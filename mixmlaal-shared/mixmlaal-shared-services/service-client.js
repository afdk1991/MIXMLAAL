const axios = require('axios');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/service-client.log' })
  ]
});

class ServiceClient {
  constructor(options = {}) {
    this.serviceRegistryUrl = options.serviceRegistryUrl || process.env.SERVICE_REGISTRY_URL || 'http://localhost:3032';
    this.serviceName = options.serviceName || 'unknown-service';
    this.serviceUrl = options.serviceUrl || `http://localhost:${options.port || 3000}`;
    this.instanceId = `${this.serviceName}-${Date.now()}`;
    this.timeout = options.timeout || 10000;
    this.retryAttempts = options.retry || 2;
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 30000;
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      threshold: 5,
      resetTimeout: 60000,
      halfOpen: false
    };
    this.requestQueue = [];
    this.maxConcurrentRequests = options.maxConcurrentRequests || 10;
    this.activeRequests = 0;
  }

  async getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }
    return null;
  }

  setCache(key, data) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(pattern = null) {
    if (!pattern) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  async register() {
    try {
      const response = await axios.post(`${this.serviceRegistryUrl}/register`, {
        name: this.serviceName,
        url: this.serviceUrl,
        port: parseInt(this.serviceUrl.split(':').pop()),
        metadata: {
          version: '1.0.0',
          environment: process.env.NODE_ENV || 'development'
        }
      });
      logger.info(`${this.serviceName} registered:`, response.data);
      return response.data;
    } catch (error) {
      logger.error(`${this.serviceName} registration failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async deregister() {
    try {
      const response = await axios.post(`${this.serviceRegistryUrl}/deregister`, {
        name: this.serviceName,
        instanceId: this.instanceId
      });
      logger.info(`${this.serviceName} deregistered`);
      return response.data;
    } catch (error) {
      logger.error(`${this.serviceName} deregistration failed:`, error.message);
      return { success: false, error: error.message };
    }
  }

  async heartbeat() {
    try {
      await axios.post(`${this.serviceRegistryUrl}/heartbeat`, {
        name: this.serviceName,
        instanceId: this.instanceId
      });
    } catch (error) {
      logger.error(`${this.serviceName} heartbeat failed:`, error.message);
    }
  }

  async discover(serviceName) {
    const cacheKey = `discover:${serviceName}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const response = await axios.get(`${this.serviceRegistryUrl}/discover/${serviceName}`, {
        timeout: 5000
      });

      if (response.data.success && response.data.instances.length > 0) {
        const instances = response.data.instances;
        const healthyInstance = instances[Math.floor(Math.random() * instances.length)];
        this.setCache(cacheKey, healthyInstance.url);
        return healthyInstance.url;
      }

      return null;
    } catch (error) {
      logger.error(`Service discovery failed for ${serviceName}:`, error.message);
      return null;
    }
  }

  isCircuitOpen() {
    if (this.circuitBreaker.failures >= this.circuitBreaker.threshold) {
      const timeSinceFailure = Date.now() - this.circuitBreaker.lastFailure;
      if (timeSinceFailure < this.circuitBreaker.resetTimeout) {
        return true;
      }
      this.circuitBreaker.halfOpen = true;
    }
    return false;
  }

  recordSuccess() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.lastFailure = null;
    this.circuitBreaker.halfOpen = false;
  }

  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
  }

  async call(serviceName, path, options = {}) {
    if (this.isCircuitOpen() && !this.circuitBreaker.halfOpen) {
      throw new Error(`Circuit breaker is OPEN for ${serviceName}`);
    }

    if (this.activeRequests >= this.maxConcurrentRequests) {
      return new Promise((resolve, reject) => {
        this.requestQueue.push({ serviceName, path, options, resolve, reject });
      });
    }

    this.activeRequests++;

    const method = options.method || 'GET';
    const data = options.data || {};
    const params = options.params || {};
    const headers = options.headers || {};

    let serviceUrl = await this.discover(serviceName);

    if (!serviceUrl) {
      this.recordFailure();
      this.activeRequests--;
      this.processQueue();
      throw new Error(`Service ${serviceName} not available`);
    }

    let lastError;
    for (let attempt = 0; attempt < this.retryAttempts; attempt++) {
      try {
        const response = await axios({
          method,
          url: `${serviceUrl}${path}`,
          data,
          params,
          headers: {
            ...headers,
            'X-Service-Name': this.serviceName,
            'X-Instance-Id': this.instanceId
          },
          timeout: options.timeout || this.timeout
        });

        this.recordSuccess();
        this.activeRequests--;
        this.processQueue();
        return response.data;
      } catch (error) {
        lastError = error;
        logger.warn(`${serviceName} call attempt ${attempt + 1} failed:`, error.message);

        if (attempt < this.retryAttempts - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          serviceUrl = await this.discover(serviceName);
        }
      }
    }

    this.recordFailure();
    this.activeRequests--;
    this.processQueue();
    throw lastError;
  }

  processQueue() {
    if (this.requestQueue.length > 0 && this.activeRequests < this.maxConcurrentRequests) {
      const { serviceName, path, options, resolve, reject } = this.requestQueue.shift();
      this.call(serviceName, path, options).then(resolve).catch(reject);
    }
  }

  async get(serviceName, path, options = {}) {
    return this.call(serviceName, path, { ...options, method: 'GET' });
  }

  async post(serviceName, path, data, options = {}) {
    return this.call(serviceName, path, { ...options, method: 'POST', data });
  }

  async put(serviceName, path, data, options = {}) {
    return this.call(serviceName, path, { ...options, method: 'PUT', data });
  }

  async delete(serviceName, path, options = {}) {
    return this.call(serviceName, path, { ...options, method: 'DELETE' });
  }

  startHeartbeat(intervalMs = 30000) {
    this.heartbeatInterval = setInterval(() => this.heartbeat(), intervalMs);
    logger.info(`${this.serviceName} heartbeat started`);
  }

  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      logger.info(`${this.serviceName} heartbeat stopped`);
    }
  }

  getCircuitStatus() {
    return {
      failures: this.circuitBreaker.failures,
      threshold: this.circuitBreaker.threshold,
      isOpen: this.isCircuitOpen(),
      isHalfOpen: this.circuitBreaker.halfOpen,
      lastFailure: this.circuitBreaker.lastFailure
    };
  }

  async batchCall(calls) {
    return Promise.all(calls.map(call =>
      this.call(call.serviceName, call.path, call.options)
    ));
  }
}

function createServiceClient(options) {
  return new ServiceClient(options);
}

module.exports = {
  ServiceClient,
  createServiceClient
};
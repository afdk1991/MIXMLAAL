const winston = require('winston');
const axios = require('axios');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/health-check.log' })
  ]
});

class HealthCheck {
  constructor(options = {}) {
    this.serviceName = options.serviceName || 'unknown';
    this.port = options.port || 3000;
    this.serviceUrl = options.serviceUrl || `http://localhost:${this.port}`;
    this.checkInterval = options.checkInterval || 30000;
    this.servicesToCheck = options.servicesToCheck || [];
    this.checks = new Map();
    this.status = 'STARTING';
    this.lastCheck = null;
    this.checkIntervalId = null;
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 5000;
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

  clearCache() {
    this.cache.clear();
  }

  async checkDependencies() {
    const results = {};
    let allHealthy = true;

    for (const service of this.servicesToCheck) {
      const { name, url, critical = true } = service;

      try {
        const startTime = Date.now();
        const response = await axios.get(`${url}/health`, { timeout: 5000 });
        const responseTime = Date.now() - startTime;

        results[name] = {
          status: response.data.status === 'ok' ? 'UP' : 'DOWN',
          responseTime,
          lastCheck: new Date().toISOString()
        };

        if (response.data.status !== 'ok' && critical) {
          allHealthy = false;
        }
      } catch (error) {
        results[name] = {
          status: 'DOWN',
          error: error.message,
          lastCheck: new Date().toISOString()
        };

        if (critical) {
          allHealthy = false;
        }

        logger.warn(`Health check failed for ${name}:`, error.message);
      }
    }

    return { results, allHealthy };
  }

  async performCheck() {
    try {
      const { results, allHealthy } = await this.checkDependencies();

      this.lastCheck = {
        timestamp: new Date().toISOString(),
        results,
        overallStatus: allHealthy ? 'HEALTHY' : 'DEGRADED'
      };

      this.status = allHealthy ? 'HEALTHY' : 'DEGRADED';

      return this.lastCheck;
    } catch (error) {
      logger.error('Health check error:', error);
      this.status = 'UNHEALTHY';
      throw error;
    }
  }

  async start() {
    await this.performCheck();

    this.checkIntervalId = setInterval(async () => {
      try {
        await this.performCheck();
      } catch (error) {
        logger.error('Scheduled health check failed:', error);
      }
    }, this.checkInterval);

    logger.info(`${this.serviceName} health check started`);
  }

  stop() {
    if (this.checkIntervalId) {
      clearInterval(this.checkIntervalId);
      this.checkIntervalId = null;
      logger.info(`${this.serviceName} health check stopped`);
    }
  }

  getStatus() {
    return {
      service: this.serviceName,
      status: this.status,
      lastCheck: this.lastCheck,
      uptime: process.uptime()
    };
  }

  getDetailedStatus() {
    return {
      service: this.serviceName,
      status: this.status,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
      dependencies: this.lastCheck?.results || {},
      timestamp: new Date().toISOString()
    };
  }

  middleware() {
    return async (req, res, next) => {
      if (req.path === '/health' || req.path === '/health/detailed') {
        if (req.path === '/health/detailed') {
          return res.json(this.getDetailedStatus());
        }
        return res.json(this.getStatus());
      }
      next();
    };
  }
}

class ServiceMonitor {
  constructor(options = {}) {
    this.services = new Map();
    this.alertThreshold = options.alertThreshold || 3;
    this.checkInterval = options.checkInterval || 60000;
    this.alerts = [];
    this.intervalId = null;
    this.cache = new Map();
    this.cacheTTL = options.cacheTTL || 10000;
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

  clearCache() {
    this.cache.clear();
  }

  registerService(name, url, options = {}) {
    this.services.set(name, {
      name,
      url,
      critical: options.critical !== false,
      responseTimeThreshold: options.responseTimeThreshold || 5000,
      ...options
    });
  }

  async checkService(name) {
    const service = this.services.get(name);
    if (!service) return null;

    const startTime = Date.now();

    try {
      const response = await axios.get(`${service.url}/health`, {
        timeout: 10000
      });

      const responseTime = Date.now() - startTime;
      const isHealthy = response.data.status === 'ok';
      const isSlow = responseTime > service.responseTimeThreshold;

      const result = {
        name,
        status: isHealthy ? 'UP' : 'DOWN',
        responseTime,
        isSlow,
        timestamp: new Date().toISOString(),
        previousStatus: service.lastStatus,
        changed: service.lastStatus && service.lastStatus !== (isHealthy ? 'UP' : 'DOWN')
      };

      service.lastStatus = result.status;
      service.lastCheck = result;

      if (result.changed && service.critical) {
        this.sendAlert({
          type: result.status === 'DOWN' ? 'CRITICAL' : 'RECOVERY',
          service: name,
          message: `Service ${name} is now ${result.status}`,
          details: result
        });
      }

      return result;
    } catch (error) {
      const result = {
        name,
        status: 'DOWN',
        error: error.message,
        timestamp: new Date().toISOString(),
        previousStatus: service.lastStatus,
        changed: service.lastStatus && service.lastStatus !== 'DOWN'
      };

      service.lastStatus = 'DOWN';
      service.lastCheck = result;

      if (result.changed && service.critical) {
        this.sendAlert({
          type: 'CRITICAL',
          service: name,
          message: `Service ${name} is DOWN: ${error.message}`,
          details: result
        });
      }

      return result;
    }
  }

  async checkAllServices() {
    const results = [];
    for (const name of this.services.keys()) {
      const result = await this.checkService(name);
      if (result) results.push(result);
    }
    return results;
  }

  sendAlert(alert) {
    alert.id = `${alert.service}-${Date.now()}`;
    alert.timestamp = new Date().toISOString();

    this.alerts.push(alert);
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100);
    }

    logger.warn('ALERT:', alert);

    return alert;
  }

  getAlerts(options = {}) {
    const { limit = 20, type, service } = options;
    let filtered = this.alerts;

    if (type) {
      filtered = filtered.filter(a => a.type === type);
    }
    if (service) {
      filtered = filtered.filter(a => a.service === service);
    }

    return filtered.slice(-limit);
  }

  getServiceStatuses() {
    const statuses = [];
    for (const [name, service] of this.services.entries()) {
      statuses.push({
        name,
        status: service.lastStatus || 'UNKNOWN',
        responseTime: service.lastCheck?.responseTime,
        lastCheck: service.lastCheck?.timestamp,
        critical: service.critical
      });
    }
    return statuses;
  }

  async start() {
    await this.checkAllServices();

    this.intervalId = setInterval(async () => {
      try {
        await this.checkAllServices();
      } catch (error) {
        logger.error('Service monitor error:', error);
      }
    }, this.checkInterval);

    logger.info('Service monitor started');
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      logger.info('Service monitor stopped');
    }
  }
}

module.exports = {
  HealthCheck,
  ServiceMonitor
};
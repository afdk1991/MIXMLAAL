const client = require('prom-client');

class MetricsCollector {
  constructor(options = {}) {
    this.prefix = options.prefix || 'mixmlaal';
    this.serviceName = options.serviceName || 'unknown-service';

    client.collectDefaultMetrics({ prefix: this.prefix });

    this.requestCounter = new client.Counter({
      name: `${this.prefix}_http_requests_total`,
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status']
    });

    this.requestDuration = new client.Histogram({
      name: `${this.prefix}_http_request_duration_seconds`,
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route'],
      buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10]
    });

    this.errorsCounter = new client.Counter({
      name: `${this.prefix}_errors_total`,
      help: 'Total number of errors',
      labelNames: ['type', 'service']
    });

    this.activeConnections = new client.Gauge({
      name: `${this.prefix}_active_connections`,
      help: 'Number of active connections'
    });

    this.businessMetrics = new client.Gauge({
      name: `${this.prefix}_business_metrics`,
      help: 'Business metrics',
      labelNames: ['type']
    });

    this.cacheMetrics = new client.Counter({
      name: `${this.prefix}_cache_operations_total`,
      help: 'Total cache operations',
      labelNames: ['operation', 'status']
    });

    this.queueMetrics = new client.Gauge({
      name: `${this.prefix}_queue_depth`,
      help: 'Message queue depth',
      labelNames: ['queue']
    });

    this.serviceHealthMetrics = new client.Gauge({
      name: `${this.prefix}_service_health`,
      help: 'Service health status',
      labelNames: ['service', 'status']
    });

    this.customMetrics = new Map();
  }

  recordRequest(method, route, status, duration) {
    this.requestCounter.inc({ method, route, status });
    this.requestDuration.observe({ method, route }, duration);
  }

  recordError(type, service = this.serviceName) {
    this.errorsCounter.inc({ type, service });
  }

  setActiveConnections(count) {
    this.activeConnections.set(count);
  }

  setBusinessMetric(type, value) {
    this.businessMetrics.set({ type }, value);
  }

  recordCacheOperation(operation, status) {
    this.cacheMetrics.inc({ operation, status });
  }

  setQueueDepth(queue, depth) {
    this.queueMetrics.set({ queue }, depth);
  }

  setServiceHealth(service, status) {
    this.serviceHealthMetrics.set({ service, status }, status === 'UP' ? 1 : 0);
  }

  registerCustomMetric(name, type, options = {}) {
    if (this.customMetrics.has(name)) {
      return this.customMetrics.get(name);
    }

    let metric;
    switch (type) {
      case 'counter':
        metric = new client.Counter({ name, ...options });
        break;
      case 'gauge':
        metric = new client.Gauge({ name, ...options });
        break;
      case 'histogram':
        metric = new client.Histogram({ name, ...options });
        break;
      case 'summary':
        metric = new client.Summary({ name, ...options });
        break;
      default:
        throw new Error(`Unknown metric type: ${type}`);
    }

    this.customMetrics.set(name, metric);
    return metric;
  }

  recordCustomMetric(name, value, labels = {}) {
    const metric = this.customMetrics.get(name);
    if (metric) {
      if (metric instanceof client.Counter || metric instanceof client.Gauge) {
        metric.inc(labels, value || 1);
      } else if (metric instanceof client.Histogram || metric instanceof client.Summary) {
        metric.observe(labels, value);
      }
    }
  }

  middleware() {
    return (req, res, next) => {
      const start = process.hrtime.bigint();

      this.activeConnections.inc();

      res.on('finish', () => {
        this.activeConnections.dec();

        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e9;

        const route = req.route?.path || req.path || 'unknown';
        this.recordRequest(req.method, route, res.statusCode, duration);

        if (res.statusCode >= 400) {
          this.recordError(`http_${res.statusCode}`, this.serviceName);
        }
      });

      next();
    };
  }

  errorMiddleware() {
    return (err, req, res, next) => {
      this.recordError(err.type || 'unknown', this.serviceName);
      next(err);
    };
  }

  async getMetrics() {
    return client.register.metrics();
  }

  getContentType() {
    return client.register.contentType;
  }

  getRegistry() {
    return client.register;
  }

  async getMetricsAsJSON() {
    const metrics = await this.getMetrics();
    const lines = metrics.split('\n');
    const result = [];

    for (const line of lines) {
      if (line && !line.startsWith('#')) {
        const parts = line.split(' ');
        if (parts.length >= 2) {
          const nameParts = parts[0].split('_');
          result.push({
            name: parts[0],
            labels: {},
            value: parseFloat(parts[1])
          });
        }
      }
    }

    return result;
  }
}

const defaultCollector = new MetricsCollector({
  serviceName: 'mixmlaal'
});

module.exports = {
  MetricsCollector,
  metrics: defaultCollector,
  client
};
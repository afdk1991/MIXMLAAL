const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const dotenv = require('dotenv');
const axios = require('axios');
const Joi = require('joi');
const Redis = require('redis');
const promClient = require('prom-client');

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/metrics-collector.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
const PORT = process.env.METRICS_COLLECTOR_PORT || 3026;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { code: 429, message: '请求过于频繁' }
});
app.use('/api', limiter);

const redisClient = Redis.createClient({
  url: `redis://${process.env.REDIS_HOST || 'redis'}:${process.env.REDIS_PORT || 6379}`,
  socket: {
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 3000);
      logger.info(`Redis reconnect attempt ${retries}, delay: ${delay}ms`);
      return delay;
    }
  }
});

redisClient.on('error', (err) => {
  logger.error('Redis error:', err);
  serviceHealthStatus.set({ service: 'redis' }, 0);
});

redisClient.on('connect', () => {
  logger.info('Redis connected');
  serviceHealthStatus.set({ service: 'redis' }, 1);
});

redisClient.on('reconnecting', (params) => {
  logger.info('Redis reconnecting:', params);
  serviceHealthStatus.set({ service: 'redis' }, 0);
});

redisClient.on('end', () => {
  logger.warn('Redis connection closed');
  serviceHealthStatus.set({ service: 'redis' }, 0);
});

const register = new promClient.Registry();
promClient.collectDefaultMetrics({ register });

const httpRequestsTotal = new promClient.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'path', 'status'],
  registers: [register]
});

const httpRequestDuration = new promClient.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'path', 'status'],
  buckets: [0.1, 0.3, 0.5, 1, 3, 5, 10],
  registers: [register]
});

const businessOrdersTotal = new promClient.Counter({
  name: 'business_orders_total',
  help: 'Total number of orders',
  labelNames: ['status', 'type'],
  registers: [register]
});

const businessPaymentsTotal = new promClient.Counter({
  name: 'business_payments_total',
  help: 'Total number of payments',
  labelNames: ['status', 'method'],
  registers: [register]
});

const businessUsersActive = new promClient.Gauge({
  name: 'business_users_active',
  help: 'Number of active users',
  labelNames: ['period'],
  registers: [register]
});

const serviceHealthStatus = new promClient.Gauge({
  name: 'service_health_status',
  help: 'Health status of services (1 = healthy, 0 = unhealthy)',
  labelNames: ['service'],
  registers: [register]
});

class MetricsCollector {
  constructor() {
    this.metricsPrefix = 'metrics';
    this.retentionPeriod = 86400;
  }

  async recordMetric(name, value, labels = {}) {
    try {
      const key = `${this.metricsPrefix}:${name}`;
      const labelStr = JSON.stringify(labels);
      
      await redisClient.zAdd(key, { score: Date.now(), value: `${labelStr}:${value}` });
      await redisClient.expire(key, this.retentionPeriod);
    } catch (error) {
      logger.error('Error recording metric:', error);
    }
  }

  async getMetric(name, options = {}) {
    try {
      const { startTime, endTime, limit = 100 } = options;
      const key = `${this.metricsPrefix}:${name}`;
      
      let min = '-inf';
      let max = '+inf';
      
      if (startTime) {
        min = startTime;
      }
      if (endTime) {
        max = endTime;
      }
      
      const results = await redisClient.zRangeByScore(key, min, max, { offset: 0, count: limit });
      
      return results.map(r => {
        const [labelStr, value] = r.split(':');
        return {
          labels: JSON.parse(labelStr),
          value: parseFloat(value),
          timestamp: Date.now()
        };
      });
    } catch (error) {
      logger.error('Error getting metric:', error);
      return [];
    }
  }

  async getAggregatedMetric(name, aggregation = 'avg') {
    try {
      const values = await this.getMetric(name, { limit: 1000 });
      
      if (values.length === 0) {
        return null;
      }
      
      const numericValues = values.map(v => v.value);
      
      switch (aggregation) {
        case 'avg':
          return numericValues.reduce((a, b) => a + b, 0) / numericValues.length;
        case 'min':
          return Math.min(...numericValues);
        case 'max':
          return Math.max(...numericValues);
        case 'sum':
          return numericValues.reduce((a, b) => a + b, 0);
        case 'count':
          return numericValues.length;
        default:
          return null;
      }
    } catch (error) {
      logger.error('Error getting aggregated metric:', error);
      return null;
    }
  }
}

const metricsCollector = new MetricsCollector();

app.post('/api/v1/metrics/http', async (req, res) => {
  try {
    const { method, path, status, duration } = req.body;

    httpRequestsTotal.inc({ method, path, status });
    httpRequestDuration.observe({ method, path, status }, duration / 1000);

    await metricsCollector.recordMetric('http_requests', 1, { method, path, status });

    res.json({ code: 200, data: { success: true } });
  } catch (error) {
    logger.error('Error recording HTTP metric:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.post('/api/v1/metrics/business', async (req, res) => {
  try {
    const { type, name, value, labels = {} } = req.body;

    await metricsCollector.recordMetric(`business_${name}`, value, { type, ...labels });

    if (name === 'orders') {
      businessOrdersTotal.inc({ status: labels.status || 'unknown', type: labels.type || 'unknown' });
    } else if (name === 'payments') {
      businessPaymentsTotal.inc({ status: labels.status || 'unknown', method: labels.method || 'unknown' });
    } else if (name === 'users_active') {
      businessUsersActive.set({ period: labels.period || 'day' }, value);
    }

    res.json({ code: 200, data: { success: true } });
  } catch (error) {
    logger.error('Error recording business metric:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.post('/api/v1/metrics/service/health', async (req, res) => {
  try {
    const { service, status } = req.body;

    serviceHealthStatus.set({ service }, status ? 1 : 0);

    await metricsCollector.recordMetric('service_health', status ? 1 : 0, { service });

    res.json({ code: 200, data: { success: true } });
  } catch (error) {
    logger.error('Error recording service health metric:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/api/v1/metrics/:name', async (req, res) => {
  try {
    const { name } = req.params;
    const { startTime, endTime, limit, aggregation } = req.query;

    if (aggregation) {
      const value = await metricsCollector.getAggregatedMetric(
        name.startsWith('business_') ? name : `business_${name}`,
        aggregation
      );
      return res.json({ code: 200, data: { name, aggregation, value } });
    }

    const values = await metricsCollector.getMetric(
      name.startsWith('business_') ? name : `business_${name}`,
      { startTime: startTime ? parseInt(startTime) : undefined, 
        endTime: endTime ? parseInt(endTime) : undefined, 
        limit: limit ? parseInt(limit) : 100 }
    );

    res.json({ code: 200, data: { name, count: values.length, values } });
  } catch (error) {
    logger.error('Error getting metric:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/api/v1/metrics', async (req, res) => {
  try {
    const keys = await redisClient.keys(`${metricsCollector.metricsPrefix}:*`);
    const metricNames = [...new Set(keys.map(k => k.replace(`${metricsCollector.metricsPrefix}:`, '')))];

    res.json({ code: 200, data: { count: metricNames.length, names: metricNames } });
  } catch (error) {
    logger.error('Error getting metrics list:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/metrics', async (req, res) => {
  try {
    res.set('Content-Type', register.contentType);
    res.end(await register.metrics());
  } catch (error) {
    logger.error('Error getting Prometheus metrics:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/health', async (req, res) => {
  try {
    await redisClient.ping();
    res.json({
      status: 'ok',
      service: 'metrics-collector',
      redis: 'connected',
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      service: 'metrics-collector',
      error: error.message
    });
  }
});

app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

async function startServer() {
  try {
    logger.info('Starting metrics collector service...');
    
    await redisClient.connect();
    logger.info('Redis connected successfully');

    app.listen(PORT, () => {
      logger.info(`Metrics collector service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down metrics collector service...');
  try {
    await redisClient.disconnect();
    logger.info('Metrics collector service shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
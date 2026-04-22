const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const dotenv = require('dotenv');
const axios = require('axios');
const Joi = require('joi');

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/tracing-proxy.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
const PORT = process.env.TRACING_PROXY_PORT || 3025;

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

class TracingManager {
  constructor() {
    this.traces = new Map();
    this.spanMap = new Map(); // Map to store spanId to trace mapping for faster lookup
    this.traceTimeout = 300000;
    this.jaegerUrl = process.env.JAEGER_URL || 'http://jaeger:14268/api/traces';
    this.elasticsearchUrl = process.env.ELASTICSEARCH_HOST || 'http://elasticsearch:9200';
  }

  generateTraceId() {
    return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  generateSpanId() {
    return `span-${Math.random().toString(36).substr(2, 9)}`;
  }

  createTrace() {
    const traceId = this.generateTraceId();
    const trace = {
      traceId,
      spans: [],
      startTime: Date.now(),
      status: 'active'
    };
    this.traces.set(traceId, trace);
    return trace;
  }

  createSpan(traceId, spanData) {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return null;
    }

    const span = {
      spanId: this.generateSpanId(),
      traceId,
      parentSpanId: spanData.parentSpanId || null,
      operationName: spanData.operationName,
      serviceName: spanData.serviceName,
      startTime: Date.now(),
      endTime: null,
      duration: null,
      tags: spanData.tags || {},
      logs: [],
      status: 'active'
    };

    trace.spans.push(span);
    this.spanMap.set(span.spanId, trace); // Store spanId to trace mapping
    return span;
  }

  finishSpan(spanId, spanData) {
    const trace = this.spanMap.get(spanId);
    if (trace) {
      const span = trace.spans.find(s => s.spanId === spanId);
      if (span) {
        span.endTime = Date.now();
        span.duration = span.endTime - span.startTime;
        span.status = 'completed';
        if (spanData && spanData.tags) {
          span.tags = { ...span.tags, ...spanData.tags };
        }
        if (spanData && spanData.logs) {
          span.logs = spanData.logs;
        }
      }
    }
  }

  addSpanLog(spanId, logData) {
    const trace = this.spanMap.get(spanId);
    if (trace) {
      const span = trace.spans.find(s => s.spanId === spanId);
      if (span) {
        span.logs.push({
          timestamp: Date.now(),
          ...logData
        });
      }
    }
  }

  async sendTraceToJaeger(trace) {
    try {
      const jaegerTrace = {
        traceID: trace.traceId,
        traceName: 'mixmlaal-trace',
        spans: trace.spans.map(span => ({
          traceID: span.traceId,
          spanID: span.spanId,
          parentSpanID: span.parentSpanId || 0,
          operationName: span.operationName,
          serviceName: span.serviceName,
          startTime: span.startTime * 1000,
          duration: span.duration * 1000,
          tags: Object.entries(span.tags).map(([key, value]) => ({
            key,
            vType: typeof value === 'number' ? 1 : 0,
            vStr: String(value)
          })),
          logs: span.logs.map(log => ({
            timestamp: log.timestamp * 1000,
            fields: Object.entries(log).filter(([k]) => k !== 'timestamp').map(([key, value]) => ({
              key,
              vType: typeof value === 'number' ? 1 : 0,
              vStr: String(value)
            }))
          }))
        }))
      };

      await axios.post(this.jaegerUrl, jaegerTrace);
      logger.info('Trace sent to Jaeger', { traceId: trace.traceId });
    } catch (error) {
      logger.error('Error sending trace to Jaeger:', error);
    }
  }

  async sendTraceToElasticsearch(trace) {
    try {
      await axios.post(
        `${this.elasticsearchUrl}/mixmlaal-traces-${Date.now()}/_doc`,
        {
          traceId: trace.traceId,
          startTime: trace.startTime,
          endTime: Date.now(),
          duration: Date.now() - trace.startTime,
          spanCount: trace.spans.length,
          status: trace.status,
          services: [...new Set(trace.spans.map(s => s.serviceName))],
          spans: trace.spans.map(span => ({
            spanId: span.spanId,
            operationName: span.operationName,
            serviceName: span.serviceName,
            duration: span.duration,
            status: span.status
          }))
        }
      );
      logger.info('Trace sent to Elasticsearch', { traceId: trace.traceId });
    } catch (error) {
      logger.error('Error sending trace to Elasticsearch:', error);
    }
  }

  finishTrace(traceId) {
    const trace = this.traces.get(traceId);
    if (!trace) {
      return null;
    }

    trace.status = 'completed';
    trace.endTime = Date.now();

    this.sendTraceToJaeger(trace);
    this.sendTraceToElasticsearch(trace);

    this.cleanupOldTraces();

    return trace;
  }

  cleanupOldTraces() {
    const now = Date.now();
    for (const [traceId, trace] of this.traces.entries()) {
      if (now - trace.startTime > this.traceTimeout) {
        // Remove all spans from spanMap that belong to this trace
        trace.spans.forEach(span => {
          this.spanMap.delete(span.spanId);
        });
        this.traces.delete(traceId);
      }
    }
  }

  getTrace(traceId) {
    return this.traces.get(traceId);
  }

  getAllTraces() {
    return Array.from(this.traces.values());
  }
}

const tracingManager = new TracingManager();

app.post('/api/v1/tracing/trace', async (req, res) => {
  try {
    const { operationName, serviceName, parentSpanId, tags } = req.body;

    const schema = Joi.object({
      operationName: Joi.string().required(),
      serviceName: Joi.string().required(),
      parentSpanId: Joi.string().optional(),
      tags: Joi.object().optional()
    });

    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({ code: 400, message: error.details[0].message });
    }

    let traceId = req.headers['x-trace-id'];
    let trace;

    if (!traceId) {
      trace = tracingManager.createTrace();
      traceId = trace.traceId;
    } else {
      trace = tracingManager.getTrace(traceId);
    }

    const span = tracingManager.createSpan(traceId, {
      operationName,
      serviceName,
      parentSpanId,
      tags
    });

    res.json({
      code: 200,
      data: {
        traceId,
        spanId: span.spanId
      }
    });
  } catch (error) {
    logger.error('Error creating trace:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.put('/api/v1/tracing/span/:spanId', async (req, res) => {
  try {
    const { spanId } = req.params;
    const { tags, logs } = req.body;

    tracingManager.finishSpan(spanId, { tags, logs });

    res.json({ code: 200, data: { success: true } });
  } catch (error) {
    logger.error('Error finishing span:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.post('/api/v1/tracing/span/:spanId/log', async (req, res) => {
  try {
    const { spanId } = req.params;
    const { event, message, data } = req.body;

    tracingManager.addSpanLog(spanId, { event, message, data });

    res.json({ code: 200, data: { success: true } });
  } catch (error) {
    logger.error('Error adding span log:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.post('/api/v1/tracing/finish', async (req, res) => {
  try {
    const { traceId } = req.body;

    if (!traceId) {
      return res.status(400).json({ code: 400, message: 'Missing traceId' });
    }

    const trace = tracingManager.finishTrace(traceId);

    if (!trace) {
      return res.status(404).json({ code: 404, message: 'Trace not found' });
    }

    res.json({ code: 200, data: { traceId, spanCount: trace.spans.length } });
  } catch (error) {
    logger.error('Error finishing trace:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/api/v1/tracing/trace/:traceId', async (req, res) => {
  try {
    const { traceId } = req.params;

    const trace = tracingManager.getTrace(traceId);

    if (!trace) {
      return res.status(404).json({ code: 404, message: 'Trace not found' });
    }

    res.json({ code: 200, data: trace });
  } catch (error) {
    logger.error('Error getting trace:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/api/v1/tracing/traces', async (req, res) => {
  try {
    const traces = tracingManager.getAllTraces();

    res.json({
      code: 200,
      data: {
        count: traces.length,
        traces: traces.map(t => ({
          traceId: t.traceId,
          startTime: t.startTime,
          status: t.status,
          spanCount: t.spans.length
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting traces:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'tracing-proxy',
    activeTraces: tracingManager.traces.size
  });
});

app.use((err, req, res, next) => {
  logger.error('Error:', err);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

async function startServer() {
  try {
    logger.info('Starting tracing proxy service...');

    app.listen(PORT, () => {
      logger.info(`Tracing proxy service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down tracing proxy service...');
  process.exit(0);
});

startServer();
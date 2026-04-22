const express = require('express');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const winston = require('winston');
const expressWinston = require('express-winston');
const dotenv = require('dotenv');
const Joi = require('joi');
const path = require('path');
const fs = require('fs');
const { createRotateFileStream } = require('rotate-file-stream');
const ElasticsearchWinston = require('winston-elasticsearch');
const FluentLogger = require('fluent-logger');
const morgan = require('morgan');

dotenv.config();

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/logging-aggregator.log' }),
    new winston.transports.Console()
  ]
});

const app = express();
const PORT = process.env.LOGGING_AGGREGATOR_PORT || 3024;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { code: 429, message: '请求过于频繁' }
});
app.use('/api', limiter);

const logDirectory = path.join(__dirname, '../logs');
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory, { recursive: true });
}

const accessLogStream = createRotateFileStream('access.log', {
  interval: '1d',
  path: logDirectory,
  maxFiles: 30,
  maxSize: '100M'
});

const errorLogStream = createRotateFileStream('error.log', {
  interval: '1d',
  path: logDirectory,
  maxFiles: 30,
  maxSize: '50M'
});

const esTransportOpts = {
  level: 'info',
  clientOpts: {
    node: process.env.ELASTICSEARCH_HOST || 'http://elasticsearch:9200',
    maxRetries: 5,
    requestTimeout: 10000
  },
  indexPrefix: 'mixmlaal-logs',
  indexSuffixPattern: 'YYYY.MM.DD',
  transformer: (logData) => {
    return {
      '@timestamp': logData.timestamp || new Date().toISOString(),
      message: logData.message,
      severity: logData.level,
      service: 'logging-aggregator',
      fields: logData.meta || {}
    };
  }
};

const esTransport = new ElasticsearchWinston(esTransportOpts);

const combinedLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 100 * 1024 * 1024,
      maxFiles: 30
    }),
    esTransport
  ]
});

app.use(morgan('combined', { stream: accessLogStream }));

app.use(expressWinston.errorLogger({
  winstonInstance: logger,
  stream: errorLogStream
}));

const fluentLogger = new FluentLogger.FluentLogger(
  process.env.FLUENTD_HOST || 'logstash',
  process.env.FLUENTD_PORT || 5000,
  { timeout: 3.0, reconnectInterval: 60000 }
);

let fluentLoggerConnected = true;
let fluentLoggerErrorCount = 0;
const MAX_ERRORS_BEFORE_FALLBACK = 3;

fluentLogger.on('error', (err) => {
  logger.error('Fluent logger error:', err);
  fluentLoggerErrorCount++;
  if (fluentLoggerConnected && fluentLoggerErrorCount >= MAX_ERRORS_BEFORE_FALLBACK) {
    fluentLoggerConnected = false;
    logger.warn('Fluent logger connection failed, falling back to local file logging');
  }
});

fluentLogger.on('connect', () => {
  logger.info('Fluent logger connected');
  fluentLoggerConnected = true;
  fluentLoggerErrorCount = 0;
});

fluentLogger.on('reconnect', () => {
  logger.info('Fluent logger reconnected');
  fluentLoggerConnected = true;
  fluentLoggerErrorCount = 0;
});

class LogCollector {
  constructor() {
    this.logBuffer = [];
    this.bufferSize = 100;
    this.flushInterval = 5000;
    this.startBufferFlush();
  }

  addLog(logEntry) {
    this.logBuffer.push({
      ...logEntry,
      timestamp: new Date().toISOString(),
      service: 'logging-aggregator'
    });

    if (this.logBuffer.length >= this.bufferSize) {
      this.flushBuffer();
    }
  }

  async flushBuffer() {
    if (this.logBuffer.length === 0) return;

    const logsToSend = [...this.logBuffer];
    this.logBuffer = [];

    try {
      if (fluentLoggerConnected) {
        fluentLogger.emit('mixmlaal-logs', {
          logs: logsToSend,
          count: logsToSend.length
        });
        combinedLogger.info('Flushed logs to Fluentd', { count: logsToSend.length });
      } else {
        // Fallback to local file logging
        logsToSend.forEach(log => {
          combinedLogger.info('Fallback log:', log);
        });
        combinedLogger.warn('Flushed logs to local file (Fluentd fallback)', { count: logsToSend.length });
      }
    } catch (error) {
      logger.error('Error flushing log buffer:', error);
      // Fallback to local file logging on error
      logsToSend.forEach(log => {
        combinedLogger.info('Fallback log:', log);
      });
      this.logBuffer = [...logsToSend, ...this.logBuffer];
    }
  }

  startBufferFlush() {
    setInterval(() => {
      this.flushBuffer();
    }, this.flushInterval);
  }
}

const logCollector = new LogCollector();

app.post('/api/v1/logs', async (req, res) => {
  try {
    const { logs } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ code: 400, message: 'Invalid logs format' });
    }

    logs.forEach(log => {
      logCollector.addLog(log);
      combinedLogger.info(log.message, log);
    });

    res.json({ code: 200, data: { received: logs.length } });
  } catch (error) {
    logger.error('Error collecting logs:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.post('/api/v1/logs/batch', async (req, res) => {
  try {
    const { logs, service, level } = req.body;

    if (!logs || !Array.isArray(logs)) {
      return res.status(400).json({ code: 400, message: 'Invalid logs format' });
    }

    const processedLogs = logs.map(log => ({
      ...log,
      service: log.service || service,
      level: log.level || level,
      timestamp: log.timestamp || new Date().toISOString()
    }));

    processedLogs.forEach(log => {
      logCollector.addLog(log);
      combinedLogger.log(log.level || 'info', log.message, log);
    });

    res.json({ code: 200, data: { received: processedLogs.length } });
  } catch (error) {
    logger.error('Error collecting batch logs:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/api/v1/logs/stats', async (req, res) => {
  try {
    const stats = {
      bufferSize: logCollector.logBuffer.length,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };

    res.json({ code: 200, data: stats });
  } catch (error) {
    logger.error('Error getting log stats:', error);
    res.status(500).json({ code: 500, message: 'Internal server error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'logging-aggregator',
    uptime: process.uptime(),
    bufferSize: logCollector.logBuffer.length
  });
});

app.use((err, req, res, next) => {
  logger.error('Error:', err);
  errorLogStream.write(`${new Date().toISOString()} ERROR: ${err.stack}\n`);
  res.status(500).json({ code: 500, message: 'Internal server error' });
});

async function startServer() {
  try {
    logger.info('Starting logging aggregator service...');
    
    app.listen(PORT, () => {
      logger.info(`Logging aggregator service running on port ${PORT}`);
    });
  } catch (error) {
    logger.error('Error starting server:', error);
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  logger.info('Shutting down logging aggregator service...');
  
  try {
    await logCollector.flushBuffer();
    fluentLogger.end();
    logger.info('Logging aggregator service shut down successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown:', error);
    process.exit(1);
  }
});

startServer();
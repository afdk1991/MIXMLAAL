/**
 * 日志工具模块
 * 版本: v1.0.0.0
 * 说明: 基于Winston的日志系统，支持多级别日志和文件轮转
 */

const winston = require('winston');
const path = require('path');

// 日志级别定义
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// 日志级别颜色
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

winston.addColors(colors);

// 日志格式
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    info => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// 文件日志格式（不带颜色）
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json(),
);

// 日志目录
const logDir = path.join(__dirname, '../../../logs');

// 创建Logger实例
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  format: fileFormat,
  transports: [
    // 错误日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // 综合日志文件
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'rejections.log'),
      maxsize: 5242880,
      maxFiles: 5,
    }),
  ],
});

// 非生产环境添加控制台输出
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: format,
    }),
  );
}

/**
 * HTTP请求日志中间件
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms - ${req.ip}`;

    if (res.statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

/**
 * 性能监控日志
 */
const performanceLogger = (operation, duration, metadata = {}) => {
  logger.info(`[PERFORMANCE] ${operation}: ${duration}ms`, {
    type: 'performance',
    operation,
    duration,
    ...metadata,
  });
};

/**
 * 错误日志
 */
const errorLogger = (error, context = {}) => {
  logger.error(`[ERROR] ${error.message}`, {
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
  });
};

/**
 * 业务日志
 */
const businessLogger = (action, data = {}) => {
  logger.info(`[BUSINESS] ${action}`, {
    type: 'business',
    action,
    ...data,
  });
};

/**
 * 安全日志
 */
const securityLogger = (event, details = {}) => {
  logger.warn(`[SECURITY] ${event}`, {
    type: 'security',
    event,
    timestamp: new Date().toISOString(),
    ...details,
  });
};

module.exports = {
  logger,
  httpLogger,
  performanceLogger,
  errorLogger,
  businessLogger,
  securityLogger,
};

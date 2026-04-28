/**
 * 错误处理工具
 * 版本: v1.0.0.0
 * 说明: 提供统一的错误处理和日志记录功能
 */

const fs = require('fs');
const path = require('path');

// 确保日志目录存在
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// 日志文件路径
const errorLogPath = path.join(logDir, 'error.log');
const accessLogPath = path.join(logDir, 'access.log');

/**
 * 记录日志
 * @param {string} message - 日志消息
 * @param {string} level - 日志级别 (info, error, warn, debug)
 * @param {string} type - 日志类型 (access, error)
 */
function log(message, level = 'info', type = 'access') {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
  
  console.log(logMessage.trim());
  
  // 写入日志文件
  const logPath = type === 'error' ? errorLogPath : accessLogPath;
  fs.appendFile(logPath, logMessage, (err) => {
    if (err) {
      console.error('写入日志文件失败:', err);
    }
  });
}

/**
 * 记录错误日志
 * @param {Error} error - 错误对象
 * @param {string} context - 错误上下文
 */
function logError(error, context = 'Unknown') {
  const errorMessage = `[${context}] ${error.message}\n${error.stack || ''}`;
  log(errorMessage, 'error', 'error');
}

/**
 * 统一错误响应
 * @param {Object} res - Express响应对象
 * @param {number} statusCode - HTTP状态码
 * @param {string} message - 错误消息
 * @param {Object} errors - 详细错误信息
 */
function sendError(res, statusCode, message, errors = null) {
  res.status(statusCode).json({
    status: 'error',
    message,
    errors,
    timestamp: new Date().toISOString()
  });
}

/**
 * 全局错误处理中间件
 */
function errorHandler(err, req, res, next) {
  // 记录错误日志
  logError(err, `${req.method} ${req.path}`);
  
  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    // 验证错误
    const errors = Object.values(err.errors).map(error => error.message);
    return sendError(res, 400, '验证失败', errors);
  }
  
  if (err.name === 'UnauthorizedError') {
    // 认证错误
    return sendError(res, 401, '未授权');
  }
  
  if (err.name === 'ForbiddenError') {
    // 权限错误
    return sendError(res, 403, '权限不足');
  }
  
  if (err.name === 'NotFoundError') {
    // 资源不存在错误
    return sendError(res, 404, '资源不存在');
  }
  
  if (err.code === 'ECONNREFUSED') {
    // 连接拒绝错误
    return sendError(res, 503, '服务暂时不可用');
  }
  
  // 默认错误
  return sendError(res, 500, '服务器内部错误');
}

/**
 * 404处理中间件
 */
function notFoundHandler(req, res, next) {
  sendError(res, 404, '接口不存在');
}

/**
 * 访问日志中间件
 */
function accessLogger(req, res, next) {
  const start = Date.now();
  const originalEnd = res.end;
  
  res.end = function(chunk, encoding) {
    const duration = Date.now() - start;
    const logMessage = `${req.method} ${req.path} ${res.statusCode} ${duration}ms`;
    log(logMessage, 'info', 'access');
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
}

module.exports = {
  log,
  logError,
  sendError,
  errorHandler,
  notFoundHandler,
  accessLogger
};

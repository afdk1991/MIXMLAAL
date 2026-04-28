/**
 * 错误处理中间件
 * 版本: v1.0.0.0
 * 说明: 统一处理API错误，返回标准化的错误响应
 */

const winston = require('winston');

/**
 * 错误处理中间件
 * @param {Error} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
const errorHandler = (err, req, res, next) => {
  // 记录错误日志
  winston.error(err.message, {
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    user: req.user ? req.user.id : 'anonymous'
  });

  // 处理不同类型的错误
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      code: 400,
      message: '请求参数验证失败',
      data: {
        errors: Object.values(err.errors).map(error => error.message)
      }
    });
  }

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      code: 401,
      message: '未授权访问',
      data: null
    });
  }

  if (err.name === 'ForbiddenError') {
    return res.status(403).json({
      code: 403,
      message: '权限不足',
      data: null
    });
  }

  if (err.name === 'NotFoundError') {
    return res.status(404).json({
      code: 404,
      message: '资源不存在',
      data: null
    });
  }

  if (err.name === 'ConflictError') {
    return res.status(409).json({
      code: 409,
      message: '资源冲突',
      data: null
    });
  }

  // 处理数据库错误
  if (err.code && err.code.startsWith('ER_')) {
    return res.status(500).json({
      code: 500,
      message: '数据库操作失败',
      data: {
        error: err.code
      }
    });
  }

  // 处理网络错误
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    return res.status(503).json({
      code: 503,
      message: '服务暂时不可用',
      data: null
    });
  }

  // 默认错误处理
  return res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: {
      error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message
    }
  });
};

/**
 * 自定义错误类
 */
class AppError extends Error {
  constructor(message, statusCode, name = 'AppError') {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'ValidationError');
  }
}

class UnauthorizedError extends AppError {
  constructor(message) {
    super(message, 401, 'UnauthorizedError');
  }
}

class ForbiddenError extends AppError {
  constructor(message) {
    super(message, 403, 'ForbiddenError');
  }
}

class NotFoundError extends AppError {
  constructor(message) {
    super(message, 404, 'NotFoundError');
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'ConflictError');
  }
}

class ServerError extends AppError {
  constructor(message) {
    super(message, 500, 'ServerError');
  }
}

module.exports = {
  errorHandler,
  AppError,
  ValidationError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  ServerError
};
/**
 * API优化工具
 * 版本: v1.0.0.0
 * 说明: 用于优化API性能，包括压缩、速率限制、请求日志和响应时间优化
 */

const compression = require('compression');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

/**
 * 压缩中间件
 * 用于压缩HTTP响应，减少传输数据量
 */
const compressionMiddleware = compression({
  // 压缩级别，0-9，默认为6
  level: 6,
  // 压缩的最小响应大小（字节）
  threshold: 1024,
  // 压缩的内容类型
  filter: (req, res) => {
    // 只压缩JSON和HTML响应
    const contentType = res.getHeader('Content-Type');
    return /json|text|html|javascript|css/.test(contentType);
  }
});

/**
 * 速率限制中间件
 * 用于防止API滥用，限制请求频率
 */
const rateLimiterMiddleware = rateLimit({
  // 窗口时间（毫秒）
  windowMs: 15 * 60 * 1000, // 15分钟
  // 每个IP在窗口时间内的最大请求数
  max: 100, // 每个IP 15分钟内最多100个请求
  // 响应消息
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null
  },
  // 存储方式
  store: new rateLimit.MemoryStore(),
  // 跳过的请求
  skip: (req) => {
    // 跳过健康检查
    if (req.path === '/health') {
      return true;
    }
    // 跳过静态资源
    if (req.path.startsWith('/static/')) {
      return true;
    }
    return false;
  },
  // 状态码
  statusCode: 429,
  // Headers
  headers: true
});

/**
 * 请求日志中间件
 * 用于记录API请求信息
 */
const requestLoggerMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // 重写response.end方法，记录响应信息
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    const responseTime = Date.now() - startTime;
    
    // 记录请求日志
    winston.info('API请求', {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      contentLength: res.getHeader('Content-Length')
    });
    
    // 调用原始的end方法
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * 响应时间优化中间件
 * 用于优化API响应时间，添加响应时间头
 */
const optimizeResponseTimeMiddleware = (req, res, next) => {
  const startTime = Date.now();
  
  // 保存原始的end方法
  const originalEnd = res.end;
  
  // 重写end方法
  res.end = function(chunk, encoding, callback) {
    const responseTime = Date.now() - startTime;
    res.setHeader('X-Response-Time', `${responseTime}ms`);
    return originalEnd.call(this, chunk, encoding, callback);
  };
  
  next();
};

/**
 * 批量处理中间件
 * 用于处理批量请求，减少HTTP请求次数
 */
const batchProcessorMiddleware = (req, res, next) => {
  // 检查是否为批量请求
  if (req.method === 'POST' && req.path === '/batch') {
    const { requests } = req.body;
    
    if (Array.isArray(requests)) {
      // 限制批量请求数量
      if (requests.length > 10) {
        return res.status(400).json({
          code: 400,
          message: '批量请求数量不能超过10个',
          data: null
        });
      }
      
      // 处理批量请求
      // 实际生产环境中应该实现具体的批量处理逻辑
      // 这里只是一个示例
      const results = requests.map((request, index) => {
        return {
          id: request.id || index,
          status: 200,
          data: { message: '批量请求处理成功' }
        };
      });
      
      return res.json({
        code: 200,
        message: '批量请求处理成功',
        data: results
      });
    }
  }
  
  next();
};

/**
 * 缓存控制中间件
 * 用于设置缓存头，提高API性能
 */
const cacheControlMiddleware = (req, res, next) => {
  // 对于GET请求，设置缓存
  if (req.method === 'GET') {
    // 静态资源缓存1小时
    if (req.path.startsWith('/static/')) {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
    // API响应缓存5分钟
    else if (req.path.startsWith('/api/')) {
      res.setHeader('Cache-Control', 'public, max-age=300');
    }
  }
  // 对于其他请求，禁用缓存
  else {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
};

/**
 * CORS优化中间件
 * 用于优化CORS设置，提高安全性
 */
const corsOptimizerMiddleware = (req, res, next) => {
  // 设置CORS头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24小时
  
  // 处理OPTIONS请求
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  
  next();
};

/**
 * API版本控制中间件
 * 用于处理API版本兼容性
 */
const versionControlMiddleware = (req, res, next) => {
  // 从请求头或路径中获取API版本
  const version = req.headers['x-api-version'] || req.params.version || '1.0';
  
  // 设置API版本
  req.apiVersion = version;
  
  // 检查版本兼容性
  // 实际生产环境中应该实现具体的版本兼容性检查逻辑
  // 这里只是一个示例
  const supportedVersions = ['1.0', '2.0'];
  if (!supportedVersions.includes(version)) {
    return res.status(400).json({
      code: 400,
      message: `不支持的API版本: ${version}`,
      data: {
        supportedVersions
      }
    });
  }
  
  next();
};

module.exports = {
  // 压缩中间件
  compression: compressionMiddleware,
  // 速率限制中间件
  rateLimiter: rateLimiterMiddleware,
  // 请求日志中间件
  requestLogger: requestLoggerMiddleware,
  // 响应时间优化中间件
  optimizeResponseTime: optimizeResponseTimeMiddleware,
  // 批量处理中间件
  batchProcessor: batchProcessorMiddleware,
  // 缓存控制中间件
  cacheControl: cacheControlMiddleware,
  // CORS优化中间件
  corsOptimizer: corsOptimizerMiddleware,
  // API版本控制中间件
  versionControl: versionControlMiddleware
};
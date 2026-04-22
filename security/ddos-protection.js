const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');

// DDoS防护配置
const ddosProtection = {
  // 速率限制中间件
  rateLimiter: rateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    max: 100, // 每个IP限制100个请求
    message: {
      status: 'error',
      message: 'Too many requests, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    // 针对不同路径设置不同的限制
    skip: (req) => {
      // 静态资源不限制
      if (req.path.startsWith('/assets/')) {
        return true;
      }
      return false;
    }
  }),

  // 渐进式延迟中间件
  slowDown: slowDown({
    windowMs: 15 * 60 * 1000, // 15分钟
    delayAfter: 50, // 前50个请求无延迟
    delayMs: (hits) => hits * 100, // 每多一个请求，延迟增加100ms
    maxDelayMs: 2000, // 最大延迟2秒
    skip: (req) => {
      // 静态资源不延迟
      if (req.path.startsWith('/assets/')) {
        return true;
      }
      return false;
    }
  }),

  // 高级DDoS检测
  advancedDetection: (req, res, next) => {
    // 检测异常请求模式
    const userAgent = req.headers['user-agent'];
    const xForwardedFor = req.headers['x-forwarded-for'];
    
    // 检测异常User-Agent
    if (!userAgent || userAgent.length < 5) {
      return res.status(403).json({ status: 'error', message: 'Invalid request' });
    }
    
    // 检测异常请求频率（可结合Redis实现更复杂的检测）
    // 这里可以添加更复杂的DDoS检测逻辑
    
    next();
  }
};

module.exports = ddosProtection;

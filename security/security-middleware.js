const helmet = require('helmet');
const cors = require('cors');
const { rateLimiter, slowDown, advancedDetection } = require('./ddos-protection');
const { logSecurityEvent } = require('./encryption');

// 安全中间件配置
const securityMiddleware = {
  // 基础安全防护
  baseSecurity: [
    // 设置安全相关的HTTP头
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "https://cdn.example.com"],
          styleSrc: ["'self'", "https://cdn.example.com"],
          imgSrc: ["'self'", "https://cdn.example.com", "data:"],
          fontSrc: ["'self'", "https://cdn.example.com"],
          connectSrc: ["'self'", "https://api.example.com"],
          frameSrc: ["'none'"],
          objectSrc: ["'none'"],
          upgradeInsecureRequests: []
        }
      }
    }),
    
    // CORS配置
    cors({
      origin: process.env.NODE_ENV === 'production' 
        ? ['https://example.com', 'https://www.example.com'] 
        : '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      credentials: true
    }),
    
    // 请求体解析
    require('express').json({ limit: '10mb' }),
    require('express').urlencoded({ extended: true, limit: '10mb' })
  ],
  
  // DDoS防护
  ddosProtection: [
    rateLimiter,
    slowDown,
    advancedDetection
  ],
  
  // 安全审计
  securityAudit: (req, res, next) => {
    // 记录请求信息
    const startTime = Date.now();
    
    // 重写res.send方法，记录响应信息
    const originalSend = res.send;
    res.send = function(body) {
      const endTime = Date.now();
      const responseTime = endTime - startTime;
      
      // 记录安全审计日志
      logSecurityEvent('api_request', {
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        responseTime: responseTime,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        query: req.query,
        // 不记录请求体，避免敏感信息泄露
        // body: req.body
      });
      
      return originalSend.call(this, body);
    };
    
    next();
  },
  
  // 输入验证
  inputValidation: (req, res, next) => {
    // 基本输入验证
    if (req.body) {
      // 检查是否包含恶意代码
      const bodyStr = JSON.stringify(req.body);
      if (bodyStr.includes('<script>') || bodyStr.includes('</script>')) {
        logSecurityEvent('xss_attempt', {
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          body: bodyStr
        });
        return res.status(400).json({ status: 'error', message: 'Invalid input' });
      }
    }
    
    next();
  }
};

module.exports = securityMiddleware;

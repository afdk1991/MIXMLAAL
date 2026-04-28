const security = require('../config/security');

// 安全中间件
const securityMiddleware = (req, res, next) => {
  // 设置安全响应头
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https:;");

  // 防止CSRF攻击
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const csrfToken = req.headers['x-csrf-token'] || req.body.csrfToken;
    const sessionToken = req.session?.csrfToken;

    if (!csrfToken || !sessionToken || !security.verifyCSRFToken(csrfToken, sessionToken)) {
      return res.status(403).json({ status: 'error', message: 'CSRF token验证失败' });
    }
  }

  // 防止XSS攻击
  if (req.body) {
    sanitizeBody(req.body);
  }

  // 防止SQL注入
  if (req.query) {
    sanitizeQuery(req.query);
  }

  next();
};

// 清理请求体
const sanitizeBody = (body) => {
  for (const key in body) {
    if (typeof body[key] === 'string') {
      body[key] = security.escapeHTML(body[key]);
    } else if (typeof body[key] === 'object' && body[key] !== null) {
      sanitizeBody(body[key]);
    }
  }
};

// 清理查询参数
const sanitizeQuery = (query) => {
  for (const key in query) {
    if (typeof query[key] === 'string') {
      query[key] = security.escapeHTML(query[key]);
    } else if (typeof query[key] === 'object' && query[key] !== null) {
      sanitizeQuery(query[key]);
    }
  }
};

// 速率限制中间件
const rateLimitMiddleware = (options = {}) => {
  const { windowMs = 60000, max = 100 } = options;
  const requests = new Map();

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    const windowStart = now - windowMs;

    // 清理过期的请求记录
    if (requests.has(ip)) {
      const userRequests = requests.get(ip).filter(timestamp => timestamp > windowStart);
      requests.set(ip, userRequests);
    } else {
      requests.set(ip, []);
    }

    // 检查请求次数
    const userRequests = requests.get(ip);
    if (userRequests.length >= max) {
      return res.status(429).json({ status: 'error', message: '请求过于频繁，请稍后再试' });
    }

    // 记录新请求
    userRequests.push(now);
    requests.set(ip, userRequests);

    next();
  };
};

// 日志记录中间件
const loggerMiddleware = (req, res, next) => {
  const start = Date.now();
  const originalSend = res.send;

  res.send = function(body) {
    const duration = Date.now() - start;
    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    };

    console.log(JSON.stringify(logData));
    return originalSend.call(this, body);
  };

  next();
};

module.exports = {
  securityMiddleware,
  rateLimitMiddleware,
  loggerMiddleware
};
/**
 * 安全审计中间件
 * 版本: v1.0.0.0
 * 说明: 用于监控和记录API访问，检测潜在的安全威胁
 */

const winston = require('winston');

/**
 * 安全审计中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件
 */
const securityAudit = (req, res, next) => {
  // 记录请求开始时间
  const startTime = Date.now();
  
  // 检查请求头中的安全信息
  const userAgent = req.headers['user-agent'];
  const referer = req.headers['referer'];
  const ip = req.ip;
  
  // 检测潜在的安全威胁
  const threats = [];
  
  // 检查SQL注入攻击
  if (detectSqlInjection(req)) {
    threats.push('SQL注入攻击检测');
  }
  
  // 检查XSS攻击
  if (detectXssAttack(req)) {
    threats.push('XSS攻击检测');
  }
  
  // 检查CSRF攻击
  if (detectCsrfAttack(req)) {
    threats.push('CSRF攻击检测');
  }
  
  // 检查恶意请求方法
  if (detectMaliciousMethod(req)) {
    threats.push('恶意请求方法');
  }
  
  // 记录威胁信息
  if (threats.length > 0) {
    winston.warn('安全威胁检测', {
      threats,
      path: req.path,
      method: req.method,
      ip,
      userAgent,
      referer
    });
  }
  
  // 重写response.end方法，记录响应信息
  const originalEnd = res.end;
  res.end = function(chunk, encoding) {
    // 计算响应时间
    const responseTime = Date.now() - startTime;
    
    // 记录访问日志
    winston.info('API访问记录', {
      path: req.path,
      method: req.method,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
      ip,
      userAgent,
      referer,
      user: req.user ? req.user.id : 'anonymous',
      threats: threats.length > 0 ? threats : null
    });
    
    // 调用原始的end方法
    originalEnd.call(this, chunk, encoding);
  };
  
  next();
};

/**
 * 检测SQL注入攻击
 * @param {Object} req - 请求对象
 * @returns {boolean} 是否检测到SQL注入
 */
const detectSqlInjection = (req) => {
  const sqlPatterns = [
    /\bunion\b/i,
    /\bselect\b/i,
    /\bfrom\b/i,
    /\bwhere\b/i,
    /\border\b/i,
    /\bby\b/i,
    /\bdrop\b/i,
    /\balter\b/i,
    /\bdelete\b/i,
    /\binsert\b/i,
    /\bupdate\b/i,
    /\bexec\b/i,
    /\bexecute\b/i,
    /\bsp_\b/i,
    /\bor\b\s+\d+\s*=\s*\d+/i,
    /\b--\b/,
    /#/,
    /\b\/\*[\s\S]*?\*\/\b/
  ];
  
  const data = {...req.query, ...req.body, ...req.params};
  
  for (const key in data) {
    const value = String(data[key]);
    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * 检测XSS攻击
 * @param {Object} req - 请求对象
 * @returns {boolean} 是否检测到XSS攻击
 */
const detectXssAttack = (req) => {
  const xssPatterns = [
    /<script[^>]*>[\S]*?<\/script>/i,
    /<iframe[^>]*>[\S]*?<\/iframe>/i,
    /<object[^>]*>[\S]*?<\/object>/i,
    /<embed[^>]*>[\S]*?<\/embed>/i,
    /<link[^>]*>[\S]*?<\/link>/i,
    /<meta[^>]*>[\S]*?<\/meta>/i,
    /<style[^>]*>[\S]*?<\/style>/i,
    /javascript:/i,
    /onerror=/i,
    /onload=/i,
    /onclick=/i,
    /onmouseover=/i,
    /onfocus=/i,
    /onblur=/i,
    /onkeydown=/i,
    /onkeyup=/i,
    /onkeypress=/i,
    /onchange=/i,
    /on submit=/i,
    /onreset=/i,
    /onselect=/i,
    /onfocusin=/i,
    /onfocusout=/i,
    /onmousedown=/i,
    /onmouseup=/i,
    /onmousemove=/i,
    /onmouseout=/i,
    /onmouseenter=/i,
    /onmouseleave=/i,
    /ontouchstart=/i,
    /ontouchmove=/i,
    /ontouchend=/i,
    /onorientationchange=/i,
    /onresize=/i,
    /onscroll=/i
  ];
  
  const data = {...req.query, ...req.body, ...req.params};
  
  for (const key in data) {
    const value = String(data[key]);
    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        return true;
      }
    }
  }
  
  return false;
};

/**
 * 检测CSRF攻击
 * @param {Object} req - 请求对象
 * @returns {boolean} 是否检测到CSRF攻击
 */
const detectCsrfAttack = (req) => {
  // 简单的CSRF检测逻辑
  // 实际生产环境中应该使用更复杂的CSRF保护机制
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'DELETE') {
    const token = req.headers['x-csrf-token'] || (req.body && req.body._csrf);
    if (!token) {
      return true;
    }
  }
  
  return false;
};

/**
 * 检测恶意请求方法
 * @param {Object} req - 请求对象
 * @returns {boolean} 是否检测到恶意请求方法
 */
const detectMaliciousMethod = (req) => {
  const allowedMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
  return !allowedMethods.includes(req.method);
};

/**
 * 记录安全事件
 * @param {string} eventType - 事件类型
 * @param {Object} eventData - 事件数据
 */
const recordSecurityEvent = (eventType, eventData) => {
  winston.info(`安全事件: ${eventType}`, eventData);
};

module.exports = {
  securityAudit,
  recordSecurityEvent
};
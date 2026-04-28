/**
 * CSRF中间件
 * 版本: v1.0.0.0
 * 说明: 提供CSRF令牌的生成和验证
 */

const csrf = require('csurf');

// 配置CSRF防护
const csrfProtection = csrf({ cookie: true });

/**
 * 生成CSRF令牌并添加到响应中
 */
function generateCsrfToken(req, res, next) {
  try {
    // 生成CSRF令牌
    const token = req.csrfToken();
    // 将令牌添加到响应头
    res.setHeader('X-CSRF-Token', token);
    // 将令牌添加到响应体
    res.locals.csrfToken = token;
    next();
  } catch (error) {
    console.error('生成CSRF令牌错误:', error);
    next(error);
  }
}

/**
 * 验证CSRF令牌
 */
function validateCsrfToken(req, res, next) {
  csrfProtection(req, res, (err) => {
    if (err) {
      console.error('CSRF令牌验证失败:', err);
      return res.status(403).json({
        status: 'error',
        message: 'CSRF令牌验证失败',
      });
    }
    next();
  });
}

module.exports = {
  csrfProtection,
  generateCsrfToken,
  validateCsrfToken
};

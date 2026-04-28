/**
 * 增强安全中间件
 * 版本: v1.0.0.0
 * 说明: 提供增强的安全措施，包括数据加密和验证
 */

const encryption = require('../utils/encryption');

/**
 * 敏感数据加密中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const encryptSensitiveData = (req, res, next) => {
  // 加密请求体中的敏感数据
  if (req.body) {
    const sensitiveFields = ['password', 'cardNumber', 'cvv', 'expiryDate', 'ssn', 'phone', 'email'];

    sensitiveFields.forEach(field => {
      if (req.body[field]) {
        // 对于密码，使用哈希处理
        if (field === 'password') {
          req.body[field] = encryption.hashPassword(req.body[field]);
        } else {
          // 对于其他敏感数据，使用加密
          req.body[field] = encryption.encrypt(req.body[field]);
        }
      }
    });
  }

  next();
};

/**
 * 敏感数据解密中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const decryptSensitiveData = (req, res, next) => {
  // 保存原始的 res.json 方法
  const originalJson = res.json;

  // 重写 res.json 方法，解密响应中的敏感数据
  res.json = function (data) {
    if (data && typeof data === 'object') {
      const sensitiveFields = ['phone', 'email', 'cardNumber'];

      // 递归解密数据
      const decryptData = obj => {
        if (Array.isArray(obj)) {
          return obj.map(item => decryptData(item));
        } else if (typeof obj === 'object' && obj !== null) {
          const result = {};
          for (const key in obj) {
            if (sensitiveFields.includes(key) && typeof obj[key] === 'string') {
              const decrypted = encryption.decrypt(obj[key]);
              result[key] = decrypted || obj[key];
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
              result[key] = decryptData(obj[key]);
            } else {
              result[key] = obj[key];
            }
          }
          return result;
        }
        return obj;
      };

      data = decryptData(data);
    }

    return originalJson.call(this, data);
  };

  next();
};

/**
 * API 密钥验证中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const validateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'] || req.query.apiKey;

  // 实际应用中，应该从环境变量或数据库中获取有效API密钥
  const validApiKeys = process.env.VALID_API_KEYS ? process.env.VALID_API_KEYS.split(',') : [];

  if (validApiKeys.length > 0 && !validApiKeys.includes(apiKey)) {
    return res.status(401).json({
      status: 'error',
      message: '无效的API密钥',
    });
  }

  next();
};

/**
 * 安全日志记录中间件
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @param {Function} next - Express 下一个中间件
 */
const securityLogger = (req, res, next) => {
  // 记录请求信息，但不记录敏感数据
  const { method, url, ip } = req;
  const timestamp = new Date().toISOString();

  // 记录请求开始
  console.log(`[${timestamp}] ${method} ${url} from ${ip}`);

  // 保存原始的 res.end 方法
  const originalEnd = res.end;

  // 重写 res.end 方法，记录响应信息
  res.end = function (chunk, encoding) {
    const responseTime = Date.now() - req.startTime;
    console.log(`[${new Date().toISOString()}] ${method} ${url} ${res.statusCode} ${responseTime}ms`);
    return originalEnd.call(this, chunk, encoding);
  };

  // 记录请求开始时间
  req.startTime = Date.now();

  next();
};

module.exports = {
  encryptSensitiveData,
  decryptSensitiveData,
  validateApiKey,
  securityLogger,
};

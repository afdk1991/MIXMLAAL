/**
 * API安全中间件
 * 版本: v1.0.0.0
 * 说明: API密钥管理、请求签名验证、防重放攻击
 */

const crypto = require('crypto');
const moment = require('moment');

// 尝试导入缓存模块，如果失败则使用模拟实现
let cacheService;
try {
  cacheService = require('../utils/cache');
} catch (error) {
  console.warn('缓存模块加载失败，使用模拟实现:', error.message);
  // 模拟实现
  cacheService = {
    get: () => null,
    set: () => false,
    del: () => false,
  };
}

// API密钥管理
class ApiKeyManager {
  constructor() {
    // 内存存储API密钥（生产环境应使用数据库）
    this.apiKeys = new Map();
    // 初始化默认API密钥（仅用于开发环境）
    if (process.env.NODE_ENV === 'development') {
      this.apiKeys.set('test-api-key', {
        key: 'test-api-key',
        secret: 'test-api-secret-very-long-and-secure',
        name: 'Test API Key',
        status: 'active',
        createdAt: new Date(),
        lastUsedAt: null,
        permissions: ['read', 'write'],
      });
    }
  }

  /**
   * 获取API密钥信息
   * @param {string} apiKey - API密钥
   * @returns {Object|null} API密钥信息
   */
  getApiKey(apiKey) {
    return this.apiKeys.get(apiKey) || null;
  }

  /**
   * 验证API密钥是否有效
   * @param {string} apiKey - API密钥
   * @returns {boolean} 是否有效
   */
  validateApiKey(apiKey) {
    const keyInfo = this.getApiKey(apiKey);
    return keyInfo && keyInfo.status === 'active';
  }

  /**
   * 获取API密钥的密钥
   * @param {string} apiKey - API密钥
   * @returns {string|null} 密钥
   */
  getApiSecret(apiKey) {
    const keyInfo = this.getApiKey(apiKey);
    return keyInfo ? keyInfo.secret : null;
  }

  /**
   * 更新API密钥的最后使用时间
   * @param {string} apiKey - API密钥
   */
  updateLastUsed(apiKey) {
    const keyInfo = this.getApiKey(apiKey);
    if (keyInfo) {
      keyInfo.lastUsedAt = new Date();
    }
  }
}

// 初始化API密钥管理器
const apiKeyManager = new ApiKeyManager();

/**
 * 生成请求签名
 * @param {Object} params - 请求参数
 * @param {string} secret - API密钥
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机字符串
 * @returns {string} 签名
 */
const generateSignature = (params, secret, timestamp, nonce) => {
  // 按字典序排序参数
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');

  // 构建签名字符串
  const signatureString = `${timestamp}&${nonce}&${sortedParams}&${secret}`;

  // 使用HMAC-SHA256生成签名
  return crypto
    .createHmac('sha256', secret)
    .update(signatureString)
    .digest('hex');
};

/**
 * 验证请求签名
 * @param {Object} params - 请求参数
 * @param {string} signature - 签名
 * @param {string} apiKey - API密钥
 * @param {string} timestamp - 时间戳
 * @param {string} nonce - 随机字符串
 * @returns {boolean} 签名是否有效
 */
const verifySignature = (params, signature, apiKey, timestamp, nonce) => {
  const secret = apiKeyManager.getApiSecret(apiKey);
  if (!secret) {
    return false;
  }

  // 验证时间戳是否在有效范围内（5分钟）
  const now = moment();
  const requestTime = moment(timestamp);
  if (Math.abs(now.diff(requestTime, 'minutes')) > 5) {
    return false;
  }

  // 验证nonce是否已使用（防重放攻击）
  const nonceKey = `nonce:${apiKey}:${nonce}`;
  if (cacheService.get(nonceKey)) {
    return false;
  }

  // 生成签名并验证
  const expectedSignature = generateSignature(params, secret, timestamp, nonce);
  if (signature !== expectedSignature) {
    return false;
  }

  // 将nonce加入缓存，有效期5分钟
  cacheService.set(nonceKey, '1', 300);

  // 更新API密钥的最后使用时间
  apiKeyManager.updateLastUsed(apiKey);

  return true;
};

/**
 * API密钥认证中间件
 * 验证API密钥和请求签名
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    // 获取API密钥和签名信息
    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];

    // 检查必需的头信息
    if (!apiKey || !signature || !timestamp || !nonce) {
      return res.status(401).json({
        status: 'error',
        code: 'API_KEY_MISSING',
        message: '缺少API密钥或签名信息',
      });
    }

    // 验证API密钥是否有效
    if (!apiKeyManager.validateApiKey(apiKey)) {
      return res.status(401).json({
        status: 'error',
        code: 'API_KEY_INVALID',
        message: 'API密钥无效或已过期',
      });
    }

    // 构建请求参数
    const params = {
      ...req.body,
      ...req.query,
    };

    // 验证签名
    if (!verifySignature(params, signature, apiKey, timestamp, nonce)) {
      return res.status(401).json({
        status: 'error',
        code: 'SIGNATURE_INVALID',
        message: '签名无效或已过期',
      });
    }

    // 将API密钥信息附加到请求对象
    req.apiKey = apiKey;
    req.apiKeyInfo = apiKeyManager.getApiKey(apiKey);

    next();
  } catch (error) {
    console.error('API密钥认证错误:', error);
    return res.status(500).json({
      status: 'error',
      code: 'API_AUTH_ERROR',
      message: 'API认证过程中发生错误',
    });
  }
};

/**
 * 可选的API密钥认证中间件
 * 验证API密钥但不强制要求
 */
const optionalApiKeyAuth = async (req, res, next) => {
  try {
    // 获取API密钥和签名信息
    const apiKey = req.headers['x-api-key'];
    const signature = req.headers['x-signature'];
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];

    // 如果没有提供API密钥，则继续
    if (!apiKey || !signature || !timestamp || !nonce) {
      return next();
    }

    // 验证API密钥是否有效
    if (!apiKeyManager.validateApiKey(apiKey)) {
      return next();
    }

    // 构建请求参数
    const params = {
      ...req.body,
      ...req.query,
    };

    // 验证签名
    if (!verifySignature(params, signature, apiKey, timestamp, nonce)) {
      return next();
    }

    // 将API密钥信息附加到请求对象
    req.apiKey = apiKey;
    req.apiKeyInfo = apiKeyManager.getApiKey(apiKey);

    next();
  } catch (error) {
    console.error('可选API密钥认证错误:', error);
    next();
  }
};

/**
 * CORS中间件
 * 处理跨域请求
 */
const cors = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-API-Key, X-Signature, X-Timestamp, X-Nonce');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  next();
};

/**
 * 请求限流中间件
 * 防止API滥用
 */
const rateLimit = (options) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = {
      status: 'error',
      code: 'RATE_LIMIT_EXCEEDED',
      message: '请求过于频繁，请稍后再试',
    },
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
  } = options || {};

  return async (req, res, next) => {
    try {
      // 获取客户端IP或API密钥
      const key = req.apiKey || req.ip;
      const rateLimitKey = `rate_limit:${key}`;

      // 获取当前请求次数
      const currentCount = await cacheService.get(rateLimitKey) || 0;

      // 检查是否超过限制
      if (currentCount >= max) {
        return res.status(429).json(message);
      }

      // 增加请求次数
      await cacheService.set(rateLimitKey, parseInt(currentCount) + 1, Math.floor(windowMs / 1000));

      next();
    } catch (error) {
      console.error('限流中间件错误:', error);
      next();
    }
  };
};

/**
 * 输入验证中间件
 * 验证请求参数
 */
const validateInput = (schema) => {
  return (req, res, next) => {
    try {
      const { error, value } = schema.validate({
        ...req.body,
        ...req.query,
        ...req.params,
      });

      if (error) {
        return res.status(400).json({
          status: 'error',
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        });
      }

      // 替换请求参数为验证后的值
      req.validatedData = value;

      next();
    } catch (error) {
      console.error('输入验证错误:', error);
      return res.status(400).json({
        status: 'error',
        code: 'VALIDATION_ERROR',
        message: '请求参数验证失败',
      });
    }
  };
};

module.exports = {
  apiKeyAuth,
  optionalApiKeyAuth,
  cors,
  rateLimit,
  validateInput,
  generateSignature,
  verifySignature,
  apiKeyManager,
};
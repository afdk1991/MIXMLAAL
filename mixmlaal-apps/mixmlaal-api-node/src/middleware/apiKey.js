/**
 * API密钥验证中间件
 * 版本: 0.0.0.4
 * 说明: 用于验证API密钥，确保API访问安全
 *
 * 安全说明:
 * 1. API密钥现在通过环境变量JSON数组存储，不再使用逗号分隔
 * 2. 支持密钥轮换机制
 * 3. 建议生产环境使用专门的密钥管理服务（如AWS Secrets Manager、HashiCorp Vault）
 */

const winston = require('winston');
const crypto = require('crypto');

const API_KEY_CONFIG = {
  storageMode: process.env.API_KEY_STORAGE_MODE || 'env',
  keyRotationEnabled: process.env.API_KEY_ROTATION_ENABLED === 'true',
  lastRotation: process.env.API_KEY_LAST_ROTATION || null,
  rotationIntervalDays: parseInt(process.env.API_KEY_ROTATION_INTERVAL_DAYS) || 90
};

let cachedApiKeys = null;

/**
 * 解析API密钥
 * 支持两种格式：
 * 1. JSON数组格式: '["key1","key2"]'
 * 2. 逗号分隔格式（已废弃，仅兼容）: 'key1,key2'
 * @returns {Array<string>} API密钥数组
 */
function parseApiKeys() {
  if (cachedApiKeys) {
    return cachedApiKeys;
  }

  const rawKeys = process.env.API_KEYS;

  if (!rawKeys) {
    cachedApiKeys = [];
    return cachedApiKeys;
  }

  try {
    if (rawKeys.startsWith('[')) {
      cachedApiKeys = JSON.parse(rawKeys);
    } else {
      cachedApiKeys = rawKeys.split(',').map(k => k.trim()).filter(k => k.length > 0);
      console.warn('API密钥使用逗号分隔格式，建议迁移到JSON数组格式');
    }
  } catch (error) {
    console.error('API密钥解析失败:', error.message);
    cachedApiKeys = [];
  }

  return cachedApiKeys;
}

/**
 * 清除API密钥缓存
 */
function clearApiKeyCache() {
  cachedApiKeys = null;
}

/**
 * 验证API密钥是否有效
 * @param {string} apiKey - API密钥
 * @returns {Object} 验证结果
 */
function validateApiKey(apiKey) {
  if (!apiKey || typeof apiKey !== 'string') {
    return { valid: false, error: 'API密钥格式无效' };
  }

  if (apiKey.length < 16) {
    return { valid: false, error: 'API密钥长度不足' };
  }

  if (!/^mk_[a-zA-Z0-9]{64}$/.test(apiKey)) {
    return { valid: false, error: 'API密钥格式无效，应为 mk_ 前缀加64位字母数字' };
  }

  return { valid: true };
}

/**
 * 检查是否需要密钥轮换
 * @returns {boolean} 是否需要轮换
 */
function needsKeyRotation() {
  if (!API_KEY_CONFIG.keyRotationEnabled) {
    return false;
  }

  if (!API_KEY_CONFIG.lastRotation) {
    return true;
  }

  const lastRotationDate = new Date(API_KEY_CONFIG.lastRotation);
  const daysSinceRotation = Math.floor((Date.now() - lastRotationDate) / (1000 * 60 * 60 * 24));

  return daysSinceRotation >= API_KEY_CONFIG.rotationIntervalDays;
}

/**
 * 生成新的API密钥
 * @returns {string} 新密钥，格式为 mk_ 前缀加64位字母数字
 */
function generateNewApiKey() {
  return `mk_${crypto.randomBytes(32).toString('hex')}`;
}

const apiKeyMiddleware = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKeys = parseApiKeys();

    if (needsKeyRotation()) {
      winston.warn('API密钥需要轮换', {
        lastRotation: API_KEY_CONFIG.lastRotation,
        intervalDays: API_KEY_CONFIG.rotationIntervalDays
      });
    }

    if (!apiKey) {
      winston.warn('API密钥缺失', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return res.status(401).json({
        code: 401,
        message: '缺少API密钥',
        data: null
      });
    }

    const keyValidation = validateApiKey(apiKey);
    if (!keyValidation.valid) {
      winston.warn('API密钥格式无效', {
        path: req.path,
        method: req.method,
        ip: req.ip,
        error: keyValidation.error
      });

      return res.status(401).json({
        code: 401,
        message: 'API密钥格式无效',
        data: null
      });
    }

    if (!validApiKeys.includes(apiKey)) {
      winston.warn('无效的API密钥', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });

      return res.status(401).json({
        code: 401,
        message: '无效的API密钥',
        data: null
      });
    }

    winston.info('API密钥验证通过', {
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    next();
  } catch (error) {
    winston.error('API密钥验证错误', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    return res.status(500).json({
      code: 500,
      message: '服务器内部错误',
      data: {
        error: error.message
      }
    });
  }
};

const optionalApiKeyMiddleware = (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.query.apiKey;
    const validApiKeys = parseApiKeys();

    if (apiKey) {
      const keyValidation = validateApiKey(apiKey);
      if (!keyValidation.valid) {
        winston.warn('无效的API密钥', {
          path: req.path,
          method: req.method,
          ip: req.ip,
          error: keyValidation.error
        });

        return res.status(401).json({
          code: 401,
          message: 'API密钥格式无效',
          data: null
        });
      }

      if (!validApiKeys.includes(apiKey)) {
        winston.warn('无效的API密钥', {
          path: req.path,
          method: req.method,
          ip: req.ip
        });

        return res.status(401).json({
          code: 401,
          message: '无效的API密钥',
          data: null
        });
      }

      winston.info('API密钥验证通过', {
        path: req.path,
        method: req.method,
        ip: req.ip
      });
    }

    next();
  } catch (error) {
    winston.error('API密钥验证错误', {
      error: error.message,
      path: req.path,
      method: req.method,
      ip: req.ip
    });

    next();
  }
};

module.exports = {
  apiKeyMiddleware,
  optionalApiKeyMiddleware,
  parseApiKeys,
  clearApiKeyCache,
  validateApiKey,
  needsKeyRotation,
  generateNewApiKey
};
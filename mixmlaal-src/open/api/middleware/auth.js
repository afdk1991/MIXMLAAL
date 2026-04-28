/**
 * JWT认证中间件
 * 版本: v1.0.0.0
 * 说明: Token验证、刷新、黑名单管理
 */

const jwt = require('jsonwebtoken');

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

// JWT配置
const JWT_SECRET = process.env.JWT_SECRET || (process.env.NODE_ENV === 'test' ? 'test-jwt-secret-key-for-testing-only-min-32-characters' : null);
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (process.env.NODE_ENV === 'test' ? 'test-refresh-secret-key-for-testing-only-min-32-characters' : null);
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// 启动时验证JWT密钥
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  console.error('错误: JWT_SECRET 必须设置且至少32个字符');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

if (!JWT_REFRESH_SECRET || JWT_REFRESH_SECRET.length < 32) {
  console.error('错误: JWT_REFRESH_SECRET 必须设置且至少32个字符');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

// Token黑名单前缀
const BLACKLIST_PREFIX = 'blacklist:token:';

/**
 * 生成Access Token
 * @param {Object} payload - Token载荷
 * @returns {string} JWT Token
 */
const generateAccessToken = payload => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'mixmlaal-api',
    audience: 'mixmlaal-client',
  });
};

/**
 * 生成Refresh Token
 * @param {Object} payload - Token载荷
 * @returns {string} JWT Refresh Token
 */
const generateRefreshToken = payload => {
  return jwt.sign(
    { ...payload, type: 'refresh' },
    JWT_REFRESH_SECRET,
    {
      expiresIn: JWT_REFRESH_EXPIRES_IN,
      issuer: 'mixmlaal-api',
      audience: 'mixmlaal-client',
    },
  );
};

/**
 * 验证Access Token
 * @param {string} token - JWT Token
 * @returns {Promise<Object|null>} 解码后的payload或null
 */
const verifyAccessToken = async token => {
  try {
    // 检查是否在黑名单
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return null;
    }
    return jwt.verify(token, JWT_SECRET, {
      issuer: 'mixmlaal-api',
      audience: 'mixmlaal-client',
    });
  } catch (error) {
    return null;
  }
};

/**
 * 验证Refresh Token
 * @param {string} token - JWT Refresh Token
 * @returns {Promise<Object|null>} 解码后的payload或null
 */
const verifyRefreshToken = async token => {
  try {
    // 检查是否在黑名单
    const isBlacklisted = await isTokenBlacklisted(token);
    if (isBlacklisted) {
      return null;
    }
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: 'mixmlaal-api',
      audience: 'mixmlaal-client',
    });
  } catch (error) {
    return null;
  }
};

/**
 * 检查Token是否在黑名单中
 * @param {string} token - JWT Token
 * @returns {Promise<boolean>} 是否在黑名单中
 */
const isTokenBlacklisted = async token => {
  try {
    const key = `${BLACKLIST_PREFIX}${token}`;
    const result = await cacheService.get(key);
    return result !== null;
  } catch (error) {
    console.error('检查Token黑名单失败:', error);
    return false;
  }
};

/**
 * 将Token加入黑名单
 * @param {string} token - JWT Token
 * @param {number} expiresIn - Token过期时间（秒）
 * @returns {Promise<boolean>} 是否成功加入黑名单
 */
const addToBlacklist = async (token, expiresIn = 86400) => {
  try {
    const key = `${BLACKLIST_PREFIX}${token}`;
    return await cacheService.set(key, '1', expiresIn);
  } catch (error) {
    console.error('加入黑名单失败:', error);
    return false;
  }
};

/**
 * JWT认证中间件
 * 验证请求中的Authorization头
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_MISSING',
        message: '未提供认证Token',
      });
    }

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_FORMAT_ERROR',
        message: 'Token格式错误，请使用Bearer格式',
      });
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        code: 'TOKEN_INVALID',
        message: 'Token无效或已过期',
      });
    }

    // 将用户信息附加到请求对象
    req.user = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role || 'user',
    };
    req.token = token;

    next();
  } catch (error) {
    console.error('认证错误:', error);
    return res.status(500).json({
      status: 'error',
      code: 'AUTH_ERROR',
      message: '认证过程中发生错误',
    });
  }
};

/**
 * 可选认证中间件
 * 验证Token但不强制要求，用于需要获取用户信息但不需要登录的接口
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.substring(7);
    const decoded = await verifyAccessToken(token);

    if (decoded) {
      req.user = {
        userId: decoded.userId,
        phone: decoded.phone,
        role: decoded.role || 'user',
      };
      req.token = token;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * 角色授权中间件
 * @param {...string} allowedRoles - 允许的角色列表
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: '请先登录',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        status: 'error',
        code: 'FORBIDDEN',
        message: '您没有权限执行此操作',
      });
    }

    next();
  };
};

/**
 * Token刷新处理
 * 使用Refresh Token获取新的Access Token
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        status: 'error',
        code: 'REFRESH_TOKEN_MISSING',
        message: '未提供Refresh Token',
      });
    }

    const decoded = await verifyRefreshToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({
        status: 'error',
        code: 'REFRESH_TOKEN_INVALID',
        message: 'Refresh Token无效或已过期',
      });
    }

    // 将旧Refresh Token加入黑名单
    await addToBlacklist(refreshToken);

    // 生成新的Token对
    const payload = {
      userId: decoded.userId,
      phone: decoded.phone,
      role: decoded.role || 'user',
    };

    const newAccessToken = generateAccessToken(payload);
    const newRefreshToken = generateRefreshToken(payload);

    return res.json({
      status: 'success',
      message: 'Token刷新成功',
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        expiresIn: JWT_EXPIRES_IN,
      },
    });
  } catch (error) {
    console.error('Token刷新错误:', error);
    return res.status(500).json({
      status: 'error',
      code: 'REFRESH_ERROR',
      message: 'Token刷新失败',
    });
  }
};

/**
 * 登出处理
 * 将当前Token加入黑名单
 */
const logout = async (req, res) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      // 获取Token过期时间
      try {
        const decoded = jwt.decode(token);
        if (decoded && decoded.exp) {
          const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
          await addToBlacklist(token, Math.max(expiresIn, 0));
        }
      } catch (e) {
        await addToBlacklist(token);
      }
    }

    return res.json({
      status: 'success',
      message: '登出成功',
    });
  } catch (error) {
    console.error('登出错误:', error);
    return res.status(500).json({
      status: 'error',
      code: 'LOGOUT_ERROR',
      message: '登出失败',
    });
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  addToBlacklist,
  authenticate,
  optionalAuth,
  authorize,
  refreshToken,
  logout,
  JWT_SECRET,
  JWT_REFRESH_SECRET,
  JWT_EXPIRES_IN,
  JWT_REFRESH_EXPIRES_IN,
};

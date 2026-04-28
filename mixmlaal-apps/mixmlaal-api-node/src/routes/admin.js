const express = require('express');
const crypto = require('crypto');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

/**
 * 管理后台模块路由
 * 对应域名: admin.laal.top
 * 用途: 管理后台入口
 *
 * 安全说明:
 * 1. 当前实现为演示模式，生产环境需配置真实数据库
 * 2. 密码使用bcrypt加密存储
 * 3. 使用JWT进行身份认证
 * 4. JWT密钥在每次认证请求时进行强度验证
 */

const ADMIN_CONFIG = {
  mode: process.env.ADMIN_AUTH_MODE || 'demo',
  jwtSecret: process.env.JWT_SECRET || 'demo-secret-change-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  demoAdmin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    passwordHash: process.env.ADMIN_PASSWORD_HASH || ''
  }
};

// 生产环境必须配置管理员密码
if (!ADMIN_CONFIG.demoAdmin.passwordHash && process.env.NODE_ENV === 'production') {
  throw new Error('生产环境必须配置管理员密码');
}

let jwtKeyValidationCache = null;
let lastValidationTime = 0;
const VALIDATION_CACHE_MS = 60000;

function validateJwtKeyStrength(secret) {
  const errors = [];

  if (!secret || typeof secret !== 'string') {
    errors.push('JWT密钥不能为空');
    return { valid: false, errors };
  }

  if (secret.includes('demo')) {
    errors.push('JWT密钥不能包含"demo"');
  }

  if (secret.length < 32) {
    errors.push('JWT密钥长度必须至少32位');
  }

  if (!/[A-Z]/.test(secret)) {
    errors.push('JWT密钥应包含大写字母');
  }

  if (!/[a-z]/.test(secret)) {
    errors.push('JWT密钥应包含小写字母');
  }

  if (!/[0-9]/.test(secret)) {
    errors.push('JWT密钥应包含数字');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateJwtKeyAtRuntime() {
  const now = Date.now();

  if (now - lastValidationTime < VALIDATION_CACHE_MS && jwtKeyValidationCache !== null) {
    return jwtKeyValidationCache;
  }

  const currentSecret = process.env.JWT_SECRET || ADMIN_CONFIG.jwtSecret;
  const validation = validateJwtKeyStrength(currentSecret);

  if (process.env.NODE_ENV === 'production') {
    if (!validation.valid) {
      const error = new Error('生产环境JWT密钥强度不足: ' + validation.errors.join(', '));
      error.code = 'INVALID_JWT_KEY';
      throw error;
    }
  }

  jwtKeyValidationCache = validation;
  lastValidationTime = now;

  return validation;
}

function clearJwtValidationCache() {
  jwtKeyValidationCache = null;
  lastValidationTime = 0;
}

if (process.env.NODE_ENV === 'production') {
  const validation = validateJwtKeyStrength(ADMIN_CONFIG.jwtSecret);
  if (!validation.valid) {
    throw new Error('生产环境必须设置强JWT密钥（' + validation.errors.join(', ') + '）');
  }
  if (!ADMIN_CONFIG.demoAdmin.passwordHash || ADMIN_CONFIG.demoAdmin.passwordHash.length < 60) {
    throw new Error('生产环境必须设置安全的密码哈希');
  }
  console.log('✓ 生产环境JWT密钥验证通过');
} else {
  console.warn('⚠ 开发环境使用演示JWT密钥，生产环境请设置强密钥');
}

if (!ADMIN_CONFIG.demoAdmin.passwordHash) {
  ADMIN_CONFIG.demoAdmin.passwordHash = '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW'; // admin123
  console.warn('警告: 使用默认管理员密码哈希，请通过ADMIN_PASSWORD_HASH环境变量设置安全密码');
}

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function generateToken(user) {
  validateJwtKeyAtRuntime();

  return jwt.sign({
    id: user.id,
    username: user.username,
    role: user.role,
    type: 'admin'
  }, process.env.JWT_SECRET || ADMIN_CONFIG.jwtSecret, { expiresIn: ADMIN_CONFIG.jwtExpiresIn });
}

const demoUsers = [
  {
    id: 1,
    username: 'admin',
    passwordHash: ADMIN_CONFIG.demoAdmin.passwordHash,
    role: 'super_admin',
    status: 'active',
    createdAt: new Date('2024-01-01').toISOString()
  },
  {
    id: 2,
    username: 'editor',
    passwordHash: '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // editor123
    role: 'editor',
    status: 'active',
    createdAt: new Date('2024-01-15').toISOString()
  }
];

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({
      code: 400,
      message: '用户名和密码不能为空',
      data: null
    });
  }

  if (ADMIN_CONFIG.mode === 'demo') {
    const user = demoUsers.find(u => u.username === username);

    if (!user) {
      return res.json({
        code: 401,
        message: '用户名或密码错误',
        data: null
      });
    }

    try {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return res.json({
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      const token = generateToken(user);

      return res.json({
        code: 200,
        message: 'success',
        data: {
          token: token,
          tokenType: 'Bearer',
          expiresIn: ADMIN_CONFIG.jwtExpiresIn,
          user: {
            id: user.id,
            username: user.username,
            role: user.role,
            status: user.status
          },
          demo: true,
          notice: '演示模式：此登录仅用于功能验证，生产环境请配置真实的认证系统'
        }
      });
    } catch (error) {
      return res.json({
        code: 500,
        message: '密码验证失败',
        data: null
      });
    }
  }

  res.json({
    code: 503,
    message: '生产认证模式暂未实现，请联系系统管理员',
    data: {
      mode: ADMIN_CONFIG.mode,
      setupRequired: [
        '配置数据库连接 (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD)',
        '设置JWT密钥 (JWT_SECRET)',
        '配置管理员账号 (ADMIN_USERNAME, ADMIN_PASSWORD_HASH)',
        '启用生产模式 (ADMIN_AUTH_MODE=production)'
      ]
    }
  });
});

router.post('/verify-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  const token = authHeader.substring(7);

  if (ADMIN_CONFIG.mode === 'demo') {
    try {
      validateJwtKeyAtRuntime();

      const decoded = jwt.verify(token, process.env.JWT_SECRET || ADMIN_CONFIG.jwtSecret);
      return res.json({
        code: 200,
        message: 'success',
        data: {
          valid: true,
          demo: true,
          user: {
            id: decoded.id || 1,
            username: decoded.username || 'admin',
            role: decoded.role || 'super_admin'
          },
          decoded: decoded,
          keyValidation: jwtKeyValidationCache
        }
      });
    } catch (error) {
      return res.json({
        code: 401,
        message: '无效的令牌: ' + error.message,
        data: null
      });
    }
  }

  res.json({
    code: 401,
    message: '令牌验证功能仅在演示模式下可用',
    data: null
  });
});

router.post('/refresh-token', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.json({
      code: 401,
      message: '未提供认证令牌',
      data: null
    });
  }

  const token = authHeader.substring(7);

  if (ADMIN_CONFIG.mode === 'demo') {
    try {
      validateJwtKeyAtRuntime();

      const decoded = jwt.verify(token, process.env.JWT_SECRET || ADMIN_CONFIG.jwtSecret, { ignoreExpiration: true });

      const newToken = jwt.sign({
        id: decoded.id,
        username: decoded.username,
        role: decoded.role,
        type: 'admin'
      }, process.env.JWT_SECRET || ADMIN_CONFIG.jwtSecret, { expiresIn: ADMIN_CONFIG.jwtExpiresIn });

      return res.json({
        code: 200,
        message: 'success',
        data: {
          token: newToken,
          tokenType: 'Bearer',
          expiresIn: ADMIN_CONFIG.jwtExpiresIn,
          demo: true
        }
      });
    } catch (error) {
      return res.json({
        code: 401,
        message: '无效的令牌',
        data: null
      });
    }
  }

  res.json({
    code: 401,
    message: '令牌刷新功能仅在演示模式下可用',
    data: null
  });
});

router.post('/validate-key', (req, res) => {
  try {
    const validation = validateJwtKeyAtRuntime();

    return res.json({
      code: 200,
      message: 'success',
      data: {
        valid: validation.valid,
        errors: validation.errors,
        environment: process.env.NODE_ENV || 'development',
        cached: lastValidationTime > 0,
        lastValidated: new Date(lastValidationTime).toISOString()
      }
    });
  } catch (error) {
    return res.json({
      code: error.code === 'INVALID_JWT_KEY' ? 400 : 500,
      message: error.message,
      data: null
    });
  }
});

router.post('/clear-key-cache', (req, res) => {
  clearJwtValidationCache();

  return res.json({
    code: 200,
    message: '密钥验证缓存已清除',
    data: {
      cleared: true,
      timestamp: new Date().toISOString()
    }
  });
});

// 获取管理员列表
router.get('/users', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        username: 'admin',
        role: 'super_admin',
        status: 'active'
      },
      {
        id: 2,
        username: 'editor',
        role: 'editor',
        status: 'active'
      }
    ]
  });
});

// 获取系统统计
router.get('/stats', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      users: 1000,
      orders: 500,
      sales: 100000,
      products: 200
    }
  });
});

// 系统配置管理
router.get('/config', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      siteName: '拉阿狸',
      siteUrl: 'https://laal.top',
      maintenanceMode: false
    }
  });
});

router.put('/config', (req, res) => {
  res.json({
    code: 200,
    message: '配置更新成功',
    data: req.body
  });
});

module.exports = router;

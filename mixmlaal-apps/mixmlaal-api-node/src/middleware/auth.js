const { verifyToken } = require('../config/jwt');
const { cache } = require('../config/redis');

// 认证中间件
const authMiddleware = async (req, res, next) => {
  try {
    // 从请求头获取令牌
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 10002,
        message: '缺少认证令牌',
        data: null
      });
    }
    
    const token = authHeader.split(' ')[1];
    
    // 验证令牌
    const decoded = verifyToken(token);
    
    if (!decoded) {
      return res.status(401).json({
        code: 10003,
        message: '令牌无效或已过期',
        data: null
      });
    }
    
    // 从缓存中验证令牌是否存在
    const cacheKey = `token:${decoded.id}`;
    const cachedToken = await cache.get(cacheKey);
    
    if (!cachedToken) {
      return res.status(401).json({
        code: 10003,
        message: '令牌已被注销',
        data: null
      });
    }
    
    // 将用户信息存储在请求对象中
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    return res.status(401).json({
      code: 10003,
      message: '认证失败',
      data: null
    });
  }
};

// 权限中间件
const permissionMiddleware = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          code: 10002,
          message: '缺少认证信息',
          data: null
        });
      }
      
      // 检查用户是否拥有所需权限
      if (!user.permissions || !user.permissions.includes(requiredPermission)) {
        return res.status(403).json({
          code: 10004,
          message: '权限不足',
          data: null
        });
      }
      
      next();
    } catch (error) {
      console.error('权限中间件错误:', error);
      return res.status(403).json({
        code: 10004,
        message: '权限验证失败',
        data: null
      });
    }
  };
};

module.exports = {
  authMiddleware,
  permissionMiddleware
};
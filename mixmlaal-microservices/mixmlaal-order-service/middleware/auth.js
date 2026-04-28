const jwt = require('jsonwebtoken');

// 认证中间件
const auth = (roles = []) => {
  // 如果roles是字符串，转换为数组
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    // 从请求头获取token
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ status: 'error', message: '未提供认证令牌' });
    }

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      req.user = decoded;

      // 检查角色权限
      if (roles.length > 0 && !roles.includes(decoded.role)) {
        return res.status(403).json({ status: 'error', message: '权限不足' });
      }

      next();
    } catch (error) {
      console.error('认证失败:', error);
      res.status(401).json({ status: 'error', message: '无效的认证令牌' });
    }
  };
};

module.exports = auth;
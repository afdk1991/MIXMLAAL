const errorHandler = (err, req, res, next) => {
  console.error('认证服务错误:', err);

  // 处理Sequelize错误
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(error => error.message);
    return res.status(400).json({
      code: 400,
      message: '数据验证失败',
      data: errors
    });
  }

  // 处理Sequelize数据库错误
  if (err.name === 'SequelizeDatabaseError') {
    return res.status(500).json({
      code: 500,
      message: '数据库错误',
      data: null
    });
  }

  // 处理JWT错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      code: 401,
      message: 'token无效',
      data: null
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      code: 401,
      message: 'token已过期',
      data: null
    });
  }

  // 处理其他错误
  return res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
};

module.exports = errorHandler;
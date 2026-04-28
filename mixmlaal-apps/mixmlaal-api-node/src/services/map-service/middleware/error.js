const errorHandler = (err, req, res, next) => {
  console.error('地图服务错误:', err);

  // 处理Axios错误
  if (err.response) {
    // 服务器返回错误状态码
    return res.status(err.response.status).json({
      code: err.response.status,
      message: '地图API请求失败',
      data: null
    });
  } else if (err.request) {
    // 请求已发送但没有收到响应
    return res.status(500).json({
      code: 500,
      message: '地图API无响应',
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
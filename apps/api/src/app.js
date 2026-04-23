const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const { testDatabaseConnection } = require('./config/database');
const { connectRedis } = require('./config/redis');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 配置中间件
app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 10005,
    message: '请求过于频繁，请稍后再试',
    data: null
  }
});

app.use(limiter);

// 注册路由
app.use('/api/v1', routes);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    code: 40001,
    message: '服务器内部错误',
    data: null
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testDatabaseConnection();
    
    // 连接Redis
    await connectRedis();
    
    // 启动服务器
    app.listen(PORT, () => {
      console.log(`服务器已启动，监听端口 ${PORT}`);
      console.log(`API文档地址: http://localhost:${PORT}/api/v1/api-docs`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
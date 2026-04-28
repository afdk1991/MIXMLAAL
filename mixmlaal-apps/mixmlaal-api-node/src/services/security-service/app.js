const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const routes = require('./routes');
const errorHandler = require('./middleware/error');

const app = express();

// 安全中间件
app.use(helmet());

// 跨域中间件
app.use(cors());

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 速率限制中间件
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null
  }
});
app.use('/api/security', limiter);

// 路由
app.use('/api/security', routes);

// 错误处理中间件
app.use(errorHandler);

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

const PORT = process.env.PORT || 3005;

app.listen(PORT, () => {
  console.log(`Security service running on port ${PORT}`);
});

module.exports = app;
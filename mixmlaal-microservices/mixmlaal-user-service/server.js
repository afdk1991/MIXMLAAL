const express = require('express');
const Consul = require('consul');
const passport = require('passport');
const cors = require('cors');
const winston = require('winston');

// 配置日志
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'user-service.log' })
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// 安全中间件
const { securityMiddleware, rateLimitMiddleware, loggerMiddleware } = require('./middleware/security');
app.use(securityMiddleware);
app.use(rateLimitMiddleware({ windowMs: 60000, max: 100 }));
app.use(loggerMiddleware);

// 配置Consul
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500
});

// 注册服务到Consul
const registerService = async () => {
  try {
    await consul.agent.service.register({
      name: 'user-service',
      id: `user-service-${PORT}`,
      address: process.env.SERVICE_HOST || 'user-service',
      port: parseInt(PORT),
      check: {
        HTTP: `http://${process.env.SERVICE_HOST || 'user-service'}:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    logger.info('服务注册到Consul成功');
  } catch (error) {
    logger.error('服务注册到Consul失败:', error);
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 导入路由
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const roleRoutes = require('./routes/role');
const permissionRoutes = require('./routes/permission');

// 注册路由
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/roles', roleRoutes);
app.use('/api/v1/permissions', permissionRoutes);

// 启动服务
app.listen(PORT, async () => {
  logger.info(`用户服务启动在端口 ${PORT}`);
  await registerService();
});

// 优雅关闭
process.on('SIGINT', async () => {
  try {
    await consul.agent.service.deregister(`user-service-${PORT}`);
    logger.info('服务从Consul注销成功');
  } catch (error) {
    logger.error('服务从Consul注销失败:', error);
  }
  process.exit(0);
});
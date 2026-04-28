const express = require('express');
const Consul = require('consul');
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
    new winston.transports.File({ filename: 'order-service.log' })
  ]
});

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置Consul
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500
});

// 初始化缓存
const cache = require('./config/cache');

// 初始化数据同步
const sync = require('./config/sync');

// 注册服务到Consul
const registerService = async () => {
  try {
    await consul.agent.service.register({
      name: 'order-service',
      id: `order-service-${PORT}`,
      address: process.env.SERVICE_HOST || 'order-service',
      port: parseInt(PORT),
      check: {
        HTTP: `http://${process.env.SERVICE_HOST || 'order-service'}:${PORT}/health`,
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
const orderRoutes = require('./routes/order');
const rideRoutes = require('./routes/ride');
const foodRoutes = require('./routes/food');
const errandRoutes = require('./routes/errand');
const logisticsRoutes = require('./routes/logistics');

// 注册路由
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/ride', rideRoutes);
app.use('/api/v1/food', foodRoutes);
app.use('/api/v1/errand', errandRoutes);
app.use('/api/v1/logistics', logisticsRoutes);

// 启动服务
app.listen(PORT, async () => {
  logger.info(`订单服务启动在端口 ${PORT}`);
  await registerService();
  // 初始化Kafka
  sync.initKafka();
  logger.info('数据同步服务初始化成功');
});

// 优雅关闭
process.on('SIGINT', async () => {
  try {
    await consul.agent.service.deregister(`order-service-${PORT}`);
    logger.info('服务从Consul注销成功');
  } catch (error) {
    logger.error('服务从Consul注销失败:', error);
  }
  process.exit(0);
});
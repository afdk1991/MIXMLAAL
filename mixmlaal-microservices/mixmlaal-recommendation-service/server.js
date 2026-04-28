// 推荐服务微服务

const express = require('express');
const cors = require('cors');
const { Consul } = require('consul');
const dotenv = require('dotenv');

// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 3011;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 配置Consul
const consul = new Consul({
  host: process.env.CONSUL_HOST || 'localhost',
  port: process.env.CONSUL_PORT || 8500
});

// 服务注册
const registerService = async () => {
  try {
    await consul.agent.service.register({
      name: 'recommendation-service',
      id: `recommendation-service-${PORT}`,
      address: process.env.SERVICE_HOST || 'localhost',
      port: parseInt(PORT),
      tags: ['recommendation', 'service'],
      check: {
        http: `http://${process.env.SERVICE_HOST || 'localhost'}:${PORT}/health`,
        interval: '10s',
        timeout: '5s'
      }
    });
    console.log('服务注册成功');
  } catch (error) {
    console.error('服务注册失败:', error);
  }
};

// 服务注销
const deregisterService = async () => {
  try {
    await consul.agent.service.deregister(`recommendation-service-${PORT}`);
    console.log('服务注销成功');
  } catch (error) {
    console.error('服务注销失败:', error);
  }
};

// 健康检查
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 导入路由
const recommendationRoutes = require('./routes/recommendation');
app.use('/api/v1/recommendation', recommendationRoutes);

// 启动服务器
app.listen(PORT, async () => {
  console.log(`推荐服务微服务运行在端口 ${PORT}`);
  await registerService();
});

// 优雅关闭
process.on('SIGINT', async () => {
  await deregisterService();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await deregisterService();
  process.exit(0);
});
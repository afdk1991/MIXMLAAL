const express = require('express');
const router = express.Router();

/**
 * 开发测试模块路由
 * 对应域名: dev.laal.top
 * 用途: 开发测试入口
 */

// 获取开发环境信息
router.get('/info', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      environment: 'development',
      version: '1.0.0',
      nodeVersion: '18.17.0',
      dependencies: {
        express: '4.18.2',
        mysql: '2.18.1',
        redis: '4.6.7'
      },
      uptime: '10 days 5 hours 30 minutes'
    }
  });
});

// 健康检查
router.get('/health', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'healthy',
      services: [
        { name: 'api', status: 'up' },
        { name: 'database', status: 'up' },
        { name: 'cache', status: 'up' }
      ],
      timestamp: Date.now()
    }
  });
});

// 测试接口
router.get('/test', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      message: '测试接口正常',
      query: req.query,
      timestamp: Date.now()
    }
  });
});

// 错误测试
router.get('/error', (req, res) => {
  try {
    throw new Error('测试错误');
  } catch (error) {
    res.status(500).json({
      code: 500,
      message: '测试错误',
      data: {
        error: error.message
      }
    });
  }
});

// 性能测试
router.get('/performance', (req, res) => {
  const start = Date.now();
  // 模拟耗时操作
  for (let i = 0; i < 100000000; i++) {
    // 空循环
  }
  const end = Date.now();
  res.json({
    code: 200,
    message: 'success',
    data: {
      executionTime: end - start,
      timestamp: Date.now()
    }
  });
});

// 数据库测试
router.get('/database', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'connected',
      tables: ['users', 'products', 'orders', 'payments'],
      connections: 10
    }
  });
});

// 缓存测试
router.get('/cache', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      status: 'connected',
      keys: 100,
      memory: {
        used: 1024000,
        total: 10240000
      }
    }
  });
});

module.exports = router;
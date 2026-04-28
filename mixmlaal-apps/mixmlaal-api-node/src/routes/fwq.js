const express = require('express');
const router = express.Router();

/**
 * 服务器支撑模块路由
 * 对应域名: fwq.laal.top
 * 用途: 服务器支撑入口
 */

// 获取服务器状态
router.get('/status', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      serverName: 'laal-top-server-01',
      status: 'running',
      uptime: '7 days 12 hours 34 minutes',
      load: {
        1: 0.5,
        5: 0.3,
        15: 0.2
      },
      memory: {
        total: 16384,
        used: 8192,
        free: 8192
      },
      disk: {
        total: 1024000,
        used: 512000,
        free: 512000
      }
    }
  });
});

// 获取服务器列表
router.get('/servers', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: 'laal-top-server-01',
        ip: '110.42.133.52',
        status: 'running',
        role: 'web',
        location: '北京'
      },
      {
        id: 2,
        name: 'laal-top-server-02',
        ip: '110.42.133.53',
        status: 'running',
        role: 'database',
        location: '北京'
      },
      {
        id: 3,
        name: 'laal-top-server-03',
        ip: '110.42.133.54',
        status: 'stopped',
        role: 'backup',
        location: '上海'
      }
    ]
  });
});

// 服务器操作
router.post('/servers/:id/start', (req, res) => {
  res.json({
    code: 200,
    message: '服务器启动成功',
    data: {
      serverId: parseInt(req.params.id),
      status: 'running'
    }
  });
});

router.post('/servers/:id/stop', (req, res) => {
  res.json({
    code: 200,
    message: '服务器停止成功',
    data: {
      serverId: parseInt(req.params.id),
      status: 'stopped'
    }
  });
});

router.post('/servers/:id/restart', (req, res) => {
  res.json({
    code: 200,
    message: '服务器重启成功',
    data: {
      serverId: parseInt(req.params.id),
      status: 'running'
    }
  });
});

// 获取服务器日志
router.get('/logs', (req, res) => {
  const { serverId, type = 'system', limit = 100 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      serverId: serverId ? parseInt(serverId) : null,
      type,
      logs: [
        {
          timestamp: '2024-01-01T00:00:00Z',
          level: 'info',
          message: 'Server started successfully'
        },
        {
          timestamp: '2024-01-01T00:01:00Z',
          level: 'warn',
          message: 'Disk usage above 80%'
        },
        {
          timestamp: '2024-01-01T00:02:00Z',
          level: 'error',
          message: 'Failed to connect to database'
        }
      ]
    }
  });
});

// 获取服务器监控数据
router.get('/monitoring', (req, res) => {
  const { serverId, metric = 'cpu', period = '24h' } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      serverId: serverId ? parseInt(serverId) : null,
      metric,
      period,
      data: [
        { timestamp: '2024-01-01T00:00:00Z', value: 50 },
        { timestamp: '2024-01-01T01:00:00Z', value: 55 },
        { timestamp: '2024-01-01T02:00:00Z', value: 45 },
        { timestamp: '2024-01-01T03:00:00Z', value: 40 },
        { timestamp: '2024-01-01T04:00:00Z', value: 35 }
      ]
    }
  });
});

module.exports = router;
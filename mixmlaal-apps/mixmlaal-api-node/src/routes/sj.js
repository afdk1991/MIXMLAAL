const express = require('express');
const router = express.Router();

/**
 * 数据采集模块路由
 * 对应域名: sj.laal.top
 * 用途: 数据采集入口
 */

// 获取采集任务列表
router.get('/tasks', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '商品数据采集',
        description: '采集电商平台商品数据',
        status: 'running',
        progress: 50,
        startTime: '2024-01-01T00:00:00Z',
        estimatedEndTime: '2024-01-01T01:00:00Z'
      },
      {
        id: 2,
        name: '新闻数据采集',
        description: '采集新闻网站数据',
        status: 'completed',
        progress: 100,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-01T00:30:00Z'
      }
    ]
  });
});

// 创建采集任务
router.post('/tasks', (req, res) => {
  const { name, description, target, schedule } = req.body;
  res.json({
    code: 200,
    message: '采集任务创建成功',
    data: {
      taskId: 'task-123456',
      name,
      description,
      target,
      schedule,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
  });
});

// 获取任务详情
router.get('/tasks/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: id,
      name: '商品数据采集',
      description: '采集电商平台商品数据',
      target: 'https://example.com',
      schedule: 'daily',
      status: 'running',
      progress: 50,
      startTime: '2024-01-01T00:00:00Z',
      estimatedEndTime: '2024-01-01T01:00:00Z',
      statistics: {
        total: 1000,
        collected: 500,
        failed: 10
      }
    }
  });
});

// 启动任务
router.post('/tasks/:id/start', (req, res) => {
  res.json({
    code: 200,
    message: '任务启动成功',
    data: {
      taskId: req.params.id,
      status: 'running',
      startTime: new Date().toISOString()
    }
  });
});

// 停止任务
router.post('/tasks/:id/stop', (req, res) => {
  res.json({
    code: 200,
    message: '任务停止成功',
    data: {
      taskId: req.params.id,
      status: 'stopped',
      endTime: new Date().toISOString()
    }
  });
});

// 获取采集数据
router.get('/data', (req, res) => {
  const { taskId, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 500,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      records: [
        {
          id: 1,
          taskId,
          url: 'https://example.com/product/1',
          title: '商品1',
          price: 99,
          data: { /* 采集的详细数据 */ },
          status: 'success',
          collectedAt: '2024-01-01T00:01:00Z'
        },
        {
          id: 2,
          taskId,
          url: 'https://example.com/product/2',
          title: '商品2',
          price: 199,
          data: { /* 采集的详细数据 */ },
          status: 'success',
          collectedAt: '2024-01-01T00:02:00Z'
        }
      ]
    }
  });
});

// 导出采集数据
router.get('/export', (req, res) => {
  const { taskId, format = 'csv' } = req.query;
  res.json({
    code: 200,
    message: '数据导出成功',
    data: {
      downloadUrl: `https://sj.laal.top/exports/${taskId}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
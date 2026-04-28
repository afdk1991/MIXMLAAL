const express = require('express');
const router = express.Router();

/**
 * 云服务模块路由
 * 对应域名: cloud.laal.top
 * 用途: 云服务模块入口
 */

// 获取云服务列表
router.get('/services', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '云存储',
        description: '安全可靠的云存储服务',
        price: 9.9,
        features: ['10GB空间', '高速传输', '自动备份']
      },
      {
        id: 2,
        name: '云主机',
        description: '高性能云服务器',
        price: 99,
        features: ['1核2G', '100GB SSD', '99.9%可用']
      },
      {
        id: 3,
        name: '云数据库',
        description: '托管式数据库服务',
        price: 49,
        features: ['MySQL 8.0', '自动备份', '高可用']
      }
    ]
  });
});

// 获取云服务详情
router.get('/services/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: '云存储',
      description: '安全可靠的云存储服务，提供大容量、高速度、高可靠性的存储解决方案',
      price: 9.9,
      features: ['10GB空间', '高速传输', '自动备份', '加密存储', 'CDN加速'],
      technicalSpecs: {
        storage: '10GB',
        bandwidth: '100Mbps',
        API: 'RESTful API',
        SDK: 'JavaScript, Python, Java'
      }
    }
  });
});

// 创建云服务实例
router.post('/services/:id/instances', (req, res) => {
  res.json({
    code: 200,
    message: '服务实例创建成功',
    data: {
      instanceId: 'instance-123',
      serviceId: parseInt(req.params.id),
      status: 'running',
      createdAt: new Date().toISOString(),
      endpoint: 'https://cloud.laal.top/instances/instance-123'
    }
  });
});

// 获取用户云服务实例
router.get('/instances', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 'instance-123',
        serviceName: '云存储',
        status: 'running',
        createdAt: '2024-01-01T00:00:00Z',
        endpoint: 'https://cloud.laal.top/instances/instance-123'
      },
      {
        id: 'instance-456',
        serviceName: '云主机',
        status: 'stopped',
        createdAt: '2024-01-02T00:00:00Z',
        endpoint: 'https://cloud.laal.top/instances/instance-456'
      }
    ]
  });
});

// 管理云服务实例
router.post('/instances/:id/start', (req, res) => {
  res.json({
    code: 200,
    message: '实例启动成功',
    data: {
      instanceId: req.params.id,
      status: 'running'
    }
  });
});

router.post('/instances/:id/stop', (req, res) => {
  res.json({
    code: 200,
    message: '实例停止成功',
    data: {
      instanceId: req.params.id,
      status: 'stopped'
    }
  });
});

module.exports = router;
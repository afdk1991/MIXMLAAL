const express = require('express');
const router = express.Router();

/**
 * 服务支撑模块路由
 * 对应域名: service.laal.top
 * 用途: 服务支撑入口
 */

// 获取服务列表
router.get('/list', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '技术支持',
        description: '提供技术咨询和问题解决',
        icon: 'technical',
        status: 'active'
      },
      {
        id: 2,
        name: '商务合作',
        description: '商务合作洽谈',
        icon: 'business',
        status: 'active'
      },
      {
        id: 3,
        name: '广告投放',
        description: '广告投放服务',
        icon: 'advertising',
        status: 'active'
      },
      {
        id: 4,
        name: 'API服务',
        description: '提供API接口服务',
        icon: 'api',
        status: 'active'
      }
    ]
  });
});

// 获取服务详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: '技术支持',
      description: '提供技术咨询和问题解决，包括系统故障、功能使用、接口对接等方面的支持。',
      features: [
        '7x24小时技术支持',
        '专业技术团队',
        '快速响应',
        '远程协助',
        '问题跟踪'
      ],
      contact: {
        phone: '400-123-4567',
        email: 'tech@laal.top',
        wechat: 'laal_tech'
      },
      status: 'active'
    }
  });
});

// 提交服务请求
router.post('/request', (req, res) => {
  const { serviceId, subject, content, contact } = req.body;
  res.json({
    code: 200,
    message: '服务请求提交成功',
    data: {
      requestId: 'req-123456',
      serviceId,
      subject,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTime: '24小时内'
    }
  });
});

// 获取服务请求状态
router.get('/request/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      requestId: id,
      subject: '系统故障',
      status: 'processing',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:01:00Z',
      assignee: '技术支持工程师',
      messages: [
        {
          id: 1,
          content: '您的请求已收到，我们正在处理',
          sender: 'system',
          createdAt: '2024-01-01T00:01:00Z'
        }
      ]
    }
  });
});

// 服务评价
router.post('/:id/rate', (req, res) => {
  const { rating, comment } = req.body;
  res.json({
    code: 200,
    message: '评价提交成功',
    data: {
      serviceId: parseInt(req.params.id),
      rating,
      comment,
      createdAt: new Date().toISOString()
    }
  });
});

// 获取服务评价
router.get('/:id/ratings', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      averageRating: 4.8,
      totalRatings: 100,
      ratings: [
        {
          id: 1,
          rating: 5,
          comment: '服务非常好，响应及时',
          user: 'user1',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          rating: 4,
          comment: '服务不错，解决了问题',
          user: 'user2',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

module.exports = router;
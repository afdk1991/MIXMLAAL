const express = require('express');
const router = express.Router();

/**
 * 技术支持模块路由
 * 对应域名: support.laal.top
 * 用途: 技术支持入口
 */

// 获取支持服务
router.get('/services', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '在线客服',
        description: '在线实时客服支持',
        icon: 'chat',
        status: 'active'
      },
      {
        id: 2,
        name: '电话支持',
        description: '电话咨询服务',
        icon: 'phone',
        status: 'active'
      },
      {
        id: 3,
        name: '邮件支持',
        description: '邮件咨询服务',
        icon: 'email',
        status: 'active'
      },
      {
        id: 4,
        name: '工单系统',
        description: '提交技术工单',
        icon: 'ticket',
        status: 'active'
      }
    ]
  });
});

// 在线客服
router.post('/chat', (req, res) => {
  const { message } = req.body;
  res.json({
    code: 200,
    message: '消息发送成功',
    data: {
      chatId: 'chat-123456',
      message,
      response: '您好，有什么可以帮助您的？',
      timestamp: new Date().toISOString()
    }
  });
});

// 提交工单
router.post('/ticket', (req, res) => {
  const { subject, content, contact, priority } = req.body;
  res.json({
    code: 200,
    message: '工单提交成功',
    data: {
      ticketId: 'ticket-123456',
      subject,
      priority,
      status: 'pending',
      createdAt: new Date().toISOString(),
      estimatedTime: '24小时内'
    }
  });
});

// 获取工单状态
router.get('/ticket/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      ticketId: id,
      subject: '系统故障',
      status: 'processing',
      priority: 'high',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:01:00Z',
      assignee: '技术支持工程师',
      messages: [
        {
          id: 1,
          content: '您的工单已收到，我们正在处理',
          sender: 'system',
          createdAt: '2024-01-01T00:01:00Z'
        }
      ]
    }
  });
});

// 获取常见问题
router.get('/faq', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        question: '如何注册账户？',
        answer: '打开拉阿狸官网，点击右上角的"注册"按钮，填写相关信息即可。'
      },
      {
        id: 2,
        question: '如何修改密码？',
        answer: '登录账户后，进入"个人中心"，点击"修改密码"即可。'
      },
      {
        id: 3,
        question: '支持哪些支付方式？',
        answer: '支持支付宝、微信支付、银行卡等多种支付方式。'
      }
    ]
  });
});

// 联系我们
router.get('/contact', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      phone: '400-123-4567',
      email: 'support@laal.top',
      wechat: 'laal_support',
      address: '北京市朝阳区某某大厦1001室',
      workingHours: '周一至周日 9:00-21:00'
    }
  });
});

// 反馈建议
router.post('/feedback', (req, res) => {
  const { type, content, contact } = req.body;
  res.json({
    code: 200,
    message: '反馈提交成功',
    data: {
      feedbackId: 'feedback-123456',
      type,
      content,
      contact,
      createdAt: new Date().toISOString()
    }
  });
});

module.exports = router;
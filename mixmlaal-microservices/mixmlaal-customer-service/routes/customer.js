// 客服服务路由

const express = require('express');
const router = express.Router();

// 模拟常见问题数据
const faqs = [
  {
    id: '1',
    category: '账户管理',
    question: '如何注册账号？',
    answer: '您可以通过点击首页的"注册"按钮，填写相关信息完成注册。注册时需要提供手机号码或邮箱地址进行验证。'
  },
  {
    id: '2',
    category: '账户管理',
    question: '如何修改密码？',
    answer: '您可以在"个人中心"-"账户设置"中修改密码。修改密码需要验证当前密码，然后设置新密码。'
  },
  {
    id: '3',
    category: '订单管理',
    question: '如何查看我的订单？',
    answer: '您可以在"个人中心"-"我的订单"中查看所有订单状态和详情。'
  },
  {
    id: '4',
    category: '订单管理',
    question: '如何取消订单？',
    answer: '在订单状态为"待支付"或"待发货"时，您可以在订单详情页点击"取消订单"按钮进行取消。如果订单已经发货，需要联系客服进行处理。'
  },
  {
    id: '5',
    category: '支付问题',
    question: '支持哪些支付方式？',
    answer: '我们支持微信支付、支付宝、银行卡等多种支付方式。'
  },
  {
    id: '6',
    category: '支付问题',
    question: '支付失败怎么办？',
    answer: '如果支付失败，您可以检查支付方式是否正确，网络是否正常，或者联系客服进行处理。'
  },
  {
    id: '7',
    category: '配送问题',
    question: '配送范围是哪些？',
    answer: '我们的配送范围覆盖全国大部分城市，具体以订单页面显示为准。'
  },
  {
    id: '8',
    category: '配送问题',
    question: '如何查询物流信息？',
    answer: '您可以在订单详情页查看物流信息，或者通过物流公司官网输入运单号查询。'
  },
  {
    id: '9',
    category: '售后服务',
    question: '如何申请退款？',
    answer: '您可以在"个人中心"-"我的订单"中找到需要退款的订单，点击"申请退款"按钮，填写退款原因和相关信息。'
  },
  {
    id: '10',
    category: '售后服务',
    question: '退款需要多长时间？',
    answer: '退款申请审核通过后，一般会在1-3个工作日内退回到您的支付账户。'
  }
];

// 模拟客服对话数据
const conversations = {
  'user1': [
    {
      id: '1',
      userId: 'user1',
      messages: [
        {
          id: 'm1',
          sender: 'user',
          content: '您好，我想咨询一下如何修改密码？',
          timestamp: '2023-12-01T10:00:00Z'
        },
        {
          id: 'm2',
          sender: 'system',
          content: '您好，欢迎咨询客服。您可以在"个人中心"-"账户设置"中修改密码。修改密码需要验证当前密码，然后设置新密码。',
          timestamp: '2023-12-01T10:01:00Z'
        },
        {
          id: 'm3',
          sender: 'user',
          content: '好的，谢谢。',
          timestamp: '2023-12-01T10:02:00Z'
        }
      ],
      status: 'closed',
      createdAt: '2023-12-01T10:00:00Z',
      closedAt: '2023-12-01T10:02:00Z'
    }
  ],
  'user2': [
    {
      id: '2',
      userId: 'user2',
      messages: [
        {
          id: 'm4',
          sender: 'user',
          content: '您好，我的订单还没有发货，请问什么时候能发货？',
          timestamp: '2023-12-02T14:00:00Z'
        },
        {
          id: 'm5',
          sender: 'system',
          content: '您好，请问您的订单号是多少？我帮您查询一下。',
          timestamp: '2023-12-02T14:01:00Z'
        }
      ],
      status: 'open',
      createdAt: '2023-12-02T14:00:00Z'
    }
  ]
};

// 获取常见问题列表
router.get('/faqs', (req, res) => {
  const { category } = req.query;
  let filteredFaqs = faqs;

  if (category) {
    filteredFaqs = filteredFaqs.filter(faq => faq.category === category);
  }

  res.status(200).json({
    status: 'success',
    data: filteredFaqs
  });
});

// 获取常见问题详情
router.get('/faqs/:id', (req, res) => {
  const { id } = req.params;
  const faq = faqs.find(faq => faq.id === id);

  if (!faq) {
    return res.status(404).json({
      status: 'error',
      message: '常见问题不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: faq
  });
});

// 搜索常见问题
router.get('/faqs/search', (req, res) => {
  const { keyword } = req.query;

  if (!keyword) {
    return res.status(400).json({
      status: 'error',
      message: '缺少搜索关键词'
    });
  }

  const matchedFaqs = faqs.filter(faq => 
    faq.question.includes(keyword) || faq.answer.includes(keyword)
  );

  res.status(200).json({
    status: 'success',
    data: matchedFaqs
  });
});

// 获取用户对话列表
router.get('/conversations', (req, res) => {
  const { userId, status } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  const userConversations = conversations[userId] || [];
  let filteredConversations = userConversations;

  if (status) {
    filteredConversations = filteredConversations.filter(conv => conv.status === status);
  }

  res.status(200).json({
    status: 'success',
    data: filteredConversations
  });
});

// 获取对话详情
router.get('/conversations/:id', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  const userConversations = conversations[userId] || [];
  const conversation = userConversations.find(conv => conv.id === id);

  if (!conversation) {
    return res.status(404).json({
      status: 'error',
      message: '对话不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// 创建新对话
router.post('/conversations', (req, res) => {
  const { userId, message } = req.body;

  if (!userId || !message) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 确保用户对话列表存在
  if (!conversations[userId]) {
    conversations[userId] = [];
  }

  // 创建新对话
  const conversation = {
    id: `conv${Date.now()}`,
    userId,
    messages: [
      {
        id: `m${Date.now()}`,
        sender: 'user',
        content: message,
        timestamp: new Date().toISOString()
      },
      {
        id: `m${Date.now() + 1}`,
        sender: 'system',
        content: '您好，欢迎咨询客服。我们会尽快为您解答问题。',
        timestamp: new Date().toISOString()
      }
    ],
    status: 'open',
    createdAt: new Date().toISOString()
  };

  conversations[userId].push(conversation);

  res.status(201).json({
    status: 'success',
    data: conversation
  });
});

// 发送消息
router.post('/conversations/:id/messages', (req, res) => {
  const { id } = req.params;
  const { userId, content } = req.body;

  if (!userId || !content) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  const userConversations = conversations[userId] || [];
  const conversation = userConversations.find(conv => conv.id === id);

  if (!conversation) {
    return res.status(404).json({
      status: 'error',
      message: '对话不存在'
    });
  }

  if (conversation.status === 'closed') {
    return res.status(400).json({
      status: 'error',
      message: '对话已关闭'
    });
  }

  // 添加用户消息
  const userMessage = {
    id: `m${Date.now()}`,
    sender: 'user',
    content,
    timestamp: new Date().toISOString()
  };
  conversation.messages.push(userMessage);

  // 模拟客服回复
  setTimeout(() => {
    const systemMessage = {
      id: `m${Date.now() + 1}`,
      sender: 'system',
      content: '您好，感谢您的咨询。我们正在处理您的问题，请稍候。',
      timestamp: new Date().toISOString()
    };
    conversation.messages.push(systemMessage);
  }, 1000);

  res.status(201).json({
    status: 'success',
    data: userMessage
  });
});

// 关闭对话
router.put('/conversations/:id/close', (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  const userConversations = conversations[userId] || [];
  const conversation = userConversations.find(conv => conv.id === id);

  if (!conversation) {
    return res.status(404).json({
      status: 'error',
      message: '对话不存在'
    });
  }

  if (conversation.status === 'closed') {
    return res.status(400).json({
      status: 'error',
      message: '对话已关闭'
    });
  }

  conversation.status = 'closed';
  conversation.closedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    data: conversation
  });
});

// 获取联系我们信息
router.get('/contact', (req, res) => {
  const contactInfo = {
    phone: '400-123-4567',
    email: 'service@mixmlaal.com',
    workingHours: '周一至周日 9:00-21:00',
    address: '北京市朝阳区某某大厦1001室'
  };

  res.status(200).json({
    status: 'success',
    data: contactInfo
  });
});

module.exports = router;
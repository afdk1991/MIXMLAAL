const express = require('express');
const app = express();
const PORT = process.env.PORT || 3003;

// 中间件
app.use(express.json());

// 模拟通知数据
const mockNotifications = [
  {
    notificationId: 'NOTIF_1',
    userId: 'USER_001',
    type: 'system',
    title: '系统通知',
    content: '欢迎使用MIXMLAAL平台，祝您使用愉快！',
    isRead: false,
    relatedId: null,
    createdAt: new Date().toISOString()
  },
  {
    notificationId: 'NOTIF_2',
    userId: 'USER_001',
    type: 'order',
    title: '订单状态更新',
    content: '您的外卖订单已送达，感谢您的使用！',
    isRead: false,
    relatedId: 'ORDER_001',
    createdAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
  },
  {
    notificationId: 'NOTIF_3',
    userId: 'USER_001',
    type: 'promotion',
    title: '优惠活动',
    content: '新用户专享优惠，首单立减20元！',
    isRead: true,
    relatedId: null,
    createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
  }
];

// 模拟认证中间件
const mockAuth = (req, res, next) => {
  // 模拟用户ID
  req.user = {
    userId: 'USER_001',
    phone: '13800138000',
    role: 'user'
  };
  next();
};

// 通知API端点
app.get('/api/v1/notification/list', mockAuth, (req, res) => {
  const { limit = 20, offset = 0, unreadOnly = false } = req.query;
  
  let filtered = mockNotifications;
  if (unreadOnly === 'true') {
    filtered = mockNotifications.filter(n => !n.isRead);
  }
  
  const paginated = filtered.slice(offset, offset + parseInt(limit));
  
  res.json({
    status: 'success',
    data: {
      notifications: paginated,
      total: filtered.length,
      limit: parseInt(limit),
      offset: parseInt(offset)
    }
  });
});

app.get('/api/v1/notification/unread-count', mockAuth, (req, res) => {
  const unreadCount = mockNotifications.filter(n => !n.isRead).length;
  
  res.json({
    status: 'success',
    data: {
      unreadCount: unreadCount
    }
  });
});

app.post('/api/v1/notification/mark-read', mockAuth, (req, res) => {
  const { notificationId } = req.body;
  
  if (!notificationId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少通知ID'
    });
  }
  
  const notification = mockNotifications.find(n => n.notificationId === notificationId);
  if (notification) {
    notification.isRead = true;
    res.json({
      status: 'success',
      message: '标记成功'
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: '通知不存在'
    });
  }
});

app.post('/api/v1/notification/mark-all-read', mockAuth, (req, res) => {
  mockNotifications.forEach(notification => {
    notification.isRead = true;
  });
  
  res.json({
    status: 'success',
    message: '标记成功',
    data: {
      markedCount: mockNotifications.length
    }
  });
});

app.delete('/api/v1/notification/:id', mockAuth, (req, res) => {
  const notificationId = req.params.id;
  const index = mockNotifications.findIndex(n => n.notificationId === notificationId);
  
  if (index !== -1) {
    mockNotifications.splice(index, 1);
    res.json({
      status: 'success',
      message: '删除成功'
    });
  } else {
    res.status(404).json({
      status: 'error',
      message: '通知不存在'
    });
  }
});

// 健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      message: 'Notification service is running'
    }
  });
});

// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Notification server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`Notification list: http://localhost:${PORT}/api/v1/notification/list`);
  console.log(`Unread count: http://localhost:${PORT}/api/v1/notification/unread-count`);
});
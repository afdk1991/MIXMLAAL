/**
 * MIXMLAAL API Server (简化版)
 * 版本: v1.0.0.0
 * 说明: 后端API服务入口（简化版，用于测试）
 */

// 加载环境变量
require('dotenv').config();

const express = require('express');

// 创建Express应用
const app = express();
const PORT = 3006;

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 安全中间件
const helmet = require('helmet');
app.use(helmet());

// 访问日志
const morgan = require('morgan');
app.use(morgan('combined'));

// 简单的健康检查
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'success',
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0.0'
    },
  });
});

// 获取未读通知数量
app.get('/api/v1/notification/unread-count', (req, res) => {
  res.json({
    status: 'success',
    data: {
      unreadCount: 2
    },
  });
});

// 获取通知列表
app.get('/api/v1/notification/list', (req, res) => {
  res.json({
    status: 'success',
    data: {
      notifications: [
        {
          id: 'NOTIF_1',
          type: 'system',
          title: '系统通知',
          content: '欢迎使用MIXMLAAL平台，祝您使用愉快！',
          read: false,
          createdAt: new Date().toISOString()
        },
        {
          id: 'NOTIF_2',
          type: 'order',
          title: '订单状态更新',
          content: '您的外卖订单已送达，感谢您的使用！',
          read: false,
          createdAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
        },
        {
          id: 'NOTIF_3',
          type: 'promotion',
          title: '优惠活动',
          content: '新用户专享优惠，首单立减20元！',
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
        }
      ]
    },
  });
});

// 404 处理
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: '接口不存在'
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    status: 'error',
    message: '服务器内部错误'
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
});
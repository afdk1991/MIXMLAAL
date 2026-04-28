/**
 * 通知路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const NotificationService = require('../../../../shared/services/notificationservice.js');

let notificationService;

const getNotificationService = () => {
  if (!notificationService) {
    const db = require('../config/db');
    notificationService = new NotificationService(db);
  }
  return notificationService;
};

router.get('/list', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { page = 1, limit = 20, type = null } = req.query;

    const service = getNotificationService();
    const result = await service.getNotifications(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type: type ? parseInt(type, 10) : null,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('获取通知列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/unread-count', async (req, res) => {
  try {
    const { user_id } = req.user;
    const service = getNotificationService();
    const count = await service.getUnreadCount(user_id);

    res.json({
      status: 'success',
      data: { count },
    });
  } catch (error) {
    console.error('获取未读数量错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/mark-read', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { notification_id } = req.body;

    const service = getNotificationService();
    await service.markAsRead(notification_id);

    res.json({
      status: 'success',
      message: '标记已读成功',
    });
  } catch (error) {
    console.error('标记已读错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/mark-all-read', async (req, res) => {
  try {
    const { user_id } = req.user;
    const service = getNotificationService();
    await service.markAllAsRead(user_id);

    res.json({
      status: 'success',
      message: '全部标记已读成功',
    });
  } catch (error) {
    console.error('标记全部已读错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const service = getNotificationService();
    await service.deleteNotification(id);

    res.json({
      status: 'success',
      message: '删除通知成功',
    });
  } catch (error) {
    console.error('删除通知错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/test', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { title, content } = req.body;

    const service = getNotificationService();
    const notification = await service.sendSystemNotification(user_id, title, content);

    res.json({
      status: 'success',
      data: notification,
    });
  } catch (error) {
    console.error('发送测试通知错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
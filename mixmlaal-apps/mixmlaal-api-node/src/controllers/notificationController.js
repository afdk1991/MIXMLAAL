/**
 * 通知系统控制器
 * 版本: v1.0.0.0
 * 说明: 提供消息推送、站内通知等功能
 */

const Notification = require('../models/Notification');
const { NotificationService } = require('../services/notificationService');

class NotificationController {
  /**
   * 获取用户通知列表
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getUserNotifications(req, res) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20, unreadOnly = false } = req.query;

      const where = { userId };
      if (unreadOnly === 'true') {
        where.isRead = false;
      }

      const notifications = await Notification.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: (parseInt(page) - 1) * parseInt(limit)
      });

      res.json({
        success: true,
        data: {
          notifications: notifications.rows,
          total: notifications.count,
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 标记通知为已读
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async markAsRead(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({ 
        where: { id, userId } 
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: '通知不存在'
        });
      }

      await notification.update({ isRead: true });

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 标记所有通知为已读
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async markAllAsRead(req, res) {
    try {
      const userId = req.user.id;

      await Notification.update(
        { isRead: true },
        { where: { userId, isRead: false } }
      );

      res.json({
        success: true,
        message: '所有通知已标记为已读'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 发送通知
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async sendNotification(req, res) {
    try {
      const { userId, title, content, type, data } = req.body;

      const notification = await NotificationService.sendNotification(
        userId,
        title,
        content,
        type,
        data
      );

      res.json({
        success: true,
        data: notification
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 获取未读通知数量
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.id;

      const count = await Notification.count({
        where: { userId, isRead: false }
      });

      res.json({
        success: true,
        data: { count }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 删除通知
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async deleteNotification(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const notification = await Notification.findOne({ 
        where: { id, userId } 
      });

      if (!notification) {
        return res.status(404).json({
          success: false,
          error: '通知不存在'
        });
      }

      await notification.destroy();

      res.json({
        success: true,
        message: '通知已删除'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = NotificationController;
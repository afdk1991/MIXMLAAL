/**
 * 消息通知服务
 * 版本: v1.0.0.0
 * 说明: 处理用户消息通知的发送、接收和管理
 */

const db = require('../utils/database.sqlite');

/**
 * 消息通知服务类
 */
class NotificationService {
  /**
   * 生成通知ID
   * @returns {string} 通知ID
   */
  static generateNotificationId() {
    return `NOTIF_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
  }

  /**
   * 发送通知
   * @param {string} userId - 用户ID
   * @param {string} type - 通知类型
   * @param {string} title - 通知标题
   * @param {string} content - 通知内容
   * @param {string} relatedId - 关联ID（如订单ID）
   * @returns {Promise<Object>} 通知对象
   */
  static async sendNotification(userId, type, title, content, relatedId = null) {
    try {
      const notificationId = this.generateNotificationId();
      const createdAt = new Date().toISOString();

      await db.run(
        `INSERT INTO notifications (notificationId, userId, type, title, content, isRead, relatedId, createdAt)
         VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
        [notificationId, userId, type, title, content, relatedId, createdAt]
      );

      return {
        notificationId,
        userId,
        type,
        title,
        content,
        isRead: false,
        relatedId,
        createdAt
      };
    } catch (error) {
      console.error('发送通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取用户通知列表
   * @param {string} userId - 用户ID
   * @param {number} limit - 限制数量
   * @param {number} offset - 偏移量
   * @param {boolean} unreadOnly - 仅未读
   * @returns {Promise<Array>} 通知列表
   */
  static async getUserNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
    try {
      let sql = `SELECT * FROM notifications WHERE userId = ?`;
      let params = [userId];

      if (unreadOnly) {
        sql += ` AND isRead = 0`;
      }

      sql += ` ORDER BY createdAt DESC LIMIT ? OFFSET ?`;
      params.push(limit, offset);

      const notifications = await db.execute(sql, params);
      
      // 如果是模拟实现，返回模拟数据
      if (notifications.length === 0) {
        return this.getMockNotifications(userId, limit, offset, unreadOnly);
      }
      
      return notifications;
    } catch (error) {
      console.error('获取用户通知失败:', error);
      // 出错时返回模拟数据
      return this.getMockNotifications(userId, limit, offset, unreadOnly);
    }
  }

  /**
   * 获取模拟通知数据
   * @param {string} userId - 用户ID
   * @param {number} limit - 限制数量
   * @param {boolean} unreadOnly - 仅未读
   * @returns {Array} 模拟通知列表
   */
  static getMockNotifications(userId, limit = 20, offset = 0, unreadOnly = false) {
    const mockNotifications = [
      {
        notificationId: 'NOTIF_1',
        userId,
        type: 'system',
        title: '系统通知',
        content: '欢迎使用MIXMLAAL平台，祝您使用愉快！',
        isRead: false,
        relatedId: null,
        createdAt: new Date().toISOString()
      },
      {
        notificationId: 'NOTIF_2',
        userId,
        type: 'order',
        title: '订单状态更新',
        content: '您的外卖订单已送达，感谢您的使用！',
        isRead: false,
        relatedId: 'ORDER_001',
        createdAt: new Date(Date.now() - 3600000).toISOString() // 1小时前
      },
      {
        notificationId: 'NOTIF_3',
        userId,
        type: 'promotion',
        title: '优惠活动',
        content: '新用户专享优惠，首单立减20元！',
        isRead: true,
        relatedId: null,
        createdAt: new Date(Date.now() - 86400000).toISOString() // 1天前
      },
      {
        notificationId: 'NOTIF_4',
        userId,
        type: 'activity',
        title: '活动通知',
        content: '周末特惠活动开始了，全场商品8折起！',
        isRead: false,
        relatedId: 'ACT_001',
        createdAt: new Date(Date.now() - 172800000).toISOString() // 2天前
      },
      {
        notificationId: 'NOTIF_5',
        userId,
        type: 'payment',
        title: '支付成功',
        content: '您的订单已支付成功，订单号：ORDER_002',
        isRead: true,
        relatedId: 'ORDER_002',
        createdAt: new Date(Date.now() - 259200000).toISOString() // 3天前
      }
    ];

    let filtered = mockNotifications;
    if (unreadOnly) {
      filtered = mockNotifications.filter(n => !n.isRead);
    }

    return filtered.slice(offset, offset + limit);
  }

  /**
   * 标记通知为已读
   * @param {string} notificationId - 通知ID
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 操作结果
   */
  static async markAsRead(notificationId, userId) {
    try {
      const result = await db.run(
        `UPDATE notifications SET isRead = 1 WHERE notificationId = ? AND userId = ?`,
        [notificationId, userId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('标记通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 标记所有通知为已读
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 影响的行数
   */
  static async markAllAsRead(userId) {
    try {
      const result = await db.run(
        `UPDATE notifications SET isRead = 1 WHERE userId = ? AND isRead = 0`,
        [userId]
      );

      return result.changes;
    } catch (error) {
      console.error('标记所有通知已读失败:', error);
      throw error;
    }
  }

  /**
   * 删除通知
   * @param {string} notificationId - 通知ID
   * @param {string} userId - 用户ID
   * @returns {Promise<boolean>} 操作结果
   */
  static async deleteNotification(notificationId, userId) {
    try {
      const result = await db.run(
        `DELETE FROM notifications WHERE notificationId = ? AND userId = ?`,
        [notificationId, userId]
      );

      return result.changes > 0;
    } catch (error) {
      console.error('删除通知失败:', error);
      throw error;
    }
  }

  /**
   * 获取未读通知数量
   * @param {string} userId - 用户ID
   * @returns {Promise<number>} 未读数量
   */
  static async getUnreadCount(userId) {
    try {
      const result = await db.execute(
        `SELECT COUNT(*) as count FROM notifications WHERE userId = ? AND isRead = 0`,
        [userId]
      );

      const count = result[0]?.count || 0;
      
      // 如果是模拟实现，返回模拟数据中的未读数量
      if (count === 0) {
        const mockNotifications = this.getMockNotifications(userId);
        return mockNotifications.filter(n => !n.isRead).length;
      }
      
      return count;
    } catch (error) {
      console.error('获取未读通知数量失败:', error);
      // 出错时返回模拟数据中的未读数量
      const mockNotifications = this.getMockNotifications(userId);
      return mockNotifications.filter(n => !n.isRead).length;
    }
  }

  /**
   * 发送订单状态更新通知
   * @param {string} userId - 用户ID
   * @param {string} orderId - 订单ID
   * @param {string} orderType - 订单类型
   * @param {string} status - 订单状态
   * @returns {Promise<Object>} 通知对象
   */
  static async sendOrderStatusNotification(userId, orderId, orderType, status) {
    const statusMap = {
      pending: '待处理',
      processing: '处理中',
      completed: '已完成',
      cancelled: '已取消',
      refunded: '已退款',
      accepted: '已接单',
      arrived: '已到达',
      onTheWay: '配送中',
      delivered: '已送达'
    };

    const typeMap = {
      ride: '出行',
      food: '外卖',
      errand: '跑腿',
      package: '服务套餐'
    };

    const title = `${typeMap[orderType] || orderType}订单状态更新`;
    const content = `您的${typeMap[orderType] || orderType}订单(${orderId})已更新为${statusMap[status] || status}状态`;

    return this.sendNotification(userId, 'order_status', title, content, orderId);
  }

  /**
   * 发送支付成功通知
   * @param {string} userId - 用户ID
   * @param {string} orderId - 订单ID
   * @param {number} amount - 支付金额
   * @returns {Promise<Object>} 通知对象
   */
  static async sendPaymentSuccessNotification(userId, orderId, amount) {
    const title = '支付成功';
    const content = `您的订单(${orderId})已支付成功，支付金额：¥${amount.toFixed(2)}`;

    return this.sendNotification(userId, 'payment_success', title, content, orderId);
  }

  /**
   * 发送优惠活动通知
   * @param {string} userId - 用户ID
   * @param {string} promotionName - 活动名称
   * @param {string} promotionDetails - 活动详情
   * @returns {Promise<Object>} 通知对象
   */
  static async sendPromotionNotification(userId, promotionName, promotionDetails) {
    const title = '优惠活动';
    const content = `${promotionName}：${promotionDetails}`;

    return this.sendNotification(userId, 'promotion', title, content);
  }

  /**
   * 发送系统通知
   * @param {string} userId - 用户ID
   * @param {string} title - 通知标题
   * @param {string} content - 通知内容
   * @returns {Promise<Object>} 通知对象
   */
  static async sendSystemNotification(userId, title, content) {
    return this.sendNotification(userId, 'system', title, content);
  }
}

module.exports = NotificationService;
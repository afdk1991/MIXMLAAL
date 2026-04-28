import { defineStore } from 'pinia';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';

export const useNotificationStore = defineStore('notification', {
  state: () => ({
    notifications: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  }),

  getters: {
    getNotifications: state => state.notifications,
    getUnreadCount: state => state.unreadCount,
    getError: state => state.error,
    getUnreadNotifications: state => state.notifications.filter(n => !n.read)
  },

  actions: {
    // 设置通知列表
    setNotifications(notifications) {
      this.notifications = notifications;
      this.updateUnreadCount();
    },

    // 设置未读数量
    setUnreadCount(count) {
      this.unreadCount = count;
    },

    // 设置错误信息
    setError(error) {
      this.error = error;
    },

    // 设置加载状态
    setLoading(loading) {
      this.isLoading = loading;
    },

    // 更新未读数量
    updateUnreadCount() {
      this.unreadCount = this.notifications.filter(n => !n.read).length;
    },

    // 获取通知列表
    async getNotificationsList() {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/notification/list`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setNotifications(data.data.notifications);
          return true;
        } else {
          this.setError(data.message);
          // 使用模拟数据
          this.useMockNotifications();
          return false;
        }
      } catch (error) {
        this.setError('获取通知失败，使用模拟数据');
        // 使用模拟数据
        this.useMockNotifications();
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 使用模拟通知数据
    useMockNotifications() {
      const mockNotifications = [
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
        },
        {
          id: 'NOTIF_4',
          type: 'activity',
          title: '活动通知',
          content: '周末特惠活动开始了，全场商品8折起！',
          read: false,
          createdAt: new Date(Date.now() - 172800000).toISOString() // 2天前
        },
        {
          id: 'NOTIF_5',
          type: 'payment',
          title: '支付成功',
          content: '您的订单已支付成功，订单号：ORDER_002',
          read: true,
          createdAt: new Date(Date.now() - 259200000).toISOString() // 3天前
        }
      ];
      this.setNotifications(mockNotifications);
    },

    // 标记通知为已读
    async markAsRead(notificationId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/notification/${notificationId}/read`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 更新本地通知状态
          const notification = this.notifications.find(n => n.id === notificationId);
          if (notification) {
            notification.read = true;
          }
          this.updateUnreadCount();
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('标记已读失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 标记所有通知为已读
    async markAllAsRead() {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/notification/read-all`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 更新本地所有通知状态
          this.notifications.forEach(notification => {
            notification.read = true;
          });
          this.setUnreadCount(0);
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('标记全部已读失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 删除通知
    async deleteNotification(notificationId) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/notification/${notificationId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          // 从本地列表中移除
          this.notifications = this.notifications.filter(n => n.id !== notificationId);
          this.updateUnreadCount();
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('删除通知失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 清空所有通知
    async clearAllNotifications() {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/notification/clear`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setNotifications([]);
          this.setUnreadCount(0);
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('清空通知失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },
  },
});
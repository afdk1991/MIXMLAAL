<template>
  <div class="notification-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('notification.title') }}</h1>
        <button class="mark-all-btn" @click="markAllAsRead">
          {{ $t('notification.markAllRead') }}
        </button>
      </header>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
          <span v-if="tab.count" class="badge">{{ tab.count }}</span>
        </button>
      </div>

      <div class="notification-list" v-if="notifications.length > 0">
        <div
          v-for="item in notifications"
          :key="item.id"
          :class="['notification-item', { unread: !item.read }]"
          @click="handleClick(item)"
        >
          <div class="notification-icon">
            {{ getIcon(item.type) }}
          </div>
          <div class="notification-content">
            <h3>{{ item.title }}</h3>
            <p>{{ item.content }}</p>
            <span class="time">{{ formatTime(item.created_at) }}</span>
          </div>
          <button class="delete-btn" @click.stop="deleteNotification(item.id)">×</button>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">🔔</div>
        <p>{{ $t('notification.empty') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Notifications',
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { label: '全部', value: 'all', count: 0 },
        { label: '系统通知', value: 'system', count: 0 },
        { label: '订单通知', value: 'order', count: 0 },
        { label: '支付通知', value: 'payment', count: 0 },
        { label: '活动通知', value: 'promotion', count: 0 },
      ],
      notifications: [],
    };
  },
  mounted() {
    this.loadNotifications();
  },
  methods: {
    async loadNotifications() {
      this.notifications = [];
    },
    getIcon(type) {
      const icons = {
        system: '⚙️',
        order: '📦',
        payment: '💳',
        promotion: '🎁',
      };
      return icons[type] || '🔔';
    },
    formatTime(time) {
      const date = new Date(time);
      const now = new Date();
      const diff = now - date;
      if (diff < 60000) return '刚刚';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
      return date.toLocaleDateString('zh-CN');
    },
    handleClick(item) {
      if (!item.read) {
        this.markAsRead(item.id);
      }
    },
    async markAsRead(id) {
      const item = this.notifications.find(n => n.id === id);
      if (item) item.read = true;
    },
    async markAllAsRead() {
      this.notifications.forEach(n => n.read = true);
    },
    async deleteNotification(id) {
      this.notifications = this.notifications.filter(n => n.id !== id);
    },
  },
};
</script>

<style scoped>
.notification-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
}

.mark-all-btn {
  padding: 8px 16px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  overflow-x: auto;
  padding-bottom: 10px;
}

.tabs button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 20px;
  cursor: pointer;
  white-space: nowrap;
  font-size: 14px;
}

.tabs button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.badge {
  background: #ff6b6b;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.notification-item {
  display: flex;
  gap: 15px;
  background: white;
  padding: 20px;
  border-radius: 12px;
  cursor: pointer;
  position: relative;
  transition: transform 0.2s;
}

.notification-item:hover {
  transform: translateX(5px);
}

.notification-item.unread {
  border-left: 4px solid #667eea;
}

.notification-icon {
  font-size: 32px;
  flex-shrink: 0;
}

.notification-content {
  flex: 1;
}

.notification-content h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.notification-content p {
  color: #666;
  font-size: 14px;
  margin-bottom: 8px;
}

.time {
  color: #999;
  font-size: 12px;
}

.delete-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 24px;
  height: 24px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  font-size: 16px;
  color: #999;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  font-size: 16px;
}
</style>
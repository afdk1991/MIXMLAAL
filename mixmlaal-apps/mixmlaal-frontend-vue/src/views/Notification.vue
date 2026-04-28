<template>
  <div class="notification-container">
    <!-- 顶部导航栏 -->
    <div class="bg-white shadow-sm sticky top-0 z-10">
      <div class="container mx-auto px-4 py-3 flex justify-between items-center">
        <div class="flex items-center space-x-2">
          <button 
            class="text-gray-600 hover:text-primary"
            @click="router.back()"
          >
            <i class="fa fa-arrow-left"></i>
          </button>
          <h1 class="text-lg font-semibold">消息通知</h1>
        </div>
        <div class="flex items-center space-x-4">
          <button 
            class="text-gray-600 hover:text-primary"
            @click="markAllAsRead"
            :disabled="notifications.length === 0"
          >
            <i class="fa fa-check-circle mr-1"></i>全部已读
          </button>
          <button 
            class="text-gray-600 hover:text-red-500"
            @click="showDeleteConfirm = true"
            :disabled="notifications.length === 0"
          >
            <i class="fa fa-trash mr-1"></i>清空
          </button>
        </div>
      </div>
    </div>

    <!-- 通知列表 -->
    <div class="container mx-auto px-4 py-6">
      <!-- 通知过滤器 -->
      <div class="flex space-x-2 mb-6">
        <button 
          v-for="filter in filters" 
          :key="filter.value"
          :class="['px-4 py-2 rounded-full text-sm font-medium transition-all', 
                  activeFilter === filter.value 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200']"
          @click="activeFilter = filter.value"
        >
          {{ filter.label }}
          <span v-if="filter.value === 'unread' && unreadCount > 0" class="ml-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {{ unreadCount }}
          </span>
        </button>
      </div>

      <!-- 通知列表 -->
      <div v-if="notifications.length > 0" class="space-y-4">
        <div 
          v-for="notification in notifications" 
          :key="notification.notificationId"
          :class="['bg-white rounded-xl shadow-card p-4 transition-all', 
                  !notification.isRead && 'border-l-4 border-primary bg-blue-50']"
        >
          <div class="flex justify-between items-start">
            <div class="flex-1">
              <div class="flex items-center mb-2">
                <h3 class="font-medium text-gray-900">{{ notification.title }}</h3>
                <span 
                  v-if="!notification.isRead" 
                  class="ml-2 w-2 h-2 bg-primary rounded-full"
                ></span>
              </div>
              <p class="text-gray-600 text-sm mb-3">{{ notification.content }}</p>
              <div class="flex items-center text-xs text-gray-500">
                <span>{{ formatDate(notification.createdAt) }}</span>
                <span class="mx-2">•</span>
                <span>{{ getTypeLabel(notification.type) }}</span>
              </div>
            </div>
            <div class="flex flex-col space-y-2 ml-4">
              <button 
                v-if="!notification.isRead"
                class="text-primary hover:underline text-sm"
                @click="markAsRead(notification.notificationId)"
              >
                标记已读
              </button>
              <button 
                class="text-red-500 hover:underline text-sm"
                @click="deleteNotification(notification.notificationId)"
              >
                删除
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-else class="text-center py-16">
        <div class="text-gray-400 mb-4">
          <i class="fa fa-bell-o text-5xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-600 mb-2">暂无通知</h3>
        <p class="text-gray-500 text-sm">您还没有收到任何通知</p>
        <button 
          class="mt-6 bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-all"
          @click="sendTestNotification"
        >
          <i class="fa fa-paper-plane mr-2"></i>发送测试通知
        </button>
      </div>

      <!-- 加载更多 -->
      <div v-if="notifications.length > 0 && hasMore" class="text-center py-4">
        <button 
          class="text-primary hover:underline"
          @click="loadMore"
        >
          加载更多
        </button>
      </div>
    </div>

    <!-- 确认删除对话框 -->
    <div v-if="showDeleteConfirm" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl p-6 max-w-md w-full">
        <h3 class="text-lg font-semibold mb-4">确认清空</h3>
        <p class="text-gray-600 mb-6">确定要清空所有通知吗？此操作不可恢复。</p>
        <div class="flex space-x-4 justify-end">
          <button 
            class="px-4 py-2 border rounded-lg hover:bg-gray-100 transition-all"
            @click="showDeleteConfirm = false"
          >
            取消
          </button>
          <button 
            class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
            @click="clearAllNotifications"
          >
            确定清空
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式数据
const notifications = ref([]);
const unreadCount = ref(0);
const activeFilter = ref('all');
const showDeleteConfirm = ref(false);
const offset = ref(0);
const limit = ref(20);
const hasMore = ref(true);

// 通知过滤器
const filters = [
  { label: '全部', value: 'all' },
  { label: '未读', value: 'unread' },
  { label: '已读', value: 'read' }
];

// 格式化日期
function formatDate(dateString) {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleString();
}

// 获取通知类型标签
function getTypeLabel(type) {
  const typeMap = {
    order_status: '订单状态',
    payment_success: '支付成功',
    promotion: '优惠活动',
    system: '系统通知'
  };
  return typeMap[type] || type;
}

// 获取通知列表
async function getNotifications() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const unreadOnly = activeFilter.value === 'unread';
    const readOnly = activeFilter.value === 'read';

    const response = await fetch(`/api/v1/notification/list?limit=${limit.value}&offset=${offset.value}&unreadOnly=${unreadOnly}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      if (offset.value === 0) {
        notifications.value = data.data.notifications;
      } else {
        notifications.value = [...notifications.value, ...data.data.notifications];
      }
      hasMore.value = data.data.notifications.length === limit.value;
      offset.value += data.data.notifications.length;
    } else {
      alert('获取通知失败: ' + data.message);
    }
  } catch (error) {
    console.error('获取通知错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 获取未读通知数量
async function getUnreadCount() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';
    const response = await fetch(`${API_BASE_URL}/api/v1/notification/unread-count`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      unreadCount.value = data.data.unreadCount;
    } else {
      console.error('获取未读通知数量失败:', data.message);
    }
  } catch (error) {
    console.error('获取未读通知数量错误:', error);
  }
}

// 标记通知为已读
async function markAsRead(notificationId) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch('/api/v1/notification/mark-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ notificationId })
    });

    const data = await response.json();
    if (data.status === 'success') {
      // 更新本地通知状态
      const index = notifications.value.findIndex(n => n.notificationId === notificationId);
      if (index !== -1) {
        notifications.value[index].isRead = true;
      }
      // 更新未读数量
      getUnreadCount();
    } else {
      alert('标记已读失败: ' + data.message);
    }
  } catch (error) {
    console.error('标记已读错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 标记所有通知为已读
async function markAllAsRead() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch('/api/v1/notification/mark-all-read', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // 更新本地通知状态
      notifications.value.forEach(notification => {
        notification.isRead = true;
      });
      // 更新未读数量
      unreadCount.value = 0;
      alert('已标记所有通知为已读');
    } else {
      alert('标记所有已读失败: ' + data.message);
    }
  } catch (error) {
    console.error('标记所有已读错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 删除通知
async function deleteNotification(notificationId) {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch(`/api/v1/notification/${notificationId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // 从本地列表中移除
      notifications.value = notifications.value.filter(n => n.notificationId !== notificationId);
      // 更新未读数量
      getUnreadCount();
    } else {
      alert('删除通知失败: ' + data.message);
    }
  } catch (error) {
    console.error('删除通知错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 清空所有通知
async function clearAllNotifications() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    // 逐个删除所有通知
    for (const notification of notifications.value) {
      await fetch(`/api/v1/notification/${notification.notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    }

    // 清空本地列表
    notifications.value = [];
    unreadCount.value = 0;
    showDeleteConfirm.value = false;
    alert('已清空所有通知');
  } catch (error) {
    console.error('清空通知错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 加载更多
function loadMore() {
  getNotifications();
}

// 发送测试通知
async function sendTestNotification() {
  try {
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const response = await fetch('/api/v1/notification/test', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    if (data.status === 'success') {
      // 重新获取通知列表
      offset.value = 0;
      getNotifications();
      getUnreadCount();
      alert('测试通知发送成功');
    } else {
      alert('发送测试通知失败: ' + data.message);
    }
  } catch (error) {
    console.error('发送测试通知错误:', error);
    alert('网络错误，请稍后重试');
  }
}

// 监听过滤器变化
activeFilter.value = 'all';

// 组件挂载时加载数据
onMounted(() => {
  getNotifications();
  getUnreadCount();
});
</script>

<style scoped>
.notification-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

/* 自定义样式 */
.shadow-card {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .container {
    padding-left: 16px;
    padding-right: 16px;
  }
}
</style>
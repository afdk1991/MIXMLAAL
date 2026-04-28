<template>
  <div class="notification-container">
    <div class="notification-header">
      <h1 class="text-2xl font-bold mb-6">通知管理</h1>
      <button class="add-notification-btn" @click="showAddForm = true" :disabled="loading">
        <i class="fa fa-plus mr-2"></i>
        添加通知
      </button>
    </div>
    
    <!-- 消息提示 -->
    <div v-if="error" class="message error">
      <i class="fa fa-exclamation-circle mr-2"></i>
      {{ error }}
    </div>
    <div v-if="successMessage" class="message success">
      <i class="fa fa-check-circle mr-2"></i>
      {{ successMessage }}
    </div>
    
    <div class="notification-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="搜索通知标题..." v-model="searchQuery" @input="resetPage">
      </div>
      <div class="search-filters">
        <select v-model="filterType" @change="resetPage">
          <option value="">所有类型</option>
          <option value="system">系统通知</option>
          <option value="user">用户通知</option>
          <option value="marketing">营销通知</option>
        </select>
        <select v-model="filterStatus" @change="resetPage">
          <option value="">所有状态</option>
          <option value="sent">已发送</option>
          <option value="pending">待发送</option>
          <option value="failed">发送失败</option>
        </select>
      </div>
    </div>
    
    <div class="notification-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>标题</th>
            <th>类型</th>
            <th>状态</th>
            <th>发送时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="notification in paginatedNotifications" :key="notification.id">
            <td>{{ notification.id }}</td>
            <td>{{ notification.title }}</td>
            <td>
              <span class="type-badge" :class="notification.type">{{ notification.typeText }}</span>
            </td>
            <td>
              <span class="status-badge" :class="notification.status">{{ notification.statusText }}</span>
            </td>
            <td>{{ notification.sendTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="view-btn" @click="viewNotification(notification)">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="edit-btn" @click="editNotification(notification)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteNotification(notification.id)">
                  <i class="fa fa-trash"></i>
                </button>
                <button v-if="notification.status === 'pending'" class="send-btn" @click="sendNotification(notification.id)">
                  <i class="fa fa-paper-plane"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="notification-pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
    </div>
    
    <!-- 添加/编辑通知表单 -->
    <div v-if="showAddForm || editingNotification" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>{{ editingNotification ? '编辑通知' : '添加通知' }}</h3>
          <button class="close-btn" @click="closeForm">&times;</button>
        </div>
        <form @submit.prevent="saveNotification">
          <div class="form-group">
            <label>标题：</label>
            <input 
              type="text" 
              v-model="formData.title" 
              @input="validateField('title', formData.title)"
              :class="{ 'error': formErrors.title }"
              required
            >
            <div v-if="formErrors.title" class="error-message">{{ formErrors.title }}</div>
          </div>
          <div class="form-group">
            <label>类型：</label>
            <select v-model="formData.type" required>
              <option value="system">系统通知</option>
              <option value="user">用户通知</option>
              <option value="marketing">营销通知</option>
            </select>
          </div>
          <div class="form-group">
            <label>状态：</label>
            <select v-model="formData.status" required>
              <option value="pending">待发送</option>
              <option value="sent">已发送</option>
            </select>
          </div>
          <div class="form-group">
            <label>内容：</label>
            <textarea 
              v-model="formData.content" 
              @input="validateField('content', formData.content)"
              :class="{ 'error': formErrors.content }"
              rows="10"
              required
            ></textarea>
            <div v-if="formErrors.content" class="error-message">{{ formErrors.content }}</div>
          </div>
          <div class="form-group">
            <label>发送对象：</label>
            <select v-model="formData.target" required>
              <option value="all">所有用户</option>
              <option value="specific">特定用户</option>
              <option value="group">用户组</option>
            </select>
          </div>
          <div class="form-group" v-if="formData.target === 'specific'">
            <label>用户ID：</label>
            <input 
              type="text" 
              v-model="formData.userIds" 
              placeholder="多个用户ID用逗号分隔"
            >
          </div>
          <div class="form-group" v-if="formData.target === 'group'">
            <label>用户组：</label>
            <select v-model="formData.groupId">
              <option value="">请选择用户组</option>
              <option value="1">管理员</option>
              <option value="2">普通用户</option>
              <option value="3">VIP用户</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeForm" :disabled="loading">取消</button>
            <button type="submit" class="save-btn" :disabled="loading || !isFormValid">
              <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
              {{ loading ? '处理中...' : (editingNotification ? '保存' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 通知详情弹窗 -->
    <div v-if="viewingNotification" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>通知详情</h3>
          <button class="close-btn" @click="viewingNotification = null">&times;</button>
        </div>
        <div class="notification-details">
          <div class="detail-item">
            <span class="detail-label">标题：</span>
            <span class="detail-value">{{ viewingNotification.title }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">类型：</span>
            <span class="detail-value">{{ viewingNotification.typeText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态：</span>
            <span class="detail-value">{{ viewingNotification.statusText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">发送时间：</span>
            <span class="detail-value">{{ viewingNotification.sendTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">发送对象：</span>
            <span class="detail-value">{{ viewingNotification.targetText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">内容：</span>
            <div class="detail-content" v-html="viewingNotification.content"></div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="viewingNotification = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');
const filterType = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = 10;
const showAddForm = ref(false);
const editingNotification = ref(null);
const viewingNotification = ref(null);

// 状态管理
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const formData = ref({
  title: '',
  type: 'system',
  status: 'pending',
  content: '',
  target: 'all',
  userIds: '',
  groupId: ''
});

// 表单验证错误
const formErrors = ref({
  title: '',
  content: ''
});

// 实时验证
const validateField = (field, value) => {
  switch (field) {
    case 'title':
      if (!value) {
        formErrors.value.title = '标题不能为空';
      } else if (value.length < 2) {
        formErrors.value.title = '标题至少需要2个字符';
      } else {
        formErrors.value.title = '';
      }
      break;
    case 'content':
      if (!value) {
        formErrors.value.content = '内容不能为空';
      } else if (value.length < 10) {
        formErrors.value.content = '内容至少需要10个字符';
      } else {
        formErrors.value.content = '';
      }
      break;
  }
};

// 检查表单是否有效
const isFormValid = computed(() => {
  return !formErrors.value.title && !formErrors.value.content;
});

const notifications = ref([
  { id: 1, title: '系统维护通知', type: 'system', typeText: '系统通知', status: 'sent', statusText: '已发送', content: '<p>系统将于2026年4月15日凌晨2:00-4:00进行维护，期间服务可能暂时不可用。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-10 10:00' },
  { id: 2, title: '新功能上线', type: 'system', typeText: '系统通知', status: 'sent', statusText: '已发送', content: '<p>我们已上线新的用户管理功能，您可以在管理后台查看详细信息。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-09 14:30' },
  { id: 3, title: '优惠活动通知', type: 'marketing', typeText: '营销通知', status: 'pending', statusText: '待发送', content: '<p>限时优惠：新用户注册送50元优惠券，有效期至2026年5月1日。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-12 09:00' },
  { id: 4, title: '账户安全提醒', type: 'user', typeText: '用户通知', status: 'sent', statusText: '已发送', content: '<p>您的账户最近在新设备上登录，如非本人操作，请及时修改密码。</p>', target: 'specific', targetText: '特定用户', sendTime: '2026-04-08 16:45' },
  { id: 5, title: '订单状态更新', type: 'user', typeText: '用户通知', status: 'sent', statusText: '已发送', content: '<p>您的订单 #12345 已发货，预计3天内送达。</p>', target: 'specific', targetText: '特定用户', sendTime: '2026-04-07 11:20' },
  { id: 6, title: 'VIP用户专享活动', type: 'marketing', typeText: '营销通知', status: 'pending', statusText: '待发送', content: '<p>VIP用户专享：全场商品8折优惠，仅限本周。</p>', target: 'group', targetText: '用户组', sendTime: '2026-04-13 10:00' },
  { id: 7, title: '系统更新完成', type: 'system', typeText: '系统通知', status: 'sent', statusText: '已发送', content: '<p>系统更新已完成，所有功能已恢复正常。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-06 08:30' },
  { id: 8, title: '数据备份提醒', type: 'system', typeText: '系统通知', status: 'pending', statusText: '待发送', content: '<p>请及时备份系统数据，以防止数据丢失。</p>', target: 'group', targetText: '用户组', sendTime: '2026-04-14 15:00' },
  { id: 9, title: '节日祝福', type: 'marketing', typeText: '营销通知', status: 'pending', statusText: '待发送', content: '<p>祝您节日快乐！我们为您准备了专属优惠。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-15 09:00' },
  { id: 10, title: '密码重置成功', type: 'user', typeText: '用户通知', status: 'sent', statusText: '已发送', content: '<p>您的密码已成功重置，请使用新密码登录。</p>', target: 'specific', targetText: '特定用户', sendTime: '2026-04-05 13:15' },
  { id: 11, title: '服务条款更新', type: 'system', typeText: '系统通知', status: 'pending', statusText: '待发送', content: '<p>我们的服务条款已更新，请查看最新版本。</p>', target: 'all', targetText: '所有用户', sendTime: '2026-04-16 10:00' }
]);

const filteredNotifications = computed(() => {
  let result = notifications.value;
  
  if (searchQuery.value) {
    result = result.filter(notification => 
      notification.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (filterType.value) {
    result = result.filter(notification => notification.type === filterType.value);
  }
  
  if (filterStatus.value) {
    result = result.filter(notification => notification.status === filterStatus.value);
  }
  
  return result;
});

const paginatedNotifications = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredNotifications.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / pageSize);
});

// 分页方法
const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
};

const resetPage = () => {
  currentPage.value = 1;
};

// CRUD操作
const viewNotification = (notification) => {
  viewingNotification.value = notification;
};

const editNotification = (notification) => {
  editingNotification.value = notification;
  formData.value = {
    title: notification.title,
    type: notification.type,
    status: notification.status,
    content: notification.content,
    target: notification.target,
    userIds: notification.userIds || '',
    groupId: notification.groupId || ''
  };
  // 清除之前的错误和成功消息
  error.value = '';
  successMessage.value = '';
};

const deleteNotification = async (id) => {
  if (confirm('确定要删除这个通知吗？')) {
    try {
      loading.value = true;
      error.value = '';
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      notifications.value = notifications.value.filter(notification => notification.id !== id);
      // 重置分页
      if (paginatedNotifications.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      successMessage.value = '通知删除成功';
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (err) {
      error.value = '删除通知失败，请稍后重试';
      console.error('删除通知失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

const sendNotification = async (id) => {
  if (confirm('确定要发送这个通知吗？')) {
    try {
      loading.value = true;
      error.value = '';
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const index = notifications.value.findIndex(notification => notification.id === id);
      if (index !== -1) {
        notifications.value[index] = {
          ...notifications.value[index],
          status: 'sent',
          statusText: '已发送',
          sendTime: new Date().toLocaleString('zh-CN')
        };
        successMessage.value = '通知发送成功';
        // 3秒后清除成功消息
        setTimeout(() => {
          successMessage.value = '';
        }, 3000);
      }
    } catch (err) {
      error.value = '发送通知失败，请稍后重试';
      console.error('发送通知失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

const saveNotification = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 表单验证
    if (!formData.value.title || !formData.value.content) {
      throw new Error('标题和内容不能为空');
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingNotification.value) {
      // 编辑现有通知
      const index = notifications.value.findIndex(notification => notification.id === editingNotification.value.id);
      if (index !== -1) {
        notifications.value[index] = {
          ...notifications.value[index],
          title: formData.value.title,
          type: formData.value.type,
          typeText: getTypeText(formData.value.type),
          status: formData.value.status,
          statusText: getStatusText(formData.value.status),
          content: formData.value.content,
          target: formData.value.target,
          targetText: getTargetText(formData.value.target),
          userIds: formData.value.userIds,
          groupId: formData.value.groupId
        };
        successMessage.value = '通知更新成功';
      }
    } else {
      // 添加新通知
      const newNotification = {
        id: notifications.value.length + 1,
        title: formData.value.title,
        type: formData.value.type,
        typeText: getTypeText(formData.value.type),
        status: formData.value.status,
        statusText: getStatusText(formData.value.status),
        content: formData.value.content,
        target: formData.value.target,
        targetText: getTargetText(formData.value.target),
        userIds: formData.value.userIds,
        groupId: formData.value.groupId,
        sendTime: formData.value.status === 'sent' ? new Date().toLocaleString('zh-CN') : ''
      };
      notifications.value.push(newNotification);
      successMessage.value = '通知添加成功';
    }
    
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    closeForm();
  } catch (err) {
    error.value = err.message || '保存通知失败，请稍后重试';
    console.error('保存通知失败:', err);
  } finally {
    loading.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingNotification.value = null;
  formData.value = {
    title: '',
    type: 'system',
    status: 'pending',
    content: '',
    target: 'all',
    userIds: '',
    groupId: ''
  };
  // 清除错误和成功消息
  error.value = '';
  successMessage.value = '';
  // 清除表单验证错误
  formErrors.value = {
    title: '',
    content: ''
  };
};

// 辅助函数
const getTypeText = (type) => {
  const typeMap = {
    system: '系统通知',
    user: '用户通知',
    marketing: '营销通知'
  };
  return typeMap[type] || type;
};

const getStatusText = (status) => {
  const statusMap = {
    sent: '已发送',
    pending: '待发送',
    failed: '发送失败'
  };
  return statusMap[status] || status;
};

const getTargetText = (target) => {
  const targetMap = {
    all: '所有用户',
    specific: '特定用户',
    group: '用户组'
  };
  return targetMap[target] || target;
};
</script>

<style scoped>
.notification-container {
  padding: 20px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-notification-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  font-size: 14px;
  font-weight: 500;
}

.add-notification-btn:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-notification-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 消息提示样式 */
.message {
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  font-size: 14px;
  animation: fadeIn 0.3s ease;
}

.message.error {
  background-color: #fee2e2;
  color: #b91c1c;
  border-left: 4px solid #dc2626;
}

.message.success {
  background-color: #d1fae5;
  color: #065f46;
  border-left: 4px solid #10b981;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.notification-search {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .notification-search {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .search-input {
    min-width: 100%;
  }
  
  .search-filters {
    flex-wrap: wrap;
  }
  
  .search-filters select {
    flex: 1;
    min-width: 120px;
  }
  
  .notification-table {
    overflow-x: auto;
  }
  
  .notification-table table {
    min-width: 600px;
  }
  
  .form-container {
    width: 95%;
    padding: 20px;
  }
}

.search-input {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-input i {
  position: absolute;
  left: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
}

.search-input input {
  width: 100%;
  padding: 10px 15px 10px 40px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.search-filters {
  display: flex;
  gap: 10px;
}

.search-filters select {
  padding: 10px 15px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.notification-table {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.notification-table table {
  width: 100%;
  border-collapse: collapse;
}

.notification-table th {
  background-color: #f8fafc;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.notification-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.notification-table tr:hover {
  background-color: #f8fafc;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.system {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-badge.user {
  background-color: #d1fae5;
  color: #065f46;
}

.type-badge.marketing {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.sent {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.failed {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.view-btn, .edit-btn, .delete-btn, .send-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.view-btn {
  background-color: #f1f5f9;
  color: #64748b;
}

.view-btn:hover {
  background-color: #e2e8f0;
}

.edit-btn {
  background-color: #f1f5f9;
  color: #3b82f6;
}

.edit-btn:hover {
  background-color: #e2e8f0;
}

.delete-btn {
  background-color: #fef2f2;
  color: #ef4444;
}

.delete-btn:hover {
  background-color: #fee2e2;
}

.send-btn {
  background-color: #d1fae5;
  color: #10b981;
}

.send-btn:hover {
  background-color: #a7f3d0;
}

.notification-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.page-btn {
  background-color: white;
  border: 1px solid #e2e8f0;
  padding: 8px 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background-color: #f8fafc;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #64748b;
}

/* 表单样式 */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 600px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow-y: auto;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #334155;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #334155;
  font-size: 14px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input.error,
.form-group textarea.error {
  border-color: #ef4444;
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-message {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn {
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.save-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.save-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.save-btn:active {
  transform: translateY(0);
}

/* 通知详情样式 */
.notification-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  font-size: 14px;
}

.detail-content {
  flex: 1;
  color: #1e293b;
  font-size: 14px;
  line-height: 1.6;
}

.detail-content p {
  margin-bottom: 12px;
}

.detail-content p:last-child {
  margin-bottom: 0;
}
</style>
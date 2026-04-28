<template>
  <div class="orders-container">
    <div class="orders-header">
      <h1 class="text-2xl font-bold mb-6">订单管理</h1>
      <div class="header-actions">
        <button class="add-order-btn" @click="showAddForm = true">
          <i class="fa fa-plus mr-2"></i>
          添加订单
        </button>
        <button class="export-btn">
          <i class="fa fa-download mr-2"></i>
          导出订单
        </button>
      </div>
    </div>
    
    <div class="orders-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="搜索订单号或用户..." v-model="searchQuery" @input="resetPage">
      </div>
      <div class="search-filters">
        <select v-model="filterStatus" @change="resetPage">
          <option value="">所有状态</option>
          <option value="pending">待处理</option>
          <option value="processing">处理中</option>
          <option value="success">已完成</option>
          <option value="cancelled">已取消</option>
        </select>
        <select v-model="filterService" @change="resetPage">
          <option value="">所有服务</option>
          <option value="ride">出行服务</option>
          <option value="food">美食服务</option>
          <option value="errand">跑腿服务</option>
        </select>
      </div>
    </div>
    
    <div class="orders-table">
      <table>
        <thead>
          <tr>
            <th>订单号</th>
            <th>用户</th>
            <th>服务类型</th>
            <th>金额</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in paginatedOrders" :key="order.id">
            <td>{{ order.id }}</td>
            <td>{{ order.user }}</td>
            <td>{{ order.service }}</td>
            <td>¥{{ order.amount }}</td>
            <td>
              <span class="status-badge" :class="order.status">{{ order.statusText }}</span>
            </td>
            <td>{{ order.createTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="view-btn" @click="viewOrder(order)">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="edit-btn" @click="editOrder(order)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteOrder(order.id)">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="orders-pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
    </div>
    
    <!-- 添加/编辑订单表单 -->
    <div v-if="showAddForm || editingOrder" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>{{ editingOrder ? '编辑订单' : '添加订单' }}</h3>
          <button class="close-btn" @click="closeForm">&times;</button>
        </div>
        <form @submit.prevent="saveOrder">
          <div class="form-group">
            <label>订单号：</label>
            <input type="text" v-model="formData.id" :disabled="editingOrder" required>
          </div>
          <div class="form-group">
            <label>用户：</label>
            <input type="text" v-model="formData.user" required>
          </div>
          <div class="form-group">
            <label>服务类型：</label>
            <select v-model="formData.service" required>
              <option value="出行服务">出行服务</option>
              <option value="美食服务">美食服务</option>
              <option value="跑腿服务">跑腿服务</option>
            </select>
          </div>
          <div class="form-group">
            <label>金额：</label>
            <input type="number" v-model="formData.amount" step="0.01" min="0" required>
          </div>
          <div class="form-group">
            <label>状态：</label>
            <select v-model="formData.status" required>
              <option value="pending">待处理</option>
              <option value="processing">处理中</option>
              <option value="success">已完成</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeForm">取消</button>
            <button type="submit" class="save-btn">{{ editingOrder ? '保存' : '添加' }}</button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 订单详情弹窗 -->
    <div v-if="viewingOrder" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="viewingOrder = null">&times;</button>
        </div>
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">订单号：</span>
            <span class="detail-value">{{ viewingOrder.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">用户：</span>
            <span class="detail-value">{{ viewingOrder.user }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">服务类型：</span>
            <span class="detail-value">{{ viewingOrder.service }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">金额：</span>
            <span class="detail-value">¥{{ viewingOrder.amount }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态：</span>
            <span class="detail-value">{{ viewingOrder.statusText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间：</span>
            <span class="detail-value">{{ viewingOrder.createTime }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="viewingOrder = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');
const filterStatus = ref('');
const filterService = ref('');
const currentPage = ref(1);
const pageSize = 10;
const showAddForm = ref(false);
const editingOrder = ref(null);
const viewingOrder = ref(null);

const formData = ref({
  id: '',
  user: '',
  service: '出行服务',
  amount: 0,
  status: 'pending'
});

const orders = ref([
  { id: 'ORD20260410001', user: 'user1', service: '出行服务', amount: 128, status: 'success', statusText: '已完成', createTime: '2026-04-10 08:30' },
  { id: 'ORD20260410002', user: 'user2', service: '美食服务', amount: 88, status: 'pending', statusText: '待处理', createTime: '2026-04-10 09:15' },
  { id: 'ORD20260410003', user: 'user3', service: '跑腿服务', amount: 35, status: 'processing', statusText: '处理中', createTime: '2026-04-10 10:20' },
  { id: 'ORD20260410004', user: 'user4', service: '出行服务', amount: 95, status: 'success', statusText: '已完成', createTime: '2026-04-10 11:45' },
  { id: 'ORD20260410005', user: 'user5', service: '美食服务', amount: 156, status: 'success', statusText: '已完成', createTime: '2026-04-10 12:30' },
  { id: 'ORD20260410006', user: 'user6', service: '跑腿服务', amount: 28, status: 'cancelled', statusText: '已取消', createTime: '2026-04-10 13:15' },
  { id: 'ORD20260410007', user: 'user7', service: '出行服务', amount: 145, status: 'processing', statusText: '处理中', createTime: '2026-04-10 14:20' },
  { id: 'ORD20260410008', user: 'user8', service: '美食服务', amount: 112, status: 'pending', statusText: '待处理', createTime: '2026-04-10 15:30' },
  { id: 'ORD20260410009', user: 'user9', service: '跑腿服务', amount: 45, status: 'success', statusText: '已完成', createTime: '2026-04-10 16:45' },
  { id: 'ORD20260410010', user: 'user10', service: '出行服务', amount: 88, status: 'success', statusText: '已完成', createTime: '2026-04-10 17:20' },
  { id: 'ORD20260410011', user: 'user1', service: '美食服务', amount: 96, status: 'processing', statusText: '处理中', createTime: '2026-04-10 18:30' }
]);

const filteredOrders = computed(() => {
  let result = orders.value;
  
  if (searchQuery.value) {
    result = result.filter(order => 
      order.id.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      order.user.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (filterStatus.value) {
    result = result.filter(order => order.status === filterStatus.value);
  }
  
  if (filterService.value) {
    result = result.filter(order => order.service.includes(filterService.value));
  }
  
  return result;
});

const paginatedOrders = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredOrders.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredOrders.value.length / pageSize);
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
const viewOrder = (order) => {
  viewingOrder.value = order;
};

const editOrder = (order) => {
  editingOrder.value = order;
  formData.value = {
    id: order.id,
    user: order.user,
    service: order.service,
    amount: order.amount,
    status: order.status
  };
};

const deleteOrder = (id) => {
  if (confirm('确定要删除这个订单吗？')) {
    orders.value = orders.value.filter(order => order.id !== id);
    // 重置分页
    if (paginatedOrders.value.length === 0 && currentPage.value > 1) {
      currentPage.value--;
    }
  }
};

const saveOrder = () => {
  if (editingOrder.value) {
    // 编辑现有订单
    const index = orders.value.findIndex(order => order.id === editingOrder.value.id);
    if (index !== -1) {
      orders.value[index] = {
        ...orders.value[index],
        user: formData.value.user,
        service: formData.value.service,
        amount: formData.value.amount,
        status: formData.value.status,
        statusText: getStatusText(formData.value.status)
      };
    }
  } else {
    // 添加新订单
    const newOrder = {
      id: formData.value.id,
      user: formData.value.user,
      service: formData.value.service,
      amount: formData.value.amount,
      status: formData.value.status,
      statusText: getStatusText(formData.value.status),
      createTime: new Date().toLocaleString('zh-CN')
    };
    orders.value.push(newOrder);
  }
  closeForm();
};

const closeForm = () => {
  showAddForm.value = false;
  editingOrder.value = null;
  formData.value = {
    id: '',
    user: '',
    service: '出行服务',
    amount: 0,
    status: 'pending'
  };
};

// 辅助函数
const getStatusText = (status) => {
  const statusMap = {
    pending: '待处理',
    processing: '处理中',
    success: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
};
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.orders-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.add-order-btn {
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

.add-order-btn:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.export-btn {
  background-color: #10b981;
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

.export-btn:hover {
  background-color: #059669;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
}

.orders-search {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
  align-items: flex-end;
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: 8px;
    align-items: stretch;
  }
  
  .add-order-btn,
  .export-btn {
    justify-content: center;
  }
  
  .orders-search {
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
  
  .orders-table {
    overflow-x: auto;
  }
  
  .orders-table table {
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

.orders-table {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.orders-table table {
  width: 100%;
  border-collapse: collapse;
}

.orders-table th {
  background-color: #f8fafc;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.orders-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.orders-table tr:hover {
  background-color: #f8fafc;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background-color: #fef3c7;
  color: #92400e;
}

.status-badge.processing {
  background-color: #dbeafe;
  color: #1e40af;
}

.status-badge.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.cancelled {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.view-btn, .edit-btn, .delete-btn {
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

.orders-pagination {
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
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
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
.form-group select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-group input:disabled {
  background-color: #f8fafc;
  cursor: not-allowed;
  opacity: 0.7;
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

/* 订单详情样式 */
.order-details {
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
}

.detail-value {
  flex: 1;
  color: #1e293b;
  font-size: 14px;
}
</style>
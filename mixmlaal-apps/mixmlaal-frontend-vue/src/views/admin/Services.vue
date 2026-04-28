<template>
  <div class="services-container">
    <div class="services-header">
      <h1 class="text-2xl font-bold mb-6">服务管理</h1>
      <button class="add-service-btn">
        <i class="fa fa-plus mr-2"></i>
        添加服务
      </button>
    </div>
    
    <div class="services-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="搜索服务名称或ID..." v-model="searchQuery">
      </div>
      <div class="search-filters">
        <select v-model="filterType">
          <option value="">所有类型</option>
          <option value="ride">出行服务</option>
          <option value="food">美食服务</option>
          <option value="errand">跑腿服务</option>
          <option value="mall">本地商城</option>
        </select>
        <select v-model="filterStatus">
          <option value="">所有状态</option>
          <option value="active">启用</option>
          <option value="inactive">禁用</option>
        </select>
      </div>
    </div>
    
    <div class="services-table">
      <table>
        <thead>
          <tr>
            <th>服务ID</th>
            <th>服务名称</th>
            <th>服务类型</th>
            <th>描述</th>
            <th>状态</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="service in filteredServices" :key="service.id">
            <td>{{ service.id }}</td>
            <td>{{ service.name }}</td>
            <td>
              <span class="type-badge" :class="service.type">{{ service.typeText }}</span>
            </td>
            <td>{{ service.description }}</td>
            <td>
              <span class="status-badge" :class="service.status">{{ service.statusText }}</span>
            </td>
            <td>{{ service.createTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="edit-btn">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="delete-btn">
                  <i class="fa fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="services-pagination">
      <button class="page-btn" :disabled="currentPage === 1">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="currentPage === totalPages">下一页</button>
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

const services = ref([
  { id: 1, name: '网约车', type: 'ride', typeText: '出行服务', description: '提供便捷的网约车服务', status: 'active', statusText: '启用', createTime: '2026-01-01' },
  { id: 2, name: '共享单车', type: 'ride', typeText: '出行服务', description: '提供共享单车服务', status: 'active', statusText: '启用', createTime: '2026-01-02' },
  { id: 3, name: '外卖配送', type: 'food', typeText: '美食服务', description: '提供外卖配送服务', status: 'active', statusText: '启用', createTime: '2026-01-03' },
  { id: 4, name: '餐厅预订', type: 'food', typeText: '美食服务', description: '提供餐厅预订服务', status: 'inactive', statusText: '禁用', createTime: '2026-01-04' },
  { id: 5, name: '快递代取', type: 'errand', typeText: '跑腿服务', description: '提供快递代取服务', status: 'active', statusText: '启用', createTime: '2026-01-05' },
  { id: 6, name: '物品配送', type: 'errand', typeText: '跑腿服务', description: '提供物品配送服务', status: 'active', statusText: '启用', createTime: '2026-01-06' },
  { id: 7, name: '代排队', type: 'errand', typeText: '跑腿服务', description: '提供代排队服务', status: 'inactive', statusText: '禁用', createTime: '2026-01-07' },
  { id: 8, name: '机场接送', type: 'ride', typeText: '出行服务', description: '提供机场接送服务', status: 'active', statusText: '启用', createTime: '2026-01-08' },
  { id: 9, name: '同城快递', type: 'errand', typeText: '跑腿服务', description: '提供同城快递服务', status: 'active', statusText: '启用', createTime: '2026-01-09' },
  { id: 10, name: '食材配送', type: 'food', typeText: '美食服务', description: '提供食材配送服务', status: 'active', statusText: '启用', createTime: '2026-01-10' },
  { id: 11, name: '商务租车', type: 'ride', typeText: '出行服务', description: '提供商务租车服务', status: 'inactive', statusText: '禁用', createTime: '2026-01-11' },
  { id: 12, name: '本地商城', type: 'mall', typeText: '本地商城', description: '提供本地商品购物服务', status: 'active', statusText: '启用', createTime: '2026-01-12' },
  { id: 13, name: '生鲜超市', type: 'mall', typeText: '本地商城', description: '提供生鲜食品购物服务', status: 'active', statusText: '启用', createTime: '2026-01-13' },
  { id: 14, name: '生活百货', type: 'mall', typeText: '本地商城', description: '提供日常生活用品购物服务', status: 'active', statusText: '启用', createTime: '2026-01-14' }
]);

const filteredServices = computed(() => {
  let result = services.value;
  
  if (searchQuery.value) {
    result = result.filter(service => 
      service.name.includes(searchQuery.value) || 
      service.id.toString().includes(searchQuery.value)
    );
  }
  
  if (filterType.value) {
    result = result.filter(service => service.type === filterType.value);
  }
  
  if (filterStatus.value) {
    result = result.filter(service => service.status === filterStatus.value);
  }
  
  return result;
});

const totalPages = computed(() => {
  return Math.ceil(filteredServices.value.length / pageSize);
});
</script>

<style scoped>
.services-container {
  padding: 20px;
}

.services-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-service-btn {
  background-color: #3b82f6;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  display: flex;
  align-items: center;
}

.add-service-btn:hover {
  background-color: #2563eb;
}

.services-search {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
  flex-wrap: wrap;
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

.services-table {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.services-table table {
  width: 100%;
  border-collapse: collapse;
}

.services-table th {
  background-color: #f8fafc;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.services-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.services-table tr:hover {
  background-color: #f8fafc;
}

.type-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.type-badge.ride {
  background-color: #dbeafe;
  color: #1e40af;
}

.type-badge.food {
  background-color: #fef3c7;
  color: #92400e;
}

.type-badge.errand {
  background-color: #d1fae5;
  color: #065f46;
}

.type-badge.mall {
  background-color: #f3e8ff;
  color: #7e22ce;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background-color: #d1fae5;
  color: #065f46;
}

.status-badge.inactive {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.edit-btn, .delete-btn {
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

.services-pagination {
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
</style>
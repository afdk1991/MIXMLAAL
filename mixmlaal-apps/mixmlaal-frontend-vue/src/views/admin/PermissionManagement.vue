<template>
  <div class="permission-container">
    <div class="permission-header">
      <h1 class="text-2xl font-bold mb-6">权限管理</h1>
      <button class="add-role-btn" @click="showAddForm = true" :disabled="loading">
        <i class="fa fa-plus mr-2"></i>
        添加角色
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
    
    <div class="permission-search">
      <div class="search-input">
        <i class="fa fa-search"></i>
        <input type="text" placeholder="搜索角色名称..." v-model="searchQuery" @input="resetPage">
      </div>
    </div>
    
    <div class="permission-table">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>角色名称</th>
            <th>描述</th>
            <th>创建时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="role in paginatedRoles" :key="role.id">
            <td>{{ role.id }}</td>
            <td>{{ role.name }}</td>
            <td>{{ role.description }}</td>
            <td>{{ role.createTime }}</td>
            <td>
              <div class="action-buttons">
                <button class="view-btn" @click="viewRole(role)">
                  <i class="fa fa-eye"></i>
                </button>
                <button class="edit-btn" @click="editRole(role)">
                  <i class="fa fa-edit"></i>
                </button>
                <button class="delete-btn" @click="deleteRole(role.id)">
                  <i class="fa fa-trash"></i>
                </button>
                <button class="permission-btn" @click="assignPermissions(role)">
                  <i class="fa fa-key"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="permission-pagination">
      <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
      <span class="page-info">第 {{ currentPage }} 页，共 {{ totalPages }} 页</span>
      <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
    </div>
    
    <!-- 添加/编辑角色表单 -->
    <div v-if="showAddForm || editingRole" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>{{ editingRole ? '编辑角色' : '添加角色' }}</h3>
          <button class="close-btn" @click="closeForm">&times;</button>
        </div>
        <form @submit.prevent="saveRole">
          <div class="form-group">
            <label>角色名称：</label>
            <input 
              type="text" 
              v-model="formData.name" 
              @input="validateField('name', formData.name)"
              :class="{ 'error': formErrors.name }"
              required
            >
            <div v-if="formErrors.name" class="error-message">{{ formErrors.name }}</div>
          </div>
          <div class="form-group">
            <label>描述：</label>
            <textarea 
              v-model="formData.description" 
              @input="validateField('description', formData.description)"
              :class="{ 'error': formErrors.description }"
              rows="4"
              required
            ></textarea>
            <div v-if="formErrors.description" class="error-message">{{ formErrors.description }}</div>
          </div>
          <div class="form-actions">
            <button type="button" class="cancel-btn" @click="closeForm" :disabled="loading">取消</button>
            <button type="submit" class="save-btn" :disabled="loading || !isFormValid">
              <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
              {{ loading ? '处理中...' : (editingRole ? '保存' : '添加') }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 角色详情弹窗 -->
    <div v-if="viewingRole" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>角色详情</h3>
          <button class="close-btn" @click="viewingRole = null">&times;</button>
        </div>
        <div class="role-details">
          <div class="detail-item">
            <span class="detail-label">角色名称：</span>
            <span class="detail-value">{{ viewingRole.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">描述：</span>
            <span class="detail-value">{{ viewingRole.description }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间：</span>
            <span class="detail-value">{{ viewingRole.createTime }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">权限：</span>
            <div class="permission-list">
              <span v-for="permission in viewingRole.permissions" :key="permission.id" class="permission-tag">
                {{ permission.name }}
              </span>
              <span v-if="viewingRole.permissions.length === 0" class="no-permission">
                暂无权限
              </span>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="viewingRole = null">关闭</button>
        </div>
      </div>
    </div>
    
    <!-- 权限分配弹窗 -->
    <div v-if="assigningRole" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>分配权限 - {{ assigningRole.name }}</h3>
          <button class="close-btn" @click="assigningRole = null">&times;</button>
        </div>
        <div class="permission-assignment">
          <div v-for="module in permissionModules" :key="module.id" class="permission-module">
            <div class="module-header">
              <input 
                type="checkbox" 
                :id="module.id" 
                :checked="isModuleChecked(module.id)" 
                @change="toggleModule(module.id)"
              >
              <label :for="module.id">{{ module.name }}</label>
            </div>
            <div class="module-permissions">
              <div v-for="permission in module.permissions" :key="permission.id" class="permission-item">
                <input 
                  type="checkbox" 
                  :id="permission.id" 
                  :checked="isPermissionChecked(permission.id)" 
                  @change="togglePermission(permission.id)"
                >
                <label :for="permission.id">{{ permission.name }}</label>
              </div>
            </div>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="assigningRole = null" :disabled="loading">取消</button>
          <button type="button" class="save-btn" @click="savePermissions" :disabled="loading">
            <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
            {{ loading ? '处理中...' : '保存权限' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const searchQuery = ref('');
const currentPage = ref(1);
const pageSize = 10;
const showAddForm = ref(false);
const editingRole = ref(null);
const viewingRole = ref(null);
const assigningRole = ref(null);

// 状态管理
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const formData = ref({
  name: '',
  description: ''
});

// 表单验证错误
const formErrors = ref({
  name: '',
  description: ''
});

// 权限模块和权限列表
const permissionModules = ref([
  {
    id: 'user',
    name: '用户管理',
    permissions: [
      { id: 'user:view', name: '查看用户' },
      { id: 'user:create', name: '创建用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'user:delete', name: '删除用户' }
    ]
  },
  {
    id: 'order',
    name: '订单管理',
    permissions: [
      { id: 'order:view', name: '查看订单' },
      { id: 'order:create', name: '创建订单' },
      { id: 'order:edit', name: '编辑订单' },
      { id: 'order:delete', name: '删除订单' }
    ]
  },
  {
    id: 'content',
    name: '内容管理',
    permissions: [
      { id: 'content:view', name: '查看内容' },
      { id: 'content:create', name: '创建内容' },
      { id: 'content:edit', name: '编辑内容' },
      { id: 'content:delete', name: '删除内容' }
    ]
  },
  {
    id: 'notification',
    name: '通知管理',
    permissions: [
      { id: 'notification:view', name: '查看通知' },
      { id: 'notification:create', name: '创建通知' },
      { id: 'notification:edit', name: '编辑通知' },
      { id: 'notification:delete', name: '删除通知' },
      { id: 'notification:send', name: '发送通知' }
    ]
  },
  {
    id: 'permission',
    name: '权限管理',
    permissions: [
      { id: 'permission:view', name: '查看角色' },
      { id: 'permission:create', name: '创建角色' },
      { id: 'permission:edit', name: '编辑角色' },
      { id: 'permission:delete', name: '删除角色' },
      { id: 'permission:assign', name: '分配权限' }
    ]
  }
]);

// 选中的权限
const selectedPermissions = ref([]);

// 实时验证
const validateField = (field, value) => {
  switch (field) {
    case 'name':
      if (!value) {
        formErrors.value.name = '角色名称不能为空';
      } else if (value.length < 2) {
        formErrors.value.name = '角色名称至少需要2个字符';
      } else {
        formErrors.value.name = '';
      }
      break;
    case 'description':
      if (!value) {
        formErrors.value.description = '描述不能为空';
      } else if (value.length < 5) {
        formErrors.value.description = '描述至少需要5个字符';
      } else {
        formErrors.value.description = '';
      }
      break;
  }
};

// 检查表单是否有效
const isFormValid = computed(() => {
  return !formErrors.value.name && !formErrors.value.description;
});

const roles = ref([
  {
    id: 1,
    name: '超级管理员',
    description: '拥有所有权限',
    createTime: '2026-04-01 10:00',
    permissions: [
      { id: 'user:view', name: '查看用户' },
      { id: 'user:create', name: '创建用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'user:delete', name: '删除用户' },
      { id: 'order:view', name: '查看订单' },
      { id: 'order:create', name: '创建订单' },
      { id: 'order:edit', name: '编辑订单' },
      { id: 'order:delete', name: '删除订单' },
      { id: 'content:view', name: '查看内容' },
      { id: 'content:create', name: '创建内容' },
      { id: 'content:edit', name: '编辑内容' },
      { id: 'content:delete', name: '删除内容' },
      { id: 'notification:view', name: '查看通知' },
      { id: 'notification:create', name: '创建通知' },
      { id: 'notification:edit', name: '编辑通知' },
      { id: 'notification:delete', name: '删除通知' },
      { id: 'notification:send', name: '发送通知' },
      { id: 'permission:view', name: '查看角色' },
      { id: 'permission:create', name: '创建角色' },
      { id: 'permission:edit', name: '编辑角色' },
      { id: 'permission:delete', name: '删除角色' },
      { id: 'permission:assign', name: '分配权限' }
    ]
  },
  {
    id: 2,
    name: '普通管理员',
    description: '拥有基本管理权限',
    createTime: '2026-04-02 14:30',
    permissions: [
      { id: 'user:view', name: '查看用户' },
      { id: 'user:edit', name: '编辑用户' },
      { id: 'order:view', name: '查看订单' },
      { id: 'order:edit', name: '编辑订单' },
      { id: 'content:view', name: '查看内容' },
      { id: 'content:create', name: '创建内容' },
      { id: 'content:edit', name: '编辑内容' },
      { id: 'notification:view', name: '查看通知' },
      { id: 'notification:create', name: '创建通知' }
    ]
  },
  {
    id: 3,
    name: '客服人员',
    description: '拥有客服相关权限',
    createTime: '2026-04-03 09:15',
    permissions: [
      { id: 'user:view', name: '查看用户' },
      { id: 'order:view', name: '查看订单' },
      { id: 'notification:view', name: '查看通知' },
      { id: 'notification:send', name: '发送通知' }
    ]
  },
  {
    id: 4,
    name: '内容编辑',
    description: '拥有内容编辑权限',
    createTime: '2026-04-04 11:20',
    permissions: [
      { id: 'content:view', name: '查看内容' },
      { id: 'content:create', name: '创建内容' },
      { id: 'content:edit', name: '编辑内容' },
      { id: 'content:delete', name: '删除内容' }
    ]
  },
  {
    id: 5,
    name: '订单处理',
    description: '拥有订单处理权限',
    createTime: '2026-04-05 16:45',
    permissions: [
      { id: 'order:view', name: '查看订单' },
      { id: 'order:create', name: '创建订单' },
      { id: 'order:edit', name: '编辑订单' },
      { id: 'order:delete', name: '删除订单' }
    ]
  }
]);

const filteredRoles = computed(() => {
  let result = roles.value;
  
  if (searchQuery.value) {
    result = result.filter(role => 
      role.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  return result;
});

const paginatedRoles = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredRoles.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredRoles.value.length / pageSize);
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
const viewRole = (role) => {
  viewingRole.value = role;
};

const editRole = (role) => {
  editingRole.value = role;
  formData.value = {
    name: role.name,
    description: role.description
  };
  // 清除之前的错误和成功消息
  error.value = '';
  successMessage.value = '';
};

const deleteRole = async (id) => {
  if (confirm('确定要删除这个角色吗？')) {
    try {
      loading.value = true;
      error.value = '';
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      roles.value = roles.value.filter(role => role.id !== id);
      // 重置分页
      if (paginatedRoles.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      successMessage.value = '角色删除成功';
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (err) {
      error.value = '删除角色失败，请稍后重试';
      console.error('删除角色失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

const saveRole = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 表单验证
    if (!formData.value.name || !formData.value.description) {
      throw new Error('角色名称和描述不能为空');
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingRole.value) {
      // 编辑现有角色
      const index = roles.value.findIndex(role => role.id === editingRole.value.id);
      if (index !== -1) {
        roles.value[index] = {
          ...roles.value[index],
          name: formData.value.name,
          description: formData.value.description
        };
        successMessage.value = '角色更新成功';
      }
    } else {
      // 添加新角色
      const newRole = {
        id: roles.value.length + 1,
        name: formData.value.name,
        description: formData.value.description,
        createTime: new Date().toLocaleString('zh-CN'),
        permissions: []
      };
      roles.value.push(newRole);
      successMessage.value = '角色添加成功';
    }
    
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    closeForm();
  } catch (err) {
    error.value = err.message || '保存角色失败，请稍后重试';
    console.error('保存角色失败:', err);
  } finally {
    loading.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingRole.value = null;
  formData.value = {
    name: '',
    description: ''
  };
  // 清除错误和成功消息
  error.value = '';
  successMessage.value = '';
  // 清除表单验证错误
  formErrors.value = {
    name: '',
    description: ''
  };
};

// 权限分配相关方法
const assignPermissions = (role) => {
  assigningRole.value = role;
  // 初始化选中的权限
  selectedPermissions.value = role.permissions.map(permission => permission.id);
};

const isModuleChecked = (moduleId) => {
  const module = permissionModules.value.find(m => m.id === moduleId);
  if (!module) return false;
  return module.permissions.every(permission => selectedPermissions.value.includes(permission.id));
};

const toggleModule = (moduleId) => {
  const module = permissionModules.value.find(m => m.id === moduleId);
  if (!module) return;
  
  const isChecked = isModuleChecked(moduleId);
  module.permissions.forEach(permission => {
    if (isChecked) {
      // 取消选中所有权限
      const index = selectedPermissions.value.indexOf(permission.id);
      if (index !== -1) {
        selectedPermissions.value.splice(index, 1);
      }
    } else {
      // 选中所有权限
      if (!selectedPermissions.value.includes(permission.id)) {
        selectedPermissions.value.push(permission.id);
      }
    }
  });
};

const isPermissionChecked = (permissionId) => {
  return selectedPermissions.value.includes(permissionId);
};

const togglePermission = (permissionId) => {
  const index = selectedPermissions.value.indexOf(permissionId);
  if (index !== -1) {
    selectedPermissions.value.splice(index, 1);
  } else {
    selectedPermissions.value.push(permissionId);
  }
};

const savePermissions = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 更新角色的权限
    const index = roles.value.findIndex(role => role.id === assigningRole.value.id);
    if (index !== -1) {
      // 获取权限详情
      const newPermissions = [];
      permissionModules.value.forEach(module => {
        module.permissions.forEach(permission => {
          if (selectedPermissions.value.includes(permission.id)) {
            newPermissions.push(permission);
          }
        });
      });
      
      roles.value[index] = {
        ...roles.value[index],
        permissions: newPermissions
      };
      
      successMessage.value = '权限分配成功';
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }
    
    assigningRole.value = null;
  } catch (err) {
    error.value = '分配权限失败，请稍后重试';
    console.error('分配权限失败:', err);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.permission-container {
  padding: 20px;
}

.permission-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.add-role-btn {
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

.add-role-btn:hover:not(:disabled) {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.add-role-btn:disabled {
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

.permission-search {
  margin-bottom: 30px;
}

.search-input {
  position: relative;
  max-width: 400px;
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

.permission-table {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
}

.permission-table table {
  width: 100%;
  border-collapse: collapse;
}

.permission-table th {
  background-color: #f8fafc;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

.permission-table td {
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.permission-table tr:hover {
  background-color: #f8fafc;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.view-btn, .edit-btn, .delete-btn, .permission-btn {
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

.permission-btn {
  background-color: #f1f5f9;
  color: #10b981;
}

.permission-btn:hover {
  background-color: #e2e8f0;
}

.permission-pagination {
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

/* 角色详情样式 */
.role-details {
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

.permission-list {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.permission-tag {
  background-color: #f1f5f9;
  color: #64748b;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.no-permission {
  color: #94a3b8;
  font-size: 14px;
  font-style: italic;
}

/* 权限分配样式 */
.permission-assignment {
  margin-bottom: 24px;
}

.permission-module {
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.module-header {
  background-color: #f8fafc;
  padding: 12px 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.module-header:hover {
  background-color: #f1f5f9;
}

.module-header input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.module-header label {
  font-weight: 500;
  color: #334155;
  font-size: 14px;
  cursor: pointer;
  flex: 1;
}

.module-permissions {
  padding: 16px;
  background-color: white;
}

.permission-item {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 0;
}

.permission-item:last-child {
  margin-bottom: 0;
}

.permission-item input[type="checkbox"] {
  width: 16px;
  height: 16px;
  cursor: pointer;
}

.permission-item label {
  font-size: 14px;
  color: #1e293b;
  cursor: pointer;
  flex: 1;
}

@media (max-width: 768px) {
  .form-container {
    width: 95%;
    padding: 20px;
  }
  
  .permission-table {
    overflow-x: auto;
  }
  
  .permission-table table {
    min-width: 600px;
  }
  
  .search-input {
    max-width: 100%;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
  
  .action-buttons button {
    flex: 1;
    min-width: 36px;
  }
}
</style>
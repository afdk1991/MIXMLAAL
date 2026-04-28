<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="w-8 h-8">
                <defs>
                  <linearGradient id="adminLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="url(#adminLogoGradient)"/>
                <path d="M10,20 L14,12 L18,20 L22,12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10,12 L22,12" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <path d="M14,12 L14,8" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <path d="M18,12 L18,8" stroke="white" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">MIXMLAAL 管理后台</span>
            </div>
            <div class="ml-10 flex items-center space-x-4">
              <button @click="$router.push('/admin')" class="text-gray-500 hover:text-gray-700">{{ t('admin.dashboard.title') }}</button>
              <span class="text-gray-300">/</span>
              <span class="text-gray-900 font-medium">{{ t('admin.users.title') }}</span>
            </div>
          </div>
          <div class="flex items-center">
            <button class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
              <i class="fa fa-bell text-lg"></i>
            </button>
            <ThemeToggle />
            <div class="ml-4 relative">
              <button class="flex items-center">
                <span class="text-sm font-medium text-gray-700">管理员</span>
                <i class="fa fa-chevron-down ml-2 text-xs text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.users.title') }}</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center" @click="showAddForm = true" :disabled="loading">
          <i class="fa fa-plus mr-2"></i> {{ t('admin.users.add') }}
        </button>
      </div>

      <!-- 消息提示 -->
      <div v-if="error" class="message error mb-6">
        <i class="fa fa-exclamation-circle mr-2"></i>
        {{ error }}
      </div>
      <div v-if="successMessage" class="message success mb-6">
        <i class="fa fa-check-circle mr-2"></i>
        {{ successMessage }}
      </div>

      <!-- 搜索和筛选 -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.search') }}</label>
            <input type="text" v-model="searchQuery" @input="resetPage" placeholder="输入用户名或邮箱" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.filters.role') }}</label>
            <select v-model="filterRole" @change="resetPage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">{{ t('admin.users.filters.all') }}</option>
              <option value="admin">{{ t('admin.users.filters.admin') }}</option>
              <option value="user">{{ t('admin.users.filters.user') }}</option>
              <option value="driver">司机</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.filters.status') }}</label>
            <select v-model="filterStatus" @change="resetPage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">{{ t('admin.users.filters.all') }}</option>
              <option value="active">{{ t('admin.users.filters.active') }}</option>
              <option value="inactive">{{ t('admin.users.filters.inactive') }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              <i class="fa fa-search mr-2"></i> {{ t('common.search') }}
            </button>
          </div>
        </div>
      </div>
    
      <!-- 用户列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('admin.users.form.name') }} ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('admin.users.form.name') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('admin.users.form.email') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('admin.users.form.role') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('admin.users.form.status') }}
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  注册时间
                </th>
                <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {{ t('common.edit') }}
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="user in paginatedUsers" :key="user.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ user.id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <i class="fa fa-user text-gray-500"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">{{ user.username }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.email }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.role === 'admin' ? 'bg-purple-100 text-purple-800' : user.role === 'driver' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800']">
                    {{ user.role === 'admin' ? t('admin.users.filters.admin') : user.role === 'driver' ? '司机' : t('admin.users.filters.user') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                    {{ user.status === 'active' ? t('admin.users.filters.active') : t('admin.users.filters.inactive') }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ user.registerDate }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button class="text-blue-600 hover:text-blue-900 mr-3" @click="editUser(user)">
                    <i class="fa fa-edit"></i> {{ t('common.edit') }}
                  </button>
                  <button class="text-red-600 hover:text-red-900" @click="deleteUser(user.id)">
                    <i class="fa fa-trash"></i> {{ t('common.delete') }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 分页 -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              {{ t('common.previous') }}
            </button>
            <button @click="nextPage" :disabled="currentPage === totalPages" class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              {{ t('common.next') }}
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                显示 <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> 到 <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredUsers.length) }}</span> 共 <span class="font-medium">{{ filteredUsers.length }}</span> 条记录
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button @click="prevPage" :disabled="currentPage === 1" class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">{{ t('common.previous') }}</span>
                  <i class="fa fa-chevron-left"></i>
                </button>
                <button v-for="page in Math.min(5, totalPages)" :key="page" @click="currentPage = page" :class="['relative inline-flex items-center px-4 py-2 border text-sm font-medium', currentPage === page ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50']">
                  {{ page }}
                </button>
                <button v-if="totalPages > 5" @click="currentPage = totalPages" class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  {{ totalPages }}
                </button>
                <button @click="nextPage" :disabled="currentPage === totalPages" class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">{{ t('common.next') }}</span>
                  <i class="fa fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 添加/编辑用户表单 -->
      <div v-if="showAddForm || editingUser" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div class="flex justify-between items-center mb-6">
            <h3 class="text-lg font-medium text-gray-900">{{ editingUser ? t('admin.users.edit') : t('admin.users.add') }}</h3>
            <button class="text-gray-400 hover:text-gray-500" @click="closeForm">
              <i class="fa fa-times text-xl"></i>
            </button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.form.name') }}</label>
              <input 
                type="text" 
                v-model="formData.username" 
                @input="validateField('username', formData.username)"
                :class="['w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500', formErrors.username ? 'border-red-500' : 'border-gray-300']"
                required
              >
              <div v-if="formErrors.username" class="mt-1 text-sm text-red-600">{{ formErrors.username }}</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.form.email') }}</label>
              <input 
                type="email" 
                v-model="formData.email" 
                @input="validateField('email', formData.email)"
                :class="['w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500', formErrors.email ? 'border-red-500' : 'border-gray-300']"
                required
              >
              <div v-if="formErrors.email" class="mt-1 text-sm text-red-600">{{ formErrors.email }}</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.form.password') }}</label>
              <input 
                type="password" 
                v-model="formData.password" 
                @input="validateField('password', formData.password)"
                :class="['w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500', formErrors.password ? 'border-red-500' : 'border-gray-300']"
                :required="!editingUser"
              >
              <div v-if="formErrors.password" class="mt-1 text-sm text-red-600">{{ formErrors.password }}</div>
              <div v-if="editingUser" class="mt-1 text-sm text-gray-500">留空表示不修改密码</div>
            </div>
            <div class="mb-4">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.form.role') }}</label>
              <select v-model="formData.role" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                <option value="admin">{{ t('admin.users.filters.admin') }}</option>
                <option value="user">{{ t('admin.users.filters.user') }}</option>
                <option value="driver">司机</option>
              </select>
            </div>
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.users.form.status') }}</label>
              <select v-model="formData.status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                <option value="active">{{ t('admin.users.filters.active') }}</option>
                <option value="inactive">{{ t('admin.users.filters.inactive') }}</option>
              </select>
            </div>
            <div class="flex justify-end space-x-3">
              <button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" @click="closeForm" :disabled="loading">{{ t('common.cancel') }}</button>
              <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" :disabled="loading || !isFormValid">
                <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
                {{ loading ? '处理中...' : (editingUser ? t('common.save') : t('common.add')) }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import ThemeToggle from '../../components/ThemeToggle.vue';

const { t } = useI18n();

const searchQuery = ref('');
const filterRole = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = 10;
const showAddForm = ref(false);
const editingUser = ref(null);

// 状态管理
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const formData = ref({
  username: '',
  email: '',
  password: '',
  role: 'user',
  status: 'active'
});

// 表单验证错误
const formErrors = ref({
  username: '',
  email: '',
  password: ''
});

// 实时验证
const validateField = (field, value) => {
  switch (field) {
    case 'username':
      if (!value) {
        formErrors.value.username = '用户名不能为空';
      } else if (value.length < 3) {
        formErrors.value.username = '用户名至少需要3个字符';
      } else {
        formErrors.value.username = '';
      }
      break;
    case 'email':
      if (!value) {
        formErrors.value.email = '邮箱不能为空';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        formErrors.value.email = '请输入有效的邮箱地址';
      } else {
        formErrors.value.email = '';
      }
      break;
    case 'password':
      if (!editingUser.value && !value) {
        formErrors.value.password = '密码不能为空';
      } else if (value && value.length < 6) {
        formErrors.value.password = '密码至少需要6个字符';
      } else {
        formErrors.value.password = '';
      }
      break;
  }
};

// 检查表单是否有效
const isFormValid = computed(() => {
  return !formErrors.value.username && !formErrors.value.email && !formErrors.value.password;
});

const users = ref([
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', registerDate: '2026-01-01' },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', registerDate: '2026-01-02' },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', status: 'inactive', registerDate: '2026-01-03' },
  { id: 4, username: 'user3', email: 'user3@example.com', role: 'user', status: 'active', registerDate: '2026-01-04' },
  { id: 5, username: 'user4', email: 'user4@example.com', role: 'user', status: 'active', registerDate: '2026-01-05' },
  { id: 6, username: 'user5', email: 'user5@example.com', role: 'user', status: 'inactive', registerDate: '2026-01-06' },
  { id: 7, username: 'user6', email: 'user6@example.com', role: 'user', status: 'active', registerDate: '2026-01-07' },
  { id: 8, username: 'user7', email: 'user7@example.com', role: 'user', status: 'active', registerDate: '2026-01-08' },
  { id: 9, username: 'user8', email: 'user8@example.com', role: 'user', status: 'inactive', registerDate: '2026-01-09' },
  { id: 10, username: 'user9', email: 'user9@example.com', role: 'user', status: 'active', registerDate: '2026-01-10' },
  { id: 11, username: 'user10', email: 'user10@example.com', role: 'user', status: 'active', registerDate: '2026-01-11' },
  { id: 12, username: 'driver1', email: 'driver1@example.com', role: 'driver', status: 'active', registerDate: '2026-01-12' },
  { id: 13, username: 'driver2', email: 'driver2@example.com', role: 'driver', status: 'active', registerDate: '2026-01-13' }
]);

const filteredUsers = computed(() => {
  let result = users.value;
  
  if (searchQuery.value) {
    result = result.filter(user => 
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (filterRole.value) {
    result = result.filter(user => user.role === filterRole.value);
  }
  
  if (filterStatus.value) {
    result = result.filter(user => user.status === filterStatus.value);
  }
  
  return result;
});

const paginatedUsers = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredUsers.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredUsers.value.length / pageSize);
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
const editUser = (user) => {
  editingUser.value = user;
  formData.value = {
    username: user.username,
    email: user.email,
    password: '',
    role: user.role,
    status: user.status
  };
  // 清除之前的错误和成功消息
  error.value = '';
  successMessage.value = '';
};

const deleteUser = async (id) => {
  if (confirm(t('common.confirm'))) {
    try {
      loading.value = true;
      error.value = '';
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      users.value = users.value.filter(user => user.id !== id);
      // 重置分页
      if (paginatedUsers.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      successMessage.value = t('admin.users.messages.deleteSuccess');
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (err) {
      error.value = t('admin.users.messages.deleteFailed');
      console.error('删除用户失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

const saveUser = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 表单验证
    if (!formData.value.username || !formData.value.email) {
      throw new Error(t('admin.users.form.required'));
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingUser.value) {
      // 编辑现有用户
      const index = users.value.findIndex(user => user.id === editingUser.value.id);
      if (index !== -1) {
        users.value[index] = {
          ...users.value[index],
          username: formData.value.username,
          email: formData.value.email,
          role: formData.value.role,
          status: formData.value.status
        };
        successMessage.value = t('admin.users.messages.updateSuccess');
      }
    } else {
      // 添加新用户
      const newUser = {
        id: users.value.length + 1,
        username: formData.value.username,
        email: formData.value.email,
        role: formData.value.role,
        status: formData.value.status,
        registerDate: new Date().toISOString().split('T')[0]
      };
      users.value.push(newUser);
      successMessage.value = t('admin.users.messages.addSuccess');
    }
    
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    closeForm();
  } catch (err) {
    error.value = err.message || t('admin.users.messages.saveFailed');
    console.error('保存用户失败:', err);
  } finally {
    loading.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingUser.value = null;
  formData.value = {
    username: '',
    email: '',
    password: '',
    role: 'user',
    status: 'active'
  };
  // 清除错误和成功消息
  error.value = '';
  successMessage.value = '';
};
</script>

<style scoped>
/* 消息提示样式 */
.message {
  padding: 12px 16px;
  border-radius: 6px;
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
</style>
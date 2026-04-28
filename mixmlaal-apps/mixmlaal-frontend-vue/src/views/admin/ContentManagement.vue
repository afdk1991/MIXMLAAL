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
              <span class="text-gray-900 font-medium">{{ t('admin.content.title') }}</span>
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
        <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.content.title') }}</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center" @click="showAddForm = true" :disabled="loading">
          <i class="fa fa-plus mr-2"></i> {{ t('admin.content.add') }}
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
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.search') }}</label>
            <input type="text" v-model="searchQuery" @input="resetPage" placeholder="输入内容标题" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.filters.type') }}</label>
            <select v-model="filterType" @change="resetPage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">{{ t('admin.content.filters.all') }}</option>
              <option value="article">{{ t('admin.content.filters.article') }}</option>
              <option value="page">{{ t('admin.content.filters.page') }}</option>
              <option value="banner">{{ t('admin.content.filters.banner') }}</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.filters.status') }}</label>
            <select v-model="filterStatus" @change="resetPage" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">{{ t('admin.content.filters.all') }}</option>
              <option value="published">{{ t('admin.content.filters.published') }}</option>
              <option value="draft">{{ t('admin.content.filters.draft') }}</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              <i class="fa fa-search mr-2"></i> {{ t('common.search') }}
            </button>
          </div>
        </div>
      </div>
    
    <!-- 内容列表 -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              内容ID
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('admin.content.form.title') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('admin.content.form.type') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('admin.content.form.status') }}
            </th>
            <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              创建时间
            </th>
            <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              {{ t('common.edit') }}
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="content in paginatedContents" :key="content.id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              {{ content.id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              {{ content.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', content.type === 'article' ? 'bg-blue-100 text-blue-800' : content.type === 'page' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                {{ getTypeText(content.type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', content.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                {{ getStatusText(content.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ content.createTime }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button class="text-gray-600 hover:text-gray-900 mr-3" @click="viewContent(content)">
                <i class="fa fa-eye"></i> {{ t('admin.content.view') }}
              </button>
              <button class="text-blue-600 hover:text-blue-900 mr-3" @click="editContent(content)">
                <i class="fa fa-edit"></i> {{ t('common.edit') }}
              </button>
              <button class="text-red-600 hover:text-red-900" @click="deleteContent(content.id)">
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
              显示 <span class="font-medium">{{ (currentPage - 1) * pageSize + 1 }}</span> 到 <span class="font-medium">{{ Math.min(currentPage * pageSize, filteredContents.length) }}</span> 共 <span class="font-medium">{{ filteredContents.length }}</span> 条记录
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
  </div>
    
    <!-- 添加/编辑内容表单 -->
    <div v-if="showAddForm || editingContent" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">{{ editingContent ? t('admin.content.edit') : t('admin.content.add') }}</h3>
          <button class="text-gray-400 hover:text-gray-500" @click="closeForm">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <form @submit.prevent="saveContent">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.form.title') }}</label>
            <input 
              type="text" 
              v-model="formData.title" 
              @input="validateField('title', formData.title)"
              :class="['w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500', formErrors.title ? 'border-red-500' : 'border-gray-300']"
              required
            >
            <div v-if="formErrors.title" class="mt-1 text-sm text-red-600">{{ formErrors.title }}</div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.form.type') }}</label>
              <select v-model="formData.type" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                <option value="article">{{ t('admin.content.filters.article') }}</option>
                <option value="page">{{ t('admin.content.filters.page') }}</option>
                <option value="banner">{{ t('admin.content.filters.banner') }}</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.form.status') }}</label>
              <select v-model="formData.status" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" required>
                <option value="published">{{ t('admin.content.filters.published') }}</option>
                <option value="draft">{{ t('admin.content.filters.draft') }}</option>
              </select>
            </div>
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.content.form.content') }}</label>
            <textarea 
              v-model="formData.content" 
              @input="validateField('content', formData.content)"
              :class="['w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500', formErrors.content ? 'border-red-500' : 'border-gray-300']"
              rows="10"
              required
            ></textarea>
            <div v-if="formErrors.content" class="mt-1 text-sm text-red-600">{{ formErrors.content }}</div>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" @click="closeForm" :disabled="loading">{{ t('common.cancel') }}</button>
            <button type="submit" class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" :disabled="loading || !isFormValid">
              <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
              {{ loading ? '处理中...' : (editingContent ? t('common.save') : t('common.add')) }}
            </button>
          </div>
        </form>
      </div>
    </div>
    
    <!-- 内容详情弹窗 -->
    <div v-if="viewingContent" class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <h3 class="text-lg font-medium text-gray-900">{{ t('admin.content.view') }}</h3>
          <button class="text-gray-400 hover:text-gray-500" @click="viewingContent = null">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <div class="space-y-4">
          <div class="p-4 bg-gray-50 rounded-md">
            <h4 class="text-sm font-medium text-gray-500 mb-2">标题</h4>
            <p class="text-gray-900">{{ viewingContent.title }}</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-4 bg-gray-50 rounded-md">
              <h4 class="text-sm font-medium text-gray-500 mb-2">类型</h4>
              <p class="text-gray-900">{{ getTypeText(viewingContent.type) }}</p>
            </div>
            <div class="p-4 bg-gray-50 rounded-md">
              <h4 class="text-sm font-medium text-gray-500 mb-2">状态</h4>
              <p class="text-gray-900">{{ getStatusText(viewingContent.status) }}</p>
            </div>
          </div>
          <div class="p-4 bg-gray-50 rounded-md">
            <h4 class="text-sm font-medium text-gray-500 mb-2">创建时间</h4>
            <p class="text-gray-900">{{ viewingContent.createTime }}</p>
          </div>
          <div class="p-4 bg-gray-50 rounded-md">
            <h4 class="text-sm font-medium text-gray-500 mb-2">内容</h4>
            <div class="text-gray-900" v-html="viewingContent.content"></div>
          </div>
        </div>
        <div class="mt-6 flex justify-end">
          <button type="button" class="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50" @click="viewingContent = null">{{ t('common.close') }}</button>
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
const filterType = ref('');
const filterStatus = ref('');
const currentPage = ref(1);
const pageSize = 10;
const showAddForm = ref(false);
const editingContent = ref(null);
const viewingContent = ref(null);

// 状态管理
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

const formData = ref({
  title: '',
  type: 'article',
  status: 'draft',
  content: ''
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

const contents = ref([
  { id: 1, title: '欢迎使用MIXMLAAL', type: 'article', status: 'published', content: '<p>欢迎使用MIXMLAAL管理后台，这是一个功能强大的综合性管理系统。</p><p>您可以在这里管理用户、订单、内容等各种资源。</p>', createTime: '2026-04-01 10:00' },
  { id: 2, title: '关于我们', type: 'page', status: 'published', content: '<p>MIXMLAAL是一家专注于提供综合性服务的公司，我们致力于为用户提供优质的服务体验。</p>', createTime: '2026-04-02 14:30' },
  { id: 3, title: '服务介绍', type: 'article', status: 'draft', content: '<p>我们提供多种服务，包括出行服务、美食服务、跑腿服务等。</p>', createTime: '2026-04-03 09:15' },
  { id: 4, title: '首页横幅', type: 'banner', status: 'published', content: '<p>限时优惠活动：新用户注册送优惠券</p>', createTime: '2026-04-04 11:20' },
  { id: 5, title: '用户指南', type: 'page', status: 'draft', content: '<p>本指南将帮助您了解如何使用我们的服务。</p>', createTime: '2026-04-05 16:45' },
  { id: 6, title: '隐私政策', type: 'page', status: 'published', content: '<p>我们重视用户的隐私保护，本政策详细说明了我们如何收集、使用和保护您的个人信息。</p>', createTime: '2026-04-06 13:30' },
  { id: 7, title: '服务条款', type: 'page', status: 'published', content: '<p>使用我们的服务即表示您同意遵守以下服务条款。</p>', createTime: '2026-04-07 10:45' },
  { id: 8, title: '常见问题', type: 'article', status: 'draft', content: '<p>以下是用户常见问题的解答。</p>', createTime: '2026-04-08 15:20' },
  { id: 9, title: '活动公告', type: 'article', status: 'published', content: '<p>我们将于近期举办一系列优惠活动，敬请关注。</p>', createTime: '2026-04-09 14:10' },
  { id: 10, title: '联系我们', type: 'page', status: 'published', content: '<p>如有任何问题，请随时联系我们。</p>', createTime: '2026-04-10 11:30' },
  { id: 11, title: '新功能介绍', type: 'article', status: 'draft', content: '<p>我们即将推出新功能，敬请期待。</p>', createTime: '2026-04-11 09:50' }
]);

const filteredContents = computed(() => {
  let result = contents.value;
  
  if (searchQuery.value) {
    result = result.filter(content => 
      content.title.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  }
  
  if (filterType.value) {
    result = result.filter(content => content.type === filterType.value);
  }
  
  if (filterStatus.value) {
    result = result.filter(content => content.status === filterStatus.value);
  }
  
  return result;
});

const paginatedContents = computed(() => {
  const startIndex = (currentPage.value - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return filteredContents.value.slice(startIndex, endIndex);
});

const totalPages = computed(() => {
  return Math.ceil(filteredContents.value.length / pageSize);
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
const viewContent = (content) => {
  viewingContent.value = content;
};

const editContent = (content) => {
  editingContent.value = content;
  formData.value = {
    title: content.title,
    type: content.type,
    status: content.status,
    content: content.content
  };
  // 清除之前的错误和成功消息
  error.value = '';
  successMessage.value = '';
};

const deleteContent = async (id) => {
  if (confirm(t('common.confirm'))) {
    try {
      loading.value = true;
      error.value = '';
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      contents.value = contents.value.filter(content => content.id !== id);
      // 重置分页
      if (paginatedContents.value.length === 0 && currentPage.value > 1) {
        currentPage.value--;
      }
      successMessage.value = t('admin.content.messages.deleteSuccess');
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    } catch (err) {
      error.value = t('admin.content.messages.deleteFailed');
      console.error('删除内容失败:', err);
    } finally {
      loading.value = false;
    }
  }
};

const saveContent = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    // 表单验证
    if (!formData.value.title || !formData.value.content) {
      throw new Error(t('admin.content.form.required'));
    }
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (editingContent.value) {
      // 编辑现有内容
      const index = contents.value.findIndex(content => content.id === editingContent.value.id);
      if (index !== -1) {
        contents.value[index] = {
          ...contents.value[index],
          title: formData.value.title,
          type: formData.value.type,
          status: formData.value.status,
          content: formData.value.content
        };
        successMessage.value = t('admin.content.messages.updateSuccess');
      }
    } else {
      // 添加新内容
      const newContent = {
        id: contents.value.length + 1,
        title: formData.value.title,
        type: formData.value.type,
        status: formData.value.status,
        content: formData.value.content,
        createTime: new Date().toLocaleString('zh-CN')
      };
      contents.value.push(newContent);
      successMessage.value = t('admin.content.messages.addSuccess');
    }
    
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
    
    closeForm();
  } catch (err) {
    error.value = err.message || t('admin.content.messages.saveFailed');
    console.error('保存内容失败:', err);
  } finally {
    loading.value = false;
  }
};

const closeForm = () => {
  showAddForm.value = false;
  editingContent.value = null;
  formData.value = {
    title: '',
    type: 'article',
    status: 'draft',
    content: ''
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
    article: t('admin.content.filters.article'),
    page: t('admin.content.filters.page'),
    banner: t('admin.content.filters.banner')
  };
  return typeMap[type] || type;
};

const getStatusText = (status) => {
  const statusMap = {
    published: t('admin.content.filters.published'),
    draft: t('admin.content.filters.draft')
  };
  return statusMap[status] || status;
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
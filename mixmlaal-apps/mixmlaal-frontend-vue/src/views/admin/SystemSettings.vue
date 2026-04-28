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
              <span class="text-gray-900 font-medium">{{ t('admin.system.title') }}</span>
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
        <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.system.title') }}</h1>
        <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center" @click="saveSettings" :disabled="loading">
          <i v-if="loading" class="fa fa-spinner fa-spin mr-2"></i>
          {{ loading ? '保存中...' : t('admin.system.save') }}
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

      <!-- 设置选项卡 -->
      <div class="bg-white rounded-lg shadow overflow-hidden mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-8" aria-label="Tabs">
            <button 
              @click="activeTab = 'basic'" 
              :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'basic' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              {{ t('admin.system.tabs.basic') }}
            </button>
            <button 
              @click="activeTab = 'email'" 
              :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'email' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              {{ t('admin.system.tabs.email') }}
            </button>
            <button 
              @click="activeTab = 'payment'" 
              :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'payment' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              {{ t('admin.system.tabs.payment') }}
            </button>
            <button 
              @click="activeTab = 'security'" 
              :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'security' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              {{ t('admin.system.tabs.security') }}
            </button>
            <button 
              @click="activeTab = 'cache'" 
              :class="['py-4 px-1 border-b-2 font-medium text-sm', activeTab === 'cache' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300']"
            >
              {{ t('admin.system.tabs.cache') }}
            </button>
          </nav>
        </div>

        <!-- 基本设置 -->
        <div v-if="activeTab === 'basic'" class="p-6">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.basic.site') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.siteName') }}</label>
                  <input 
                    type="text" 
                    v-model="settings.site.name" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.siteUrl') }}</label>
                  <input 
                    type="text" 
                    v-model="settings.site.url" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.siteDescription') }}</label>
                  <textarea 
                    v-model="settings.site.description" 
                    rows="3" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.siteLogo') }}</label>
                  <div class="mt-1 flex items-center">
                    <span class="inline-block h-12 w-12 rounded-md overflow-hidden bg-gray-100">
                      <img v-if="settings.site.logo" :src="settings.site.logo" alt="Site Logo" class="h-full w-full object-cover">
                      <i v-else class="fa fa-image text-gray-400 h-full w-full flex items-center justify-center"></i>
                    </span>
                    <button type="button" class="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                      {{ t('common.edit') }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.basic.system') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.systemLanguage') }}</label>
                  <select 
                    v-model="settings.system.language" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="zh-CN">简体中文</option>
                    <option value="en-US">English</option>
                    <option value="ja-JP">日本語</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.timezone') }}</label>
                  <select 
                    v-model="settings.system.timezone" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Asia/Shanghai">Asia/Shanghai</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.basic.maintenanceMode') }}</label>
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="settings.system.maintenanceMode" 
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                    <label class="ml-2 block text-sm text-gray-700">{{ t('admin.system.basic.maintenanceMode') }}</label>
                  </div>
                  <p class="mt-2 text-sm text-gray-500">{{ t('admin.system.basic.maintenanceModeDesc') }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 邮件设置 -->
        <div v-if="activeTab === 'email'" class="p-6">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.email.smtp') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.smtpHost') }}</label>
                  <input 
                    type="text" 
                    v-model="settings.email.smtp.host" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.smtpPort') }}</label>
                  <input 
                    type="number" 
                    v-model="settings.email.smtp.port" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.smtpUsername') }}</label>
                  <input 
                    type="text" 
                    v-model="settings.email.smtp.username" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.smtpPassword') }}</label>
                  <input 
                    type="password" 
                    v-model="settings.email.smtp.password" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.from') }}</label>
                  <input 
                    type="email" 
                    v-model="settings.email.from" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div class="md:col-span-2">
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.email.fromName') }}</label>
                  <input 
                    type="text" 
                    v-model="settings.email.fromName" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
                <div class="md:col-span-2">
                  <button type="button" class="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors duration-200 flex items-center">
                    <i class="fa fa-paper-plane mr-2"></i> {{ t('admin.system.email.sendTest') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 支付设置 -->
        <div v-if="activeTab === 'payment'" class="p-6">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.payment.methods') }}</h3>
              <div class="space-y-4">
                <div class="p-4 border rounded-lg">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-900">{{ t('admin.system.payment.alipay') }}</h4>
                    <div class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="settings.payment.alipay.enabled" 
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <label class="ml-2 block text-sm text-gray-700">{{ t('admin.system.payment.enabled') }}</label>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.payment.alipayAppId') }}</label>
                      <input 
                        type="text" 
                        v-model="settings.payment.alipay.appId" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.payment.alipayPrivateKey') }}</label>
                      <input 
                        type="text" 
                        v-model="settings.payment.alipay.privateKey" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                  </div>
                </div>

                <div class="p-4 border rounded-lg">
                  <div class="flex justify-between items-center mb-4">
                    <h4 class="font-medium text-gray-900">{{ t('admin.system.payment.wechat') }}</h4>
                    <div class="flex items-center">
                      <input 
                        type="checkbox" 
                        v-model="settings.payment.wechat.enabled" 
                        class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      >
                      <label class="ml-2 block text-sm text-gray-700">{{ t('admin.system.payment.enabled') }}</label>
                    </div>
                  </div>
                  <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.payment.wechatMchId') }}</label>
                      <input 
                        type="text" 
                        v-model="settings.payment.wechat.mchId" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.payment.wechatApiKey') }}</label>
                      <input 
                        type="text" 
                        v-model="settings.payment.wechat.apiKey" 
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      >
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 安全设置 -->
        <div v-if="activeTab === 'security'" class="p-6">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.security.auth') }}</h3>
              <div class="space-y-4">
                <div class="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 class="font-medium">{{ t('admin.system.security.twoFactorAuth') }}</h4>
                    <p class="text-sm text-gray-600">{{ t('admin.system.security.twoFactorAuthDesc') }}</p>
                  </div>
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="settings.security.twoFactorAuth" 
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                  </div>
                </div>
                <div class="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 class="font-medium">{{ t('admin.system.security.strongPassword') }}</h4>
                    <p class="text-sm text-gray-600">{{ t('admin.system.security.strongPasswordDesc') }}</p>
                  </div>
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="settings.security.strongPassword" 
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                  </div>
                </div>
                <div class="flex justify-between items-center p-4 border rounded-lg">
                  <div>
                    <h4 class="font-medium">{{ t('admin.system.security.loginAttemptLimit') }}</h4>
                    <p class="text-sm text-gray-600">{{ t('admin.system.security.loginAttemptLimitDesc') }}</p>
                  </div>
                  <div class="flex items-center">
                    <input 
                      type="checkbox" 
                      v-model="settings.security.loginAttemptLimit" 
                      class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    >
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.security.cors') }}</h3>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.security.allowedOrigins') }}</label>
                <textarea 
                  v-model="settings.security.cors.allowedOrigins" 
                  rows="3" 
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="输入允许的域名，每行一个"
                ></textarea>
                <p class="mt-2 text-sm text-gray-500">{{ t('admin.system.security.allowedOriginsDesc') }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 缓存设置 -->
        <div v-if="activeTab === 'cache'" class="p-6">
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.cache.config') }}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.cache.type') }}</label>
                  <select 
                    v-model="settings.cache.type" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="memory">内存</option>
                    <option value="redis">Redis</option>
                    <option value="file">文件</option>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('admin.system.cache.expire') }}</label>
                  <input 
                    type="number" 
                    v-model="settings.cache.expire" 
                    class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>
              </div>
            </div>

            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.system.cache.management') }}</h3>
              <div class="flex space-x-4">
                <button type="button" class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center" @click="clearCache">
                  <i class="fa fa-trash mr-2"></i> {{ t('admin.system.cache.clear') }}
                </button>
                <button type="button" class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center">
                  <i class="fa fa-refresh mr-2"></i> {{ t('admin.system.cache.refresh') }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ThemeToggle from '../../components/ThemeToggle.vue';

const { t } = useI18n();

// 响应式数据
const activeTab = ref('basic');
const loading = ref(false);
const error = ref('');
const successMessage = ref('');

// 系统设置
const settings = ref({
  site: {
    name: 'MIXMLAAL',
    url: 'https://mixmlaal.com',
    description: 'MIXMLAAL 综合性服务平台',
    logo: ''
  },
  system: {
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    maintenanceMode: false
  },
  email: {
    smtp: {
      host: 'smtp.qq.com',
      port: 587,
      username: '',
      password: ''
    },
    from: 'noreply@mixmlaal.com',
    fromName: 'MIXMLAAL'
  },
  payment: {
    alipay: {
      enabled: false,
      appId: '',
      privateKey: ''
    },
    wechat: {
      enabled: false,
      mchId: '',
      apiKey: ''
    }
  },
  security: {
    twoFactorAuth: false,
    strongPassword: true,
    loginAttemptLimit: true,
    cors: {
      allowedOrigins: '*'
    }
  },
  cache: {
    type: 'memory',
    expire: 3600
  }
});

// 组件挂载时加载设置
onMounted(() => {
  loadSettings();
});

// 加载设置
function loadSettings() {
  // 从localStorage加载设置
  const savedSettings = localStorage.getItem('systemSettings');
  if (savedSettings) {
    try {
      settings.value = JSON.parse(savedSettings);
    } catch (error) {
      console.error('解析系统设置失败:', error);
    }
  }
}

// 保存设置
async function saveSettings() {
  try {
    loading.value = true;
    error.value = '';
    
    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // 保存到localStorage
    localStorage.setItem('systemSettings', JSON.stringify(settings.value));
    
    successMessage.value = t('admin.system.saveSuccess');
    
    // 3秒后清除成功消息
    setTimeout(() => {
      successMessage.value = '';
    }, 3000);
  } catch (err) {
    error.value = err.message || t('admin.system.saveFailed');
    console.error('保存设置失败:', err);
  } finally {
    loading.value = false;
  }
}

// 清除缓存
function clearCache() {
  if (confirm(t('common.confirm'))) {
    // 模拟清除缓存
    setTimeout(() => {
      successMessage.value = t('admin.system.cache.clearSuccess');
      // 3秒后清除成功消息
      setTimeout(() => {
        successMessage.value = '';
      }, 3000);
    }, 500);
  }
}
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
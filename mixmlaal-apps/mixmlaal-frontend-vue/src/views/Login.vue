<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <section class="max-w-md w-full space-y-8">
      <header class="text-center">
        <router-link to="/" class="flex items-center justify-center space-x-2 mb-4 cursor-pointer hover:opacity-90 transition-all active:opacity-80">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32" class="w-10 h-10 pointer-events-auto">
              <!-- 背景圆形渐变 -->
              <defs>
                <linearGradient id="loginPageLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
                <linearGradient id="loginPageMixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#e0f2fe"/>
                </linearGradient>
              </defs>
              <!-- 背景圆形 -->
              <circle cx="16" cy="16" r="15" fill="url(#loginPageLogoGradient)"/>
              <!-- 装饰元素 -->
              <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
              <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
              <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
              <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
              <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#loginPageMixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10,12 L22,12" stroke="url(#loginPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M14,12 L14,8" stroke="url(#loginPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M18,12 L18,8" stroke="url(#loginPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">MIXMLAAL</span>
          </div>
        </router-link>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          登录您的账户
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          或
          <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
            注册
          </router-link>
        </p>
      </header>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <input type="hidden" name="remember" value="true" />
        <!-- 登录方式切换 -->
        <nav class="flex mb-4 border-b border-gray-200">
          <div 
            @click="switchLoginMethod('email')"
            :class="['py-2 px-4 font-medium login-method-toggle cursor-pointer', activeLoginMethod === 'email' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            邮箱登录
          </div>
          <div 
            @click="switchLoginMethod('phone')"
            :class="['py-2 px-4 font-medium login-method-toggle cursor-pointer', activeLoginMethod === 'phone' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            手机号登录
          </div>
        </nav>

        <!-- 错误提示 -->
        <div v-if="errorMessage" class="rounded-md bg-red-50 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{{ errorMessage }}</p>
            </div>
          </div>
        </div>

        <!-- 邮箱登录表单 -->
        <fieldset v-show="activeLoginMethod === 'email'" class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                name="email"
                type="email"
                autocomplete="email"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的邮箱"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                name="password"
                type="password"
                autocomplete="current-password"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的密码"
              />
            </div>
          </div>
        </fieldset>

        <!-- 手机号登录表单 -->
        <fieldset v-show="activeLoginMethod === 'phone'" class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">
              手机号码
            </label>
            <div class="mt-1 flex">
              <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                +86
              </span>
              <input
                id="phone"
                v-model="phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                class="appearance-none relative block flex-1 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-r-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的手机号"
              />
            </div>
          </div>

          <div>
            <label for="password-phone" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1">
              <input
                id="password-phone"
                v-model="password"
                type="password"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的密码"
              />
            </div>
          </div>
        </fieldset>

        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label for="remember-me" class="ml-2 block text-sm text-gray-900">
              记住我
            </label>
          </div>

          <div class="text-sm">
            <a
              href="#"
              class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200"
            >
              忘记密码?
            </a>
          </div>
        </div>

        <div>
          <div
            type="submit"
            @click="handleLogin"
            :class="['group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer', loading ? 'opacity-50 cursor-not-allowed' : '']"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '登录中...' : '登录' }}
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <div 
              @click="toggleThirdPartyLogin"
              class="px-2 bg-gray-50 text-gray-500 flex items-center hover:text-gray-700 transition-colors duration-200 cursor-pointer"
            >
              或使用以下方式登录
              <i :class="['ml-2 transition-transform duration-200', thirdPartyLoginVisible ? 'fa fa-chevron-up' : 'fa fa-chevron-down']"></i>
            </div>
          </div>
        </div>

        <section v-show="thirdPartyLoginVisible" class="mt-4">
          <div class="grid grid-cols-4 gap-3">
            <ThirdPartyAuthButton provider="wechat" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="qq" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="apple" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="alipay" @click="handleThirdPartyLogin" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="google" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="facebook" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="twitter" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="github" @click="handleThirdPartyLogin" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="linkedin" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="instagram" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="discord" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="slack" @click="handleThirdPartyLogin" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="twitch" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="microsoft" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="yahoo" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="tumblr" @click="handleThirdPartyLogin" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="pinterest" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="reddit" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="snapchat" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="line" @click="handleThirdPartyLogin" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="kakao" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="naver" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="vk" @click="handleThirdPartyLogin" />
            <ThirdPartyAuthButton provider="weibo" @click="handleThirdPartyLogin" />
          </div>
        </section>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { ThirdPartyAuthButton } from '../components/index';

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const activeLoginMethod = ref('email');
const email = ref('');
const phone = ref('');
const password = ref('');
const verifyCode = ref('');
const loading = ref(false);
const errorMessage = ref('');
const thirdPartyLoginVisible = ref(false);

// 检查URL中是否包含第三方登录的token和用户信息
onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  const userStr = urlParams.get('user');
  
  // 检查是否有权限错误提示
  const authError = localStorage.getItem('authError');
  if (authError) {
    errorMessage.value = authError;
    localStorage.removeItem('authError');
  }
  
  if (token && userStr) {
    try {
      const user = JSON.parse(userStr);
      localStorage.setItem('access_token', token);
      localStorage.setItem('user', JSON.stringify(user));
      router.push('/');
    } catch (error) {
      console.error('解析第三方登录数据失败:', error);
    }
  }
});

// 切换登录方式
function switchLoginMethod(method) {
  activeLoginMethod.value = method;
  errorMessage.value = '';
}

// 切换第三方登录显示状态
function toggleThirdPartyLogin() {
  thirdPartyLoginVisible.value = !thirdPartyLoginVisible.value;
}

// 处理登录
async function handleLogin() {
  loading.value = true;
  errorMessage.value = '';
  
  try {
    // 默认管理员账号
    if (activeLoginMethod.value === 'phone' && phone.value === '15726833367' && password.value === 'admin123') {
      // 模拟登录成功
      const adminUser = {
        userId: 'admin_001',
        phone: '15726833367',
        nickname: '管理员',
        avatar: null,
        email: null,
        role: 'admin',
        status: 1
      };
      const mockToken = 'admin_token_' + Date.now();
      
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('user', JSON.stringify(adminUser));
      localStorage.setItem('user_role', 'admin');
      userStore.setToken(mockToken);
      userStore.setUser(adminUser);
      router.push('/admin');
      loading.value = false;
      return;
    }
    
    let endpoint = '/auth/login';
    let body = {};
    
    if (activeLoginMethod.value === 'email') {
      if (!email.value || !password.value) {
        errorMessage.value = '请输入邮箱和密码';
        loading.value = false;
        return;
      }
      endpoint = '/auth/login/email';
      body = { email: email.value, password: password.value };
    } else {
      if (!phone.value || !password.value) {
        errorMessage.value = '请输入手机号和密码';
        loading.value = false;
        return;
      }
      body = { phone: phone.value, password: password.value };
    }
    
    const response = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      localStorage.setItem('user_role', data.data.user.role || 'user');
      userStore.setToken(data.data.token);
      userStore.setUser(data.data.user);
      router.push('/');
    } else {
      errorMessage.value = data.message || '登录失败';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('登录错误:', error);
  } finally {
    loading.value = false;
  }
}

// 处理第三方登录
function handleThirdPartyLogin(provider) {
  // 跳转到第三方平台登录页面
  window.location.href = `/api/auth/oauth/${provider}?returnTo=${encodeURIComponent('/')}`;
}
</script>

<style scoped>
/* 登录方式切换样式 */
.login-method-toggle {
  cursor: pointer;
}

/* 表单显示/隐藏 */
.email-login-form {
  display: block;
}

.phone-login-form {
  display: none;
}

.email-login-form.hidden {
  display: none;
}

.phone-login-form.active {
  display: block;
}
</style>

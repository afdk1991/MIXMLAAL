<template>
  <main class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <section class="max-w-md w-full space-y-8">
      <header class="text-center">
        <button @click="$router.push('/')" class="flex items-center justify-center space-x-2 mb-4 cursor-pointer hover:opacity-90 transition-all active:opacity-80">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32" class="w-10 h-10 pointer-events-auto">
              <!-- 背景圆形渐变 -->
              <defs>
                <linearGradient id="registerPageLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
                <linearGradient id="registerPageMixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#e0f2fe"/>
                </linearGradient>
              </defs>
              <!-- 背景圆形 -->
              <circle cx="16" cy="16" r="15" fill="url(#registerPageLogoGradient)"/>
              <!-- 装饰元素 -->
              <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
              <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
              <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
              <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
              <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#registerPageMixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10,12 L22,12" stroke="url(#registerPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M14,12 L14,8" stroke="url(#registerPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M18,12 L18,8" stroke="url(#registerPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">MIXMLAAL</span>
          </div>
        </button>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          欢迎注册
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          已有账号？
          <button @click="$router.push('/login')" class="font-medium text-blue-600 hover:text-blue-500 transition-colors duration-200">
            登录
          </button>
        </p>
      </header>

      <form class="mt-8 space-y-6" @submit.prevent="handleRegister">
        <!-- 注册方式切换 -->
        <nav class="flex mb-4 border-b border-gray-200">
          <button 
            @click.prevent="switchRegisterMethod('email')"
            :class="['py-2 px-4 font-medium', activeRegisterMethod === 'email' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            邮箱注册
          </button>
          <button 
            @click.prevent="switchRegisterMethod('phone')"
            :class="['py-2 px-4 font-medium', activeRegisterMethod === 'phone' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            手机号注册
          </button>
        </nav>

        <fieldset class="rounded-md shadow-sm space-y-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              姓名
            </label>
            <div class="mt-1">
              <input
                id="name"
                name="name"
                type="text"
                required
                v-model="formData.name"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的姓名"
              />
            </div>
          </div>

          <!-- 邮箱注册表单 -->
          <div v-show="activeRegisterMethod === 'email'">
            <label for="email" class="block text-sm font-medium text-gray-700">
              邮箱地址
            </label>
            <div class="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autocomplete="email"
                required
                v-model="formData.email"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的邮箱"
              />
            </div>
            <div class="flex items-center mt-2">
              <input
                id="email-code"
                name="email-code"
                type="text"
                required
                v-model="formData.emailCode"
                class="appearance-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="验证码"
              />
              <button
                type="button"
                @click="sendEmailCode"
                :disabled="sendingCode"
                class="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s后重发` : '发送验证码') }}
              </button>
            </div>
          </div>

          <!-- 手机号注册表单 -->
          <div v-show="activeRegisterMethod === 'phone'">
            <label for="phone" class="block text-sm font-medium text-gray-700">
              手机号码
            </label>
            <div class="mt-1">
              <input
                id="phone"
                name="phone"
                type="tel"
                autocomplete="tel"
                required
                v-model="formData.phone"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的手机号"
              />
            </div>
            <div class="flex items-center mt-2">
              <input
                id="phone-code"
                name="phone-code"
                type="text"
                required
                v-model="formData.phoneCode"
                class="appearance-none relative block w-1/2 px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="验证码"
              />
              <button
                type="button"
                @click="sendPhoneCode"
                :disabled="sendingCode"
                class="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                {{ sendingCode ? '发送中...' : (countdown > 0 ? `${countdown}s后重发` : '发送验证码') }}
              </button>
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">
              密码
            </label>
            <div class="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autocomplete="new-password"
                required
                v-model="formData.password"
                @input="checkPasswordStrength"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入您的密码"
              />
            </div>
            <!-- 密码强度提示 -->
            <div v-if="passwordStrength !== ''" class="mt-1">
              <div class="flex items-center space-x-2">
                <div class="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    class="h-2 rounded-full transition-all duration-300" 
                    :class="{
                      'bg-red-500 w-1/4': passwordStrength === 'weak',
                      'bg-yellow-500 w-2/4': passwordStrength === 'medium',
                      'bg-green-500 w-full': passwordStrength === 'strong'
                    }"
                  ></div>
                </div>
                <span 
                  class="text-xs font-medium" 
                  :class="{
                    'text-red-500': passwordStrength === 'weak',
                    'text-yellow-500': passwordStrength === 'medium',
                    'text-green-500': passwordStrength === 'strong'
                  }"
                >
                  {{ passwordStrength === 'weak' ? '弱' : passwordStrength === 'medium' ? '中' : '强' }}
                </span>
              </div>
              <p v-if="passwordStrength === 'weak'" class="text-xs text-red-500 mt-1">密码强度较弱，请包含字母、数字和特殊字符</p>
              <p v-else-if="passwordStrength === 'medium'" class="text-xs text-yellow-500 mt-1">密码强度中等</p>
              <p v-else-if="passwordStrength === 'strong'" class="text-xs text-green-500 mt-1">密码强度良好</p>
            </div>
          </div>

          <div>
            <label for="password-confirm" class="block text-sm font-medium text-gray-700">
              确认密码
            </label>
            <div class="mt-1">
              <input
                id="password-confirm"
                name="password-confirm"
                type="password"
                autocomplete="new-password"
                required
                v-model="formData.passwordConfirm"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请再次输入您的密码"
              />
            </div>
          </div>
        </fieldset>

        <div class="flex items-center">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            v-model="formData.terms"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label for="terms" class="ml-2 block text-sm text-gray-900">
            我同意
            <button @click.prevent class="text-blue-600 hover:text-blue-500 transition-colors duration-200">服务条款</button>
            和
            <button @click.prevent class="text-blue-600 hover:text-blue-500 transition-colors duration-200">隐私政策</button>
          </label>
        </div>

        <div>
          <button
            type="submit"
            :disabled="loading"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="loading" class="absolute left-0 inset-y-0 flex items-center pl-3">
              <svg class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </span>
            {{ loading ? '注册中...' : '注册' }}
          </button>
        </div>

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

        <div class="relative">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-300"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <button 
              type="button"
              @click.prevent="toggleThirdPartyRegister"
              class="px-2 bg-gray-50 text-gray-500 flex items-center hover:text-gray-700 transition-colors duration-200"
            >
              或使用以下方式注册
              <i :class="['ml-2 transition-transform duration-200', thirdPartyRegisterVisible ? 'fa fa-chevron-up' : 'fa fa-chevron-down']"></i>
            </button>
          </div>
        </div>

        <section v-show="thirdPartyRegisterVisible" class="mt-4">
          <div class="grid grid-cols-4 gap-3">
            <ThirdPartyAuthButton provider="wechat" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="qq" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="apple" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="alipay" @click="handleThirdPartyRegister" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="google" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="facebook" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="twitter" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="github" @click="handleThirdPartyRegister" />
          </div>

          <div class="grid grid-cols-4 gap-3 mt-3">
            <ThirdPartyAuthButton provider="linkedin" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="instagram" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="discord" @click="handleThirdPartyRegister" />
            <ThirdPartyAuthButton provider="slack" @click="handleThirdPartyRegister" />
          </div>
        </section>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store/user';
import { ThirdPartyAuthButton } from '../components/index';

const router = useRouter();
const userStore = useUserStore();

// 响应式数据
const thirdPartyRegisterVisible = ref(false);
const loading = ref(false);
const errorMessage = ref('');
const activeRegisterMethod = ref('email');
const sendingCode = ref(false);
const countdown = ref(0);
const passwordStrength = ref('');
const formData = ref({
  name: '',
  email: '',
  emailCode: '',
  phone: '',
  phoneCode: '',
  password: '',
  passwordConfirm: '',
  terms: false
});

// 倒计时计时器
let countdownTimer = null;

// 切换注册方式
function switchRegisterMethod(method) {
  activeRegisterMethod.value = method;
  errorMessage.value = '';
}

// 切换第三方注册显示状态
function toggleThirdPartyRegister() {
  thirdPartyRegisterVisible.value = !thirdPartyRegisterVisible.value;
}

// 发送邮箱验证码
async function sendEmailCode() {
  if (!formData.value.email) {
    errorMessage.value = '请输入邮箱地址';
    return;
  }
  
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    errorMessage.value = '请输入有效的邮箱地址';
    return;
  }
  
  sendingCode.value = true;
  
  try {
    const response = await fetch('http://localhost:3003/api/v1/auth/send-email-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: formData.value.email })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      startCountdown();
      errorMessage.value = '验证码已发送，请查收';
    } else {
      errorMessage.value = data.message || '发送验证码失败';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('发送验证码错误:', error);
  } finally {
    sendingCode.value = false;
  }
}

// 发送手机验证码
async function sendPhoneCode() {
  if (!formData.value.phone) {
    errorMessage.value = '请输入手机号码';
    return;
  }
  
  if (!/^1[3-9]\d{9}$/.test(formData.value.phone)) {
    errorMessage.value = '请输入有效的手机号码';
    return;
  }
  
  sendingCode.value = true;
  
  try {
    const response = await fetch('http://localhost:3003/api/v1/auth/send-phone-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: formData.value.phone })
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      startCountdown();
      errorMessage.value = '验证码已发送，请查收';
    } else {
      errorMessage.value = data.message || '发送验证码失败';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('发送验证码错误:', error);
  } finally {
    sendingCode.value = false;
  }
}

// 开始倒计时
function startCountdown() {
  countdown.value = 60;
  
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
  
  countdownTimer = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownTimer);
    }
  }, 1000);
}

// 检查密码强度
function checkPasswordStrength() {
  const password = formData.value.password;
  
  if (!password) {
    passwordStrength.value = '';
    return;
  }
  
  let strength = 0;
  
  // 长度检查
  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  
  // 包含数字
  if (/\d/.test(password)) strength++;
  
  // 包含小写字母
  if (/[a-z]/.test(password)) strength++;
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) strength++;
  
  // 包含特殊字符
  if (/[^A-Za-z0-9]/.test(password)) strength++;
  
  if (strength < 3) {
    passwordStrength.value = 'weak';
  } else if (strength < 5) {
    passwordStrength.value = 'medium';
  } else {
    passwordStrength.value = 'strong';
  }
}

// 处理注册
async function handleRegister() {
  // 表单验证
  if (!formData.value.name) {
    errorMessage.value = '请输入姓名';
    return;
  }
  
  if (activeRegisterMethod.value === 'email') {
    if (!formData.value.email) {
      errorMessage.value = '请输入邮箱';
      return;
    }
    
    if (!formData.value.emailCode) {
      errorMessage.value = '请输入邮箱验证码';
      return;
    }
  } else {
    if (!formData.value.phone) {
      errorMessage.value = '请输入手机号';
      return;
    }
    
    if (!formData.value.phoneCode) {
      errorMessage.value = '请输入手机验证码';
      return;
    }
  }
  
  if (!formData.value.password) {
    errorMessage.value = '请输入密码';
    return;
  }
  
  if (formData.value.password !== formData.value.passwordConfirm) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }
  
  if (passwordStrength.value === 'weak') {
    errorMessage.value = '密码强度不足，请使用更强的密码';
    return;
  }
  
  if (!formData.value.terms) {
    errorMessage.value = '请同意服务条款和隐私政策';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    let endpoint = '/auth/register';
    let body = {
      name: formData.value.name,
      password: formData.value.password
    };
    
    if (activeRegisterMethod.value === 'email') {
      body.email = formData.value.email;
      body.emailCode = formData.value.emailCode;
    } else {
      body.phone = formData.value.phone;
      body.phoneCode = formData.value.phoneCode;
    }
    
    const response = await fetch(`http://localhost:3003/api/v1${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      userStore.setToken(data.data.token);
      userStore.setUser(data.data.user);
      router.push('/');
    } else {
      errorMessage.value = data.message || '注册失败';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('注册错误:', error);
  } finally {
    loading.value = false;
  }
}

// 处理第三方注册
async function handleThirdPartyRegister(provider) {
  try {
    const response = await fetch(`http://localhost:3003/api/v1/auth/oauth/${provider}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      userStore.setToken(data.data.token);
      userStore.setUser(data.data.user);
      router.push('/');
    } else {
      alert(data.message || '第三方注册失败');
    }
  } catch (error) {
    alert('网络错误，请稍后重试');
    console.error('第三方注册错误:', error);
  }
}

// 组件卸载时清除计时器
onUnmounted(() => {
  if (countdownTimer) {
    clearInterval(countdownTimer);
  }
});
</script>

<style scoped>
/* 组件特定样式 */
</style>
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <router-link to="/" class="flex items-center justify-center space-x-2 mb-4 cursor-pointer hover:opacity-90 transition-all active:opacity-80">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32" class="w-10 h-10 pointer-events-auto">
              <!-- 背景圆形渐变 -->
              <defs>
                <linearGradient id="forgotPasswordPageLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#3b82f6"/>
                  <stop offset="100%" stop-color="#8b5cf6"/>
                </linearGradient>
                <linearGradient id="forgotPasswordPageMixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#ffffff"/>
                  <stop offset="100%" stop-color="#e0f2fe"/>
                </linearGradient>
              </defs>
              <!-- 背景圆形 -->
              <circle cx="16" cy="16" r="15" fill="url(#forgotPasswordPageLogoGradient)"/>
              <!-- 装饰元素 -->
              <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
              <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
              <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
              <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
              <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#forgotPasswordPageMixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M10,12 L22,12" stroke="url(#forgotPasswordPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M14,12 L14,8" stroke="url(#forgotPasswordPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
              <path d="M18,12 L18,8" stroke="url(#forgotPasswordPageMixGradient)" stroke-width="3" stroke-linecap="round"/>
            </svg>
          </div>
          <div class="logo-text">
            <span class="text-2xl font-bold bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">MIXMLAAL</span>
          </div>
        </router-link>
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
          找回密码
        </h2>
        <p class="mt-2 text-sm text-gray-600">
          请选择找回密码的方式
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <!-- 找回密码方式切换 -->
        <div class="flex mb-4 border-b border-gray-200">
          <button 
            @click.prevent="switchMethod('email')"
            :class="['py-2 px-4 font-medium', activeMethod === 'email' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            邮箱验证
          </button>
          <button 
            @click.prevent="switchMethod('phone')"
            :class="['py-2 px-4 font-medium', activeMethod === 'phone' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700']"
          >
            手机验证
          </button>
        </div>

        <div class="rounded-md shadow-sm space-y-4">
          <!-- 邮箱验证表单 -->
          <div v-show="activeMethod === 'email'">
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

          <!-- 手机验证表单 -->
          <div v-show="activeMethod === 'phone'">
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
            <label for="new-password" class="block text-sm font-medium text-gray-700">
              新密码
            </label>
            <div class="mt-1">
              <input
                id="new-password"
                name="new-password"
                type="password"
                autocomplete="new-password"
                required
                v-model="formData.newPassword"
                @input="checkPasswordStrength"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请输入新密码"
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
            <label for="confirm-password" class="block text-sm font-medium text-gray-700">
              确认新密码
            </label>
            <div class="mt-1">
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autocomplete="new-password"
                required
                v-model="formData.confirmPassword"
                class="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition-colors duration-200"
                placeholder="请再次输入新密码"
              />
            </div>
          </div>
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
            {{ loading ? '重置中...' : '重置密码' }}
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-blue-600 hover:text-blue-500 transition-colors duration-200">
            返回登录
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

// 响应式数据
const loading = ref(false);
const errorMessage = ref('');
const activeMethod = ref('email');
const sendingCode = ref(false);
const countdown = ref(0);
const passwordStrength = ref('');
const formData = ref({
  email: '',
  emailCode: '',
  phone: '',
  phoneCode: '',
  newPassword: '',
  confirmPassword: ''
});

// 倒计时计时器
let countdownTimer = null;

// 切换验证方式
function switchMethod(method) {
  activeMethod.value = method;
  errorMessage.value = '';
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
      body: JSON.stringify({ email: formData.value.email, type: 'reset' })
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
      body: JSON.stringify({ phone: formData.value.phone, type: 'reset' })
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
  const password = formData.value.newPassword;
  
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

// 处理密码重置
async function handleSubmit() {
  // 表单验证
  if (activeMethod.value === 'email') {
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
  
  if (!formData.value.newPassword) {
    errorMessage.value = '请输入新密码';
    return;
  }
  
  if (formData.value.newPassword !== formData.value.confirmPassword) {
    errorMessage.value = '两次输入的密码不一致';
    return;
  }
  
  if (passwordStrength.value === 'weak') {
    errorMessage.value = '密码强度不足，请使用更强的密码';
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    let endpoint = '/auth/reset-password';
    let body = {
      newPassword: formData.value.newPassword
    };
    
    if (activeMethod.value === 'email') {
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
      // 密码重置成功，跳转到登录页面
      alert('密码重置成功，请使用新密码登录');
      router.push('/login');
    } else {
      errorMessage.value = data.message || '密码重置失败';
    }
  } catch (error) {
    errorMessage.value = '网络错误，请稍后重试';
    console.error('密码重置错误:', error);
  } finally {
    loading.value = false;
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
<template>
  <form class="space-y-4" @submit.prevent="handleLogin">
    <!-- 登录方式切换 -->
    <div class="flex mb-4 border-b border-border">
      <div 
        @click="switchLoginMethod('email')"
        :class="['py-2 px-4 font-medium login-method-toggle cursor-pointer', activeLoginMethod === 'email' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary']"
      >
        邮箱登录
      </div>
      <div 
        @click="switchLoginMethod('phone')"
        :class="['py-2 px-4 font-medium login-method-toggle cursor-pointer', activeLoginMethod === 'phone' ? 'border-b-2 border-primary text-primary' : 'text-text-secondary hover:text-text-primary']"
      >
        手机号登录
      </div>
    </div>
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="rounded-md bg-danger/10 p-4 border border-danger/20">
      <div class="flex">
        <div class="flex-shrink-0">
          <svg class="h-5 w-5 text-danger" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-danger">{{ errorMessage }}</p>
        </div>
      </div>
    </div>
    <!-- 邮箱登录表单 -->
    <div v-show="activeLoginMethod === 'email'" class="space-y-4">
      <BaseInput
        v-model="email"
        type="email"
        label="邮箱地址"
        placeholder="请输入您的邮箱"
        :error="emailError"
        prefix="fa fa-envelope"
        size="md"
      />
      <BaseInput
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入您的密码"
        :error="passwordError"
        prefix="fa fa-lock"
        size="md"
      />
    </div>
    <!-- 手机号登录表单 -->
    <div v-show="activeLoginMethod === 'phone'" class="space-y-4">
      <BaseInput
        v-model="phone"
        type="tel"
        label="手机号码"
        placeholder="请输入您的手机号"
        :error="phoneError"
        prefix="fa fa-phone"
        size="md"
      />
      <BaseInput
        v-model="password"
        type="password"
        label="密码"
        placeholder="请输入您的密码"
        :error="passwordError"
        prefix="fa fa-lock"
        size="md"
      />
    </div>
    <div class="flex items-center justify-between">
      <div class="flex items-center">
        <input
          id="remember-me"
          name="remember-me"
          type="checkbox"
          class="h-4 w-4 text-primary focus:ring-primary/50 border-border rounded"
        />
        <label for="remember-me" class="ml-2 block text-sm text-text-primary">
          记住我
        </label>
      </div>
      <div class="text-sm">
        <a
          href="#"
          class="font-medium text-primary hover:text-primary-dark transition-colors duration-200"
        >
          忘记密码?
        </a>
      </div>
    </div>
    <div>
      <BaseButton
        type="submit"
        variant="primary"
        size="md"
        block
        :loading="loading"
        :disabled="loading"
      >
        {{ loading ? '登录中...' : '登录' }}
      </BaseButton>
    </div>
    <div class="relative">
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-border"></div>
      </div>
      <div class="relative flex justify-center text-sm">
        <div @click="toggleThirdPartyLogin" class="px-2 bg-card text-text-tertiary flex items-center space-x-1 hover:text-text-primary transition-colors duration-200 cursor-pointer">
          <span>或使用以下方式登录</span>
          <i :class="['fa', thirdPartyLoginExpanded ? 'fa-chevron-up' : 'fa-chevron-down', 'text-xs']"></i>
        </div>
      </div>
    </div>
    <div v-show="thirdPartyLoginExpanded" class="mt-4 animate-fade-in">
      <div class="grid grid-cols-4 gap-3">
        <div
          @click="handleThirdPartyLogin('wechat')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用微信登录</span>
          <i class="fab fa-weixin text-green-500 text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('qq')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 QQ 登录</span>
          <i class="fab fa-qq text-blue-500 text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('apple')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 Apple 登录</span>
          <i class="fab fa-apple text-text-primary text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('alipay')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用支付宝登录</span>
          <i class="fab fa-alipay text-blue-600 text-xl"></i>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-3 mt-3">
        <div
          @click="handleThirdPartyLogin('google')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 Google 登录</span>
          <i class="fab fa-google text-red-500 text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('facebook')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 Facebook 登录</span>
          <i class="fab fa-facebook text-blue-600 text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('twitter')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 Twitter 登录</span>
          <i class="fab fa-twitter text-blue-400 text-xl"></i>
        </div>

        <div
          @click="handleThirdPartyLogin('github')"
          class="flex justify-center items-center py-3 px-4 border border-border rounded-lg bg-card hover:bg-background transition-colors duration-200 cursor-pointer shadow-sm hover:shadow-md"
        >
          <span class="sr-only">使用 GitHub 登录</span>
          <i class="fab fa-github text-text-primary text-xl"></i>
        </div>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref } from 'vue';
import BaseButton from './base/Button.vue';
import BaseInput from './base/Input.vue';

const emit = defineEmits(['login-success', 'close']);

const activeLoginMethod = ref('email');
const email = ref('');
const phone = ref('');
const password = ref('');
const loading = ref(false);
const errorMessage = ref('');
const emailError = ref('');
const phoneError = ref('');
const passwordError = ref('');
const thirdPartyLoginExpanded = ref(false);

function switchLoginMethod(method) {
  activeLoginMethod.value = method;
  errorMessage.value = '';
  emailError.value = '';
  phoneError.value = '';
  passwordError.value = '';
}

function toggleThirdPartyLogin() {
  thirdPartyLoginExpanded.value = !thirdPartyLoginExpanded.value;
}

function validateForm() {
  let isValid = true;
  emailError.value = '';
  phoneError.value = '';
  passwordError.value = '';
  
  if (activeLoginMethod.value === 'email') {
    if (!email.value) {
      emailError.value = '请输入邮箱';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
      emailError.value = '请输入有效的邮箱地址';
      isValid = false;
    }
  } else {
    if (!phone.value) {
      phoneError.value = '请输入手机号';
      isValid = false;
    } else if (!/^1[3-9]\d{9}$/.test(phone.value)) {
      phoneError.value = '请输入有效的手机号';
      isValid = false;
    }
  }
  
  if (!password.value) {
    passwordError.value = '请输入密码';
    isValid = false;
  } else if (password.value.length < 6) {
    passwordError.value = '密码长度至少6位';
    isValid = false;
  }
  
  return isValid;
}

async function handleLogin() {
  if (!validateForm()) {
    return;
  }
  
  loading.value = true;
  errorMessage.value = '';
  
  try {
    let endpoint = '/auth/login';
    let body = {};
    
    if (activeLoginMethod.value === 'email') {
      endpoint = '/auth/login/email';
      body = { email: email.value, password: password.value };
    } else {
      body = { phone: phone.value, password: password.value };
    }
    
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';
    const response = await fetch(`${API_BASE_URL}/api/v1${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    
    if (data.status === 'success') {
      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      emit('login-success');
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

function handleThirdPartyLogin(provider) {
  // 跳转到第三方平台登录页面
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';
  window.location.href = `${API_BASE_URL}/api/v1/auth/oauth/${provider}?returnTo=${encodeURIComponent('/')}`;
}
</script>

<style scoped>
.login-method-toggle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
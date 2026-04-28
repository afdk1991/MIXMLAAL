<template>
  <div class="min-h-screen bg-background">
    <!-- 导航栏 -->
    <AppHeader @show-login="showLoginModal = true" />

    <!-- 主要内容 -->
    <main class="md:pt-16 pt-14 pb-20">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- 登录弹窗 -->
    <div v-if="showLoginModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div class="bg-card rounded-lg shadow-xl w-full max-w-md p-6 space-y-6 animate-scale-in">
        <div class="flex justify-between items-center">
          <router-link to="/" class="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-all active:opacity-80">
            <div class="logo-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="w-8 h-8 pointer-events-auto">
                <!-- 背景圆形渐变 -->
                <defs>
                  <linearGradient id="loginLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                  <linearGradient id="loginMixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#ffffff"/>
                    <stop offset="100%" stop-color="#e0f2fe"/>
                  </linearGradient>
                </defs>
                <!-- 背景圆形 -->
                <circle cx="16" cy="16" r="15" fill="url(#loginLogoGradient)"/>
                <!-- 装饰元素 -->
                <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
                <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
                <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
                <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
                <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#loginMixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10,12 L22,12" stroke="url(#loginMixGradient)" stroke-width="3" stroke-linecap="round"/>
                <path d="M14,12 L14,8" stroke="url(#loginMixGradient)" stroke-width="3" stroke-linecap="round"/>
                <path d="M18,12 L18,8" stroke="url(#loginMixGradient)" stroke-width="3" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="logo-text">
              <span class="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">MIXMLAAL</span>
            </div>
          </router-link>
          <button @click="showLoginModal = false" class="text-text-tertiary hover:text-text-primary transition-colors p-2 rounded-full hover:bg-background">
            <i class="fa fa-times text-xl"></i>
          </button>
        </div>
        <h2 class="md:text-2xl text-xl font-bold text-text-primary">登录您的账户</h2>
        <p class="text-sm text-text-secondary">
          或
          <router-link to="/register" class="font-medium text-primary hover:text-primary-dark transition-colors duration-200" @click="showLoginModal = false">
            注册
          </router-link>
        </p>
        <LoginForm @login-success="handleLoginSuccess" @close="showLoginModal = false" />
      </div>
    </div>

    <!-- 底部导航 -->
    <AppFooter @show-login="showLoginModal = true" />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import AppHeader from './AppHeader.vue';
import AppFooter from './AppFooter.vue';
import LoginForm from '../LoginForm.vue';

const showLoginModal = ref(false);

function handleLoginSuccess() {
  showLoginModal.value = false;
  // 可以添加登录成功后的逻辑，如刷新页面或跳转到指定页面
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.3s ease-in-out;
}

@keyframes scaleIn {
  0% {
    transform: scale(0.95);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
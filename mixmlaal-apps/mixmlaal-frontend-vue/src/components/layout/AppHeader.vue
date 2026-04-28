<template>
  <nav :class="[
    'fixed top-0 left-0 right-0 bg-card shadow-sm z-50 transition-all duration-300 md:py-3 py-2',
    { 'bg-card/95 backdrop-blur-sm shadow-md': isScrolled, 'bg-card shadow-sm': !isScrolled }
  ]">
    <div class="container mx-auto px-4 flex justify-between items-center">
      <!-- Logo -->
      <router-link to="/" class="flex items-center space-x-2 cursor-pointer hover:opacity-90 transition-all active:opacity-80">
        <div class="logo-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="w-8 h-8 pointer-events-auto">
            <!-- 背景圆形渐变 -->
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
              <linearGradient id="mixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="100%" stop-color="#e0f2fe"/>
              </linearGradient>
            </defs>
            <!-- 背景圆形 -->
            <circle cx="16" cy="16" r="15" fill="url(#logoGradient)"/>
            <!-- 装饰元素 -->
            <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
            <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
            <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
            <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
            <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#mixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M10,12 L22,12" stroke="url(#mixGradient)" stroke-width="3" stroke-linecap="round"/>
            <path d="M14,12 L14,8" stroke="url(#mixGradient)" stroke-width="3" stroke-linecap="round"/>
            <path d="M18,12 L18,8" stroke="url(#mixGradient)" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="logo-text">
          <h1 class="text-xl font-bold text-primary md:block hidden">MIXMLAAL</h1>
        </div>
      </router-link>

      <!-- 桌面端导航 -->
      <div class="hidden md:flex items-center space-x-4 md:space-x-6">
        <!-- 搜索框 -->
        <div class="relative">
          <input 
            type="text" 
            placeholder="搜索服务、商品..." 
            class="pl-10 pr-4 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all w-48 lg:w-64 bg-background"
          >
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <!-- 导航链接 -->
        <router-link to="/" class="nav-item" active-class="active">首页</router-link>
        <router-link to="/mall" class="nav-item" active-class="active">商城</router-link>
        <router-link to="/delivery" class="nav-item" active-class="active">配送系统</router-link>

        <!-- 语言切换 -->
        <LanguageSelector class="mr-2" />
        
        <!-- 主题切换 -->
        <ThemeToggle class="mr-2" />
      </div>

      <!-- 移动端菜单按钮 -->
      <div class="md:hidden flex items-center space-x-4">
        <!-- 通知图标 -->
        <div class="relative p-2 hover:bg-background rounded-full transition-colors cursor-pointer">
          <svg class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
          </svg>
          <span v-if="unreadCount > 0" class="absolute top-1 right-1 bg-danger text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
            {{ unreadCount }}
          </span>
        </div>

        <!-- 汉堡菜单 -->
        <div class="p-2 hover:bg-background rounded-full transition-colors cursor-pointer" @click="mobileMenuOpen = !mobileMenuOpen">
          <svg v-if="!mobileMenuOpen" class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
          <svg v-else class="w-6 h-6 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
      </div>
    </div>

    <!-- 移动端菜单 -->
    <div v-if="mobileMenuOpen" class="md:hidden bg-card border-t border-border animate-in slide-in-from-top duration-300">
      <div class="container mx-auto px-4 py-4">
        <!-- 移动端搜索 -->
        <div class="relative mb-4">
          <input 
            type="text" 
            placeholder="搜索服务、商品..." 
            class="w-full pl-10 pr-4 py-2 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all bg-background"
          >
          <svg class="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-tertiary" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>

        <!-- 移动端导航链接 -->
        <div class="flex flex-col space-y-3 mb-4">
          <router-link to="/" class="nav-item py-2">首页</router-link>
          <router-link to="/mall" class="nav-item py-2">商城</router-link>
          <router-link to="/delivery" class="nav-item py-2">配送系统</router-link>
        </div>

        <!-- 移动端语言切换 -->
        <div class="mb-4">
          <LanguageSelector />
        </div>
        
        <!-- 移动端主题切换 -->
        <div class="mb-4 flex justify-center">
          <ThemeToggle />
        </div>


      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import LanguageSelector from '../LanguageSelector.vue';
import ThemeToggle from '../ThemeToggle.vue';

const mobileMenuOpen = ref(false);
const isScrolled = ref(false);

// 移除滚动事件监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// 处理滚动事件
function handleScroll() {
  isScrolled.value = window.scrollY > 10;
}
</script>

<style scoped>
.nav-item {
  transition: all 0.2s ease;
  position: relative;
  color: var(--tw-color-text-primary);
  font-weight: 500;
  padding: 0.5rem 0;
}

.nav-item:hover {
  color: var(--tw-color-primary);
}

.nav-item.active {
  color: var(--tw-color-primary);
  font-weight: 600;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background-color: var(--tw-color-primary);
  border-radius: 1px;
}

/* 动画效果 */
@keyframes slideInFromTop {
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-in {
  animation: slideInFromTop 0.3s ease-out forwards;
}
</style>
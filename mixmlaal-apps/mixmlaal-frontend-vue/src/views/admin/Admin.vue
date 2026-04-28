<template>
  <main class="admin-container">
    <!-- 全局加载状态 -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <div class="loading-text">加载中...</div>
    </div>
    <!-- 移动端菜单切换按钮 -->
    <button class="menu-toggle" @click="toggleMenu" v-show="isMobile">
      <i class="fa fa-bars"></i>
    </button>
    <!-- 全局消息通知 -->
    <div class="notification-container">
      <div 
        v-for="notification in notifications" 
        :key="notification.id"
        class="notification" 
        :class="notification.type"
      >
        <div class="notification-content">
          <i :class="notification.icon"></i>
          <span>{{ notification.message }}</span>
        </div>
        <button class="notification-close" @click="removeNotification(notification.id)">
          <i class="fa fa-times"></i>
        </button>
      </div>
    </div>
    <aside class="admin-sidebar" :class="{ 'mobile-open': isMobile && menuOpen }">
      <header class="admin-logo">
        <h1 class="text-2xl font-bold text-white">MIXMLAAL</h1>
        <p class="text-gray-300 text-sm">管理后台</p>
      </header>
      <nav class="admin-menu">
        <router-link to="/admin/dashboard" class="menu-item" active-class="active" aria-current="page">
          <i class="fa fa-dashboard mr-3"></i>
          <span>控制台</span>
        </router-link>
        <router-link to="/admin/users" class="menu-item" active-class="active">
          <i class="fa fa-users mr-3"></i>
          <span>用户管理</span>
        </router-link>
        <router-link to="/admin/orders" class="menu-item" active-class="active">
          <i class="fa fa-shopping-cart mr-3"></i>
          <span>订单管理</span>
        </router-link>
        <router-link to="/admin/products" class="menu-item" active-class="active">
          <i class="fa fa-box mr-3"></i>
          <span>商品管理</span>
        </router-link>
        <router-link to="/admin/services" class="menu-item" active-class="active">
          <i class="fa fa-cog mr-3"></i>
          <span>服务管理</span>
        </router-link>
        <router-link to="/admin/content" class="menu-item" active-class="active">
          <i class="fa fa-file-text mr-3"></i>
          <span>内容管理</span>
        </router-link>
        <router-link to="/admin/permissions" class="menu-item" active-class="active">
          <i class="fa fa-shield mr-3"></i>
          <span>权限管理</span>
        </router-link>
        <router-link to="/admin/coupons" class="menu-item" active-class="active">
          <i class="fa fa-ticket mr-3"></i>
          <span>优惠券管理</span>
        </router-link>
        <router-link to="/admin/logistics" class="menu-item" active-class="active">
          <i class="fa fa-truck mr-3"></i>
          <span>物流管理</span>
        </router-link>
        <router-link to="/admin/ai" class="menu-item" active-class="active">
          <i class="fa fa-robot mr-3"></i>
          <span>AI功能管理</span>
        </router-link>
        <router-link to="/admin/integrated-services" class="menu-item" active-class="active">
          <i class="fa fa-th-large mr-3"></i>
          <span>集成服务管理</span>
        </router-link>
        <router-link to="/admin/notifications" class="menu-item" active-class="active">
          <i class="fa fa-bell mr-3"></i>
          <span>通知管理</span>
        </router-link>
      </nav>
    </aside>
    <section class="admin-content">
      <header class="admin-header">
        <div class="header-left">
          <div class="breadcrumb">
            <span class="breadcrumb-item"><a href="/admin/dashboard">控制台</a></span>
            <span class="breadcrumb-separator">/</span>
            <span class="breadcrumb-item active">{{ $route.meta.title }}</span>
          </div>
          <h2 class="text-xl font-semibold">{{ $route.meta.title }}</h2>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="user-name">管理员</span>
            <button class="logout-btn" @click="handleLogout">
              <i class="fa fa-sign-out mr-2"></i>
              退出
            </button>
          </div>
        </div>
      </header>
      <div class="admin-body">
        <transition name="fade" mode="out-in">
          <router-view v-slot="{ Component }">
            <component :is="Component" />
          </router-view>
        </transition>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoading = ref(false);

// 响应式状态
const isMobile = ref(window.innerWidth < 640);
const menuOpen = ref(false);

// 通知系统
const notifications = ref([]);
let notificationId = 0;

// 添加通知
const addNotification = (message, type = 'success', duration = 3000) => {
  const id = notificationId++;
  const iconMap = {
    success: 'fa fa-check-circle',
    error: 'fa fa-exclamation-circle',
    warning: 'fa fa-exclamation-triangle',
    info: 'fa fa-info-circle'
  };
  
  const notification = {
    id,
    message,
    type,
    icon: iconMap[type] || iconMap.info
  };
  
  notifications.value.push(notification);
  
  // 自动移除通知
  if (duration > 0) {
    setTimeout(() => {
      removeNotification(id);
    }, duration);
  }
};

// 移除通知
const removeNotification = (id) => {
  notifications.value = notifications.value.filter(n => n.id !== id);
};

// 菜单切换方法
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// 窗口大小变化监听
const handleResize = () => {
  isMobile.value = window.innerWidth < 640;
  if (!isMobile.value) {
    menuOpen.value = false;
  }
};

const handleLogout = () => {
  isLoading.value = true;
  // 清除本地存储的用户信息
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_role');
  // 跳转到登录页
  setTimeout(() => {
    isLoading.value = false;
    addNotification('退出成功', 'success');
    setTimeout(() => {
      router.push('/login');
    }, 1000);
  }, 500);
};

onMounted(() => {
  // 检查管理员权限
  const userRole = localStorage.getItem('user_role') || 'user';
  if (userRole !== 'admin') {
    router.push('/');
  }
  
  // 添加窗口大小变化监听
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 移除窗口大小变化监听
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.admin-container {
  display: flex;
  height: 100vh;
  background-color: #f5f7fa;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.admin-sidebar {
  width: 250px;
  background-color: #1a202c;
  color: white;
  padding: 24px 0;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  z-index: 100;
}

/* 菜单切换按钮 */
.menu-toggle {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 48px;
  height: 48px;
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  cursor: pointer;
  z-index: 150;
  box-shadow: 0 2px 10px rgba(59, 130, 246, 0.3);
  transition: all 0.25s ease;
}

.menu-toggle:hover {
  background-color: #2563eb;
  transform: scale(1.05);
}

.menu-toggle:active {
  transform: scale(0.95);
}

.admin-sidebar:hover {
  box-shadow: 2px 0 15px rgba(0, 0, 0, 0.2);
}

.admin-logo {
  padding: 0 24px 32px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  margin-bottom: 32px;
  text-align: center;
}

.admin-logo h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #ffffff;
  letter-spacing: -0.025em;
}

.admin-logo p {
  font-size: 0.875rem;
  color: #94a3b8;
  margin: 0;
}

.admin-menu {
  padding: 0 12px;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 14px 24px;
  color: #e2e8f0;
  text-decoration: none;
  border-radius: 8px;
  margin-bottom: 6px;
  transition: all 0.25s ease;
  position: relative;
  overflow: hidden;
  cursor: pointer;
  user-select: none;
}

.menu-item::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 3px;
  background-color: #3b82f6;
  transform: scaleY(0);
  transition: transform 0.25s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: white;
  transform: translateX(4px);
}

.menu-item:hover::before {
  transform: scaleY(1);
}

.menu-item.active {
  background-color: rgba(59, 130, 246, 0.25);
  color: white;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

.menu-item.active::before {
  transform: scaleY(1);
  width: 4px;
}

.menu-item:active {
  transform: translateX(2px) scale(0.98);
  transition: all 0.1s ease;
}

.menu-item.active i {
  color: white;
  text-shadow: 0 0 8px rgba(59, 130, 246, 0.6);
}

.menu-item i {
  font-size: 1.125rem;
  margin-right: 12px;
  width: 20px;
  text-align: center;
  transition: color 0.25s ease;
}

.menu-item.active i {
  color: #3b82f6;
}

.admin-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}

.admin-header {
  background-color: white;
  padding: 20px 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 50;
  position: relative;
}

.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 0.875rem;
  color: #64748b;
}

.breadcrumb-item {
  display: flex;
  align-items: center;
}

.breadcrumb-item a {
  color: #3b82f6;
  text-decoration: none;
  transition: color 0.3s ease;
}

.breadcrumb-item a:hover {
  color: #2563eb;
  text-decoration: underline;
}

.breadcrumb-item.active {
  color: #1e293b;
  font-weight: 500;
}

.breadcrumb-separator {
  color: #94a3b8;
}

.header-left h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 24px;
}

.user-name {
  font-weight: 500;
  color: #334155;
  font-size: 0.9375rem;
}

.logout-btn {
  background-color: #ef4444;
  color: white;
  border: none;
  padding: 10px 18px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.25s ease;
  font-size: 0.875rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.logout-btn:hover {
  background-color: #dc2626;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.logout-btn:active {
  transform: translateY(0);
}

.admin-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #f8fafc;
}

/* 滚动条样式 */
.admin-body::-webkit-scrollbar {
  width: 8px;
}

.admin-body::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 4px;
}

.admin-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 4px;
}

.admin-body::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .admin-sidebar {
    width: 200px;
  }
  
  .admin-logo h1 {
    font-size: 1.5rem;
  }
  
  .menu-item {
    padding: 12px 20px;
  }
  
  .menu-item i {
    font-size: 1rem;
    margin-right: 10px;
  }
  
  .admin-header {
    padding: 16px 20px;
  }
  
  .header-left h2 {
    font-size: 1.125rem;
  }
  
  .user-info {
    gap: 16px;
  }
  
  .admin-body {
    padding: 20px;
  }
}

@media (max-width: 640px) {
  .admin-container {
    flex-direction: column;
  }
  
  .admin-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 250px;
    height: 100vh;
    padding: 24px 0;
    z-index: 140;
    transition: left 0.3s ease;
  }
  
  .admin-sidebar.mobile-open {
    left: 0;
  }
  
  .admin-sidebar.mobile-open::before {
    content: '';
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 250px;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: -1;
  }
  
  .admin-logo {
    padding: 0 24px 32px;
    margin-bottom: 32px;
  }
  
  .admin-menu {
    display: flex;
    flex-direction: column;
    padding: 0 12px;
    gap: 0;
  }
  
  .menu-item {
    white-space: nowrap;
    margin-bottom: 6px;
    padding: 14px 24px;
  }
  
  .admin-content {
    flex: 1;
    margin-top: 80px;
  }
  
  .admin-header {
    padding: 16px 20px;
  }
  
  .admin-body {
    padding: 20px;
  }
}

/* 加载动画 */
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

/* 路由切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.admin-content {
  animation: fadeIn 0.3s ease-out;
}

.menu-item {
  animation: fadeIn 0.2s ease-out;
}

.menu-item:nth-child(1) { animation-delay: 0.05s; }
.menu-item:nth-child(2) { animation-delay: 0.1s; }
.menu-item:nth-child(3) { animation-delay: 0.15s; }
.menu-item:nth-child(4) { animation-delay: 0.2s; }
.menu-item:nth-child(5) { animation-delay: 0.25s; }
.menu-item:nth-child(6) { animation-delay: 0.3s; }
.menu-item:nth-child(7) { animation-delay: 0.35s; }
.menu-item:nth-child(8) { animation-delay: 0.4s; }
.menu-item:nth-child(9) { animation-delay: 0.45s; }
.menu-item:nth-child(10) { animation-delay: 0.5s; }
.menu-item:nth-child(11) { animation-delay: 0.55s; }
.menu-item:nth-child(12) { animation-delay: 0.6s; }

/* 全局加载状态 */
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 1rem;
  color: #3b82f6;
  font-weight: 500;
}

/* 通知系统 */
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 350px;
}

.notification {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: slideIn 0.3s ease-out;
  transition: all 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification.success {
  border-left: 4px solid #10b981;
  background-color: #f0fdf4;
}

.notification.error {
  border-left: 4px solid #ef4444;
  background-color: #fef2f2;
}

.notification.warning {
  border-left: 4px solid #f59e0b;
  background-color: #fffbeb;
}

.notification.info {
  border-left: 4px solid #3b82f6;
  background-color: #eff6ff;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.notification-content i {
  font-size: 1.25rem;
  flex-shrink: 0;
}

.notification.success i {
  color: #10b981;
}

.notification.error i {
  color: #ef4444;
}

.notification.warning i {
  color: #f59e0b;
}

.notification.info i {
  color: #3b82f6;
}

.notification-content span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1e293b;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 1rem;
  color: #94a3b8;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #64748b;
}

/* 响应式通知 */
@media (max-width: 640px) {
  .notification-container {
    top: 80px;
    right: 16px;
    left: 16px;
    max-width: none;
  }
  
  .notification {
    padding: 14px;
  }
  
  .notification-content span {
    font-size: 0.8125rem;
  }
}
</style>
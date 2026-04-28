<template>
  <div class="delivery-home">
    <header class="delivery-header">
      <div class="user-info">
        <img :src="userInfo.avatar || 'https://via.placeholder.com/40'" class="avatar">
        <div class="info">
          <h3>{{ userInfo.name || '配送员' }}</h3>
          <p>{{ userInfo.phone || '未登录' }}</p>
        </div>
      </div>
      <button class="logout-btn" @click="logout">退出</button>
    </header>

    <div class="menu-container">
      <div class="menu-item" @click="goTo('/delivery/address/list')">
        <div class="menu-icon address-icon"></div>
        <span class="menu-text">地址管理</span>
      </div>
      <div class="menu-item" @click="goTo('/delivery/order/list')">
        <div class="menu-icon order-icon"></div>
        <span class="menu-text">订单管理</span>
      </div>
      <div class="menu-item" @click="goTo('/delivery/dispatch/optimize')">
        <div class="menu-icon dispatch-icon"></div>
        <span class="menu-text">路径优化</span>
      </div>
      <div class="menu-item" @click="goTo('/delivery/ai')">
        <div class="menu-icon ai-icon"></div>
        <span class="menu-text">智能助手</span>
      </div>
    </div>

    <div class="stats-container">
      <div class="stat-item">
        <span class="stat-number">{{ addressCount }}</span>
        <span class="stat-label">地址数量</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ orderCount }}</span>
        <span class="stat-label">订单数量</span>
      </div>
      <div class="stat-item">
        <span class="stat-number">{{ completedOrders }}</span>
        <span class="stat-label">已完成订单</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const userInfo = ref({
  name: '配送员',
  phone: '',
  avatar: ''
});

const addressCount = ref(0);
const orderCount = ref(0);
const completedOrders = ref(0);

onMounted(() => {
  loadStats();
  loadUserInfo();
});

function loadUserInfo() {
  const storedUser = localStorage.getItem('user');
  if (storedUser) {
    try {
      userInfo.value = JSON.parse(storedUser);
    } catch (e) {
      console.error('解析用户信息失败', e);
    }
  }
}

function loadStats() {
  addressCount.value = 12;
  orderCount.value = 8;
  completedOrders.value = 6;
}

function goTo(path) {
  router.push(path);
}

function logout() {
  if (confirm('确定要退出登录吗？')) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  }
}
</script>

<style scoped>
.delivery-home {
  min-height: 100vh;
  background-color: var(--color-gray-50);
  padding: 1rem;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border-radius: 0.75rem;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-info .avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin-right: 0.75rem;
}

.user-info h3 {
  font-size: 1.125rem;
  margin-bottom: 0.25rem;
}

.user-info p {
  font-size: 0.875rem;
  opacity: 0.9;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.menu-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
}

.menu-item {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s;
}

.menu-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
}

.menu-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  margin-bottom: 0.75rem;
}

.address-icon {
  background-color: #e3f2fd;
}

.order-icon {
  background-color: #e8f5e8;
}

.dispatch-icon {
  background-color: #fff3e0;
}

.ai-icon {
  background-color: #f3e5f5;
}

.menu-text {
  font-size: 1rem;
  color: #333;
}

.stats-container {
  background-color: white;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-number {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: #666;
}
</style>
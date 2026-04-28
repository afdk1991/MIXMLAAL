<template>
  <div class="delivery-home">
    <header class="delivery-header">
      <div class="user-info">
        <img :src="userInfo.avatar || 'https://via.placeholder.com/40'" class="avatar">
        <div class="info">
          <h3>{{ userInfo.name }}</h3>
          <p>{{ userInfo.phone }}</p>
        </div>
      </div>
      <div class="status-toggle">
        <span :class="{ active: isOnline }">接单中</span>
        <label class="switch">
          <input type="checkbox" v-model="isOnline">
          <span class="slider"></span>
        </label>
      </div>
    </header>

    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-value">{{ stats.todayOrders }}</span>
        <span class="stat-label">今日订单</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">¥{{ stats.todayEarnings }}</span>
        <span class="stat-label">今日收入</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">{{ stats.totalOrders }}</span>
        <span class="stat-label">累计订单</span>
      </div>
      <div class="stat-card">
        <span class="stat-value">¥{{ stats.totalEarnings }}</span>
        <span class="stat-label">累计收入</span>
      </div>
    </div>

    <div class="quick-actions">
      <h3>快捷功能</h3>
      <div class="actions-grid">
        <div class="action-item" @click="goTo('/delivery/order/list')">
          <i class="fa fa-list"></i>
          <span>订单列表</span>
        </div>
        <div class="action-item" @click="goTo('/delivery/address/list')">
          <i class="fa fa-map-marker"></i>
          <span>地址管理</span>
        </div>
        <div class="action-item" @click="goTo('/delivery/dispatch/optimize')">
          <i class="fa fa-truck"></i>
          <span>调度优化</span>
        </div>
        <div class="action-item" @click="goTo('/delivery/ai')">
          <i class="fa fa-android"></i>
          <span>AI智能</span>
        </div>
      </div>
    </div>

    <div class="recent-orders">
      <h3>待处理订单</h3>
      <div v-if="pendingOrders.length > 0" class="order-list">
        <div v-for="order in pendingOrders" :key="order.id" class="order-card" @click="viewOrder(order.id)">
          <div class="order-header">
            <span class="order-id">{{ order.id }}</span>
            <span class="order-distance">{{ order.distance }}m</span>
          </div>
          <div class="order-info">
            <p><i class="fa fa-map-marker"></i> {{ order.pickupAddress }}</p>
            <p><i class="fa fa-flag"></i> {{ order.deliveryAddress }}</p>
          </div>
          <div class="order-footer">
            <span class="order-reward">¥{{ order.reward }}</span>
            <button class="accept-btn" @click.stop="acceptOrder(order.id)">接单</button>
          </div>
        </div>
      </div>
      <div v-else class="empty-state">
        <i class="fa fa-inbox"></i>
        <p>暂无待处理订单</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isOnline = ref(true);

const userInfo = ref({
  name: '配送员小王',
  phone: '138****8888',
  avatar: ''
});

const stats = ref({
  todayOrders: 12,
  todayEarnings: 156.50,
  totalOrders: 1256,
  totalEarnings: 15680.00
});

const pendingOrders = ref([
  {
    id: 'DLV202401150001',
    distance: 800,
    pickupAddress: '朝阳区建国路88号',
    deliveryAddress: '朝阳区建国路99号',
    reward: 15.00
  },
  {
    id: 'DLV202401150002',
    distance: 1200,
    pickupAddress: '海淀区中关村大街1号',
    deliveryAddress: '海淀区清华科技园',
    reward: 20.00
  }
]);

function goTo(path) {
  router.push(path);
}

function viewOrder(orderId) {
  router.push(`/delivery/order/detail?id=${orderId}`);
}

function acceptOrder(orderId) {
  alert(`已接单：${orderId}`);
}
</script>

<style scoped>
.delivery-home {
  min-height: 100vh;
  background-color: var(--color-gray-50);
  padding-bottom: 70px;
}

.delivery-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
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

.status-toggle {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.status-toggle span.active {
  color: #10b981;
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: 0.3s;
  border-radius: 28px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 22px;
  width: 22px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: 0.3s;
  border-radius: 50%;
}

input:checked + .slider {
  background-color: #10b981;
}

input:checked + .slider:before {
  transform: translateX(22px);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.5rem;
  padding: 1rem;
  background: white;
}

.stat-card {
  text-align: center;
  padding: 0.75rem 0.25rem;
}

.stat-value {
  display: block;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-primary);
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.quick-actions {
  padding: 1rem;
}

.quick-actions h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  background: white;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.action-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.action-item i {
  font-size: 1.5rem;
  color: var(--color-primary);
  margin-bottom: 0.5rem;
}

.action-item span {
  font-size: 0.75rem;
  color: var(--color-gray-600);
}

.recent-orders {
  padding: 1rem;
}

.recent-orders h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.order-card {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 0.75rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.order-id {
  font-weight: 500;
}

.order-distance {
  color: var(--color-gray-500);
  font-size: 0.875rem;
}

.order-info p {
  font-size: 0.875rem;
  color: var(--color-gray-600);
  margin-bottom: 0.25rem;
}

.order-info i {
  margin-right: 0.5rem;
  color: var(--color-primary);
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-100);
}

.order-reward {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-danger);
}

.accept-btn {
  padding: 0.5rem 1.5rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  color: var(--color-gray-400);
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}
</style>
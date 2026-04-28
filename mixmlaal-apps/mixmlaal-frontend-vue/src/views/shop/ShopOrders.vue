<template>
  <div class="orders-container">
    <header class="orders-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>我的订单</h1>
    </header>

    <div class="orders-tabs">
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="{ active: activeTab === tab.value }"
        @click="activeTab = tab.value"
      >
        {{ tab.label }}
      </span>
    </div>

    <div class="orders-list" v-if="filteredOrders.length > 0">
      <div v-for="order in filteredOrders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-id">订单号：{{ order.id }}</span>
          <span :class="['order-status', order.status]">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-items">
          <div v-for="item in order.items" :key="item.id" class="order-item">
            <img :src="item.image" :alt="item.name">
            <div class="item-info">
              <h4>{{ item.name }}</h4>
              <p>×{{ item.quantity }}</p>
            </div>
            <span class="item-price">¥{{ item.price }}</span>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-total">合计：¥{{ order.total }}</span>
          <div class="order-actions">
            <button v-if="order.status === 'pending'" class="cancel-btn" @click="cancelOrder(order.id)">
              取消订单
            </button>
            <button v-if="order.status === 'pending'" class="pay-btn" @click="payOrder(order.id)">
              去支付
            </button>
            <button v-if="order.status === 'completed'" class="review-btn" @click="reviewOrder(order.id)">
              评价
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="empty-orders" v-else>
      <i class="fa fa-receipt"></i>
      <p>暂无订单</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const activeTab = ref('all');

const tabs = [
  { label: '全部', value: 'all' },
  { label: '待支付', value: 'pending' },
  { label: '待发货', value: 'paid' },
  { label: '待收货', value: 'shipped' },
  { label: '已完成', value: 'completed' }
];

const orders = ref([
  {
    id: 'ORD202401150001',
    status: 'pending',
    items: [
      { id: 1, name: '新鲜水果篮', quantity: 1, price: 99.00, image: 'https://via.placeholder.com/60' }
    ],
    total: 99.00,
    createdAt: '2024-01-15 10:30'
  },
  {
    id: 'ORD202401140002',
    status: 'completed',
    items: [
      { id: 2, name: '有机蔬菜套餐', quantity: 2, price: 59.90, image: 'https://via.placeholder.com/60' }
    ],
    total: 119.80,
    createdAt: '2024-01-14 14:20'
  }
]);

const filteredOrders = computed(() => {
  if (activeTab.value === 'all') {
    return orders.value;
  }
  return orders.value.filter(order => order.status === activeTab.value);
});

function getStatusText(status) {
  const statusMap = {
    pending: '待支付',
    paid: '待发货',
    shipped: '待收货',
    completed: '已完成',
    cancelled: '已取消'
  };
  return statusMap[status] || status;
}

function goBack() {
  router.back();
}

function cancelOrder(orderId) {
  if (confirm('确定要取消该订单吗？')) {
    const order = orders.value.find(o => o.id === orderId);
    if (order) {
      order.status = 'cancelled';
    }
  }
}

function payOrder(orderId) {
  router.push(`/payment?orderId=${orderId}`);
}

function reviewOrder(orderId) {
  alert('评价功能开发中');
}
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background-color: var(--color-gray-50);
}

.orders-header {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.back-btn {
  background: none;
  border: none;
  font-size: 1.25rem;
  cursor: pointer;
}

.orders-header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
}

.orders-tabs {
  display: flex;
  background: white;
  padding: 0.75rem 1rem;
  gap: 1rem;
  overflow-x: auto;
}

.orders-tabs span {
  padding: 0.5rem 1rem;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 1rem;
}

.orders-tabs span.active {
  background-color: var(--color-primary);
  color: white;
}

.order-card {
  background: white;
  margin: 1rem;
  border-radius: 0.5rem;
  padding: 1rem;
}

.order-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--color-gray-100);
}

.order-id {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.order-status {
  font-size: 0.875rem;
  font-weight: 500;
}

.order-status.pending {
  color: #f59e0b;
}

.order-status.completed {
  color: #10b981;
}

.order-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
}

.order-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-right: 0.75rem;
}

.order-item .item-info {
  flex: 1;
}

.order-item h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.order-item p {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.item-price {
  font-weight: 500;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 0.75rem;
  border-top: 1px solid var(--color-gray-100);
}

.order-total {
  font-weight: 600;
  color: var(--color-danger);
}

.order-actions {
  display: flex;
  gap: 0.5rem;
}

.order-actions button {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
}

.order-actions .pay-btn {
  background-color: var(--color-danger);
  color: white;
  border: none;
}

.empty-orders {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-orders i {
  font-size: 4rem;
  color: var(--color-gray-300);
  margin-bottom: 1rem;
}

.empty-orders p {
  color: var(--color-gray-500);
}
</style>
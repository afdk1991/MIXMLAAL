<template>
  <div class="order-detail-container">
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>订单详情</h1>
    </header>

    <div class="order-content" v-if="order">
      <div class="order-status-card">
        <div class="status-icon">
          <i :class="getStatusIcon(order.status)"></i>
        </div>
        <div class="status-info">
          <h2>{{ getStatusText(order.status) }}</h2>
          <p>{{ getStatusDesc(order.status) }}</p>
        </div>
      </div>

      <div class="address-section">
        <h3>收货地址</h3>
        <div class="address-card">
          <p class="address-name">{{ order.address.name }} {{ order.address.phone }}</p>
          <p class="address-detail">{{ order.address.province }}{{ order.address.city }}{{ order.address.district }}{{ order.address.detail }}</p>
        </div>
      </div>

      <div class="items-section">
        <h3>商品信息</h3>
        <div v-for="item in order.items" :key="item.id" class="order-item">
          <img :src="item.image || 'https://via.placeholder.com/60'" :alt="item.name">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p>×{{ item.quantity }}</p>
          </div>
          <span class="item-price">¥{{ item.price }}</span>
        </div>
      </div>

      <div class="info-section">
        <h3>订单信息</h3>
        <div class="info-row">
          <span>订单编号</span>
          <span>{{ order.id }}</span>
        </div>
        <div class="info-row">
          <span>下单时间</span>
          <span>{{ order.createdAt }}</span>
        </div>
        <div class="info-row">
          <span>配送方式</span>
          <span>快递配送</span>
        </div>
        <div class="info-row">
          <span>备注</span>
          <span>{{ order.remark || '无' }}</span>
        </div>
      </div>

      <div class="payment-section">
        <div class="info-row total">
          <span>商品总额</span>
          <span>¥{{ order.subtotal }}</span>
        </div>
        <div class="info-row">
          <span>运费</span>
          <span>¥{{ order.deliveryFee }}</span>
        </div>
        <div class="info-row" v-if="order.couponDiscount">
          <span>优惠券</span>
          <span>-¥{{ order.couponDiscount }}</span>
        </div>
        <div class="info-row final">
          <span>实付款</span>
          <span class="final-price">¥{{ order.total }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const order = ref(null);

onMounted(() => {
  const orderId = route.params.id;
  loadOrder(orderId);
});

function loadOrder(orderId) {
  order.value = {
    id: orderId || 'ORD202401150001',
    status: 'pending',
    address: {
      name: '张三',
      phone: '138****8888',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      detail: '建国路88号'
    },
    items: [
      { id: 1, name: '新鲜水果篮', quantity: 1, price: 99.00, image: 'https://via.placeholder.com/60' }
    ],
    subtotal: 99.00,
    deliveryFee: 0,
    couponDiscount: 0,
    total: 99.00,
    remark: '',
    createdAt: '2024-01-15 10:30:00'
  };
}

function goBack() {
  router.back();
}

function getStatusIcon(status) {
  const iconMap = {
    pending: 'fa fa-clock-o',
    paid: 'fa fa-credit-card',
    shipped: 'fa fa-truck',
    completed: 'fa fa-check-circle'
  };
  return iconMap[status] || 'fa fa-file';
}

function getStatusText(status) {
  const textMap = {
    pending: '待支付',
    paid: '待发货',
    shipped: '配送中',
    completed: '已完成'
  };
  return textMap[status] || status;
}

function getStatusDesc(status) {
  const descMap = {
    pending: '请尽快完成支付',
    paid: '商家正在准备商品',
    shipped: '商品正在配送中',
    completed: '感谢您的购买'
  };
  return descMap[status] || '';
}
</script>

<style scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: var(--color-gray-50);
}

.detail-header {
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

.detail-header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
}

.order-content {
  padding: 1rem;
}

.order-status-card {
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
}

.status-icon {
  font-size: 3rem;
  margin-right: 1rem;
}

.status-info h2 {
  font-size: 1.25rem;
  margin-bottom: 0.25rem;
}

.address-section,
.items-section,
.info-section,
.payment-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-gray-700);
}

.address-card {
  padding: 0.75rem;
  background: var(--color-gray-50);
  border-radius: 0.25rem;
}

.address-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.address-detail {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.order-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.order-item:last-child {
  border-bottom: none;
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

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  font-size: 0.875rem;
  color: var(--color-gray-600);
}

.info-row.total,
.info-row.final {
  padding-top: 0.75rem;
}

.final-price {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-danger);
}
</style>
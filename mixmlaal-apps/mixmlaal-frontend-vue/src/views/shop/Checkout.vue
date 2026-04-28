<template>
  <div class="checkout-container">
    <header class="checkout-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>确认订单</h1>
    </header>

    <div class="checkout-content">
      <div class="address-section" v-if="selectedAddress">
        <h3>收货地址</h3>
        <div class="address-card" @click="showAddressPicker = true">
          <div class="address-info">
            <p class="address-name">{{ selectedAddress.name }} {{ selectedAddress.phone }}</p>
            <p class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</p>
          </div>
          <i class="fa fa-chevron-right"></i>
        </div>
      </div>

      <div class="order-items">
        <h3>商品信息</h3>
        <div v-for="item in cartStore.items" :key="item.productId" class="checkout-item">
          <img :src="item.image || 'https://via.placeholder.com/60'" :alt="item.name">
          <div class="item-info">
            <h4>{{ item.name }}</h4>
            <p>{{ item.description }}</p>
          </div>
          <div class="item-price-qty">
            <span>×{{ item.quantity }}</span>
            <span class="price">¥{{ item.price * item.quantity }}</span>
          </div>
        </div>
      </div>

      <div class="delivery-time">
        <h3>配送时间</h3>
        <div class="time-options">
          <span
            v-for="option in deliveryOptions"
            :key="option.value"
            :class="{ active: deliveryTime === option.value }"
            @click="deliveryTime = option.value"
          >
            {{ option.label }}
          </span>
        </div>
      </div>

      <div class="remark-section">
        <h3>备注</h3>
        <textarea v-model="remark" placeholder="请输入备注信息（选填）"></textarea>
      </div>

      <div class="coupon-section">
        <h3>优惠券</h3>
        <div class="coupon-selector" @click="showCouponPicker = true">
          <span v-if="selectedCoupon">{{ selectedCoupon.name }} - 减免¥{{ selectedCoupon.discount }}</span>
          <span v-else class="no-coupon">暂无可用优惠券</span>
          <i class="fa fa-chevron-right"></i>
        </div>
      </div>

      <div class="payment-section">
        <h3>支付方式</h3>
        <div class="payment-options">
          <label
            v-for="payment in paymentMethods"
            :key="payment.value"
            :class="{ active: paymentMethod === payment.value }"
          >
            <input type="radio" v-model="paymentMethod" :value="payment.value">
            <i :class="payment.icon"></i>
            <span>{{ payment.label }}</span>
          </label>
        </div>
      </div>
    </div>

    <div class="checkout-footer">
      <div class="total-info">
        <span>合计：</span>
        <span class="total-price">¥{{ finalPrice }}</span>
      </div>
      <button class="submit-btn" @click="submitOrder">提交订单</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';

const router = useRouter();
const cartStore = useCartStore();

const selectedAddress = ref({
  name: '张三',
  phone: '138****8888',
  province: '北京市',
  city: '北京市',
  district: '朝阳区',
  detail: '建国路88号'
});

const deliveryTime = ref('asap');
const remark = ref('');
const selectedCoupon = ref(null);
const paymentMethod = ref('wechat');
const showAddressPicker = ref(false);
const showCouponPicker = ref(false);

const deliveryOptions = [
  { label: '立即送达', value: 'asap' },
  { label: '预约时间', value: 'scheduled' }
];

const paymentMethods = [
  { label: '微信支付', value: 'wechat', icon: 'fa fa-weixin' },
  { label: '支付宝', value: 'alipay', icon: 'fa fa-alipay' },
  { label: '银行卡', value: 'card', icon: 'fa fa-credit-card' }
];

const coupons = ref([
  { id: 1, name: '新人满减券', discount: 10, minAmount: 50 },
  { id: 2, name: '满100减20', discount: 20, minAmount: 100 }
]);

const finalPrice = computed(() => {
  let total = cartStore.totalPrice;
  if (selectedCoupon.value) {
    total -= selectedCoupon.value.discount;
  }
  return Math.max(0, total).toFixed(2);
});

function goBack() {
  router.back();
}

function submitOrder() {
  if (!selectedAddress.value) {
    alert('请选择收货地址');
    return;
  }

  const orderId = 'ORD' + Date.now();
  alert(`订单提交成功！订单号：${orderId}`);

  cartStore.clearCart();

  router.push(`/shop/order/${orderId}`);
}
</script>

<style scoped>
.checkout-container {
  min-height: 100vh;
  background-color: var(--color-gray-50);
  padding-bottom: 80px;
}

.checkout-header {
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

.checkout-header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
}

.checkout-content {
  padding: 1rem;
}

.checkout-content h3 {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: var(--color-gray-700);
}

.address-section,
.order-items,
.delivery-time,
.remark-section,
.coupon-section,
.payment-section {
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 1rem;
}

.address-card {
  display: flex;
  align-items: center;
  padding: 0.75rem;
  background: var(--color-gray-50);
  border-radius: 0.25rem;
  cursor: pointer;
}

.address-info {
  flex: 1;
}

.address-name {
  font-weight: 500;
  margin-bottom: 0.25rem;
}

.address-detail {
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.checkout-item {
  display: flex;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.checkout-item:last-child {
  border-bottom: none;
}

.checkout-item img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 0.25rem;
  margin-right: 0.75rem;
}

.checkout-item .item-info {
  flex: 1;
}

.checkout-item h4 {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.checkout-item p {
  font-size: 0.75rem;
  color: var(--color-gray-500);
}

.item-price-qty {
  text-align: right;
}

.item-price-qty span:first-child {
  display: block;
  font-size: 0.875rem;
  color: var(--color-gray-500);
}

.item-price-qty .price {
  font-weight: 600;
  color: var(--color-danger);
}

.time-options {
  display: flex;
  gap: 0.75rem;
}

.time-options span {
  padding: 0.5rem 1rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.25rem;
  cursor: pointer;
}

.time-options span.active {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
  color: var(--color-primary);
}

.remark-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.25rem;
  resize: none;
  font-family: inherit;
}

.coupon-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  background: var(--color-gray-50);
  border-radius: 0.25rem;
  cursor: pointer;
}

.no-coupon {
  color: var(--color-gray-400);
}

.payment-options {
  display: flex;
  gap: 0.75rem;
}

.payment-options label {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.25rem;
  cursor: pointer;
}

.payment-options label.active {
  border-color: var(--color-primary);
  background-color: rgba(59, 130, 246, 0.1);
}

.payment-options input {
  display: none;
}

.checkout-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.total-info {
  font-size: 0.875rem;
}

.total-price {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-danger);
  margin-left: 0.5rem;
}

.submit-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
}
</style>
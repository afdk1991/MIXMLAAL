<template>
  <div class="checkout-container">
    <h1>结算</h1>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div>加载中...</div>
    </div>
    
    <div v-else-if="cart && cart.items.length > 0" class="checkout-content">
      <!-- 收货地址 -->
      <div class="address-section">
        <h2>收货地址</h2>
        <div class="address-card" @click="selectAddress">
          <div v-if="selectedAddress" class="address-info">
            <div class="address-name">{{ selectedAddress.name }}</div>
            <div class="address-phone">{{ selectedAddress.phone }}</div>
            <div class="address-detail">{{ selectedAddress.province }}{{ selectedAddress.city }}{{ selectedAddress.district }}{{ selectedAddress.detail }}</div>
          </div>
          <div v-else class="address-placeholder">
            <div class="add-icon">+</div>
            <div>添加收货地址</div>
          </div>
        </div>
      </div>

      <!-- 商品列表 -->
      <div class="order-items">
        <h2>订单商品</h2>
        <div class="order-item" v-for="item in cart.items" :key="item.product._id">
          <div class="item-image">
            <img :src="item.product.images[0] || 'https://via.placeholder.com/80'" alt="商品图片" />
          </div>
          <div class="item-info">
            <div class="item-name">{{ item.product.name }}</div>
            <div class="item-quantity">x{{ item.quantity }}</div>
          </div>
          <div class="item-price">¥{{ (item.product.price * item.quantity).toFixed(2) }}</div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="payment-section">
        <h2>支付方式</h2>
        <div class="payment-options">
          <div 
            v-for="option in paymentOptions" 
            :key="option.value"
            class="payment-option"
            :class="{ active: selectedPayment === option.value }"
            @click="selectedPayment = option.value"
          >
            <div class="payment-icon">{{ option.icon }}</div>
            <div class="payment-name">{{ option.name }}</div>
          </div>
        </div>
      </div>

      <!-- 订单汇总 -->
      <div class="order-summary">
        <h2>订单汇总</h2>
        <div class="summary-item">
          <span>商品总价</span>
          <span>¥{{ cart.total.toFixed(2) }}</span>
        </div>
        <div class="summary-item">
          <span>运费</span>
          <span>¥10.00</span>
        </div>
        <div class="summary-total">
          <span>合计</span>
          <span>¥{{ (cart.total + 10).toFixed(2) }}</span>
        </div>
      </div>

      <!-- 提交订单 -->
      <div class="submit-section">
        <div class="total-price">
          合计: ¥{{ (cart.total + 10).toFixed(2) }}
        </div>
        <button class="submit-btn" @click="submitOrder">
          提交订单
        </button>
      </div>
    </div>

    <div v-else class="empty-cart">
      <div class="empty-icon">🛒</div>
      <h2>购物车是空的</h2>
      <p>去挑选一些喜欢的商品吧</p>
      <button class="shop-btn" @click="navigateToMall">
        去购物
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 响应式数据
const cart = ref(null);
const loading = ref(true);
const selectedAddress = ref(null);
const selectedPayment = ref('alipay');

// 支付方式选项
const paymentOptions = [
  { value: 'alipay', name: '支付宝', icon: '🔵' },
  { value: 'wechat', name: '微信支付', icon: '🟢' },
  { value: 'card', name: '银行卡', icon: '💳' }
];

// 获取购物车数据
const fetchCart = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const response = await axios.get('/api/cart', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    cart.value = response.data.data;
    
    // 获取默认地址
    fetchDefaultAddress();
  } catch (error) {
    console.error('获取购物车失败:', error);
  } finally {
    loading.value = false;
  }
};

// 获取默认地址
const fetchDefaultAddress = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    // 这里应该调用获取地址的API，暂时使用模拟数据
    selectedAddress.value = {
      name: '张三',
      phone: '13800138000',
      province: '广东省',
      city: '深圳市',
      district: '南山区',
      detail: '科技园南区8栋101室'
    };
  } catch (error) {
    console.error('获取地址失败:', error);
  }
};

// 选择地址
const selectAddress = () => {
  // 这里应该跳转到地址选择页面
  alert('跳转到地址选择页面');
};

// 提交订单
const submitOrder = async () => {
  if (!selectedAddress.value) {
    alert('请选择收货地址');
    return;
  }
  
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // 准备订单数据
    const orderData = {
      address: selectedAddress.value,
      paymentMethod: selectedPayment.value,
      items: cart.value.items.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: cart.value.total
    };
    
    // 调用创建订单API
    const response = await axios.post('/api/orders', orderData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 跳转到订单详情页面
    router.push(`/order/${response.data.data._id}`);
  } catch (error) {
    console.error('提交订单失败:', error);
    alert('提交订单失败');
  }
};

// 导航到商城
const navigateToMall = () => {
  router.push('/mall');
};

// 初始化
onMounted(() => {
  fetchCart();
});
</script>

<style scoped>
.checkout-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.checkout-container h1 {
  font-size: 24px;
  margin-bottom: 30px;
}

.checkout-content {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.address-section, .order-items, .payment-section, .order-summary {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.address-section h2, .order-items h2, .payment-section h2, .order-summary h2 {
  font-size: 18px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.address-card {
  border: 2px dashed #ddd;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.address-card:hover {
  border-color: #007bff;
}

.address-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.address-name {
  font-weight: bold;
  font-size: 16px;
}

.address-phone {
  color: #666;
}

.address-detail {
  color: #333;
  line-height: 1.4;
}

.address-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 40px 0;
}

.add-icon {
  font-size: 32px;
  color: #007bff;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 15px 0;
  border-bottom: 1px solid #eee;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border-radius: 4px;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  margin-bottom: 5px;
}

.item-quantity {
  font-size: 14px;
  color: #666;
}

.item-price {
  font-weight: bold;
}

.payment-options {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.payment-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  padding: 20px;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 100px;
}

.payment-option.active {
  border-color: #007bff;
  background-color: #f0f8ff;
}

.payment-icon {
  font-size: 24px;
}

.payment-name {
  font-size: 14px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 16px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.submit-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  bottom: 20px;
}

.total-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4757;
}

.submit-btn {
  padding: 15px 40px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.submit-btn:hover {
  background-color: #218838;
}

.empty-cart {
  text-align: center;
  padding: 100px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-cart h2 {
  font-size: 24px;
  margin-bottom: 10px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 30px;
}

.shop-btn {
  padding: 15px 30px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.shop-btn:hover {
  background-color: #0069d9;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .checkout-container {
    padding: 10px;
  }
  
  .payment-options {
    flex-direction: column;
  }
  
  .payment-option {
    flex-direction: row;
    justify-content: space-between;
    min-width: auto;
  }
}
</style>
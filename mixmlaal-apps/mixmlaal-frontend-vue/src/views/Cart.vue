<template>
  <div class="cart-container">
    <h1>购物车</h1>
    
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div>加载中...</div>
    </div>
    
    <div v-else-if="cart && cart.items.length > 0" class="cart-content">
      <!-- 购物车商品列表 -->
      <div class="cart-items">
        <div 
          v-for="item in cart.items" 
          :key="item.product._id"
          class="cart-item"
        >
          <div class="item-image">
            <img :src="item.product.images[0] || 'https://via.placeholder.com/100'" alt="商品图片" />
          </div>
          <div class="item-info">
            <h3 class="item-name">{{ item.product.name }}</h3>
            <div class="item-price">¥{{ item.product.price.toFixed(2) }}</div>
          </div>
          <div class="item-quantity">
            <button 
              @click="updateQuantity(item.product._id, item.quantity - 1)"
              :disabled="item.quantity <= 1"
            >-
            </button>
            <input 
              type="number" 
              v-model.number="item.quantity"
              min="1"
              :max="item.product.stock"
              @change="updateQuantity(item.product._id, item.quantity)"
            />
            <button 
              @click="updateQuantity(item.product._id, item.quantity + 1)"
              :disabled="item.quantity >= item.product.stock"
            >+
            </button>
          </div>
          <div class="item-total">
            ¥{{ (item.product.price * item.quantity).toFixed(2) }}
          </div>
          <div class="item-actions">
            <button class="remove-btn" @click="removeFromCart(item.product._id)">
              删除
            </button>
          </div>
        </div>
      </div>

      <!-- 购物车汇总 -->
      <div class="cart-summary">
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
        <button class="checkout-btn" @click="checkout">
          去结算
        </button>
        <button class="clear-btn" @click="clearCart">
          清空购物车
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
  } catch (error) {
    console.error('获取购物车失败:', error);
  } finally {
    loading.value = false;
  }
};

// 更新商品数量
const updateQuantity = async (productId, quantity) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    await axios.put('/api/cart', {
      productId,
      quantity
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 重新获取购物车数据
    fetchCart();
  } catch (error) {
    console.error('更新数量失败:', error);
    alert('更新数量失败');
  }
};

// 从购物车移除商品
const removeFromCart = async (productId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    await axios.delete(`/api/cart/${productId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 重新获取购物车数据
    fetchCart();
  } catch (error) {
    console.error('移除商品失败:', error);
    alert('移除商品失败');
  }
};

// 清空购物车
const clearCart = async () => {
  if (confirm('确定要清空购物车吗？')) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      
      await axios.delete('/api/cart', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      // 重新获取购物车数据
      fetchCart();
    } catch (error) {
      console.error('清空购物车失败:', error);
      alert('清空购物车失败');
    }
  }
};

// 去结算
const checkout = () => {
  // 跳转到结算页面
  router.push('/checkout');
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
.cart-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.cart-container h1 {
  font-size: 24px;
  margin-bottom: 30px;
}

.cart-content {
  display: flex;
  gap: 40px;
  flex-wrap: wrap;
}

.cart-items {
  flex: 1;
  min-width: 300px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 20px;
  gap: 20px;
}

.item-image {
  width: 100px;
  height: 100px;
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
  font-size: 16px;
  margin-bottom: 10px;
}

.item-price {
  font-weight: bold;
  color: #ff4757;
}

.item-quantity {
  display: flex;
  align-items: center;
}

.item-quantity button {
  width: 30px;
  height: 30px;
  border: 1px solid #ddd;
  background-color: white;
  cursor: pointer;
}

.item-quantity input {
  width: 60px;
  height: 30px;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 14px;
}

.item-total {
  font-weight: bold;
  min-width: 80px;
  text-align: right;
}

.item-actions {
  min-width: 60px;
}

.remove-btn {
  padding: 5px 10px;
  background-color: #ff4757;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.cart-summary {
  width: 300px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
}

.cart-summary h2 {
  font-size: 18px;
  margin-bottom: 20px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  font-weight: bold;
  font-size: 18px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #ddd;
}

.checkout-btn {
  width: 100%;
  padding: 15px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  margin-top: 20px;
  transition: background-color 0.3s ease;
}

.checkout-btn:hover {
  background-color: #218838;
}

.clear-btn {
  width: 100%;
  padding: 10px;
  background-color: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  margin-top: 10px;
  transition: background-color 0.3s ease;
}

.clear-btn:hover {
  background-color: #5a6268;
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
  .cart-content {
    flex-direction: column;
  }
  
  .cart-summary {
    width: 100%;
  }
  
  .cart-item {
    flex-wrap: wrap;
  }
  
  .item-actions {
    width: 100%;
    text-align: right;
    margin-top: 10px;
  }
}
</style>
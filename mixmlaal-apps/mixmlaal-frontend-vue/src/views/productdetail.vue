<template>
  <div class="product-detail-container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div>加载中...</div>
    </div>
    
    <div v-else-if="product" class="product-detail">
      <!-- 商品图片 -->
      <div class="product-images">
        <div class="main-image">
          <img :src="currentImage" alt="商品图片" />
        </div>
        <div class="thumbnail-images">
          <div 
            v-for="(image, index) in product.images" 
            :key="index"
            class="thumbnail"
            :class="{ active: currentImageIndex === index }"
            @click="currentImageIndex = index"
          >
            <img :src="image" alt="商品缩略图" />
          </div>
        </div>
      </div>

      <!-- 商品信息 -->
      <div class="product-info">
        <h1 class="product-name">{{ product.name }}</h1>
        <div class="product-rating">
          <span v-for="i in 5" :key="i" class="star">
            {{ i <= product.rating ? '★' : '☆' }}
          </span>
          <span class="review-count">({{ product.reviews }} 评价)</span>
        </div>
        <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
        <div class="product-stock">
          库存: {{ product.stock }} 件
        </div>
        <div class="product-category">
          分类: {{ product.category.name }}
        </div>

        <!-- 购买选项 -->
        <div class="purchase-options">
          <div class="quantity-control">
            <button 
              @click="decreaseQuantity"
              :disabled="quantity <= 1"
            >-
            </button>
            <input 
              type="number" 
              v-model.number="quantity"
              min="1"
              :max="product.stock"
            />
            <button 
              @click="increaseQuantity"
              :disabled="quantity >= product.stock"
            >+
            </button>
          </div>

          <div class="action-buttons">
            <button class="add-to-cart" @click="addToCart">
              加入购物车
            </button>
            <button class="buy-now" @click="buyNow">
              立即购买
            </button>
          </div>
        </div>
      </div>

      <!-- 商品描述 -->
      <div class="product-description">
        <h2>商品描述</h2>
        <div v-html="product.description"></div>
      </div>
    </div>

    <div v-else class="error">
      商品不存在
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// 响应式数据
const product = ref(null);
const loading = ref(true);
const quantity = ref(1);
const currentImageIndex = ref(0);

// 计算当前显示的图片
const currentImage = computed(() => {
  if (product.value && product.value.images.length > 0) {
    return product.value.images[currentImageIndex.value];
  }
  return 'https://via.placeholder.com/600';
});

// 获取商品详情
const fetchProduct = async () => {
  loading.value = true;
  try {
    const response = await axios.get(`/api/products/${route.params.id}`);
    product.value = response.data.data;
  } catch (error) {
    console.error('获取商品详情失败:', error);
  } finally {
    loading.value = false;
  }
};

// 增加数量
const increaseQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
};

// 减少数量
const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--;
  }
};

// 添加到购物车
const addToCart = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    await axios.post('/api/cart', {
      productId: product.value._id,
      quantity: quantity.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 显示成功提示
    alert('商品已加入购物车');
  } catch (error) {
    console.error('添加到购物车失败:', error);
    alert('添加到购物车失败，请先登录');
  }
};

// 立即购买
const buyNow = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    // 先添加到购物车
    await axios.post('/api/cart', {
      productId: product.value._id,
      quantity: quantity.value
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 跳转到购物车页面
    router.push('/cart');
  } catch (error) {
    console.error('立即购买失败:', error);
    alert('操作失败，请先登录');
  }
};

// 初始化
onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
.product-detail-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.product-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 40px;
}

.product-images {
  flex: 1;
  min-width: 300px;
}

.main-image {
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 8px;
  margin-bottom: 20px;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail-images {
  display: flex;
  gap: 10px;
  overflow-x: auto;
}

.thumbnail {
  width: 80px;
  height: 80px;
  overflow: hidden;
  border: 2px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.thumbnail.active {
  border-color: #007bff;
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 300px;
}

.product-name {
  font-size: 24px;
  margin-bottom: 15px;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.star {
  color: #ffc107;
  margin-right: 2px;
  font-size: 18px;
}

.review-count {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.product-price {
  font-size: 28px;
  font-weight: bold;
  color: #ff4757;
  margin-bottom: 15px;
}

.product-stock {
  margin-bottom: 10px;
  color: #28a745;
}

.product-category {
  margin-bottom: 30px;
  color: #666;
}

.purchase-options {
  margin-top: 30px;
}

.quantity-control {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.quantity-control button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: white;
  font-size: 18px;
  cursor: pointer;
}

.quantity-control input {
  width: 80px;
  height: 40px;
  border: 1px solid #ddd;
  border-left: none;
  border-right: none;
  text-align: center;
  font-size: 16px;
}

.action-buttons {
  display: flex;
  gap: 15px;
}

.add-to-cart, .buy-now {
  flex: 1;
  padding: 15px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.add-to-cart {
  background-color: #ffc107;
  color: #333;
}

.add-to-cart:hover {
  background-color: #e0a800;
}

.buy-now {
  background-color: #ff4757;
  color: white;
}

.buy-now:hover {
  background-color: #e84118;
}

.product-description {
  width: 100%;
  margin-top: 40px;
  padding-top: 40px;
  border-top: 1px solid #ddd;
}

.product-description h2 {
  font-size: 20px;
  margin-bottom: 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 100px;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 100px;
  font-size: 18px;
  color: #666;
}

@media (max-width: 768px) {
  .product-detail {
    flex-direction: column;
  }
  
  .main-image {
    height: 300px;
  }
  
  .action-buttons {
    flex-direction: column;
  }
}
</style>
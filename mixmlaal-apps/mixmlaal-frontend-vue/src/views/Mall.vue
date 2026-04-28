<template>
  <div class="mall-container">
    <!-- 分类导航 -->
    <div class="category-nav">
      <div 
        v-for="category in categories" 
        :key="category._id"
        class="category-item"
        @click="selectCategory(category._id)"
      >
        <div class="category-icon">{{ category.icon }}</div>
        <div class="category-name">{{ category.name }}</div>
      </div>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input 
        type="text" 
        v-model="searchQuery"
        placeholder="搜索商品"
        @keyup.enter="searchProducts"
      />
      <button @click="searchProducts">搜索</button>
    </div>

    <!-- 排序选项 -->
    <div class="sort-options">
      <button 
        v-for="option in sortOptions" 
        :key="option.value"
        :class="{ active: sortBy === option.value }"
        @click="sortBy = option.value; fetchProducts()"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- 商品列表 -->
    <div class="products-grid">
      <div 
        v-for="product in products" 
        :key="product._id"
        class="product-card"
        @click="navigateToProduct(product._id)"
      >
        <div class="product-image">
          <img :src="product.images[0] || 'https://via.placeholder.com/300'" alt="商品图片" />
        </div>
        <div class="product-info">
          <h3 class="product-name">{{ product.name }}</h3>
          <div class="product-price">¥{{ product.price.toFixed(2) }}</div>
          <div class="product-rating">
            <span v-for="i in 5" :key="i" class="star">
              {{ i <= product.rating ? '★' : '☆' }}
            </span>
            <span class="review-count">({{ product.reviews }})</span>
          </div>
          <button class="add-to-cart" @click.stop="addToCart(product)">
            加入购物车
          </button>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
      <div>加载中...</div>
    </div>

    <!-- 分页 -->
    <div v-if="!loading && pagination.pages > 1" class="pagination">
      <button 
        @click="changePage(1)"
        :disabled="currentPage === 1"
      >
        首页
      </button>
      <button 
        @click="changePage(currentPage - 1)"
        :disabled="currentPage === 1"
      >
        上一页
      </button>
      <span class="page-info">
        第 {{ currentPage }} 页，共 {{ pagination.pages }} 页
      </span>
      <button 
        @click="changePage(currentPage + 1)"
        :disabled="currentPage === pagination.pages"
      >
        下一页
      </button>
      <button 
        @click="changePage(pagination.pages)"
        :disabled="currentPage === pagination.pages"
      >
        末页
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
const categories = ref([]);
const products = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const pagination = ref({ total: 0, pages: 0 });
const selectedCategory = ref('');
const searchQuery = ref('');
const sortBy = ref('');

// 排序选项
const sortOptions = [
  { label: '默认', value: '' },
  { label: '价格升序', value: 'price_asc' },
  { label: '价格降序', value: 'price_desc' },
  { label: '评分最高', value: 'rating' }
];

// 获取分类
const fetchCategories = async () => {
  try {
    const response = await axios.get('/api/categories');
    categories.value = response.data.data;
  } catch (error) {
    console.error('获取分类失败:', error);
  }
};

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true;
  try {
    const response = await axios.get('/api/products', {
      params: {
        page: currentPage.value,
        category: selectedCategory.value,
        search: searchQuery.value,
        sort: sortBy.value
      }
    });
    products.value = response.data.data;
    pagination.value = response.data.pagination;
  } catch (error) {
    console.error('获取商品失败:', error);
  } finally {
    loading.value = false;
  }
};

// 选择分类
const selectCategory = (categoryId) => {
  selectedCategory.value = selectedCategory.value === categoryId ? '' : categoryId;
  currentPage.value = 1;
  fetchProducts();
};

// 搜索商品
const searchProducts = () => {
  currentPage.value = 1;
  fetchProducts();
};

// 切换页码
const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.pages) {
    currentPage.value = page;
    fetchProducts();
  }
};

// 导航到商品详情
const navigateToProduct = (productId) => {
  router.push(`/product/${productId}`);
};

// 添加到购物车
const addToCart = async (product) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    await axios.post('/api/cart', {
      productId: product._id,
      quantity: 1
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

// 初始化
onMounted(() => {
  fetchCategories();
  fetchProducts();
});
</script>

<style scoped>
.mall-container {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.category-nav {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 10px 0;
  margin-bottom: 20px;
}

.category-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.category-item:hover {
  background-color: #f5f5f5;
}

.category-icon {
  font-size: 24px;
  margin-bottom: 5px;
}

.search-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.search-bar input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-bar button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.sort-options {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.sort-options button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.sort-options button.active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.product-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
}

.product-card:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.product-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  padding: 15px;
}

.product-name {
  font-size: 16px;
  margin-bottom: 10px;
  height: 48px;
  overflow: hidden;
}

.product-price {
  font-size: 18px;
  font-weight: bold;
  color: #ff4757;
  margin-bottom: 10px;
}

.product-rating {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.star {
  color: #ffc107;
  margin-right: 2px;
}

.review-count {
  margin-left: 10px;
  font-size: 14px;
  color: #666;
}

.add-to-cart {
  width: 100%;
  padding: 10px;
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.add-to-cart:hover {
  background-color: #218838;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background-color: white;
  border-radius: 4px;
  cursor: pointer;
}

.pagination button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  margin: 0 10px;
}

@media (max-width: 768px) {
  .products-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
  
  .product-name {
    font-size: 14px;
    height: 40px;
  }
  
  .product-price {
    font-size: 16px;
  }
}
</style>
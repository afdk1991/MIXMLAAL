<template>
  <div class="food-page">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1>外卖服务</h1>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-box">
          <svg xmlns="http://www.w3.org/2000/svg" class="search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            v-model="searchKeyword"
            @input="handleSearch"
            placeholder="搜索商家、美食"
            class="search-input"
          >
        </div>
      </div>
    </div>

    <!-- 分类导航 -->
    <div class="category-section">
      <div class="category-scroll">
        <button
          v-for="category in categories"
          :key="category.id"
          @click="selectCategory(category.id)"
          :class="['category-btn', selectedCategory === category.id ? 'active' : '']"
        >
          {{ category.name }}
        </button>
      </div>
    </div>

    <!-- 商家列表 -->
    <div class="merchant-section">
      <h2 class="section-title">附近商家</h2>
      <div class="merchant-grid">
        <div
          v-for="merchant in merchants"
          :key="merchant.merchantId"
          @click="goToMerchant(merchant.merchantId)"
          class="merchant-card"
        >
          <div class="merchant-image">
            <img :src="merchant.image" :alt="merchant.name">
            <div class="merchant-sales"> {{ merchant.sales }} 单/月 </div>
          </div>
          <div class="merchant-info">
            <div class="merchant-header">
              <h3 class="merchant-name">{{ merchant.name }}</h3>
              <div class="merchant-rating">
                <svg xmlns="http://www.w3.org/2000/svg" class="star-icon" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span>{{ merchant.rating }}</span>
              </div>
            </div>
            <div class="merchant-meta">
              <span class="meta-item">{{ merchant.deliveryTime }}</span>
              <span class="meta-divider">|</span>
              <span class="meta-item">配送费 ¥{{ merchant.deliveryFee }}</span>
              <span class="meta-divider">|</span>
              <span class="meta-item">起送 ¥{{ merchant.minOrder }}</span>
            </div>
            <div class="merchant-address">{{ merchant.address }}</div>
          </div>
        </div>
      </div>

      <!-- 加载更多 -->
      <div class="load-more">
        <button @click="loadMore" class="load-more-btn">加载更多</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const searchKeyword = ref('');
const selectedCategory = ref('all');
const page = ref(1);
const limit = ref(20);

const categories = [
  { id: 'all', name: '全部' },
  { id: 'fastfood', name: '快餐' },
  { id: 'chinese', name: '中餐' },
  { id: 'western', name: '西餐' },
  { id: 'japanese', name: '日料' },
  { id: 'dessert', name: '甜点' },
  { id: 'drink', name: '饮品' },
];

const merchants = ref([
  {
    merchantId: 'M001',
    name: '麦当劳',
    rating: 4.5,
    sales: 1234,
    deliveryFee: 5,
    minOrder: 20,
    deliveryTime: '30-40分钟',
    category: '快餐',
    address: '北京市朝阳区建国路88号',
    location: { lng: 116.404, lat: 39.915 },
    distance: 800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=McDonald%27s%20fast%20food%20restaurant&image_size=landscape_4_3',
  },
  {
    merchantId: 'M002',
    name: '肯德基',
    rating: 4.3,
    sales: 987,
    deliveryFee: 6,
    minOrder: 25,
    deliveryTime: '25-35分钟',
    category: '快餐',
    address: '北京市朝阳区建国路99号',
    location: { lng: 116.402, lat: 39.916 },
    distance: 1200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=KFC%20fast%20food%20restaurant&image_size=landscape_4_3',
  },
  {
    merchantId: 'M003',
    name: '必胜客',
    rating: 4.6,
    sales: 765,
    deliveryFee: 7,
    minOrder: 30,
    deliveryTime: '35-45分钟',
    category: '西餐',
    address: '北京市朝阳区建国路100号',
    location: { lng: 116.405, lat: 39.913 },
    distance: 1500,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pizza%20Hut%20restaurant&image_size=landscape_4_3',
  },
]);

function goBack() {
  router.back();
}

function handleSearch() {
  console.log('搜索:', searchKeyword.value);
}

function selectCategory(categoryId) {
  selectedCategory.value = categoryId;
  console.log('选择分类:', categoryId);
}

function goToMerchant(merchantId) {
  console.log('跳转到商家:', merchantId);
}

function loadMore() {
  page.value++;
  console.log('加载更多商家，页码:', page.value);
}

onMounted(() => {
  console.log('外卖服务页面加载');
});
</script>

<style scoped>
.food-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.page-header {
  background: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-right: 3rem;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #3b82f6;
}

.search-section {
  background: white;
  padding: 1rem 1.5rem;
}

.search-container {
  max-width: 600px;
  margin: 0 auto;
}

.search-box {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.25rem;
  height: 1.25rem;
  color: #9ca3af;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.75rem;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  background-color: #f9fafb;
}

.search-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  background-color: white;
}

.category-section {
  background: white;
  padding: 0.75rem 0;
  margin-bottom: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.category-scroll {
  display: flex;
  gap: 0.75rem;
  padding: 0 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.category-scroll::-webkit-scrollbar {
  display: none;
}

.category-btn {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #6b7280;
}

.category-btn:hover {
  background-color: #e5e7eb;
}

.category-btn.active {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.merchant-section {
  padding: 1rem 1.5rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.merchant-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.merchant-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.merchant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.merchant-image {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;
}

.merchant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.merchant-sales {
  position: absolute;
  top: 0.75rem;
  right: 0.75rem;
  padding: 0.25rem 0.5rem;
  background: linear-gradient(135deg, #ef4444, #f97316);
  color: white;
  font-size: 0.75rem;
  border-radius: 0.25rem;
}

.merchant-info {
  padding: 1rem;
}

.merchant-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.merchant-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.merchant-rating {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.star-icon {
  width: 1rem;
  height: 1rem;
  color: #fbbf24;
}

.merchant-rating span {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.merchant-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.meta-divider {
  color: #d1d5db;
}

.merchant-address {
  font-size: 0.75rem;
  color: #9ca3af;
  padding-top: 0.5rem;
  border-top: 1px dashed #e5e7eb;
}

.load-more {
  text-align: center;
  margin-top: 1.5rem;
  padding-bottom: 1rem;
}

.load-more-btn {
  padding: 0.75rem 2rem;
  border: 1px solid #d1d5db;
  border-radius: 9999px;
  font-size: 0.875rem;
  color: #6b7280;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.load-more-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
  background-color: #eff6ff;
}

@media (max-width: 640px) {
  .page-header,
  .search-section,
  .merchant-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .category-scroll {
    padding: 0 1rem;
  }

  .merchant-image {
    height: 150px;
  }
}
</style>
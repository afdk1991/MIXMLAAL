<template>
  <div class="product-detail-container">
    <header class="detail-header">
      <button class="back-btn" @click="goBack">
        <i class="fa fa-arrow-left"></i>
      </button>
      <h1>商品详情</h1>
    </header>

    <div class="product-content" v-if="product">
      <div class="product-image">
        <img :src="product.image" :alt="product.name">
      </div>

      <div class="product-info">
        <h2>{{ product.name }}</h2>
        <p class="description">{{ product.description }}</p>

        <div class="price-section">
          <span class="current-price">¥{{ product.price }}</span>
          <span class="original-price" v-if="product.originalPrice">
            ¥{{ product.originalPrice }}
          </span>
        </div>

        <div class="sales-info">
          <span>销量 {{ product.sales }}</span>
          <span>库存 {{ product.stock }}</span>
        </div>

        <div class="quantity-selector">
          <span>数量：</span>
          <button @click="decreaseQuantity">-</button>
          <input type="number" v-model.number="quantity" min="1" :max="product.stock">
          <button @click="increaseQuantity">+</button>
        </div>

        <div class="action-buttons">
          <button class="buy-now-btn" @click="buyNow">立即购买</button>
          <button class="add-cart-btn" @click="addToCart">加入购物车</button>
        </div>
      </div>

      <div class="product-tabs">
        <div class="tab-header">
          <span :class="{ active: activeTab === 'description' }" @click="activeTab = 'description'">
            商品详情
          </span>
          <span :class="{ active: activeTab === 'reviews' }" @click="activeTab = 'reviews'">
            评价 ({{ reviews.length }})
          </span>
        </div>
        <div class="tab-content">
          <div v-if="activeTab === 'description'" class="description-content">
            <p>{{ product.fullDescription }}</p>
          </div>
          <div v-if="activeTab === 'reviews'" class="reviews-content">
            <div v-for="review in reviews" :key="review.id" class="review-item">
              <div class="review-header">
                <span class="reviewer">{{ review.user }}</span>
                <span class="review-date">{{ review.date }}</span>
              </div>
              <p class="review-text">{{ review.content }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';

const route = useRoute();
const router = useRouter();
const cartStore = useCartStore();

const product = ref(null);
const quantity = ref(1);
const activeTab = ref('description');

const reviews = ref([
  { id: 1, user: '用户1', date: '2024-01-15', content: '商品很好，物流很快！' },
  { id: 2, user: '用户2', date: '2024-01-14', content: '性价比很高，推荐购买。' }
]);

onMounted(() => {
  const productId = route.params.id;
  loadProduct(productId);
});

function loadProduct(productId) {
  const mockProducts = {
    '1': {
      id: 1,
      name: '新鲜水果篮',
      description: '精选时令水果，精美包装',
      fullDescription: '本产品精选当季最新鲜的水果，包含苹果、橙子、葡萄等多种水果，适合送礼或自用。',
      price: 99.00,
      originalPrice: 129.00,
      sales: 2580,
      stock: 100,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruit%20basket&image_size=square'
    },
    '2': {
      id: 2,
      name: '有机蔬菜套餐',
      description: '绿色健康新鲜蔬菜',
      fullDescription: '本产品采用有机种植方式，不使用农药和化肥，保证蔬菜的新鲜和安全。',
      price: 59.90,
      originalPrice: null,
      sales: 1890,
      stock: 200,
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20vegetables&image_size=square'
    }
  };

  product.value = mockProducts[productId] || mockProducts['1'];
}

function goBack() {
  router.back();
}

function decreaseQuantity() {
  if (quantity.value > 1) {
    quantity.value--;
  }
}

function increaseQuantity() {
  if (quantity.value < product.value.stock) {
    quantity.value++;
  }
}

function addToCart() {
  cartStore.addItem({
    productId: product.value.id.toString(),
    name: product.value.name,
    price: product.value.price,
    description: product.value.description,
    quantity: quantity.value
  });
  alert('已加入购物车');
}

function buyNow() {
  addToCart();
  router.push('/shop/checkout');
}
</script>

<style scoped>
.product-detail-container {
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
  padding: 0.5rem;
}

.detail-header h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  margin-right: 2.5rem;
}

.product-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
}

.product-image {
  background: white;
  border-radius: 0.5rem;
  overflow: hidden;
}

.product-image img {
  width: 100%;
  height: auto;
}

.product-info {
  background: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.product-info h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--color-gray-500);
  margin-bottom: 1rem;
}

.price-section {
  margin-bottom: 1rem;
}

.current-price {
  font-size: 2rem;
  color: var(--color-danger);
  font-weight: 600;
  margin-right: 1rem;
}

.original-price {
  font-size: 1rem;
  color: var(--color-gray-400);
  text-decoration: line-through;
}

.sales-info {
  display: flex;
  gap: 1rem;
  color: var(--color-gray-500);
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.quantity-selector {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.quantity-selector button {
  width: 2rem;
  height: 2rem;
  border: 1px solid var(--color-gray-300);
  background: white;
  cursor: pointer;
}

.quantity-selector input {
  width: 3rem;
  text-align: center;
  border: 1px solid var(--color-gray-300);
  padding: 0.25rem;
}

.action-buttons {
  display: flex;
  gap: 1rem;
}

.buy-now-btn,
.add-cart-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 0.25rem;
  font-size: 1rem;
  cursor: pointer;
}

.buy-now-btn {
  background-color: var(--color-danger);
  color: white;
}

.add-cart-btn {
  background-color: var(--color-primary);
  color: white;
}

.product-tabs {
  background: white;
  border-radius: 0.5rem;
  margin-top: 1rem;
}

.tab-header {
  display: flex;
  border-bottom: 1px solid var(--color-gray-200);
}

.tab-header span {
  flex: 1;
  padding: 1rem;
  text-align: center;
  cursor: pointer;
}

.tab-header span.active {
  color: var(--color-primary);
  border-bottom: 2px solid var(--color-primary);
}

.tab-content {
  padding: 1rem;
}

.review-item {
  padding: 1rem 0;
  border-bottom: 1px solid var(--color-gray-100);
}

.review-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.reviewer {
  font-weight: 500;
}

.review-date {
  color: var(--color-gray-400);
  font-size: 0.875rem;
}
</style>
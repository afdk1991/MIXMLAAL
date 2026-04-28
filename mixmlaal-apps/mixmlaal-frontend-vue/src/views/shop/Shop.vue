<template>
  <div class="shop-container">
    <header class="shop-header">
      <h1>本地商城</h1>
      <div class="search-box">
        <input type="text" v-model="searchKeyword" placeholder="搜索商品" @keyup.enter="handleSearch">
        <button @click="handleSearch">搜索</button>
      </div>
    </header>

    <div class="shop-content">
      <aside class="categories-sidebar">
        <h3>商品分类</h3>
        <ul>
          <li
            v-for="category in categories"
            :key="category.id"
            :class="{ active: selectedCategory === category.id }"
            @click="selectCategory(category.id)"
          >
            {{ category.name }}
          </li>
        </ul>
      </aside>

      <main class="products-grid">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <img :src="product.image" :alt="product.name">
          <div class="product-info">
            <h4>{{ product.name }}</h4>
            <p class="description">{{ product.description }}</p>
            <div class="price-row">
              <span class="price">¥{{ product.price }}</span>
              <span class="sales">{{ product.sales }}人购买</span>
            </div>
            <button class="add-cart-btn" @click.stop="addToCart(product)">加入购物车</button>
          </div>
        </div>
      </main>
    </div>

    <div v-if="cartStore.items.length > 0" class="cart-float" @click="goToCart">
      <i class="fa fa-shopping-cart"></i>
      <span class="cart-count">{{ cartStore.totalCount }}</span>
      <span class="cart-total">¥{{ cartStore.totalPrice }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCartStore } from '@/store/cart';

const router = useRouter();
const cartStore = useCartStore();

const searchKeyword = ref('');
const selectedCategory = ref('all');

const categories = [
  { id: 'all', name: '全部' },
  { id: 'food', name: '食品' },
  { id: 'drinks', name: '饮料' },
  { id: 'fruits', name: '水果' },
  { id: 'vegetables', name: '蔬菜' },
  { id: 'electronics', name: '数码' },
  { id: 'household', name: '家居' }
];

const products = ref([
  {
    id: 1,
    name: '新鲜水果篮',
    description: '精选时令水果，精美包装',
    price: 99.00,
    sales: 2580,
    category: 'fruits',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruit%20basket&image_size=square'
  },
  {
    id: 2,
    name: '有机蔬菜套餐',
    description: '绿色健康新鲜蔬菜',
    price: 59.90,
    sales: 1890,
    category: 'vegetables',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20vegetables&image_size=square'
  },
  {
    id: 3,
    name: '智能手表',
    description: '多功能智能穿戴设备',
    price: 1299.00,
    sales: 986,
    category: 'electronics',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20watch&image_size=square'
  },
  {
    id: 4,
    name: '进口红酒',
    description: '法国原瓶进口红酒',
    price: 399.00,
    sales: 756,
    category: 'food',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=red%20wine&image_size=square'
  },
  {
    id: 5,
    name: '咖啡豆',
    description: '哥伦比亚进口咖啡豆',
    price: 89.00,
    sales: 1560,
    category: 'drinks',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coffee%20beans&image_size=square'
  },
  {
    id: 6,
    name: '家庭清洁套装',
    description: '多效清洁，省心省力',
    price: 79.90,
    sales: 3200,
    category: 'household',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cleaning%20supplies&image_size=square'
  }
]);

const filteredProducts = computed(() => {
  let result = products.value;

  if (selectedCategory.value !== 'all') {
    result = result.filter(p => p.category === selectedCategory.value);
  }

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    result = result.filter(p =>
      p.name.toLowerCase().includes(keyword) ||
      p.description.toLowerCase().includes(keyword)
    );
  }

  return result;
});

function selectCategory(categoryId) {
  selectedCategory.value = categoryId;
}

function handleSearch() {
  // Search is handled by computed property
}

function goToProduct(productId) {
  router.push(`/shop/product/${productId}`);
}

function addToCart(product) {
  cartStore.addItem({
    productId: product.id.toString(),
    name: product.name,
    price: product.price,
    description: product.description,
    quantity: 1
  });
}

function goToCart() {
  router.push('/cart');
}
</script>

<style scoped>
.shop-container {
  min-height: 100vh;
  background-color: var(--color-gray-50);
}

.shop-header {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 2rem;
  text-align: center;
}

.shop-header h1 {
  margin-bottom: 1rem;
  font-size: 2rem;
}

.search-box {
  display: flex;
  max-width: 600px;
  margin: 0 auto;
}

.search-box input {
  flex: 1;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 0.5rem 0 0 0.5rem;
  font-size: 1rem;
}

.search-box button {
  padding: 0.75rem 2rem;
  background-color: #1f2937;
  color: white;
  border: none;
  border-radius: 0 0.5rem 0.5rem 0;
  cursor: pointer;
}

.shop-content {
  display: flex;
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  gap: 2rem;
}

.categories-sidebar {
  width: 200px;
  background: white;
  border-radius: 0.5rem;
  padding: 1rem;
  height: fit-content;
}

.categories-sidebar h3 {
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.categories-sidebar ul {
  list-style: none;
}

.categories-sidebar li {
  padding: 0.75rem;
  cursor: pointer;
  border-radius: 0.25rem;
  transition: all 0.2s;
}

.categories-sidebar li:hover {
  background-color: var(--color-gray-100);
}

.categories-sidebar li.active {
  background-color: var(--color-primary);
  color: white;
}

.products-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.product-card {
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.product-card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.product-info {
  padding: 1rem;
}

.product-info h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.description {
  color: var(--color-gray-500);
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.price {
  color: var(--color-danger);
  font-size: 1.25rem;
  font-weight: 600;
}

.sales {
  color: var(--color-gray-400);
  font-size: 0.75rem;
}

.add-cart-btn {
  width: 100%;
  padding: 0.5rem;
  background-color: var(--color-primary);
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.add-cart-btn:hover {
  background-color: var(--color-primary-dark);
}

.cart-float {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 1rem 1.5rem;
  border-radius: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
  transition: all 0.3s;
}

.cart-float:hover {
  transform: scale(1.05);
}

.cart-count {
  background-color: #ef4444;
  padding: 0.125rem 0.5rem;
  border-radius: 1rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .shop-content {
    flex-direction: column;
  }

  .categories-sidebar {
    width: 100%;
  }

  .categories-sidebar ul {
    display: flex;
    overflow-x: auto;
    gap: 0.5rem;
  }

  .categories-sidebar li {
    white-space: nowrap;
  }
}
</style>
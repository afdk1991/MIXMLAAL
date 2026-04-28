<template>
  <div class="shop-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <div class="shop-info">
        <div class="shop-name">{{ shop.shop_name }}</div>
        <div class="shop-rating">
          <van-rate v-model="shop.rating" readonly size="14" />
          <span>{{ shop.rating }}分</span>
          <span>月售{{ shop.month_orders }}单</span>
        </div>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="商品" name="products"></van-tab>
      <van-tab title="评价" name="reviews"></van-tab>
      <van-tab title="商家" name="info"></van-tab>
    </van-tabs>

    <div v-if="activeTab === 'products'" class="product-list">
      <div class="category-bar">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-item"
          :class="{ active: selectedCategory === category.id }"
          @click="selectCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>

      <div class="product-grid">
        <div class="product-card" v-for="product in products" :key="product.id" @click="goToProduct(product.id)">
          <van-image width="80" height="80" fit="cover" :src="product.product_image || defaultImage" />
          <div class="product-info">
            <div class="product-name">{{ product.product_name }}</div>
            <div class="product-sales">已售{{ product.sales }}</div>
            <div class="product-bottom">
              <span class="product-price">¥{{ product.price }}</span>
              <van-icon name="shopping-cart-o" class="add-cart" @click.stop="addToCart(product)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="activeTab === 'reviews'" class="review-list">
      <van-empty description="暂无评价" />
    </div>

    <div v-if="activeTab === 'info'" class="shop-detail">
      <van-cell-group>
        <van-cell title="店铺名称" :value="shop.shop_name" />
        <van-cell title="营业时间" :value="shop.business_hours || '暂无'" />
        <van-cell title="店铺地址" :value="shop.address || '暂无'" />
        <van-cell title="联系电话" :value="shop.contact_phone || '暂无'" />
      </van-cell-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast, showCartNum } from 'vant'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const shopId = route.params.id

const shop = ref({})
const products = ref([])
const categories = ref([])
const selectedCategory = ref(null)
const activeTab = ref('products')
const defaultImage = 'https://via.placeholder.com/80'

onMounted(() => {
  getShopDetail()
  getProducts()
})

const getShopDetail = async () => {
  try {
    const response = await api.get(`/mall/shops/${shopId}`)
    shop.value = response.data.data
  } catch (error) {
    console.error('获取店铺详情失败:', error)
  }
}

const getProducts = async () => {
  try {
    const params = {
      page: 1,
      page_size: 50,
      shop_id: shopId,
      is_on_sale: true
    }
    if (selectedCategory.value) {
      params.category_id = selectedCategory.value
    }

    const response = await api.get('/mall/products', { params })
    products.value = response.data.data.list
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

const onTabChange = () => {
  if (activeTab.value === 'products') {
    getProducts()
  }
}

const selectCategory = (categoryId) => {
  selectedCategory.value = categoryId
  getProducts()
}

const goBack = () => {
  router.back()
}

const goToProduct = (id) => {
  router.push(`/mall/product/${id}`)
}

const addToCart = async (product) => {
  try {
    await api.post('/mall/cart', {
      shop_id: shopId,
      product_id: product.id,
      quantity: 1,
      price: product.price
    })
    showToast({ message: '已加入购物车', position: 'top' })
  } catch (error) {
    showToast({ message: '加入购物车失败', position: 'top' })
  }
}
</script>

<style scoped>
.shop-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
}

.back-icon {
  font-size: 20px;
}

.shop-info {
  flex: 1;
}

.shop-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.shop-rating {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 12px;
}

.product-list {
  display: flex;
  height: calc(100vh - 250px);
}

.category-bar {
  width: 80px;
  background: #f5f5f5;
  overflow-y: auto;
}

.category-item {
  padding: 15px 10px;
  font-size: 12px;
  text-align: center;
  color: #666;
}

.category-item.active {
  background: #fff;
  color: #4facfe;
  font-weight: bold;
}

.product-grid {
  flex: 1;
  padding: 10px;
  overflow-y: auto;
  background: #fff;
}

.product-card {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.product-sales {
  font-size: 12px;
  color: #999;
}

.product-bottom {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-price {
  font-size: 16px;
  font-weight: bold;
  color: #f5576c;
}

.add-cart {
  font-size: 20px;
  color: #4facfe;
}

.review-list,
.shop-detail {
  padding: 15px;
}
</style>
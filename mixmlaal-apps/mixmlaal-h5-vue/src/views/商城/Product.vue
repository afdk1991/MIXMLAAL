<template>
  <div class="product-container">
    <van-nav-bar
      title="商品详情"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />

    <div class="product-images">
      <van-swipe indicator-color="white">
        <van-swipe-item v-for="(image, index) in productImages" :key="index">
          <van-image width="100%" height="300" fit="cover" :src="image" />
        </van-swipe-item>
      </van-swipe>
    </div>

    <div class="product-info">
      <div class="price-row">
        <span class="price">¥{{ product.price }}</span>
        <span class="original-price" v-if="product.original_price">¥{{ product.original_price }}</span>
      </div>
      <div class="product-name">{{ product.product_name }}</div>
      <div class="product-tags">
        <van-tag type="success" size="small" v-if="product.is_free_shipping">包邮</van-tag>
        <van-tag type="warning" size="small" v-if="product.is_hot">热销</van-tag>
        <van-tag type="danger" size="small" v-if="product.is_new">新品</van-tag>
      </div>
    </div>

    <van-cell-group class="spec-section">
      <van-cell title="选择规格" is-link @click="showSpecPicker = true" />
    </van-cell-group>

    <van-cell-group class="shop-section">
      <van-cell>
        <template #title>
          <div class="shop-info">
            <span class="shop-name">{{ shop?.shop_name }}</span>
            <van-rate v-model="shop.rating" readonly size="12" />
          </div>
        </template>
        <template #label>
          <span>月售{{ shop?.month_orders }}单</span>
        </template>
      </van-cell>
    </van-cell-group>

    <div class="product-detail">
      <div class="section-title">商品详情</div>
      <div class="detail-content" v-html="product.details"></div>
    </div>

    <div class="bottom-bar">
      <van-icon name="shopping-cart-o" class="cart-icon" @click="goToCart" :badge="cartCount" />
      <van-button type="primary" size="small" @click="handleAddToCart">加入购物车</van-button>
      <van-button type="danger" size="small" @click="handleBuyNow">立即购买</van-button>
    </div>

    <van-sku
      v-model:show="showSpecPicker"
      :sku="skuData"
      :goods="goodsData"
      @buy-clicked="onBuyClicked"
      @add-cart-clicked="onAddCartClicked"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { showToast } from 'vant'
import api from '../../api'

const router = useRouter()
const route = useRoute()
const productId = route.params.id

const product = ref({})
const shop = ref({})
const cartCount = ref(0)
const showSpecPicker = ref(false)

const productImages = computed(() => {
  if (product.value.product_images) {
    return product.value.product_images
  }
  if (product.value.product_image) {
    return [product.value.product_image]
  }
  return ['https://via.placeholder.com/300']
})

const skuData = computed(() => ({
  tree: [],
  list: [{ id: 1, price: product.value.price * 100, stock_num: product.value.stock }],
  price: product.value.price
}))

const goodsData = computed(() => ({
  picture: productImages.value[0],
  title: product.value.product_name
}))

onMounted(() => {
  getProductDetail()
  getCartCount()
})

const getProductDetail = async () => {
  try {
    const response = await api.get(`/mall/products/${productId}`)
    product.value = response.data.data
    if (product.value.shop_id) {
      getShopDetail(product.value.shop_id)
    }
  } catch (error) {
    console.error('获取商品详情失败:', error)
  }
}

const getShopDetail = async (shopId) => {
  try {
    const response = await api.get(`/mall/shops/${shopId}`)
    shop.value = response.data.data
  } catch (error) {
    console.error('获取店铺详情失败:', error)
  }
}

const getCartCount = async () => {
  try {
    const response = await api.get('/mall/cart')
    const carts = response.data.data || []
    cartCount.value = carts.reduce((sum, item) => sum + item.quantity, 0)
  } catch (error) {
    console.error('获取购物车数量失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const goToCart = () => {
  router.push('/mall/cart')
}

const handleAddToCart = async () => {
  try {
    await api.post('/mall/cart', {
      shop_id: product.value.shop_id,
      product_id: productId,
      quantity: 1,
      price: product.value.price
    })
    cartCount.value++
    showToast({ message: '已加入购物车', position: 'top' })
  } catch (error) {
    showToast({ message: '加入购物车失败', position: 'top' })
  }
}

const handleBuyNow = () => {
  showToast({ message: '购买功能开发中', position: 'top' })
}

const onBuyClicked = () => {
  showToast({ message: '购买功能开发中', position: 'top' })
}

const onAddCartClicked = async () => {
  await handleAddToCart()
  showSpecPicker.value = false
}
</script>

<style scoped>
.product-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.product-images {
  background: #fff;
}

.product-info {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.price-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #f5576c;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.product-name {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.product-tags {
  display: flex;
  gap: 8px;
}

.spec-section,
.shop-section {
  margin-bottom: 10px;
}

.shop-info {
  display: flex;
  align-items: center;
  gap: 10px;
}

.shop-name {
  font-weight: bold;
}

.product-detail {
  background: #fff;
  padding: 15px;
}

.section-title {
  font-size: 16px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.detail-content {
  font-size: 14px;
  color: #666;
  line-height: 1.6;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background: #fff;
  display: flex;
  align-items: center;
  padding: 0 15px;
  gap: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.cart-icon {
  font-size: 24px;
  color: #666;
}

.bottom-bar .van-button {
  flex: 1;
}
</style>
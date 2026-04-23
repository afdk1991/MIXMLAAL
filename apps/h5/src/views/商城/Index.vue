<template>
  <div class="mall-container">
    <div class="header">
      <div class="search-box" @click="goToSearch">
        <van-icon name="search" />
        <span>搜索商品</span>
      </div>
    </div>

    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="推荐" name="recommend"></van-tab>
      <van-tab title="生鲜" name="fresh"></van-tab>
      <van-tab title="商超" name="supermarket"></van-tab>
      <van-tab title="餐饮" name="restaurant"></van-tab>
      <van-tab title="小吃" name="snack"></van-tab>
      <van-tab title="预制菜" name="premade"></van-tab>
    </van-tabs>

    <div class="product-list">
      <div class="product-card" v-for="product in products" :key="product.id" @click="goToProduct(product.id)">
        <div class="product-image">
          <van-image width="100%" height="150" fit="cover" :src="product.product_image || defaultImage" />
          <div class="product-tags" v-if="product.is_new || product.is_hot">
            <van-tag type="danger" size="small" v-if="product.is_new">新品</van-tag>
            <van-tag type="warning" size="small" v-if="product.is_hot">热销</van-tag>
          </div>
        </div>
        <div class="product-info">
          <div class="product-name">{{ product.product_name }}</div>
          <div class="product-shop">{{ product.shop?.shop_name }}</div>
          <div class="product-bottom">
            <span class="product-price">¥{{ product.price }}</span>
            <span class="product-sales">已售{{ product.sales }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-empty v-if="!products.length" description="暂无商品" />

    <van-tabbar v-model="activeBottomTab" @change="onBottomTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import api from '../../api'

const router = useRouter()
const activeTab = ref('recommend')
const activeBottomTab = ref(0)
const products = ref([])
const defaultImage = 'https://via.placeholder.com/150'

onMounted(() => {
  getProducts()
})

const getProducts = async () => {
  try {
    const params = {
      page: 1,
      page_size: 20,
      is_on_sale: true
    }

    if (activeTab.value === 'recommend') {
      params.is_recommend = true
    } else {
      params.shop_type = activeTab.value
    }

    const response = await api.get('/mall/products', { params })
    products.value = response.data.data.list
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

const onTabChange = () => {
  getProducts()
}

const onBottomTabChange = (index) => {
  switch (index) {
    case 0:
      break
    case 1:
      router.push('/mall/order')
      break
    case 2:
      router.push('/mall/cart')
      break
    case 3:
      router.push('/mine')
      break
  }
}

const goToSearch = () => {
  showToast({ message: '搜索功能开发中', position: 'top' })
}

const goToProduct = (id) => {
  router.push(`/mall/product/${id}`)
}
</script>

<style scoped>
.mall-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  padding: 15px;
}

.search-box {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 10px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.product-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
  padding: 10px;
}

.product-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
}

.product-image {
  position: relative;
}

.product-tags {
  position: absolute;
  top: 5px;
  left: 5px;
  display: flex;
  gap: 5px;
}

.product-info {
  padding: 10px;
}

.product-name {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-shop {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
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

.product-sales {
  font-size: 12px;
  color: #999;
}
</style>
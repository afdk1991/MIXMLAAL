<template>
  <div class="home-container">
    <div class="header">
      <div class="location" @click="selectCity">
        <van-icon name="location-o" />
        <span>{{ city }}</span>
        <van-icon name="arrow-down" />
      </div>
      <div class="search-box" @click="goToSearch">
        <van-icon name="search" />
        <span>搜索商家、商品</span>
      </div>
    </div>

    <div class="service-modules">
      <div class="module-grid">
        <div class="module-item" @click="goToModule('travel')">
          <div class="module-icon travel">
            <van-icon name="logistics" size="28" />
          </div>
          <span>出行服务</span>
        </div>
        <div class="module-item" @click="goToModule('delivery')">
          <div class="module-icon delivery">
            <van-icon name="courier-o" size="28" />
          </div>
          <span>即时配送</span>
        </div>
        <div class="module-item" @click="goToModule('mall')">
          <div class="module-icon mall">
            <van-icon name="shop-o" size="28" />
          </div>
          <span>本地商城</span>
        </div>
        <div class="module-item" @click="goToModule('content')">
          <div class="module-icon content">
            <van-icon name="description" size="28" />
          </div>
          <span>内容资讯</span>
        </div>
        <div class="module-item" @click="goToModule('video')">
          <div class="module-icon video">
            <van-icon name="video-o" size="28" />
          </div>
          <span>短视频</span>
        </div>
        <div class="module-item" @click="goToModule('social')">
          <div class="module-icon social">
            <van-icon name="friends-o" size="28" />
          </div>
          <span>本地社交</span>
        </div>
      </div>
    </div>

    <div class="quick-actions">
      <h3>快捷服务</h3>
      <div class="action-list">
        <div class="action-item" @click="goToQuickService('express')">
          <van-icon name="orders-o" />
          <span>快车</span>
        </div>
        <div class="action-item" @click="goToQuickService('delivery')">
          <van-icon name="send-gift-o" />
          <span>帮我送</span>
        </div>
        <div class="action-item" @click="goToQuickService('buy')">
          <van-icon name="shopping-cart-o" />
          <span>帮我买</span>
        </div>
        <div class="action-item" @click="goToQuickService('clean')">
          <van-icon name="shield-o" />
          <span>家政服务</span>
        </div>
      </div>
    </div>

    <div class="recommendations">
      <h3>推荐商家</h3>
      <div class="shop-list">
        <div class="shop-card" v-for="shop in shops" :key="shop.id" @click="goToShop(shop.id)">
          <div class="shop-image">
            <van-image width="80" height="80" fit="cover" :src="shop.shop_logo || defaultLogo" />
          </div>
          <div class="shop-info">
            <div class="shop-name">{{ shop.shop_name }}</div>
            <div class="shop-meta">
              <span class="rating">评分 {{ shop.rating }}</span>
              <span class="sales">月售 {{ shop.month_orders }}</span>
            </div>
            <div class="shop-tags">
              <van-tag type="success" size="small" v-if="shop.is_promotion">精选</van-tag>
              <van-tag type="primary" size="small" v-if="shop.shop_level === 'gold'">金牌</van-tag>
            </div>
          </div>
        </div>
      </div>
    </div>

    <van-tabbar v-model="activeTab" @change="onTabChange">
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
import api from '../api'

const router = useRouter()
const activeTab = ref(0)
const city = ref('北京市')
const shops = ref([])
const defaultLogo = 'https://via.placeholder.com/80'

onMounted(() => {
  getRecommendShops()
})

const getRecommendShops = async () => {
  try {
    const response = await api.get('/mall/shops', {
      params: {
        page: 1,
        page_size: 5,
        is_promotion: true
      }
    })
    shops.value = response.data.data.list
  } catch (error) {
    console.error('获取推荐商家失败:', error)
  }
}

const selectCity = () => {
  showToast({ message: '城市选择功能开发中', position: 'top' })
}

const goToSearch = () => {
  showToast({ message: '搜索功能开发中', position: 'top' })
}

const goToModule = (module) => {
  router.push(`/${module}`)
}

const goToQuickService = (type) => {
  showToast({ message: `${type}服务开发中`, position: 'top' })
}

const goToShop = (shopId) => {
  router.push(`/mall/shop/${shopId}`)
}

const onTabChange = (index) => {
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
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.location {
  display: flex;
  align-items: center;
  color: #fff;
  font-size: 14px;
  white-space: nowrap;
}

.search-box {
  flex: 1;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  padding: 8px 15px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
}

.service-modules {
  background: #fff;
  padding: 20px 10px;
  margin-bottom: 10px;
}

.module-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.module-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.module-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.module-icon.travel {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.module-icon.delivery {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.module-icon.mall {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.module-icon.content {
  background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
}

.module-icon.video {
  background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
}

.module-icon.social {
  background: linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%);
}

.module-item span {
  font-size: 12px;
  color: #333;
}

.quick-actions {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.quick-actions h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.action-list {
  display: flex;
  justify-content: space-around;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  color: #666;
  font-size: 12px;
}

.action-item .van-icon {
  font-size: 24px;
  color: #666;
}

.recommendations {
  background: #fff;
  padding: 15px;
}

.recommendations h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.shop-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.shop-card {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.shop-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.shop-name {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.shop-meta {
  display: flex;
  gap: 10px;
  font-size: 12px;
  color: #999;
}

.shop-tags {
  display: flex;
  gap: 5px;
}
</style>
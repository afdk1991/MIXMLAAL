<template>
  <div class="mine-container">
    <div class="header">
      <div class="user-info">
        <van-image round width="60" height="60" :src="userInfo.avatar || defaultAvatar" />
        <div class="user-detail">
          <div class="user-name">{{ userInfo.nickname || userInfo.username || '未登录' }}</div>
          <div class="user-phone">{{ userInfo.phone || '暂无手机号' }}</div>
        </div>
      </div>
    </div>

    <div class="wallet-section">
      <div class="wallet-item">
        <span class="wallet-value">{{ wallet.balance || 0 }}</span>
        <span class="wallet-label">余额</span>
      </div>
      <div class="wallet-item">
        <span class="wallet-value">{{ wallet.coupon || 0 }}</span>
        <span class="wallet-label">优惠券</span>
      </div>
      <div class="wallet-item">
        <span class="wallet-value">{{ wallet.points || 0 }}</span>
        <span class="wallet-label">积分</span>
      </div>
    </div>

    <van-cell-group class="order-section">
      <van-cell title="我的订单" is-link to="/mall/order" />
      <van-cell title="出行订单" is-link to="/travel/order" />
      <van-cell title="配送订单" is-link to="/delivery/order" />
    </van-cell-group>

    <van-cell-group class="service-section">
      <van-cell title="我的地址" is-link icon="location-o" />
      <van-cell title="我的收藏" is-link icon="star-o" />
      <van-cell title="浏览历史" is-link icon="clock-o" />
      <van-cell title="优惠券" is-link icon="coupon-o" />
    </van-cell-group>

    <van-cell-group class="setting-section">
      <van-cell title="设置" is-link icon="setting-o" />
      <van-cell title="帮助与反馈" is-link icon="question-o" />
      <van-cell title="关于我们" is-link icon="info-o" />
    </van-cell-group>

    <van-button block class="logout-btn" v-if="isLoggedIn" @click="handleLogout">
      退出登录
    </van-button>

    <van-tabbar v-model="activeTab" @change="onTabChange">
      <van-tabbar-item icon="home-o">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o">订单</van-tabbar-item>
      <van-tabbar-item icon="shopping-cart-o">购物车</van-tabbar-item>
      <van-tabbar-item icon="user-o">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import { useUserStore } from '../store/user'

const router = useRouter()
const userStore = useUserStore()
const activeTab = ref(3)

const userInfo = computed(() => userStore.userInfo || {})
const isLoggedIn = computed(() => userStore.isLoggedIn)
const defaultAvatar = 'https://via.placeholder.com/60'

const wallet = ref({
  balance: 0,
  coupon: 0,
  points: 0
})

onMounted(() => {
  if (userStore.isLoggedIn) {
    getUserInfo()
    getWalletInfo()
  }
})

const getUserInfo = async () => {
  try {
    await userStore.getCurrentUser()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
}

const getWalletInfo = async () => {
  wallet.value = {
    balance: 100.00,
    coupon: 5,
    points: 500
  }
}

const onTabChange = (index) => {
  switch (index) {
    case 0:
      router.push('/home')
      break
    case 1:
      router.push('/mall/order')
      break
    case 2:
      router.push('/mall/cart')
      break
    case 3:
      break
  }
}

const handleLogout = async () => {
  try {
    await showConfirmDialog({
      title: '确认退出',
      message: '确定要退出登录吗？'
    })
    await userStore.logout()
    showToast({ message: '已退出登录', position: 'top' })
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败:', error)
    }
  }
}
</script>

<style scoped>
.mine-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px 15px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
}

.user-detail {
  flex: 1;
}

.user-name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.user-phone {
  font-size: 12px;
  opacity: 0.8;
}

.wallet-section {
  display: flex;
  background: #fff;
  padding: 15px 0;
  margin-bottom: 10px;
}

.wallet-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.wallet-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.wallet-label {
  font-size: 12px;
  color: #999;
}

.order-section,
.service-section,
.setting-section {
  margin-bottom: 10px;
}

.logout-btn {
  margin: 20px 15px;
  border-radius: 8px;
  background: #fff;
  color: #666;
  border: none;
}
</style>
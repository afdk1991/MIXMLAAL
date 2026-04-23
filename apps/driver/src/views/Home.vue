<template>
  <div class="home-container">
    <div class="header">
      <div class="status-section">
        <div class="status-info">
          <span class="status-text">{{ onlineStatus ? '在线' : '离线' }}</span>
          <span class="order-status">{{ orderStatusText }}</span>
        </div>
        <van-switch v-model="onlineStatus" @change="toggleOnlineStatus" size="28" />
      </div>
      <div class="location-section">
        <van-icon name="location-o" />
        <span class="location-text">{{ currentLocation }}</span>
      </div>
    </div>

    <div class="stats-section">
      <div class="stat-item">
        <span class="stat-value">{{ todayOrders }}</span>
        <span class="stat-label">今日订单</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">¥{{ todayIncome }}</span>
        <span class="stat-label">今日收入</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">{{ totalOrders }}</span>
        <span class="stat-label">总订单</span>
      </div>
    </div>

    <div class="order-section">
      <div class="section-header">
        <span>最近订单</span>
        <router-link to="/orders" class="view-all">查看全部</router-link>
      </div>
      <div class="order-list">
        <div class="order-card" v-for="order in recentOrders" :key="order.id" @click="goToOrderDetail(order.id)">
          <div class="order-header">
            <span class="order-type">{{ order.order_type }}</span>
            <span class="order-status" :class="order.status">{{ order.status_text }}</span>
          </div>
          <div class="order-info">
            <div class="order-route">
              <van-icon name="location-o" class="route-icon" />
              <span class="route-text">{{ order.route }}</span>
            </div>
            <div class="order-time">
              <van-icon name="clock-o" />
              <span>{{ order.created_at }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="order-price">¥{{ order.price }}</span>
          </div>
        </div>
        <van-empty v-if="!recentOrders.length" description="暂无订单" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDriverStore } from '../store/driver'
import { showToast } from 'vant'

const router = useRouter()
const driverStore = useDriverStore()

const onlineStatus = ref(false)
const currentLocation = ref('北京市朝阳区')
const todayOrders = ref(5)
const todayIncome = ref(280.50)
const totalOrders = ref(1250)

const recentOrders = ref([
  {
    id: 1,
    order_type: '出行订单',
    status: 'completed',
    status_text: '已完成',
    route: '北京市朝阳区建国路 → 北京市朝阳区三里屯',
    created_at: '2024-01-01 10:30',
    price: 88.00
  },
  {
    id: 2,
    order_type: '配送订单',
    status: 'completed',
    status_text: '已完成',
    route: '北京市朝阳区望京SOHO → 北京市朝阳区国贸',
    created_at: '2024-01-01 09:15',
    price: 15.00
  }
])

const orderStatusText = computed(() => {
  if (!onlineStatus.value) return '离线'
  return '空闲中'
})

onMounted(() => {
  getDriverInfo()
})

const getDriverInfo = async () => {
  try {
    await driverStore.getCurrentDriver()
    onlineStatus.value = driverStore.onlineStatus
  } catch (error) {
    console.error('获取司机信息失败:', error)
  }
}

const toggleOnlineStatus = async (status) => {
  try {
    await driverStore.toggleOnlineStatus(status)
    showToast({ message: status ? '已上线' : '已下线', position: 'top' })
  } catch (error) {
    onlineStatus.value = !status
    showToast({ message: '切换状态失败', position: 'top' })
  }
}

const goToOrderDetail = (id) => {
  router.push(`/order/detail/${id}`)
}
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 20px 15px;
  color: #fff;
}

.status-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.status-info {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-text {
  font-size: 18px;
  font-weight: bold;
}

.order-status {
  font-size: 12px;
  opacity: 0.9;
}

.location-section {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.stats-section {
  display: flex;
  background: #fff;
  padding: 15px 0;
  margin: 10px 0;
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.order-section {
  background: #fff;
  padding: 15px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.view-all {
  font-size: 12px;
  color: #f5576c;
  text-decoration: none;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-card {
  padding: 15px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-type {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.order-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.order-info {
  margin-bottom: 10px;
}

.order-route {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
}

.route-icon {
  margin-top: 2px;
  color: #f5576c;
}

.route-text {
  flex: 1;
  line-height: 1.4;
}

.order-time {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: #999;
}

.order-footer {
  display: flex;
  justify-content: flex-end;
}

.order-price {
  font-size: 16px;
  font-weight: bold;
  color: #f5576c;
}
</style>
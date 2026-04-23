<template>
  <div class="order-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <h2>我的订单</h2>
    </div>

    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部" name="all"></van-tab>
      <van-tab title="进行中" name="ongoing"></van-tab>
      <van-tab title="已完成" name="completed"></van-tab>
    </van-tabs>

    <div class="order-list">
      <div class="order-card" v-for="order in orders" :key="order.id" @click="goToDetail(order.id)">
        <div class="order-header">
          <span class="order-no">{{ order.order_no }}</span>
          <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-route">
          <div class="route-item">
            <div class="dot start"></div>
            <span>{{ order.start_location?.address }}</span>
          </div>
          <div class="route-item">
            <div class="dot end"></div>
            <span>{{ order.end_location?.address }}</span>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-time">{{ formatTime(order.created_at) }}</span>
          <span class="order-price">¥{{ order.actual_price }}</span>
        </div>
      </div>

      <van-empty v-if="!orders.length" description="暂无订单" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()
const activeTab = ref('all')
const orders = ref([])

onMounted(() => {
  getOrders()
})

const getOrders = async () => {
  try {
    const params = { page: 1, page_size: 20 }
    if (activeTab.value === 'ongoing') {
      params.status = 'matching,accepted,arrived,started'
    } else if (activeTab.value === 'completed') {
      params.status = 'completed'
    }

    const response = await api.get('/travel/orders', { params })
    orders.value = response.data.data.list
  } catch (error) {
    console.error('获取订单列表失败:', error)
  }
}

const onTabChange = () => {
  getOrders()
}

const goBack = () => {
  router.back()
}

const goToDetail = (id) => {
  router.push(`/travel/order/${id}`)
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    matching: '匹配中',
    accepted: '已接单',
    arrived: '已到达',
    started: '行程中',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款'
  }
  return statusMap[status] || status
}

const formatTime = (time) => {
  if (!time) return ''
  const date = new Date(time)
  return `${date.getMonth()+1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<style scoped>
.order-container {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
}

.back-icon {
  font-size: 20px;
}

.header h2 {
  font-size: 18px;
  font-weight: normal;
}

.order-list {
  padding: 15px;
}

.order-card {
  background: #fff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 10px;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.order-no {
  font-size: 12px;
  color: #999;
}

.order-status {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
}

.order-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.order-status.matching {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.completed {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.cancelled {
  background: #f5f5f5;
  color: #999;
}

.order-route {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 10px;
}

.route-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.start {
  background: #667eea;
}

.dot.end {
  background: #f5576c;
}

.route-item span {
  font-size: 14px;
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.order-time {
  font-size: 12px;
  color: #999;
}

.order-price {
  font-size: 16px;
  font-weight: bold;
  color: #f5576c;
}
</style>
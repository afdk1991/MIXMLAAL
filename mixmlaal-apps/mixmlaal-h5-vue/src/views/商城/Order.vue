<template>
  <div class="order-container">
    <van-nav-bar
      title="我的订单"
      left-text="返回"
      left-arrow
      @click-left="goBack"
    />

    <van-tabs v-model:active="activeTab" sticky @change="onTabChange">
      <van-tab title="全部" name="all"></van-tab>
      <van-tab title="待支付" name="pending"></van-tab>
      <van-tab title="待发货" name="paid"></van-tab>
      <van-tab title="待收货" name="shipped"></van-tab>
      <van-tab title="已完成" name="completed"></van-tab>
    </van-tabs>

    <div class="order-list">
      <div class="order-card" v-for="order in orders" :key="order.id" @click="goToDetail(order.id)">
        <div class="order-header">
          <span class="shop-name">{{ order.shop?.shop_name }}</span>
          <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
        </div>
        <div class="order-products">
          <div class="product-item" v-for="(item, index) in order.items" :key="index">
            <van-image width="50" height="50" fit="cover" :src="item.product_image || defaultImage" />
            <div class="product-info">
              <div class="product-name">{{ item.product_name }}</div>
              <div class="product-price">¥{{ item.price }} x {{ item.quantity }}</div>
            </div>
          </div>
        </div>
        <div class="order-footer">
          <span class="order-time">{{ formatTime(order.created_at) }}</span>
          <span class="order-total">合计: ¥{{ order.actual_amount }}</span>
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
const defaultImage = 'https://via.placeholder.com/50'

onMounted(() => {
  getOrders()
})

const getOrders = async () => {
  try {
    const params = { page: 1, page_size: 20 }
    if (activeTab.value !== 'all') {
      params.status = activeTab.value
    }

    const response = await api.get('/mall/orders', { params })
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
  router.push(`/mall/order/${id}`)
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待支付',
    paid: '待发货',
    shipped: '待收货',
    delivered: '待收货',
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

.order-list {
  padding: 10px;
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

.shop-name {
  font-weight: bold;
  font-size: 14px;
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

.order-status.paid {
  background: #e6f7ff;
  color: #1890ff;
}

.order-status.shipped,
.order-status.delivered {
  background: #f6ffed;
  color: #52c41a;
}

.order-status.completed {
  background: #f5f5f5;
  color: #999;
}

.order-products {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 10px;
}

.product-item {
  display: flex;
  gap: 10px;
}

.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.product-name {
  font-size: 14px;
  color: #333;
}

.product-price {
  font-size: 12px;
  color: #999;
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

.order-total {
  font-size: 14px;
  font-weight: bold;
  color: #f5576c;
}
</style>
<template>
  <div class="orders-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <h2>我的订单</h2>
    </div>

    <van-tabs v-model:active="activeTab" @change="onTabChange">
      <van-tab title="全部" name="all"></van-tab>
      <van-tab title="进行中" name="ongoing"></van-tab>
      <van-tab title="已完成" name="completed"></van-tab>
      <van-tab title="已取消" name="cancelled"></van-tab>
    </van-tabs>

    <div class="order-list">
      <div class="order-card" v-for="order in orders" :key="order.id" @click="goToOrderDetail(order.id)">
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
          <van-button 
            v-if="order.status === 'pending'" 
            type="primary" 
            size="small" 
            @click.stop="acceptOrder(order.id)"
          >
            接单
          </van-button>
        </div>
      </div>

      <van-empty v-if="!orders.length" description="暂无订单" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showConfirmDialog } from 'vant'
import api from '../../api'

const router = useRouter()
const activeTab = ref('all')

const orders = ref([
  {
    id: 1,
    order_type: '出行订单',
    status: 'pending',
    status_text: '待接单',
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

onMounted(() => {
  getOrders()
})

const getOrders = async () => {
  try {
    // 模拟数据
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

const goToOrderDetail = (id) => {
  router.push(`/order/detail/${id}`)
}

const acceptOrder = async (id) => {
  try {
    await showConfirmDialog({
      title: '确认接单',
      message: '确定要接取该订单吗？'
    })
    const order = orders.value.find(o => o.id === id)
    if (order) {
      order.status = 'accepted'
      order.status_text = '已接单'
    }
    showToast({ message: '接单成功', position: 'top' })
  } catch (error) {
    if (error !== 'cancel') {
      showToast({ message: '接单失败', position: 'top' })
    }
  }
}
</script>

<style scoped>
.orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

.order-status.pending {
  background: #fff7e6;
  color: #fa8c16;
}

.order-status.accepted {
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
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f5f5f5;
}

.order-price {
  font-size: 16px;
  font-weight: bold;
  color: #f5576c;
}
</style>
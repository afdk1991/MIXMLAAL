<template>
  <div class="order-detail">
    <van-nav-bar title="订单详情" left-text="返回" left-arrow @click-left="goBack" />
    
    <div class="order-info">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>订单信息</span>
            <van-tag :color="orderStatusColor">{{ orderStatusText }}</van-tag>
          </div>
        </template>
        <van-cell-group>
          <van-cell title="订单编号" :value="order.orderNo" />
          <van-cell title="下单时间" :value="order.createdAt" />
          <van-cell title="订单类型" :value="orderTypeText" />
          <van-cell title="订单金额" :value="'¥' + order.amount.toFixed(2)" />
          <van-cell title="佣金金额" :value="'¥' + order.commission.toFixed(2)" />
        </van-cell-group>
      </van-card>
    </div>
    
    <div class="user-info">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>用户信息</span>
          </div>
        </template>
        <van-cell-group>
          <van-cell title="用户姓名" :value="order.userName" />
          <van-cell title="联系电话" :value="order.userPhone" />
        </van-cell-group>
      </van-card>
    </div>
    
    <div class="order-address" v-if="order.orderType === 'delivery' || order.orderType === 'travel'">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>地址信息</span>
          </div>
        </template>
        <van-cell-group v-if="order.orderType === 'delivery'">
          <van-cell title="取货地址" :value="order.pickupAddress" />
          <van-cell title="收货地址" :value="order.deliveryAddress" />
        </van-cell-group>
        <van-cell-group v-else-if="order.orderType === 'travel'">
          <van-cell title="起点" :value="order.startAddress" />
          <van-cell title="终点" :value="order.endAddress" />
        </van-cell-group>
      </van-card>
    </div>
    
    <div class="order-products" v-if="order.orderType === 'delivery' && order.products && order.products.length > 0">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>商品信息</span>
          </div>
        </template>
        <div class="products-list">
          <div class="product-item" v-for="(product, index) in order.products" :key="index">
            <div class="product-info">
              <div class="product-name">{{ product.name }}</div>
              <div class="product-price">¥{{ product.price.toFixed(2) }} x {{ product.quantity }}</div>
            </div>
          </div>
        </div>
      </van-card>
    </div>
    
    <div class="order-tracking">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>订单跟踪</span>
          </div>
        </template>
        <div class="tracking-list">
          <div class="tracking-item" v-for="(track, index) in order.tracking" :key="index" :class="{ active: index === 0 }">
            <div class="tracking-dot"></div>
            <div class="tracking-content">
              <div class="tracking-time">{{ track.time }}</div>
              <div class="tracking-status">{{ track.status }}</div>
            </div>
          </div>
        </div>
      </van-card>
    </div>
    
    <div class="order-actions">
      <div class="action-buttons">
        <van-button type="default" @click="contactUser" v-if="order.status !== 'completed' && order.status !== 'cancelled'">
          联系用户
        </van-button>
        <van-button type="primary" @click="processOrder" v-if="order.status === 'pending'">
          接单
        </van-button>
        <van-button type="primary" @click="processOrder" v-else-if="order.status === 'accepted'">
          开始配送
        </van-button>
        <van-button type="primary" @click="processOrder" v-else-if="order.status === 'in_progress'">
          完成订单
        </van-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'OrderDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const order = ref({
      id: route.params.id,
      orderNo: 'D202604230001',
      orderType: 'delivery',
      status: 'in_progress',
      amount: 29.99,
      commission: 5.00,
      userName: '张三',
      userPhone: '13800138000',
      pickupAddress: '北京市朝阳区建国路88号',
      deliveryAddress: '北京市海淀区中关村大街1号',
      createdAt: '2026-04-23 10:00:00',
      products: [
        { name: '商品A', price: 19.99, quantity: 1 },
        { name: '商品B', price: 10.00, quantity: 1 }
      ],
      tracking: [
        { time: '2026-04-23 10:00:00', status: '订单创建' },
        { time: '2026-04-23 10:05:00', status: '订单已接单' },
        { time: '2026-04-23 10:10:00', status: '开始配送' },
        { time: '2026-04-23 10:30:00', status: '配送中' }
      ]
    })
    
    const orderTypeText = computed(() => {
      const typeMap = {
        delivery: '配送订单',
        travel: '出行订单'
      }
      return typeMap[order.value.orderType] || order.value.orderType
    })
    
    const orderStatusText = computed(() => {
      const statusMap = {
        pending: '待接单',
        accepted: '已接单',
        in_progress: '进行中',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[order.value.status] || order.value.status
    })
    
    const orderStatusColor = computed(() => {
      const colorMap = {
        pending: '#ff9800',
        accepted: '#2196f3',
        in_progress: '#2196f3',
        completed: '#4caf50',
        cancelled: '#f44336'
      }
      return colorMap[order.value.status] || '#9e9e9e'
    })
    
    const goBack = () => {
      router.back()
    }
    
    const contactUser = () => {
      // 联系用户
      console.log('联系用户:', order.value.userPhone)
    }
    
    const processOrder = () => {
      // 处理订单
      console.log('处理订单:', order.value.id, order.value.status)
      
      // 模拟订单状态更新
      if (order.value.status === 'pending') {
        order.value.status = 'accepted'
        order.value.tracking.unshift({ time: new Date().toLocaleString(), status: '订单已接单' })
      } else if (order.value.status === 'accepted') {
        order.value.status = 'in_progress'
        order.value.tracking.unshift({ time: new Date().toLocaleString(), status: '开始配送' })
      } else if (order.value.status === 'in_progress') {
        order.value.status = 'completed'
        order.value.tracking.unshift({ time: new Date().toLocaleString(), status: '订单已完成' })
      }
    }
    
    onMounted(() => {
      // 实际项目中这里应该根据订单ID调用API获取订单详情
      console.log('获取订单详情:', route.params.id)
    })
    
    return {
      order,
      orderTypeText,
      orderStatusText,
      orderStatusColor,
      goBack,
      contactUser,
      processOrder
    }
  }
}
</script>

<style scoped>
.order-detail {
  padding-bottom: 80px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info,
.user-info,
.order-address,
.order-products,
.order-tracking {
  margin-bottom: 10px;
}

.products-list {
  padding: 10px;
}

.product-item {
  padding: 10px 0;
  border-bottom: 1px solid #f0f0f0;
}

.product-item:last-child {
  border-bottom: none;
}

.product-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-name {
  flex: 1;
}

.product-price {
  font-weight: bold;
}

.tracking-list {
  padding: 10px;
}

.tracking-item {
  display: flex;
  position: relative;
  padding-left: 20px;
  margin-bottom: 20px;
}

.tracking-item::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 0;
  bottom: -20px;
  width: 1px;
  background-color: #e0e0e0;
}

.tracking-item:last-child::before {
  display: none;
}

.tracking-dot {
  position: absolute;
  left: 0;
  top: 5px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #e0e0e0;
  z-index: 1;
}

.tracking-item.active .tracking-dot {
  background-color: #409eff;
}

.tracking-content {
  flex: 1;
}

.tracking-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}

.tracking-status {
  font-size: 14px;
  color: #333;
}

.order-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: #fff;
  padding: 10px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.action-buttons van-button {
  flex: 1;
}
</style>
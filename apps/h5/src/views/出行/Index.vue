<template>
  <div class="travel-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <h2>出行服务</h2>
    </div>

    <div class="service-types">
      <div
        v-for="type in serviceTypes"
        :key="type.value"
        class="service-type"
        :class="{ active: selectedType === type.value }"
        @click="selectType(type.value)"
      >
        <van-icon :name="type.icon" size="24" />
        <span>{{ type.label }}</span>
      </div>
    </div>

    <div class="location-inputs">
      <div class="input-item start">
        <div class="dot start-dot"></div>
        <van-field
          v-model="startAddress"
          placeholder="出发地"
          @click="selectLocation('start')"
          readonly
        />
      </div>
      <div class="input-item end">
        <div class="dot end-dot"></div>
        <van-field
          v-model="endAddress"
          placeholder="目的地"
          @click="selectLocation('end')"
          readonly
        />
      </div>
    </div>

    <div class="time-selection">
      <van-cell title="出发时间" :value="selectedTime" @click="showTimePicker = true" is-link />
    </div>

    <div class="estimate-result" v-if="estimatePrice">
      <div class="price-info">
        <span class="price">¥{{ estimatePrice.total_price }}</span>
        <span class="tips" v-if="estimatePrice.tips">含小费 ¥{{ estimatePrice.tips }}</span>
      </div>
      <div class="detail-info">
        <span>约{{ estimatePrice.distance }}公里</span>
        <span>约{{ estimatePrice.duration }}分钟</span>
      </div>
    </div>

    <van-button type="primary" block class="submit-btn" @click="createOrder" :disabled="!canSubmit">
      立即叫车
    </van-button>

    <div class="recent-orders" v-if="recentOrders.length">
      <h3>最近行程</h3>
      <div class="order-list">
        <div class="order-item" v-for="order in recentOrders" :key="order.id" @click="selectRecentOrder(order)">
          <div class="order-route">
            <span>{{ order.start_location.address }}</span>
            <van-icon name="arrow" />
            <span>{{ order.end_location.address }}</span>
          </div>
          <div class="order-info">
            <span>{{ order.order_type_text }}</span>
            <span>{{ order.created_at }}</span>
          </div>
        </div>
      </div>
    </div>

    <van-time-picker
      v-model:show="showTimePicker"
      mode="datetime"
      @confirm="onTimeConfirm"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import api from '../../api'

const router = useRouter()

const serviceTypes = [
  { label: '快车', value: 'express', icon: 'logistics' },
  { label: '专车', value: 'comfort', icon: 'car' },
  { label: '豪轿', value: 'premium', icon: 'vip-card' },
  { label: '拼车', value: 'carpool', icon: 'friends' },
  { label: '代驾', value: 'chauffeur', icon: 'courier' },
  { label: '租车', value: 'rental', icon: 'shop' }
]

const selectedType = ref('express')
const startAddress = ref('')
const endAddress = ref('')
const startLocation = ref(null)
const endLocation = ref(null)
const selectedTime = ref('现在出发')
const showTimePicker = ref(false)
const estimatePrice = ref(null)
const recentOrders = ref([])

const canSubmit = computed(() => {
  return startAddress.value && endAddress.value
})

onMounted(() => {
  getRecentOrders()
})

const getRecentOrders = async () => {
  try {
    const response = await api.get('/travel/orders', {
      params: { page: 1, page_size: 5 }
    })
    recentOrders.value = response.data.data.list.map(order => ({
      ...order,
      order_type_text: serviceTypes.find(t => t.value === order.order_type)?.label || order.order_type
    }))
  } catch (error) {
    console.error('获取最近行程失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const selectType = (type) => {
  selectedType.value = type
  calculateEstimatePrice()
}

const selectLocation = (type) => {
  showToast({ message: '地图选择功能开发中', position: 'top' })
}

const onTimeConfirm = (value) => {
  selectedTime.value = value.selectedValues.join(':')
  showTimePicker.value = false
}

const selectRecentOrder = (order) => {
  startAddress.value = order.start_location.address
  endAddress.value = order.end_location.address
  startLocation.value = order.start_location
  endLocation.value = order.end_location
  calculateEstimatePrice()
}

const calculateEstimatePrice = async () => {
  if (!startLocation.value || !endLocation.value) {
    estimatePrice.value = null
    return
  }

  try {
    const distance = calculateDistance(startLocation.value, endLocation.value)
    const duration = Math.ceil(distance * 3)

    const response = await api.post('/travel/estimate', {
      order_type: selectedType.value,
      distance,
      duration
    })

    estimatePrice.value = {
      ...response.data.data,
      distance,
      duration
    }
  } catch (error) {
    console.error('估算价格失败:', error)
  }
}

const calculateDistance = (start, end) => {
  const R = 6371
  const dLat = (end.lat - start.lat) * Math.PI / 180
  const dLon = (end.lng - start.lng) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(start.lat * Math.PI / 180) * Math.cos(end.lat * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

const createOrder = async () => {
  if (!canSubmit.value) {
    showToast({ message: '请选择出发地和目的地', position: 'top' })
    return
  }

  try {
    const response = await api.post('/travel/orders', {
      order_type: selectedType.value,
      start_location: startLocation.value,
      end_location: endLocation.value
    })

    showToast({ message: '下单成功', position: 'top' })
    router.push('/travel/order')
  } catch (error) {
    showToast({ message: error.message || '下单失败', position: 'top' })
  }
}
</script>

<style scoped>
.travel-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
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

.service-types {
  display: flex;
  gap: 10px;
  padding: 15px;
  background: #fff;
  overflow-x: auto;
}

.service-type {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
  padding: 10px 15px;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  flex-shrink: 0;
}

.service-type.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.location-inputs {
  background: #fff;
  padding: 0 15px;
  margin-bottom: 10px;
}

.input-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.start-dot {
  background-color: #667eea;
}

.end-dot {
  background-color: #f5576c;
}

.time-selection {
  background: #fff;
  margin-bottom: 10px;
}

.estimate-result {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.price-info {
  display: flex;
  align-items: baseline;
  gap: 10px;
  margin-bottom: 10px;
}

.price {
  font-size: 28px;
  font-weight: bold;
  color: #f5576c;
}

.tips {
  font-size: 12px;
  color: #999;
}

.detail-info {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.submit-btn {
  margin: 15px;
  border-radius: 25px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border: none;
}

.recent-orders {
  background: #fff;
  padding: 15px;
}

.recent-orders h3 {
  font-size: 16px;
  margin-bottom: 15px;
  color: #333;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.order-item {
  padding: 10px;
  background: #f9f9f9;
  border-radius: 8px;
}

.order-route {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 5px;
  font-size: 14px;
  color: #333;
}

.order-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}
</style>
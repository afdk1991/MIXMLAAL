<template>
  <div class="delivery-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <h2>即时配送</h2>
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

    <div class="address-section">
      <div class="address-item pickup">
        <div class="label">取货地址</div>
        <van-field
          v-model="pickupAddress"
          placeholder="请输入取货地址"
          @click="selectAddress('pickup')"
          readonly
        />
        <van-field
          v-model="pickupContact"
          placeholder="联系人"
        />
        <van-field
          v-model="pickupPhone"
          placeholder="联系电话"
          type="tel"
        />
      </div>

      <div class="divider">
        <van-icon name="arrow-down" />
      </div>

      <div class="address-item delivery">
        <div class="label">送货地址</div>
        <van-field
          v-model="deliveryAddress"
          placeholder="请输入送货地址"
          @click="selectAddress('delivery')"
          readonly
        />
        <van-field
          v-model="deliveryContact"
          placeholder="联系人"
        />
        <van-field
          v-model="deliveryPhone"
          placeholder="联系电话"
          type="tel"
        />
      </div>
    </div>

    <div class="options-section">
      <van-cell-group>
        <van-cell title="帮我买" is-link @click="showBuyOptions = true" />
        <van-cell title="加急配送" is-link>
          <template #right-icon>
            <van-switch v-model="isUrgent" size="20" />
          </template>
        </van-cell>
        <van-cell title="冷链配送" is-link>
          <template #right-icon>
            <van-switch v-model="isColdChain" size="20" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>

    <div class="estimate-result" v-if="estimatePrice">
      <div class="price-info">
        <span class="price">¥{{ estimatePrice.total_price }}</span>
        <span class="tips" v-if="isUrgent">加急费 ¥{{ estimatePrice.urgent_fee }}</span>
      </div>
      <div class="detail-info">
        <span>约{{ estimatePrice.distance }}公里</span>
        <span>约{{ estimatePrice.duration }}分钟</span>
      </div>
    </div>

    <van-button type="primary" block class="submit-btn" @click="createOrder" :disabled="!canSubmit">
      立即下单
    </van-button>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { showToast } from 'vant'
import api from '../../api'

const router = useRouter()

const serviceTypes = [
  { label: '帮我送', value: 'send', icon: 'send-gift-o' },
  { label: '帮我买', value: 'buy', icon: 'shopping-cart-o' },
  { label: '代取', value: 'pickup', icon: 'logistics' },
  { label: '帮我办', value: 'errand', icon: 'todo-list-o' }
]

const selectedType = ref('send')
const pickupAddress = ref('')
const pickupContact = ref('')
const pickupPhone = ref('')
const deliveryAddress = ref('')
const deliveryContact = ref('')
const deliveryPhone = ref('')
const isUrgent = ref(false)
const isColdChain = ref(false)
const showBuyOptions = ref(false)
const estimatePrice = ref(null)

const canSubmit = computed(() => {
  return pickupAddress.value && deliveryAddress.value &&
         pickupContact.value && deliveryContact.value &&
         pickupPhone.value && deliveryPhone.value
})

const goBack = () => {
  router.back()
}

const selectType = (type) => {
  selectedType.value = type
}

const selectAddress = (type) => {
  showToast({ message: '地图选择功能开发中', position: 'top' })
}

const createOrder = async () => {
  if (!canSubmit.value) {
    showToast({ message: '请填写完整信息', position: 'top' })
    return
  }

  try {
    const response = await api.post('/delivery/orders', {
      delivery_type: selectedType.value,
      pickup_address: {
        address: pickupAddress.value,
        contact_name: pickupContact.value,
        contact_phone: pickupPhone.value
      },
      delivery_address: {
        address: deliveryAddress.value,
        contact_name: deliveryContact.value,
        contact_phone: deliveryPhone.value
      },
      is_urgent: isUrgent.value,
      is_cold_chain: isColdChain.value
    })

    showToast({ message: '下单成功', position: 'top' })
    router.push('/delivery/order')
  } catch (error) {
    showToast({ message: error.message || '下单失败', position: 'top' })
  }
}
</script>

<style scoped>
.delivery-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 80px;
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: #fff;
}

.address-section {
  background: #fff;
  padding: 15px;
  margin-bottom: 10px;
}

.address-item {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.label {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.divider {
  display: flex;
  justify-content: center;
  padding: 10px 0;
  color: #999;
}

.options-section {
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
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
}
</style>
<template>
  <div class="mine">
    <van-nav-bar title="个人中心" />
    
    <div class="user-info">
      <div class="avatar">
        <img :src="driver.avatar || 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20driver%20avatar&image_size=square'" alt="头像" />
      </div>
      <div class="info">
        <div class="name">{{ driver.name }}</div>
        <div class="id">司机ID: {{ driver.id }}</div>
        <div class="rating">
          <van-rate v-model="driver.rating" disabled />
          <span class="rating-text">{{ driver.rating }}分</span>
        </div>
      </div>
    </div>
    
    <div class="menu-list">
      <van-cell-group>
        <van-cell title="个人信息" is-link @click="goToInfo">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell title="车辆管理" is-link @click="goToVehicle">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell title="我的钱包" is-link @click="goToFinance">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell title="订单记录" is-link @click="goToOrders">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell title="我的评价" is-link @click="goToReviews">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
        <van-cell title="设置" is-link @click="goToSettings">
          <template #right-icon>
            <van-icon name="arrow" />
          </template>
        </van-cell>
      </van-cell-group>
    </div>
    
    <div class="action-buttons">
      <van-button type="danger" block @click="logout">退出登录</van-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useStore } from 'pinia'

export default {
  name: 'Mine',
  setup() {
    const router = useRouter()
    const store = useStore()
    
    const driver = ref({
      id: 'D123456',
      name: '王师傅',
      avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20driver%20avatar&image_size=square',
      rating: 4.8
    })
    
    const goToInfo = () => {
      router.push('/mine/info')
    }
    
    const goToVehicle = () => {
      router.push('/mine/vehicle')
    }
    
    const goToFinance = () => {
      router.push('/finance')
    }
    
    const goToOrders = () => {
      router.push('/orders')
    }
    
    const goToReviews = () => {
      // 跳转到评价页面
      console.log('跳转到评价页面')
    }
    
    const goToSettings = () => {
      // 跳转到设置页面
      console.log('跳转到设置页面')
    }
    
    const logout = () => {
      // 退出登录
      store.dispatch('driver/logout')
      router.push('/login')
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取司机信息
    })
    
    return {
      driver,
      goToInfo,
      goToVehicle,
      goToFinance,
      goToOrders,
      goToReviews,
      goToSettings,
      logout
    }
  }
}
</script>

<style scoped>
.mine {
  padding-bottom: 20px;
}

.user-info {
  display: flex;
  align-items: center;
  padding: 20px;
  background-color: #409eff;
  color: #fff;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 20px;
  border: 3px solid rgba(255, 255, 255, 0.5);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info {
  flex: 1;
}

.name {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 5px;
}

.id {
  font-size: 14px;
  opacity: 0.8;
  margin-bottom: 10px;
}

.rating {
  display: flex;
  align-items: center;
}

.rating-text {
  margin-left: 10px;
  font-size: 14px;
}

.menu-list {
  margin-top: 10px;
}

.action-buttons {
  margin-top: 30px;
  padding: 0 20px;
}

.action-buttons van-button {
  height: 44px;
  font-size: 16px;
}
</style>
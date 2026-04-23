<template>
  <div class="driver-app">
    <router-view />
    <van-tabbar v-model="activeTab" @change="onTabChange" v-if="showTabbar">
      <van-tabbar-item icon="home-o" to="/home">首页</van-tabbar-item>
      <van-tabbar-item icon="orders-o" to="/orders">订单</van-tabbar-item>
      <van-tabbar-item icon="wallet-o" to="/finance">财务</van-tabbar-item>
      <van-tabbar-item icon="user-o" to="/mine">我的</van-tabbar-item>
    </van-tabbar>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useDriverStore } from './store/driver'

const router = useRouter()
const route = useRoute()
const driverStore = useDriverStore()

const activeTab = ref(0)
const showTabbar = computed(() => {
  const hideRoutes = ['/login', '/register', '/order/detail']
  return !hideRoutes.includes(route.path)
})

onMounted(() => {
  if (!driverStore.token) {
    router.push('/login')
  }
})

const onTabChange = (index) => {
  activeTab.value = index
}
</script>

<style scoped>
.driver-app {
  min-height: 100vh;
  background-color: #f5f5f5;
}
</style>
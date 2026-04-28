<template>
  <div class="merchant-app">
    <el-container style="height: 100vh; overflow: hidden;">
      <el-header height="60px" class="header">
        <div class="logo">
          <h1>商家后台管理系统</h1>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :src="userInfo.avatar || defaultAvatar" size="small"></el-avatar>
              <span>{{ userInfo.nickname || '商家' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="goToProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside width="200px" class="sidebar">
          <el-menu
            :default-active="activeMenu"
            class="sidebar-menu"
            router
            @select="handleMenuSelect"
          >
            <el-menu-item index="/dashboard">
              <el-icon><House /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-sub-menu index="shop">
              <template #title>
                <el-icon><Shop /></el-icon>
                <span>店铺管理</span>
              </template>
              <el-menu-item index="/shop/info">店铺信息</el-menu-item>
              <el-menu-item index="/shop/settings">店铺设置</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="product">
              <template #title>
                <el-icon><Goods /></el-icon>
                <span>商品管理</span>
              </template>
              <el-menu-item index="/product/list">商品列表</el-menu-item>
              <el-menu-item index="/product/add">添加商品</el-menu-item>
              <el-menu-item index="/product/category">商品分类</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="order">
              <template #title>
                <el-icon><Tickets /></el-icon>
                <span>订单管理</span>
              </template>
              <el-menu-item index="/order/mall">商城订单</el-menu-item>
              <el-menu-item index="/order/delivery">配送订单</el-menu-item>
              <el-menu-item index="/order/travel">出行订单</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="marketing">
              <template #title>
                <el-icon><Bell /></el-icon>
                <span>营销管理</span>
              </template>
              <el-menu-item index="/marketing/coupon">优惠券</el-menu-item>
              <el-menu-item index="/marketing/activity">活动管理</el-menu-item>
              <el-menu-item index="/marketing/ads">广告投放</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="finance">
              <template #title>
                <el-icon><Money /></el-icon>
                <span>财务管理</span>
              </template>
              <el-menu-item index="/finance/order">订单对账</el-menu-item>
              <el-menu-item index="/finance/withdraw">提现管理</el-menu-item>
              <el-menu-item index="/finance/statement">财务报表</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="data">
              <template #title>
                <el-icon><DataAnalysis /></el-icon>
                <span>数据中心</span>
              </template>
              <el-menu-item index="/data/overview">数据概览</el-menu-item>
              <el-menu-item index="/data/sales">销售分析</el-menu-item>
              <el-menu-item index="/data/visitor">访客分析</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-aside>
        <el-main class="main-content">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { House, Shop, Goods, Tickets, Bell, Money, DataAnalysis } from '@element-plus/icons-vue'
import { useUserStore } from './store/user'
import { ElMessage } from 'element-plus'

const router = useRouter()
const userStore = useUserStore()
const activeMenu = ref('/dashboard')
const defaultAvatar = 'https://via.placeholder.com/40'

const userInfo = computed(() => userStore.userInfo || {})

onMounted(() => {
  if (!userStore.token) {
    router.push('/login')
  }
})

const handleMenuSelect = (key) => {
  activeMenu.value = key
}

const goToProfile = () => {
  router.push('/profile')
}

const handleLogout = async () => {
  try {
    await userStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.merchant-app {
  width: 100%;
  height: 100vh;
}

.header {
  background: #001529;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo h1 {
  font-size: 20px;
  font-weight: bold;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.sidebar {
  background: #f0f2f5;
  border-right: 1px solid #e8e8e8;
}

.sidebar-menu {
  height: 100%;
  border-right: none;
}

.main-content {
  padding: 20px;
  overflow-y: auto;
  background: #f5f5f5;
}
</style>
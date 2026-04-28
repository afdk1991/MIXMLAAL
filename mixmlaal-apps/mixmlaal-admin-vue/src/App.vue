<template>
  <div class="app-container">
    <!-- 侧边栏 -->
    <el-aside width="200px" class="sidebar">
      <div class="logo">
        <h1>MIXMLAAL</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical-demo"
        @select="handleMenuSelect"
      >
        <el-menu-item index="/dashboard">
          <el-icon><ElementPlusIconsVue.Home /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/users">
          <el-icon><ElementPlusIconsVue.User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/roles">
          <el-icon><ElementPlusIconsVue.Collection /></el-icon>
          <span>角色管理</span>
        </el-menu-item>
        <el-menu-item index="/permissions">
          <el-icon><ElementPlusIconsVue.Lock /></el-icon>
          <span>权限管理</span>
        </el-menu-item>
        <el-menu-item index="/orders">
          <el-icon><ElementPlusIconsVue.Document /></el-icon>
          <span>订单管理</span>
        </el-menu-item>
        <el-menu-item index="/merchants">
          <el-icon><ElementPlusIconsVue.Shop /></el-icon>
          <span>商家管理</span>
        </el-menu-item>
        <el-menu-item index="/products">
          <el-icon><ElementPlusIconsVue.Goods /></el-icon>
          <span>商品管理</span>
        </el-menu-item>
        <el-menu-item index="/menus">
          <el-icon><ElementPlusIconsVue.MenuFold /></el-icon>
          <span>菜单管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 主内容区 -->
    <el-container class="main-container">
      <!-- 顶部导航栏 -->
      <el-header height="60px" class="header">
        <div class="header-left">
          <el-button type="text" @click="toggleSidebar">
            <el-icon><ElementPlusIconsVue.MenuFold /></el-icon>
          </el-button>
        </div>
        <div class="header-right">
          <el-dropdown>
            <span class="user-info">
              <el-avatar :src="user.avatar || 'https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png'" />
              <span>{{ user.nickname || '管理员' }}</span>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="handleProfile">个人中心</el-dropdown-item>
                <el-dropdown-item @click="handleLogout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from './store/user'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const store = useUserStore()

const activeMenu = computed(() => route.path)
const user = computed(() => store.userInfo)

// 处理菜单选择
const handleMenuSelect = (key) => {
  router.push(key)
}

// 切换侧边栏
const toggleSidebar = () => {
  // 实现侧边栏折叠功能
}

// 处理个人中心
const handleProfile = () => {
  router.push('/profile')
}

// 处理退出登录
const handleLogout = () => {
  store.dispatch('user/logout')
  router.push('/login')
}

// 组件挂载时检查登录状态
onMounted(() => {
  if (!store.state.user.token) {
    router.push('/login')
  }
})
</script>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.sidebar {
  background-color: #2c3e50;
  color: #fff;
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 100;
}

.logo {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-bottom: 1px solid #34495e;
}

.logo h1 {
  font-size: 18px;
  margin: 0;
  color: #fff;
}

.el-menu-vertical-demo {
  height: calc(100vh - 60px);
  background-color: #2c3e50;
  border-right: none;
}

.el-menu-item {
  color: #bdc3c7;
  margin: 10px 0;
}

.el-menu-item.is-active {
  color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.main-container {
  margin-left: 200px;
  width: calc(100vw - 200px);
  height: 100vh;
}

.header {
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.user-info span {
  margin-left: 10px;
  font-size: 14px;
}

.content {
  padding: 20px;
  background-color: #f5f7fa;
  overflow-y: auto;
  height: calc(100vh - 60px);
}
</style>
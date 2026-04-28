<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 顶部导航栏 -->
    <header class="bg-white shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <div class="flex-shrink-0 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="w-8 h-8">
                <defs>
                  <linearGradient id="adminLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#8b5cf6"/>
                  </linearGradient>
                </defs>
                <circle cx="16" cy="16" r="15" fill="url(#adminLogoGradient)"/>
                <path d="M10,20 L14,12 L18,20 L22,12" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M10,12 L22,12" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <path d="M14,12 L14,8" stroke="white" stroke-width="3" stroke-linecap="round"/>
                <path d="M18,12 L18,8" stroke="white" stroke-width="3" stroke-linecap="round"/>
              </svg>
              <span class="ml-2 text-xl font-bold text-gray-900">MIXMLAAL 管理后台</span>
            </div>
          </div>
          <div class="flex items-center">
            <button class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
              <i class="fa fa-bell text-lg"></i>
            </button>
            <div class="ml-4 relative">
              <button class="flex items-center">
                <span class="text-sm font-medium text-gray-700">管理员</span>
                <i class="fa fa-chevron-down ml-2 text-xs text-gray-400"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- 主内容区 -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-6">管理控制台</h1>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-md p-3">
              <i class="fa fa-users text-blue-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">总用户数</h3>
              <p class="text-2xl font-semibold text-gray-900">{{ userCount }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-md p-3">
              <i class="fa fa-shopping-cart text-green-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">今日订单</h3>
              <p class="text-2xl font-semibold text-gray-900">{{ todayOrders }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-md p-3">
              <i class="fa fa-credit-card text-purple-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">今日收入</h3>
              <p class="text-2xl font-semibold text-gray-900">¥{{ todayRevenue }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white p-6 rounded-lg shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-100 rounded-md p-3">
              <i class="fa fa-bell text-red-600 text-xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-500">待处理通知</h3>
              <p class="text-2xl font-semibold text-gray-900">{{ pendingNotifications }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 管理菜单 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <router-link to="/admin/users" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-50 rounded-full p-4">
              <i class="fa fa-user-circle text-blue-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">用户管理</h3>
              <p class="text-sm text-gray-500">管理用户账号和权限</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/orders" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-50 rounded-full p-4">
              <i class="fa fa-list-alt text-green-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">订单管理</h3>
              <p class="text-sm text-gray-500">处理和跟踪订单</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/products" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-50 rounded-full p-4">
              <i class="fa fa-shopping-bag text-purple-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">商品管理</h3>
              <p class="text-sm text-gray-500">管理商品和库存</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/coupons" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-yellow-50 rounded-full p-4">
              <i class="fa fa-ticket text-yellow-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">优惠券管理</h3>
              <p class="text-sm text-gray-500">创建和管理优惠券</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/logistics" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-orange-50 rounded-full p-4">
              <i class="fa fa-truck text-orange-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">物流管理</h3>
              <p class="text-sm text-gray-500">管理物流信息</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/ai" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-indigo-50 rounded-full p-4">
              <i class="fa fa-robot text-indigo-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">AI功能管理</h3>
              <p class="text-sm text-gray-500">管理AI相关功能</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/roles" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-red-50 rounded-full p-4">
              <i class="fa fa-shield text-red-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">角色管理</h3>
              <p class="text-sm text-gray-500">管理用户角色和权限</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/notification" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-pink-50 rounded-full p-4">
              <i class="fa fa-bell text-pink-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">通知管理</h3>
              <p class="text-sm text-gray-500">管理系统通知</p>
            </div>
          </div>
        </router-link>
        <router-link to="/admin/integrated" class="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-teal-50 rounded-full p-4">
              <i class="fa fa-th-large text-teal-600 text-2xl"></i>
            </div>
            <div class="ml-4">
              <h3 class="text-lg font-medium text-gray-900">服务套餐管理</h3>
              <p class="text-sm text-gray-500">管理集成服务套餐</p>
            </div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 模拟数据
const userCount = ref(1234);
const todayOrders = ref(56);
const todayRevenue = ref(12345);
const pendingNotifications = ref(8);

onMounted(() => {
  // 这里可以从API获取真实数据
  console.log('Admin dashboard mounted');
});
</script>

<style scoped>
/* 组件特定样式 */
</style>
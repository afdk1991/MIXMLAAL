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
            <div class="ml-10 flex items-center space-x-4">
              <button @click="$router.push('/admin')" class="text-gray-500 hover:text-gray-700">控制台</button>
              <span class="text-gray-300">/</span>
              <span class="text-gray-900 font-medium">优惠券管理</span>
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
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900">优惠券管理</h1>
        <div class="flex space-x-4">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <i class="fa fa-plus mr-2"></i> 新增优惠券
          </button>
          <button class="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors duration-200 flex items-center">
            <i class="fa fa-refresh mr-2"></i> 刷新
          </button>
        </div>
      </div>

      <!-- 搜索和筛选 -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优惠券名称</label>
            <input type="text" v-model="searchQuery" placeholder="输入优惠券名称" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优惠券类型</label>
            <select v-model="typeFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">全部类型</option>
              <option value="percentage">折扣券</option>
              <option value="fixed">固定金额券</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">优惠券状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">全部状态</option>
              <option value="active">有效</option>
              <option value="expired">已过期</option>
              <option value="inactive">未启用</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              <i class="fa fa-search mr-2"></i> 搜索
            </button>
          </div>
        </div>
      </div>

      <!-- 优惠券列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                优惠券ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                优惠券名称
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                类型
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                优惠金额
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                有效期
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                状态
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="coupon in coupons" :key="coupon.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ coupon.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ coupon.name }}</div>
                <div class="text-sm text-gray-500">{{ coupon.code }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', coupon.type === 'percentage' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800']">
                  {{ coupon.type === 'percentage' ? '折扣券' : '固定金额券' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ coupon.type === 'percentage' ? coupon.value + '%' : '¥' + coupon.value }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ coupon.startDate }} 至 {{ coupon.endDate }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', coupon.status === 'active' ? 'bg-green-100 text-green-800' : coupon.status === 'expired' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800']">
                  {{ coupon.status === 'active' ? '有效' : coupon.status === 'expired' ? '已过期' : '未启用' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button class="text-blue-600 hover:text-blue-900 mr-3">
                  <i class="fa fa-eye"></i> 查看
                </button>
                <button class="text-green-600 hover:text-green-900 mr-3">
                  <i class="fa fa-edit"></i> 编辑
                </button>
                <button class="text-red-600 hover:text-red-900">
                  <i class="fa fa-trash"></i> 删除
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 分页 -->
        <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div class="flex-1 flex justify-between sm:hidden">
            <button @click.prevent class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              上一页
            </button>
            <button @click.prevent class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              下一页
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-700">
                显示 <span class="font-medium">1</span> 到 <span class="font-medium">10</span> 共 <span class="font-medium">100</span> 条记录
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button @click.prevent class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">上一页</span>
                  <i class="fa fa-chevron-left"></i>
                </button>
                <button @click.prevent class="z-10 bg-blue-50 border-blue-500 text-blue-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button @click.prevent class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  2
                </button>
                <button @click.prevent class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  3
                </button>
                <span class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">
                  ...
                </span>
                <button @click.prevent class="bg-white border-gray-300 text-gray-500 hover:bg-gray-50 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  10
                </button>
                <button @click.prevent class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  <span class="sr-only">下一页</span>
                  <i class="fa fa-chevron-right"></i>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

// 模拟优惠券数据
const coupons = ref([
  {
    id: 'coupon_001',
    name: '新用户折扣券',
    code: 'NEW20',
    type: 'percentage',
    value: 20,
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    status: 'active'
  },
  {
    id: 'coupon_002',
    name: '满减券',
    code: '满100减20',
    type: 'fixed',
    value: 20,
    startDate: '2023-06-01',
    endDate: '2023-06-30',
    status: 'active'
  },
  {
    id: 'coupon_003',
    name: '限时折扣券',
    code: 'LIMITED50',
    type: 'percentage',
    value: 50,
    startDate: '2023-05-01',
    endDate: '2023-05-31',
    status: 'expired'
  },
  {
    id: 'coupon_004',
    name: '会员专享券',
    code: 'MEMBER30',
    type: 'percentage',
    value: 30,
    startDate: '2023-06-01',
    endDate: '2023-12-31',
    status: 'active'
  },
  {
    id: 'coupon_005',
    name: '节日特惠券',
    code: 'HOLIDAY10',
    type: 'fixed',
    value: 10,
    startDate: '2023-07-01',
    endDate: '2023-07-31',
    status: 'inactive'
  }
]);

// 搜索和筛选
const searchQuery = ref('');
const typeFilter = ref('');
const statusFilter = ref('');

onMounted(() => {
  // 这里可以从API获取真实数据
  console.log('Coupon management page mounted');
});
</script>

<style scoped>
/* 组件特定样式 */
</style>
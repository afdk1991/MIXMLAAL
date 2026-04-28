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
              <span class="text-gray-900 font-medium">物流管理</span>
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
        <h1 class="text-2xl font-bold text-gray-900">物流管理</h1>
        <div class="flex space-x-4">
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <i class="fa fa-plus mr-2"></i> 新增物流
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
            <label class="block text-sm font-medium text-gray-700 mb-1">物流单号</label>
            <input type="text" v-model="logisticsId" placeholder="输入物流单号" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">订单号</label>
            <input type="text" v-model="orderId" placeholder="输入订单号" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">物流状态</label>
            <select v-model="statusFilter" class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">全部状态</option>
              <option value="pending">待处理</option>
              <option value="shipping">运输中</option>
              <option value="delivered">已送达</option>
              <option value="cancelled">已取消</option>
            </select>
          </div>
          <div class="flex items-end">
            <button class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
              <i class="fa fa-search mr-2"></i> 搜索
            </button>
          </div>
        </div>
      </div>

      <!-- 物流列表 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                物流单号
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                订单号
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                收货人信息
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                物流状态
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                物流公司
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                创建时间
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="logistic in logistics" :key="logistic.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ logistic.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ logistic.orderId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ logistic.receiverName }}</div>
                <div class="text-sm text-gray-500">{{ logistic.receiverPhone }}</div>
                <div class="text-sm text-gray-500">{{ logistic.receiverAddress }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', logistic.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : logistic.status === 'shipping' ? 'bg-blue-100 text-blue-800' : logistic.status === 'delivered' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800']">
                  {{ logistic.status === 'pending' ? '待处理' : logistic.status === 'shipping' ? '运输中' : logistic.status === 'delivered' ? '已送达' : '已取消' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ logistic.carrier }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ logistic.createdAt }}
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

// 模拟物流数据
const logistics = ref([
  {
    id: 'log_001',
    orderId: 'order_001',
    receiverName: '张三',
    receiverPhone: '13800138001',
    receiverAddress: '北京市朝阳区XX街道XX小区XX号楼XX单元XX室',
    status: 'delivered',
    carrier: '顺丰速运',
    createdAt: '2023-06-01 10:30:00'
  },
  {
    id: 'log_002',
    orderId: 'order_002',
    receiverName: '李四',
    receiverPhone: '13800138002',
    receiverAddress: '上海市浦东新区XX街道XX小区XX号楼XX单元XX室',
    status: 'shipping',
    carrier: '京东物流',
    createdAt: '2023-06-01 11:15:00'
  },
  {
    id: 'log_003',
    orderId: 'order_003',
    receiverName: '王五',
    receiverPhone: '13800138003',
    receiverAddress: '广州市天河区XX街道XX小区XX号楼XX单元XX室',
    status: 'pending',
    carrier: '中通快递',
    createdAt: '2023-06-01 12:00:00'
  },
  {
    id: 'log_004',
    orderId: 'order_004',
    receiverName: '赵六',
    receiverPhone: '13800138004',
    receiverAddress: '深圳市南山区XX街道XX小区XX号楼XX单元XX室',
    status: 'delivered',
    carrier: '韵达快递',
    createdAt: '2023-06-01 13:45:00'
  },
  {
    id: 'log_005',
    orderId: 'order_005',
    receiverName: '钱七',
    receiverPhone: '13800138005',
    receiverAddress: '成都市武侯区XX街道XX小区XX号楼XX单元XX室',
    status: 'cancelled',
    carrier: '申通快递',
    createdAt: '2023-06-01 14:30:00'
  }
]);

// 搜索和筛选
const logisticsId = ref('');
const orderId = ref('');
const statusFilter = ref('');

onMounted(() => {
  // 这里可以从API获取真实数据
  console.log('Logistics management page mounted');
});
</script>

<style scoped>
/* 组件特定样式 */
</style>
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
              <button @click="$router.push('/admin')" class="text-gray-500 hover:text-gray-700">{{ t('admin.dashboard.title') }}</button>
              <span class="text-gray-300">/</span>
              <span class="text-gray-900 font-medium">{{ t('admin.analytics.title') }}</span>
            </div>
          </div>
          <div class="flex items-center">
            <button class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none">
              <i class="fa fa-bell text-lg"></i>
            </button>
            <ThemeToggle />
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
        <h1 class="text-2xl font-bold text-gray-900">{{ t('admin.analytics.title') }}</h1>
        <div class="flex space-x-4">
          <select v-model="dateRange" class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="today">{{ t('admin.analytics.dateRange.today') }}</option>
            <option value="week">{{ t('admin.analytics.dateRange.week') }}</option>
            <option value="month">{{ t('admin.analytics.dateRange.month') }}</option>
            <option value="year">{{ t('admin.analytics.dateRange.year') }}</option>
            <option value="custom">{{ t('admin.analytics.dateRange.custom') }}</option>
          </select>
          <button class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 flex items-center">
            <i class="fa fa-download mr-2"></i> {{ t('admin.analytics.export') }}
          </button>
        </div>
      </div>

      <!-- 数据概览 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ t('admin.analytics.overview.totalUsers') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.users.total }}</p>
              <p class="text-sm text-green-600">
                <i class="fa fa-arrow-up mr-1"></i>
                {{ statistics.users.growth }}% {{ t('admin.analytics.overview.growth') }}
              </p>
            </div>
            <div class="bg-blue-100 rounded-full p-3">
              <i class="fa fa-users text-blue-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ t('admin.analytics.overview.totalOrders') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.orders.total }}</p>
              <p class="text-sm text-green-600">
                <i class="fa fa-arrow-up mr-1"></i>
                {{ statistics.orders.growth }}% {{ t('admin.analytics.overview.growth') }}
              </p>
            </div>
            <div class="bg-green-100 rounded-full p-3">
              <i class="fa fa-shopping-cart text-green-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ t('admin.analytics.overview.totalSales') }}</p>
              <p class="text-2xl font-bold text-gray-900">¥{{ statistics.sales.total }}</p>
              <p class="text-sm text-green-600">
                <i class="fa fa-arrow-up mr-1"></i>
                {{ statistics.sales.growth }}% {{ t('admin.analytics.overview.growth') }}
              </p>
            </div>
            <div class="bg-yellow-100 rounded-full p-3">
              <i class="fa fa-yuan text-yellow-600 text-xl"></i>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow p-6">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-medium text-gray-500">{{ t('admin.analytics.overview.totalContent') }}</p>
              <p class="text-2xl font-bold text-gray-900">{{ statistics.content.total }}</p>
              <p class="text-sm text-green-600">
                <i class="fa fa-arrow-up mr-1"></i>
                {{ statistics.content.growth }}% {{ t('admin.analytics.overview.growth') }}
              </p>
            </div>
            <div class="bg-purple-100 rounded-full p-3">
              <i class="fa fa-file-text text-purple-600 text-xl"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <!-- 订单趋势图 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.analytics.charts.orderTrend') }}</h3>
          <div id="orderTrendChart" class="w-full h-80"></div>
        </div>

        <!-- 销售额趋势图 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.analytics.charts.salesTrend') }}</h3>
          <div id="salesTrendChart" class="w-full h-80"></div>
        </div>

        <!-- 用户增长图 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.analytics.charts.userGrowth') }}</h3>
          <div id="userGrowthChart" class="w-full h-80"></div>
        </div>

        <!-- 内容类型分布 -->
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-medium text-gray-900 mb-4">{{ t('admin.analytics.charts.contentType') }}</h3>
          <div id="contentTypeChart" class="w-full h-80"></div>
        </div>
      </div>

      <!-- 详细数据表格 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">{{ t('admin.analytics.popularContent') }}</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  标题
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  类型
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  浏览量
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  发布时间
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  状态
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="content in popularContent" :key="content.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {{ content.title }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', content.type === 'article' ? 'bg-blue-100 text-blue-800' : content.type === 'page' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                    {{ content.typeText }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ content.views }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {{ content.createTime }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 inline-flex text-xs leading-5 font-semibold rounded-full', content.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800']">
                    {{ content.statusText }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="px-6 py-4 border-t border-gray-200">
          <div class="flex justify-end">
            <button class="text-blue-600 hover:text-blue-900 text-sm font-medium">
              查看更多 <i class="fa fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import ThemeToggle from '../../components/ThemeToggle.vue';

const { t } = useI18n();
import * as echarts from 'echarts';

// 响应式数据
const dateRange = ref('week');
const statistics = ref({
  users: {
    total: 1234,
    growth: 12.5
  },
  orders: {
    total: 567,
    growth: 8.3
  },
  sales: {
    total: 123456,
    growth: 15.7
  },
  content: {
    total: 89,
    growth: 5.2
  }
});

const popularContent = ref([
  { id: 1, title: '欢迎使用MIXMLAAL', type: 'article', typeText: '文章', views: 1234, status: 'published', statusText: '已发布', createTime: '2026-04-01' },
  { id: 2, title: '关于我们', type: 'page', typeText: '页面', views: 987, status: 'published', statusText: '已发布', createTime: '2026-04-02' },
  { id: 3, title: '服务介绍', type: 'article', typeText: '文章', views: 765, status: 'draft', statusText: '草稿', createTime: '2026-04-03' },
  { id: 4, title: '隐私政策', type: 'page', typeText: '页面', views: 654, status: 'published', statusText: '已发布', createTime: '2026-04-06' },
  { id: 5, title: '活动公告', type: 'article', typeText: '文章', views: 543, status: 'published', statusText: '已发布', createTime: '2026-04-09' }
]);

// 图表实例
let orderTrendChart = null;
let salesTrendChart = null;
let userGrowthChart = null;
let contentTypeChart = null;

// 组件挂载时初始化图表
onMounted(() => {
  initCharts();
});

// 监听日期范围变化
watch(dateRange, () => {
  updateCharts();
});

// 初始化图表
function initCharts() {
  // 订单趋势图
  orderTrendChart = echarts.init(document.getElementById('orderTrendChart'));
  // 销售额趋势图
  salesTrendChart = echarts.init(document.getElementById('salesTrendChart'));
  // 用户增长图
  userGrowthChart = echarts.init(document.getElementById('userGrowthChart'));
  // 内容类型分布图
  contentTypeChart = echarts.init(document.getElementById('contentTypeChart'));
  
  updateCharts();
  
  // 监听窗口大小变化
  window.addEventListener('resize', () => {
    orderTrendChart.resize();
    salesTrendChart.resize();
    userGrowthChart.resize();
    contentTypeChart.resize();
  });
}

// 更新图表数据
function updateCharts() {
  // 模拟数据
  const dates = ['1月', '2月', '3月', '4月', '5月', '6月'];
  const orderData = [120, 132, 101, 134, 90, 230];
  const salesData = [12000, 13200, 10100, 13400, 9000, 23000];
  const userData = [100, 200, 300, 400, 500, 600];
  
  // 订单趋势图配置
  orderTrendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '订单数',
        type: 'line',
        data: orderData,
        smooth: true,
        lineStyle: {
          color: '#3b82f6'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(59, 130, 246, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(59, 130, 246, 0.1)'
            }
          ])
        }
      }
    ]
  });
  
  // 销售额趋势图配置
  salesTrendChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '销售额',
        type: 'line',
        data: salesData,
        smooth: true,
        lineStyle: {
          color: '#10b981'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: 'rgba(16, 185, 129, 0.5)'
            },
            {
              offset: 1,
              color: 'rgba(16, 185, 129, 0.1)'
            }
          ])
        }
      }
    ]
  });
  
  // 用户增长图配置
  userGrowthChart.setOption({
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: dates
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        name: '新增用户',
        type: 'bar',
        data: userData,
        itemStyle: {
          color: '#8b5cf6'
        }
      }
    ]
  });
  
  // 内容类型分布图配置
  contentTypeChart.setOption({
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '内容类型',
        type: 'pie',
        radius: '60%',
        data: [
          { value: 45, name: '文章' },
          { value: 30, name: '页面' },
          { value: 25, name: '横幅' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  });
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
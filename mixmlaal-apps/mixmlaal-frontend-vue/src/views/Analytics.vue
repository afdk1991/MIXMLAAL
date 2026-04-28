<template>
  <div class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <router-link to="/" class="flex-shrink-0 flex items-center space-x-2">
              <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" class="w-8 h-8 pointer-events-auto">
                  <!-- 背景圆形渐变 -->
                  <defs>
                    <linearGradient id="analyticsLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#3b82f6"/>
                      <stop offset="100%" stop-color="#8b5cf6"/>
                    </linearGradient>
                    <linearGradient id="analyticsMixGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#ffffff"/>
                      <stop offset="100%" stop-color="#e0f2fe"/>
                    </linearGradient>
                  </defs>
                  <!-- 背景圆形 -->
                  <circle cx="16" cy="16" r="15" fill="url(#analyticsLogoGradient)"/>
                  <!-- 装饰元素 -->
                  <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
                  <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
                  <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
                  <!-- MIXMLAAL 标志 - 融合M、X、L元素 -->
                  <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#analyticsMixGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M10,12 L22,12" stroke="url(#analyticsMixGradient)" stroke-width="3" stroke-linecap="round"/>
                  <path d="M14,12 L14,8" stroke="url(#analyticsMixGradient)" stroke-width="3" stroke-linecap="round"/>
                  <path d="M18,12 L18,8" stroke="url(#analyticsMixGradient)" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </div>
              <div class="logo-text">
                <span class="ml-2 text-xl font-bold text-gray-900">MIXMLAAL</span>
              </div>
            </router-link>
            <div class="hidden md:ml-6 md:flex md:space-x-8">
              <router-link to="/" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.home') }}
              </router-link>
              <router-link to="/ride" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.ride') }}
              </router-link>
              <router-link to="/food" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.food') }}
              </router-link>
              <router-link to="/mall" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.mall') }}
              </router-link>
              <router-link to="/errand" class="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.errand') }}
              </router-link>
              <router-link to="/analytics" class="border-blue-500 text-blue-600 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                {{ t('nav.analytics') }}
              </router-link>
            </div>
          </div>
          <div class="flex items-center">
            <div class="hidden md:block">
              <div class="ml-4 flex items-center md:ml-6">
                <button type="button" class="bg-blue-600 p-1 rounded-full text-blue-200 hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                  <span class="sr-only">{{ t('nav.notifications') }}</span>
                  <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </button>
                <div class="mr-4">
                  <LanguageSelector />
                </div>
                <div class="ml-3 relative">
                  <div>
                    <button type="button" class="max-w-xs bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500" id="user-menu-button" aria-expanded="false" aria-haspopup="true">
                      <span class="sr-only">{{ t('nav.userMenu') }}</span>
                      <img class="h-8 w-8 rounded-full" src="https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20profile%20picture&image_size=square" alt="用户头像">
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主要内容 -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- 页面标题和控制栏 -->
      <div class="mb-6">
        <div class="flex flex-col md:flex-row md:justify-between md:items-center">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">{{ t('analytics.title') }}</h1>
            <p class="mt-2 text-sm text-gray-600">{{ t('analytics.description') }}</p>
          </div>
          <div class="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
            <div class="relative">
              <select v-model="timeRange" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
                <option value="day">{{ t('analytics.timeRange.day') }}</option>
                <option value="week">{{ t('analytics.timeRange.week') }}</option>
                <option value="month">{{ t('analytics.timeRange.month') }}</option>
                <option value="year">{{ t('analytics.timeRange.year') }}</option>
                <option value="custom">{{ t('analytics.timeRange.custom') }}</option>
              </select>
            </div>
            <div v-if="timeRange === 'custom'" class="flex gap-2">
              <input type="date" v-model="startDate" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
              <input type="date" v-model="endDate" class="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md">
            </div>
            <button @click="refreshData" class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all active:scale-95">
              <i class="fa fa-refresh mr-2"></i>{{ t('analytics.refresh') }}
            </button>
            <button @click="exportData" class="flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-all active:scale-95">
              <i class="fa fa-download mr-2"></i>{{ t('analytics.export') }}
            </button>
          </div>
        </div>
        <div class="mt-4 flex items-center">
          <span class="text-sm text-gray-600">{{ t('analytics.lastUpdated') }}: {{ lastUpdated }}</span>
          <span v-if="isLoading" class="ml-3 text-sm text-blue-600 flex items-center">
            <i class="fa fa-spinner fa-spin mr-1"></i>{{ t('analytics.loading') }}
          </span>
        </div>
      </div>

      <!-- 数据概览卡片 -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-green-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('analytics.overview.totalUsers') }}</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ overviewData.totalUsers.toLocaleString() }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      15%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-blue-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('analytics.overview.totalOrders') }}</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">{{ overviewData.totalOrders.toLocaleString() }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      10%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-purple-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('analytics.overview.totalSales') }}</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">¥{{ overviewData.totalSales.toLocaleString() }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      25%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <div class="flex items-center">
              <div class="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                <svg class="h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">{{ t('analytics.overview.averageOrderValue') }}</dt>
                  <dd class="flex items-baseline">
                    <div class="text-2xl font-semibold text-gray-900">¥{{ overviewData.averageOrderValue }}</div>
                    <div class="ml-2 flex items-baseline text-sm font-semibold text-green-600">
                      <svg class="mr-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                      5%
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 图表区域 -->
      <div class="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-2">
        <!-- 订单趋势图 -->
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{{ t('analytics.charts.orderTrend') }}</h3>
            <div class="mt-4">
              <v-chart class="chart" :option="orderTrendOption" />
            </div>
          </div>
        </div>

        <!-- 服务类型分布 -->
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{{ t('analytics.charts.serviceDistribution') }}</h3>
            <div class="mt-4">
              <v-chart class="chart" :option="serviceDistributionOption" />
            </div>
          </div>
        </div>

        <!-- 用户增长趋势 -->
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{{ t('analytics.charts.userGrowth') }}</h3>
            <div class="mt-4">
              <v-chart class="chart" :option="userGrowthOption" />
            </div>
          </div>
        </div>

        <!-- 用户满意度雷达图 -->
        <div class="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg font-medium text-gray-900">{{ t('analytics.charts.satisfaction') }}</h3>
            <div class="mt-4">
              <v-chart class="chart" :option="satisfactionRadarOption" />
            </div>
          </div>
        </div>
      </div>

      <!-- 数据分析表格 -->
      <div class="mt-6 bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg font-medium text-gray-900">{{ t('analytics.table.serviceUsageDetails') }}</h3>
          <div class="mt-4 overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('analytics.table.serviceType') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('analytics.table.orderCount') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('analytics.table.totalAmount') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('analytics.table.averageAmount') }}
                  </th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {{ t('analytics.table.satisfaction') }}
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="service in serviceData" :key="service.type" class="hover:bg-gray-50 transition-colors">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{{ service.type }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ service.orders.toLocaleString() }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">¥{{ service.amount.toLocaleString() }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">¥{{ service.avgAmount }}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{{ service.satisfaction }}</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>

    <!-- 底部导航 -->
    <footer class="bg-white border-t border-gray-200 mt-8">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <p class="text-center text-sm text-gray-500">
          &copy; 2026 MIXMLAAL. 保留所有权利。
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart, BarChart, PieChart, MapChart, RadarChart, ScatterChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, LegendComponent, GridComponent, DataZoomComponent, ToolboxComponent } from 'echarts/components';
import VChart from 'vue-echarts';
import LanguageSelector from '../components/LanguageSelector.vue';

const { t } = useI18n();

// 注册 ECharts 组件
use([
  CanvasRenderer,
  LineChart,
  BarChart,
  PieChart,
  MapChart,
  RadarChart,
  ScatterChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent,
  DataZoomComponent,
  ToolboxComponent
]);

// 状态变量
const timeRange = ref('month');
const startDate = ref('');
const endDate = ref('');
const isLoading = ref(false);
const lastUpdated = ref('');

// 模拟数据
const overviewData = ref({
  totalUsers: 50000,
  totalOrders: 12500,
  totalSales: 1000000,
  averageOrderValue: 85.5
});

const serviceData = ref([
  { type: t('analytics.services.ride'), orders: 5625, amount: 471937.5, avgAmount: 83.9, satisfaction: 4.6 },
  { type: t('analytics.services.food'), orders: 3750, amount: 305625, avgAmount: 81.5, satisfaction: 4.5 },
  { type: t('analytics.services.mall'), orders: 1875, amount: 187500, avgAmount: 100, satisfaction: 4.4 },
  { type: t('analytics.services.errand'), orders: 1250, amount: 35000, avgAmount: 28, satisfaction: 4.7 }
]);

// 订单趋势图配置
const orderTrendOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  legend: {
    data: ['订单数', '销售额']
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '订单数',
      min: 0,
      max: 1500,
      interval: 300
    },
    {
      type: 'value',
      name: '销售额(万元)',
      min: 0,
      max: 100,
      interval: 20
    }
  ],
  series: [
    {
      name: '订单数',
      type: 'line',
      data: [800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1450, 1400, 1350, 1300],
      smooth: true,
      itemStyle: {
        color: '#4299e1'
      }
    },
    {
      name: '销售额',
      type: 'line',
      yAxisIndex: 1,
      data: [50, 60, 70, 75, 80, 85, 90, 95, 92, 90, 88, 85],
      smooth: true,
      itemStyle: {
        color: '#48bb78'
      }
    }
  ]
});

// 服务类型分布图配置
const serviceDistributionOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    data: ['打车', '外卖', '商城', '跑腿']
  },
  series: [
    {
      name: '服务类型',
      type: 'pie',
      radius: '70%',
      center: ['60%', '50%'],
      data: [
        { value: 45, name: '打车' },
        { value: 30, name: '外卖' },
        { value: 15, name: '商城' },
        { value: 10, name: '跑腿' }
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

// 用户增长趋势图配置
const userGrowthOption = ref({
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#6a7985'
      }
    }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '3%',
    containLabel: true
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: false,
      data: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
    }
  ],
  yAxis: [
    {
      type: 'value',
      name: '用户数',
      min: 0,
      max: 60000,
      interval: 10000
    }
  ],
  series: [
    {
      name: '用户数',
      type: 'line',
      data: [10000, 15000, 20000, 25000, 30000, 35000, 40000, 45000, 47000, 48000, 49000, 50000],
      smooth: true,
      itemStyle: {
        color: '#9f7aea'
      }
    }
  ]
});

// 地区分布图配置
const regionDistributionOption = ref({
  tooltip: {
    trigger: 'item',
    formatter: '{a} <br/>{b}: {c} ({d}%)'
  },
  legend: {
    orient: 'vertical',
    left: 10,
    data: ['北京', '上海', '广州', '深圳', '其他']
  },
  series: [
    {
      name: '地区分布',
      type: 'pie',
      radius: '70%',
      center: ['60%', '50%'],
      data: [
        { value: 20, name: '北京' },
        { value: 18, name: '上海' },
        { value: 15, name: '广州' },
        { value: 12, name: '深圳' },
        { value: 35, name: '其他' }
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

// 用户满意度雷达图配置
const satisfactionRadarOption = ref({
  tooltip: {},
  legend: {
    data: ['打车', '外卖', '商城', '跑腿']
  },
  radar: {
    indicator: [
      { name: '服务质量', max: 5 },
      { name: '响应速度', max: 5 },
      { name: '价格合理性', max: 5 },
      { name: '用户体验', max: 5 },
      { name: '安全性', max: 5 }
    ]
  },
  series: [
    {
      name: '用户满意度',
      type: 'radar',
      data: [
        { value: [4.6, 4.7, 4.3, 4.5, 4.8], name: '打车' },
        { value: [4.5, 4.6, 4.4, 4.3, 4.7], name: '外卖' },
        { value: [4.4, 4.5, 4.6, 4.4, 4.6], name: '商城' },
        { value: [4.7, 4.8, 4.5, 4.6, 4.7], name: '跑腿' }
      ]
    }
  ]
});

// 方法
const refreshData = async () => {
  isLoading.value = true;
  try {
    // 模拟从API获取数据
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 更新数据
    overviewData.value = {
      totalUsers: Math.floor(50000 + Math.random() * 10000),
      totalOrders: Math.floor(12500 + Math.random() * 2000),
      totalSales: Math.floor(1000000 + Math.random() * 200000),
      averageOrderValue: parseFloat((85.5 + Math.random() * 10).toFixed(1))
    };
    
    // 更新服务数据
    serviceData.value.forEach(item => {
      item.orders = Math.floor(item.orders * (0.9 + Math.random() * 0.2));
      item.amount = parseFloat((item.amount * (0.9 + Math.random() * 0.2)).toFixed(1));
      item.avgAmount = parseFloat((item.avgAmount * (0.9 + Math.random() * 0.2)).toFixed(1));
      item.satisfaction = parseFloat((item.satisfaction - 0.1 + Math.random() * 0.2).toFixed(1));
    });
    
    // 更新时间
    lastUpdated.value = new Date().toLocaleString();
  } catch (error) {
    console.error('刷新数据失败:', error);
  } finally {
    isLoading.value = false;
  }
};

const exportData = () => {
  // 模拟导出数据
  const data = {
    overview: overviewData.value,
    services: serviceData.value,
    timestamp: new Date().toISOString()
  };
  
  const dataStr = JSON.stringify(data, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `analytics_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

onMounted(() => {
  // 初始化数据
  lastUpdated.value = new Date().toLocaleString();
  console.log('数据分析页面加载完成');
});
</script>

<style scoped>
.chart {
  width: 100%;
  height: 300px;
}
</style>
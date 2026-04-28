<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <h1 class="text-2xl font-bold mb-6">控制台</h1>
      <div class="header-actions">
        <div class="date-info">
          <span class="text-gray-600">{{ currentDate }}</span>
        </div>
        <div class="time-range">
          <select v-model="timeRange" @change="updateCharts">
            <option value="7">近7天</option>
            <option value="30">近30天</option>
            <option value="90">近90天</option>
          </select>
        </div>
      </div>
    </div>
    
    <div class="dashboard-stats">
      <div class="stat-card" v-for="(stat, index) in statsList" :key="index">
        <div class="stat-icon" :class="stat.color">
          <i :class="stat.icon"></i>
        </div>
        <div class="stat-content">
          <h3 class="stat-title">{{ stat.title }}</h3>
          <p class="stat-value">{{ stat.value }}</p>
          <p class="stat-change" :class="stat.growth >= 0 ? 'positive' : 'negative'">
            {{ stat.growth >= 0 ? '+' : '' }}{{ stat.growth }}% 较上月
          </p>
        </div>
      </div>
    </div>
    
    <div class="dashboard-charts">
      <div class="chart-card">
        <div class="chart-header">
          <h3 class="chart-title">订单趋势</h3>
          <div class="chart-actions">
            <button class="chart-btn" :class="{ active: chartType === 'line' }" @click="chartType = 'line'; updateCharts()">
              <i class="fa fa-line-chart"></i>
            </button>
            <button class="chart-btn" :class="{ active: chartType === 'bar' }" @click="chartType = 'bar'; updateCharts()">
              <i class="fa fa-bar-chart"></i>
            </button>
          </div>
        </div>
        <div class="chart-container">
          <div ref="orderChart" class="chart"></div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">服务类型分布</h3>
        <div class="chart-container">
          <div ref="serviceChart" class="chart"></div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">用户增长趋势</h3>
        <div class="chart-container">
          <div ref="userChart" class="chart"></div>
        </div>
      </div>
      
      <div class="chart-card">
        <h3 class="chart-title">销售额趋势</h3>
        <div class="chart-container">
          <div ref="salesChart" class="chart"></div>
        </div>
      </div>
      
      <div class="chart-card full-width">
        <h3 class="chart-title">用户地理分布</h3>
        <div class="chart-container">
          <div ref="geoChart" class="chart"></div>
        </div>
      </div>
    </div>
    
    <div class="dashboard-recent">
      <div class="recent-card">
        <h3 class="recent-title">最近订单</h3>
        <div class="recent-list">
          <div v-for="order in recentOrders" :key="order.id" class="order-item" @click="viewOrderDetail(order)">
            <div class="order-info">
              <span class="order-id">订单号: {{ order.id }}</span>
              <span class="order-status" :class="order.status">{{ order.statusText }}</span>
            </div>
            <div class="order-details">
              <span class="order-service">{{ order.service }}</span>
              <span class="order-amount">¥{{ order.amount }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="recent-card">
        <h3 class="recent-title">最近用户</h3>
        <div class="recent-list">
          <div v-for="user in recentUsers" :key="user.id" class="user-item">
            <div class="user-info">
              <span class="user-name">{{ user.name }}</span>
              <span class="user-role" :class="user.role">{{ user.roleText }}</span>
            </div>
            <div class="user-details">
              <span class="user-register">{{ user.registerTime }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 订单详情弹窗 -->
    <div v-if="selectedOrder" class="form-overlay">
      <div class="form-container">
        <div class="form-header">
          <h3>订单详情</h3>
          <button class="close-btn" @click="selectedOrder = null">&times;</button>
        </div>
        <div class="order-details">
          <div class="detail-item">
            <span class="detail-label">订单号：</span>
            <span class="detail-value">{{ selectedOrder.id }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">服务类型：</span>
            <span class="detail-value">{{ selectedOrder.service }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">状态：</span>
            <span class="detail-value">{{ selectedOrder.statusText }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">金额：</span>
            <span class="detail-value">¥{{ selectedOrder.amount }}</span>
          </div>
        </div>
        <div class="form-actions">
          <button type="button" class="cancel-btn" @click="selectedOrder = null">关闭</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import * as echarts from 'echarts';

const currentDate = new Date().toLocaleDateString('zh-CN', {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  weekday: 'long'
});

const timeRange = ref('7');
const chartType = ref('line');
const selectedOrder = ref(null);

const statsList = ref([
  {
    title: '总用户数',
    value: 12345,
    growth: 12.5,
    icon: 'fa fa-users',
    color: 'bg-blue-500'
  },
  {
    title: '总订单数',
    value: 6789,
    growth: 8.2,
    icon: 'fa fa-shopping-cart',
    color: 'bg-green-500'
  },
  {
    title: '总交易额',
    value: '¥1,234,567',
    growth: 15.3,
    icon: 'fa fa-money',
    color: 'bg-purple-500'
  },
  {
    title: '服务完成率',
    value: '98.7%',
    growth: 2.1,
    icon: 'fa fa-truck',
    color: 'bg-red-500'
  }
]);

const recentOrders = ref([
  { id: 'ORD20260410001', status: 'success', statusText: '已完成', service: '出行服务', amount: 128 },
  { id: 'ORD20260410002', status: 'pending', statusText: '待处理', service: '美食服务', amount: 88 },
  { id: 'ORD20260410003', status: 'processing', statusText: '处理中', service: '跑腿服务', amount: 35 },
  { id: 'ORD20260410004', status: 'success', statusText: '已完成', service: '出行服务', amount: 95 },
  { id: 'ORD20260410005', status: 'success', statusText: '已完成', service: '美食服务', amount: 156 }
]);

const recentUsers = ref([
  { id: 1001, name: '张三', role: 'admin', roleText: '管理员', registerTime: '2026-04-10 10:00' },
  { id: 1002, name: '李四', role: 'user', roleText: '普通用户', registerTime: '2026-04-10 09:30' },
  { id: 1003, name: '王五', role: 'vip', roleText: 'VIP用户', registerTime: '2026-04-09 16:45' },
  { id: 1004, name: '赵六', role: 'user', roleText: '普通用户', registerTime: '2026-04-09 14:20' },
  { id: 1005, name: '钱七', role: 'user', roleText: '普通用户', registerTime: '2026-04-08 11:15' }
]);

const orderChart = ref(null);
const serviceChart = ref(null);
const userChart = ref(null);
const salesChart = ref(null);
const geoChart = ref(null);
let orderChartInstance = null;
let serviceChartInstance = null;
let userChartInstance = null;
let salesChartInstance = null;
let geoChartInstance = null;

onMounted(() => {
  initCharts();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
  if (orderChartInstance) {
    orderChartInstance.dispose();
  }
  if (serviceChartInstance) {
    serviceChartInstance.dispose();
  }
  if (userChartInstance) {
    userChartInstance.dispose();
  }
  if (salesChartInstance) {
    salesChartInstance.dispose();
  }
  if (geoChartInstance) {
    geoChartInstance.dispose();
  }
});

function initCharts() {
  updateOrderChart();
  updateServiceChart();
  updateUserChart();
  updateSalesChart();
  updateGeoChart();
}

function updateCharts() {
  updateOrderChart();
  updateServiceChart();
  updateUserChart();
  updateSalesChart();
  updateGeoChart();
}

function updateOrderChart() {
  if (!orderChart.value) return;
  
  if (orderChartInstance) {
    orderChartInstance.dispose();
  }
  
  orderChartInstance = echarts.init(orderChart.value);
  
  const days = parseInt(timeRange.value);
  const xAxisData = [];
  const seriesData = [];
  
  // 生成日期数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    xAxisData.push(`${date.getMonth() + 1}/${date.getDate()}`);
    // 生成随机数据
    seriesData.push(Math.floor(Math.random() * 100) + 100);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 订单'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: chartType.value === 'line' ? false : true,
      data: xAxisData,
      axisLabel: {
        rotate: days > 14 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '订单数'
    },
    series: [
      {
        name: '订单数',
        type: chartType.value,
        data: seriesData,
        ...(chartType.value === 'line' && {
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: 'rgba(59, 130, 246, 0.5)' },
              { offset: 1, color: 'rgba(59, 130, 246, 0.1)' }
            ])
          },
          lineStyle: {
            color: '#3b82f6'
          }
        }),
        ...(chartType.value === 'bar' && {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#3b82f6' },
              { offset: 1, color: '#93c5fd' }
            ])
          }
        })
      }
    ]
  };
  
  orderChartInstance.setOption(option);
}

function updateServiceChart() {
  if (!serviceChart.value) return;
  
  if (serviceChartInstance) {
    serviceChartInstance.dispose();
  }
  
  serviceChartInstance = echarts.init(serviceChart.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      top: 'center'
    },
    series: [
      {
        name: '服务类型',
        type: 'pie',
        radius: '70%',
        center: ['60%', '50%'],
        data: [
          { value: 45, name: '出行服务' },
          { value: 30, name: '美食服务' },
          { value: 15, name: '跑腿服务' },
          { value: 10, name: '其他服务' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        },
        label: {
          show: true,
          formatter: '{b}: {d}%'
        }
      }
    ]
  };
  
  serviceChartInstance.setOption(option);
}

function updateUserChart() {
  if (!userChart.value) return;
  
  if (userChartInstance) {
    userChartInstance.dispose();
  }
  
  userChartInstance = echarts.init(userChart.value);
  
  const days = parseInt(timeRange.value);
  const xAxisData = [];
  const seriesData = [];
  
  // 生成日期数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    xAxisData.push(`${date.getMonth() + 1}/${date.getDate()}`);
    // 生成随机数据
    seriesData.push(Math.floor(Math.random() * 50) + 20);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: {c} 人'
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
      data: xAxisData,
      axisLabel: {
        rotate: days > 14 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '新增用户'
    },
    series: [
      {
        name: '新增用户',
        type: 'line',
        data: seriesData,
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.5)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.1)' }
          ])
        },
        lineStyle: {
          color: '#10b981'
        },
        itemStyle: {
          color: '#10b981'
        }
      }
    ]
  };
  
  userChartInstance.setOption(option);
}

function updateSalesChart() {
  if (!salesChart.value) return;
  
  if (salesChartInstance) {
    salesChartInstance.dispose();
  }
  
  salesChartInstance = echarts.init(salesChart.value);
  
  const days = parseInt(timeRange.value);
  const xAxisData = [];
  const seriesData = [];
  
  // 生成日期数据
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    xAxisData.push(`${date.getMonth() + 1}/${date.getDate()}`);
    // 生成随机数据
    seriesData.push(Math.floor(Math.random() * 10000) + 5000);
  }
  
  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: '{b}: ¥{c}'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: true,
      data: xAxisData,
      axisLabel: {
        rotate: days > 14 ? 45 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '销售额'
    },
    series: [
      {
        name: '销售额',
        type: 'bar',
        data: seriesData,
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#8b5cf6' },
            { offset: 1, color: '#c4b5fd' }
          ])
        }
      }
    ]
  };
  
  salesChartInstance.setOption(option);
}

function updateGeoChart() {
  if (!geoChart.value) return;
  
  if (geoChartInstance) {
    geoChartInstance.dispose();
  }
  
  geoChartInstance = echarts.init(geoChart.value);
  
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} 人'
    },
    visualMap: {
      min: 0,
      max: 1000,
      left: 'left',
      top: 'bottom',
      text: ['高', '低'],
      calculable: true,
      inRange: {
        color: ['#e0f2fe', '#bae6fd', '#7dd3fc', '#38bdf8', '#0ea5e9', '#0284c7']
      }
    },
    series: [
      {
        name: '用户分布',
        type: 'map',
        map: 'china',
        roam: true,
        emphasis: {
          label: {
            show: true
          },
          itemStyle: {
            areaColor: '#38bdf8'
          }
        },
        data: [
          { name: '北京', value: 850 },
          { name: '上海', value: 920 },
          { name: '广州', value: 780 },
          { name: '深圳', value: 810 },
          { name: '杭州', value: 650 },
          { name: '成都', value: 720 },
          { name: '武汉', value: 580 },
          { name: '西安', value: 490 },
          { name: '南京', value: 550 },
          { name: '重庆', value: 680 }
        ]
      }
    ]
  };
  
  geoChartInstance.setOption(option);
}

function handleResize() {
  if (orderChartInstance) {
    orderChartInstance.resize();
  }
  if (serviceChartInstance) {
    serviceChartInstance.resize();
  }
  if (userChartInstance) {
    userChartInstance.resize();
  }
  if (salesChartInstance) {
    salesChartInstance.resize();
  }
  if (geoChartInstance) {
    geoChartInstance.resize();
  }
}

function viewOrderDetail(order) {
  selectedOrder.value = order;
}
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.date-info {
  font-size: 14px;
  color: #64748b;
}

.time-range select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.time-range select:hover {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.chart-actions {
  display: flex;
  gap: 8px;
}

.chart-btn {
  width: 36px;
  height: 36px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #64748b;
}

.chart-btn:hover {
  border-color: #3b82f6;
  color: #3b82f6;
}

.chart-btn.active {
  background-color: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.order-item, .user-item {
  cursor: pointer;
  transition: all 0.3s ease;
}

.order-item:hover, .user-item:hover {
  background-color: #f8fafc;
  transform: translateX(4px);
}

/* 表单样式 */
.form-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.form-container {
  background-color: white;
  border-radius: 12px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.form-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #334155;
}

.order-details {
  margin-bottom: 24px;
}

.detail-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.detail-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.detail-label {
  width: 100px;
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
}

.detail-value {
  flex: 1;
  color: #1e293b;
  font-size: 14px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
}

.cancel-btn {
  background-color: #f1f5f9;
  color: #334155;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.cancel-btn:hover {
  background-color: #e2e8f0;
}

.dashboard-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-content {
  flex: 1;
}

.stat-title {
  font-size: 14px;
  color: #64748b;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 5px;
}

.stat-change {
  font-size: 12px;
}

.stat-change.positive {
  color: #10b981;
}

.stat-change.negative {
  color: #ef4444;
}

.dashboard-charts {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.chart-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.chart-card.full-width {
  grid-column: 1 / -1;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.chart-container {
  height: 300px;
}

.chart {
  width: 100%;
  height: 100%;
}

.dashboard-recent {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.recent-card {
  background-color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.recent-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 20px;
}

.recent-list {
  space-y: 10px;
}

.order-item, .user-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child, .user-item:last-child {
  border-bottom: none;
}

.order-status, .user-role {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.order-status.success, .user-role.admin {
  background-color: #d1fae5;
  color: #065f46;
}

.order-status.pending, .user-role.user {
  background-color: #fef3c7;
  color: #92400e;
}

.order-status.processing, .user-role.vip {
  background-color: #dbeafe;
  color: #1e40af;
}

@media (max-width: 768px) {
  .dashboard-header {
    flex-direction: column;
    align-items: stretch;
    gap: 16px;
  }
  
  .header-actions {
    flex-direction: column;
    gap: 12px;
  }
  
  .dashboard-stats {
    grid-template-columns: 1fr;
  }
  
  .dashboard-charts {
    grid-template-columns: 1fr;
  }
  
  .dashboard-recent {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: 16px;
  }
  
  .stat-icon {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
  
  .form-container {
    width: 95%;
    padding: 20px;
  }
  
  .chart-card.full-width {
    grid-column: 1;
  }
}

@media (max-width: 480px) {
  .dashboard-container {
    padding: 16px;
  }
  
  .chart-header {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .chart-actions {
    justify-content: center;
  }
  
  .chart-container {
    height: 200px;
  }
  
  .order-item, .user-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .order-info, .user-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .order-details, .user-details {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
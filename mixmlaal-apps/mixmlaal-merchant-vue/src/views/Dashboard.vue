<template>
  <div class="dashboard">
    <el-card shadow="hover" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>店铺概览</span>
        </div>
      </template>
      <div class="stat-card-container">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todaySales }}</div>
            <div class="stat-label">今日销售额</div>
            <div class="stat-trend positive">+{{ todaySalesGrowth }}%</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ todayOrders }}</div>
            <div class="stat-label">今日订单</div>
            <div class="stat-trend positive">+{{ todayOrdersGrowth }}%</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalSales }}</div>
            <div class="stat-label">总销售额</div>
            <div class="stat-trend positive">+{{ totalSalesGrowth }}%</div>
          </div>
        </el-card>
        <el-card shadow="hover" class="stat-card">
          <div class="stat-item">
            <div class="stat-value">{{ totalOrders }}</div>
            <div class="stat-label">总订单</div>
            <div class="stat-trend positive">+{{ totalOrdersGrowth }}%</div>
          </div>
        </el-card>
      </div>
    </el-card>

    <el-card shadow="hover" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>销售趋势</span>
          <el-select v-model="timeRange" size="small" @change="getSalesData">
            <el-option label="近7天" value="7d"></el-option>
            <el-option label="近30天" value="30d"></el-option>
            <el-option label="近90天" value="90d"></el-option>
            <el-option label="近12个月" value="12m"></el-option>
          </el-select>
        </div>
      </template>
      <div class="chart-container">
        <div id="salesChart" style="width: 100%; height: 300px;"></div>
      </div>
    </el-card>

    <el-card shadow="hover" class="dashboard-card">
      <template #header>
        <div class="card-header">
          <span>最近订单</span>
        </div>
      </template>
      <el-table :data="recentOrders" style="width: 100%">
        <el-table-column prop="order_no" label="订单号"></el-table-column>
        <el-table-column prop="order_type" label="订单类型"></el-table-column>
        <el-table-column prop="total_amount" label="金额" formatter="formatPrice"></el-table-column>
        <el-table-column prop="status" label="状态"></el-table-column>
        <el-table-column prop="created_at" label="创建时间"></el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small">查看</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import api from '../api'

const todaySales = ref(12345.67)
const todaySalesGrowth = ref(15.2)
const todayOrders = ref(128)
const todayOrdersGrowth = ref(8.3)
const totalSales = ref(365210.45)
const totalSalesGrowth = ref(22.5)
const totalOrders = ref(3245)
const totalOrdersGrowth = ref(18.7)

const timeRange = ref('7d')
const salesChart = ref(null)
const recentOrders = ref([
  { order_no: 'ML20240101001', order_type: '商城订单', total_amount: 299.00, status: '已完成', created_at: '2024-01-01 10:30:00' },
  { order_no: 'DL20240101002', order_type: '配送订单', total_amount: 15.00, status: '已完成', created_at: '2024-01-01 09:15:00' },
  { order_no: 'TR20240101003', order_type: '出行订单', total_amount: 88.00, status: '已完成', created_at: '2024-01-01 08:45:00' },
  { order_no: 'ML20240101004', order_type: '商城订单', total_amount: 128.50, status: '已完成', created_at: '2024-01-01 07:30:00' }
])

const formatPrice = (row, column, cellValue) => {
  return `¥${cellValue}`
}

const initSalesChart = () => {
  const chartDom = document.getElementById('salesChart')
  salesChart.value = echarts.init(chartDom)
  updateSalesChart()
}

const updateSalesChart = () => {
  const option = {
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
      data: ['销售额', '订单数']
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
      data: ['12-26', '12-27', '12-28', '12-29', '12-30', '12-31', '01-01']
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        position: 'left',
        axisLabel: {
          formatter: '¥{value}'
        }
      },
      {
        type: 'value',
        name: '订单数',
        position: 'right',
        axisLabel: {
          formatter: '{value}单'
        }
      }
    ],
    series: [
      {
        name: '销售额',
        type: 'line',
        data: [8200, 9320, 9010, 9340, 12900, 13300, 12345],
        smooth: true,
        lineStyle: {
          color: '#667eea'
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(102, 126, 234, 0.3)' },
            { offset: 1, color: 'rgba(102, 126, 234, 0.1)' }
          ])
        }
      },
      {
        name: '订单数',
        type: 'line',
        yAxisIndex: 1,
        data: [86, 98, 92, 95, 115, 120, 128],
        smooth: true,
        lineStyle: {
          color: '#764ba2'
        }
      }
    ]
  }
  salesChart.value.setOption(option)
}

const getSalesData = () => {
  // 模拟数据更新
  updateSalesChart()
}

onMounted(() => {
  initSalesChart()
  window.addEventListener('resize', () => {
    salesChart.value?.resize()
  })
})

onUnmounted(() => {
  salesChart.value?.dispose()
  window.removeEventListener('resize', () => {
    salesChart.value?.resize()
  })
})
</script>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.dashboard-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.stat-card {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.stat-trend {
  font-size: 12px;
  font-weight: bold;
}

.stat-trend.positive {
  color: #52c41a;
}

.stat-trend.negative {
  color: #f5222d;
}

.chart-container {
  width: 100%;
  height: 300px;
}
</style>
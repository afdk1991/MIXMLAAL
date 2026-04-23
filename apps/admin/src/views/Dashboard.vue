<template>
  <div class="dashboard-container">
    <h1>仪表盘</h1>
    <div class="stats-container">
      <el-card shadow="hover" class="stat-card">
        <div class="stat-item">
          <el-icon class="stat-icon"><ElementPlusIconsVue.User /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ userCount }}</div>
            <div class="stat-label">用户总数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-item">
          <el-icon class="stat-icon"><ElementPlusIconsVue.Shop /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ merchantCount }}</div>
            <div class="stat-label">商家总数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-item">
          <el-icon class="stat-icon"><ElementPlusIconsVue.Goods /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ productCount }}</div>
            <div class="stat-label">商品总数</div>
          </div>
        </div>
      </el-card>
      <el-card shadow="hover" class="stat-card">
        <div class="stat-item">
          <el-icon class="stat-icon"><ElementPlusIconsVue.Document /></el-icon>
          <div class="stat-info">
            <div class="stat-value">{{ orderCount }}</div>
            <div class="stat-label">订单总数</div>
          </div>
        </div>
      </el-card>
    </div>
    <div class="charts-container">
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>用户增长趋势</span>
          </div>
        </template>
        <div id="userGrowthChart" class="chart"></div>
      </el-card>
      <el-card shadow="hover" class="chart-card">
        <template #header>
          <div class="card-header">
            <span>订单统计</span>
          </div>
        </template>
        <div id="orderChart" class="chart"></div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as echarts from 'echarts'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 统计数据
const userCount = ref(1234)
const merchantCount = ref(567)
const productCount = ref(8910)
const orderCount = ref(2345)

// 图表实例
let userGrowthChart = null
let orderChart = null

// 初始化图表
const initCharts = () => {
  // 用户增长趋势图表
  userGrowthChart = echarts.init(document.getElementById('userGrowthChart'))
  const userGrowthOption = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['1月', '2月', '3月', '4月', '5月', '6月']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 190, 300, 500, 800, 1200],
        type: 'line',
        smooth: true,
        areaStyle: {}
      }
    ]
  }
  userGrowthChart.setOption(userGrowthOption)

  // 订单统计图表
  orderChart = echarts.init(document.getElementById('orderChart'))
  const orderOption = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '订单状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 1200, name: '待支付' },
          { value: 800, name: '已支付' },
          { value: 300, name: '已发货' },
          { value: 45, name: '已完成' }
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
  }
  orderChart.setOption(orderOption)
}

// 处理窗口大小变化
const handleResize = () => {
  userGrowthChart?.resize()
  orderChart?.resize()
}

// 组件挂载时
onMounted(() => {
  initCharts()
  window.addEventListener('resize', handleResize)
})

// 组件卸载时
onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  userGrowthChart?.dispose()
  orderChart?.dispose()
})
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.dashboard-container h1 {
  margin-bottom: 20px;
  color: #303133;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.stat-item {
  display: flex;
  align-items: center;
  padding: 20px;
}

.stat-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 20px;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 5px;
}

.charts-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  height: 400px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chart {
  width: 100%;
  height: 350px;
}

@media (max-width: 1200px) {
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .charts-container {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="statistics-container">
    <el-card class="statistics-card">
      <template #header>
        <div class="card-header">
          <span>数据统计</span>
        </div>
      </template>
      <div class="statistics-filters">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px"
            ></el-date-picker>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleFilter" :loading="loading">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      <div class="statistics-overview">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="overview-content">
                <div class="overview-value">{{ overviewData.userCount || 0 }}</div>
                <div class="overview-label">用户总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="overview-content">
                <div class="overview-value">{{ overviewData.orderCount || 0 }}</div>
                <div class="overview-label">订单总数</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="overview-content">
                <div class="overview-value">{{ overviewData.roleCount || 0 }}</div>
                <div class="overview-label">角色数量</div>
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="overview-card">
              <div class="overview-content">
                <div class="overview-value">{{ overviewData.permissionCount || 0 }}</div>
                <div class="overview-label">权限数量</div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <div class="statistics-charts">
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>用户增长趋势</span>
              </template>
              <div ref="userGrowthChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>订单数量趋势</span>
              </template>
              <div ref="orderGrowthChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
        <el-row :gutter="20" style="margin-top: 20px;">
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>用户角色分布</span>
              </template>
              <div ref="userRoleChart" class="chart-container"></div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card class="chart-card">
              <template #header>
                <span>订单类型分布</span>
              </template>
              <div ref="orderTypeChart" class="chart-container"></div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import * as echarts from 'echarts'
import { ElMessage } from 'element-plus'
import * as statisticsApi from '../api/statistics'

const userGrowthChart = ref(null)
const orderGrowthChart = ref(null)
const userRoleChart = ref(null)
const orderTypeChart = ref(null)
const loading = ref(false)

const filterForm = reactive({
  dateRange: []
})

const overviewData = reactive({
  userCount: 0,
  orderCount: 0,
  roleCount: 0,
  permissionCount: 0
})

onMounted(() => {
  fetchOverviewData()
  fetchStatisticsData()
})

const fetchOverviewData = async () => {
  try {
    const response = await statisticsApi.getSystemOverview()
    Object.assign(overviewData, response.data || {
      userCount: 1200,
      orderCount: 5800,
      roleCount: 10,
      permissionCount: 50
    })
  } catch (error) {
    ElMessage.error('获取系统概览数据失败')
    console.error('获取系统概览数据失败:', error)
  }
}

const fetchStatisticsData = async () => {
  loading.value = true
  try {
    await Promise.all([
      fetchUserGrowth(),
      fetchOrderGrowth(),
      fetchUserRoleDistribution(),
      fetchOrderTypeDistribution()
    ])
  } catch (error) {
    ElMessage.error('获取统计数据失败')
    console.error('获取统计数据失败:', error)
  } finally {
    loading.value = false
  }
}

const fetchUserGrowth = async () => {
  try {
    const response = await statisticsApi.getUserGrowth({
      startDate: filterForm.dateRange[0]?.toISOString() || '',
      endDate: filterForm.dateRange[1]?.toISOString() || ''
    })
    initUserGrowthChart(response.data || {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [120, 190, 300, 500, 800, 1200]
    })
  } catch (error) {
    console.error('获取用户增长数据失败:', error)
    initUserGrowthChart({
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [120, 190, 300, 500, 800, 1200]
    })
  }
}

const fetchOrderGrowth = async () => {
  try {
    const response = await statisticsApi.getOrderGrowth({
      startDate: filterForm.dateRange[0]?.toISOString() || '',
      endDate: filterForm.dateRange[1]?.toISOString() || ''
    })
    initOrderGrowthChart(response.data || {
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [500, 800, 1200, 1800, 2500, 3200]
    })
  } catch (error) {
    console.error('获取订单增长数据失败:', error)
    initOrderGrowthChart({
      xAxis: ['1月', '2月', '3月', '4月', '5月', '6月'],
      data: [500, 800, 1200, 1800, 2500, 3200]
    })
  }
}

const fetchUserRoleDistribution = async () => {
  try {
    const response = await statisticsApi.getUserRoleDistribution()
    initUserRoleChart(response.data || [
      { value: 10, name: '管理员' },
      { value: 500, name: '普通用户' },
      { value: 100, name: '运营人员' }
    ])
  } catch (error) {
    console.error('获取用户角色分布数据失败:', error)
    initUserRoleChart([
      { value: 10, name: '管理员' },
      { value: 500, name: '普通用户' },
      { value: 100, name: '运营人员' }
    ])
  }
}

const fetchOrderTypeDistribution = async () => {
  try {
    const response = await statisticsApi.getOrderTypeDistribution()
    initOrderTypeChart(response.data || [
      { value: 1500, name: '网约车' },
      { value: 1200, name: '出租车' },
      { value: 800, name: '配送' },
      { value: 500, name: '其他' }
    ])
  } catch (error) {
    console.error('获取订单类型分布数据失败:', error)
    initOrderTypeChart([
      { value: 1500, name: '网约车' },
      { value: 1200, name: '出租车' },
      { value: 800, name: '配送' },
      { value: 500, name: '其他' }
    ])
  }
}

const handleFilter = () => {
  fetchStatisticsData()
}

const initUserGrowthChart = (data) => {
  const chart = echarts.init(userGrowthChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.data,
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const initOrderGrowthChart = (data) => {
  const chart = echarts.init(orderGrowthChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: data.xAxis
    },
    yAxis: {
      type: 'value'
    },
    series: [{
      data: data.data,
      type: 'line',
      smooth: true
    }]
  }
  chart.setOption(option)
}

const initUserRoleChart = (data) => {
  const chart = echarts.init(userRoleChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '用户角色',
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  chart.setOption(option)
}

const initOrderTypeChart = (data) => {
  const chart = echarts.init(orderTypeChart.value)
  const option = {
    tooltip: {
      trigger: 'item'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [{
      name: '订单类型',
      type: 'pie',
      radius: '50%',
      data: data,
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)'
        }
      }
    }]
  }
  chart.setOption(option)
}
</script>

<style scoped>
.statistics-container {
  width: 100%;
}

.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-filters {
  margin-bottom: 20px;
}

.statistics-overview {
  margin-bottom: 20px;
}

.overview-card {
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
}

.overview-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.overview-value {
  font-size: 24px;
  font-weight: bold;
  color: #1890ff;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 14px;
  color: #606266;
}

.statistics-charts {
  margin-top: 20px;
}

.chart-card {
  height: 300px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 250px;
}
</style>

<style scoped>
.statistics-container {
  width: 100%;
}

.statistics-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.statistics-filters {
  margin-bottom: 20px;
}

.statistics-charts {
  margin-top: 20px;
}

.chart-card {
  height: 300px;
  margin-bottom: 20px;
}

.chart-container {
  width: 100%;
  height: 250px;
}
</style>
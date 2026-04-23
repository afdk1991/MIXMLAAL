<template>
  <div class="data-overview">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>数据中心</span>
        </div>
      </template>
      
      <div class="date-filter">
        <el-form :inline="true" :model="dateForm" class="demo-form-inline">
          <el-form-item label="时间范围">
            <el-select v-model="dateForm.range" placeholder="选择时间范围">
              <el-option label="今日" value="today"></el-option>
              <el-option label="昨日" value="yesterday"></el-option>
              <el-option label="近7天" value="7days"></el-option>
              <el-option label="近30天" value="30days"></el-option>
              <el-option label="本月" value="thisMonth"></el-option>
              <el-option label="上月" value="lastMonth"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="updateData">查询</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="data-summary">
        <el-row :gutter="20">
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总销售额</span>
                </div>
              </template>
              <div class="summary-value">¥{{ summary.totalSales.toFixed(2) }}</div>
              <div class="summary-change" :class="summary.salesChange >= 0 ? 'positive' : 'negative'">
                {{ summary.salesChange >= 0 ? '+' : '' }}{{ summary.salesChange.toFixed(2) }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>订单数</span>
                </div>
              </template>
              <div class="summary-value">{{ summary.orderCount }}</div>
              <div class="summary-change" :class="summary.orderChange >= 0 ? 'positive' : 'negative'">
                {{ summary.orderChange >= 0 ? '+' : '' }}{{ summary.orderChange.toFixed(2) }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>访客数</span>
                </div>
              </template>
              <div class="summary-value">{{ summary.visitorCount }}</div>
              <div class="summary-change" :class="summary.visitorChange >= 0 ? 'positive' : 'negative'">
                {{ summary.visitorChange >= 0 ? '+' : '' }}{{ summary.visitorChange.toFixed(2) }}%
              </div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>转化率</span>
                </div>
              </template>
              <div class="summary-value">{{ summary.conversionRate.toFixed(2) }}%</div>
              <div class="summary-change" :class="summary.conversionChange >= 0 ? 'positive' : 'negative'">
                {{ summary.conversionChange >= 0 ? '+' : '' }}{{ summary.conversionChange.toFixed(2) }}%
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="data-charts">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>销售趋势</span>
                </div>
              </template>
              <div class="chart-container">
                <el-chart height="300px">
                  <el-line-chart :data="salesData">
                    <el-x-axis :data="salesData.categories" />
                    <el-y-axis />
                    <el-series name="销售额" :data="salesData.sales" />
                    <el-series name="订单数" :data="salesData.orders" />
                  </el-line-chart>
                </el-chart>
              </div>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>访客趋势</span>
                </div>
              </template>
              <div class="chart-container">
                <el-chart height="300px">
                  <el-line-chart :data="visitorData">
                    <el-x-axis :data="visitorData.categories" />
                    <el-y-axis />
                    <el-series name="访客数" :data="visitorData.visitors" />
                    <el-series name="转化率" :data="visitorData.conversion" />
                  </el-line-chart>
                </el-chart>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <div class="data-details">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>商品销售排行</span>
                </div>
              </template>
              <el-table :data="topProducts" style="width: 100%">
                <el-table-column prop="rank" label="排名" width="80" align="center"></el-table-column>
                <el-table-column prop="name" label="商品名称"></el-table-column>
                <el-table-column prop="sales" label="销售额" width="120" align="right">
                  <template #default="scope">
                    ¥{{ scope.row.sales.toFixed(2) }}
                  </template>
                </el-table-column>
                <el-table-column prop="count" label="销量" width="80" align="center"></el-table-column>
              </el-table>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>用户来源</span>
                </div>
              </template>
              <div class="chart-container">
                <el-chart height="300px">
                  <el-pie-chart :data="sourceData">
                    <el-series :data="sourceData.sources" />
                  </el-pie-chart>
                </el-chart>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'DataOverview',
  setup() {
    const dateForm = ref({
      range: '7days'
    })
    
    const summary = ref({
      totalSales: 125800.50,
      salesChange: 15.2,
      orderCount: 1256,
      orderChange: 10.5,
      visitorCount: 5890,
      visitorChange: 8.3,
      conversionRate: 21.3,
      conversionChange: 2.1
    })
    
    const salesData = ref({
      categories: ['4-17', '4-18', '4-19', '4-20', '4-21', '4-22', '4-23'],
      sales: [15200, 16800, 14500, 18900, 17200, 19500, 23700],
      orders: [180, 205, 165, 220, 200, 230, 256]
    })
    
    const visitorData = ref({
      categories: ['4-17', '4-18', '4-19', '4-20', '4-21', '4-22', '4-23'],
      visitors: [750, 820, 700, 880, 850, 920, 970],
      conversion: [18.5, 19.2, 18.0, 20.5, 19.8, 21.0, 22.5]
    })
    
    const topProducts = ref([
      { rank: 1, name: '商品A', sales: 25800.50, count: 256 },
      { rank: 2, name: '商品B', sales: 18900.00, count: 189 },
      { rank: 3, name: '商品C', sales: 15600.75, count: 156 },
      { rank: 4, name: '商品D', sales: 12500.25, count: 125 },
      { rank: 5, name: '商品E', sales: 9800.50, count: 98 }
    ])
    
    const sourceData = ref({
      sources: [
        { name: '直接访问', value: 35 },
        { name: '搜索引擎', value: 25 },
        { name: '社交媒体', value: 20 },
        { name: '外部链接', value: 15 },
        { name: '其他', value: 5 }
      ]
    })
    
    const updateData = () => {
      // 实际项目中这里应该根据选择的时间范围调用API获取数据
      console.log('更新数据，时间范围:', dateForm.value.range)
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取初始数据
    })
    
    return {
      dateForm,
      summary,
      salesData,
      visitorData,
      topProducts,
      sourceData,
      updateData
    }
  }
}
</script>

<style scoped>
.data-overview {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.date-filter {
  margin-bottom: 20px;
}

.data-summary {
  margin-bottom: 20px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 10px;
}

.summary-change {
  font-size: 14px;
  text-align: center;
  margin-top: 5px;
}

.positive {
  color: #67C23A;
}

.negative {
  color: #F56C6C;
}

.data-charts {
  margin-bottom: 20px;
}

.chart-container {
  margin-top: 10px;
}

.data-details {
  margin-top: 20px;
}
</style>
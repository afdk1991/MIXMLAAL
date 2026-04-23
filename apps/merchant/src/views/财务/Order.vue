<template>
  <div class="finance-order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>订单对账</span>
          <el-button type="primary" size="small">
            <el-icon><Download /></el-icon>
            导出报表
          </el-button>
        </div>
      </template>
      
      <div class="order-filter">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="订单类型">
            <el-select v-model="filterForm.orderType" placeholder="选择类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="商城订单" value="mall"></el-option>
              <el-option label="配送订单" value="delivery"></el-option>
              <el-option label="出行订单" value="travel"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="filterForm.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchOrders">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <div class="summary">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总订单数</span>
                </div>
              </template>
              <div class="summary-value">{{ summary.totalOrders }}</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>总金额</span>
                </div>
              </template>
              <div class="summary-value">¥{{ summary.totalAmount.toFixed(2) }}</div>
            </el-card>
          </el-col>
          <el-col :span="8">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>平台佣金</span>
                </div>
              </template>
              <div class="summary-value">¥{{ summary.platformFee.toFixed(2) }}</div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      
      <el-table :data="orderList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180"></el-table-column>
        <el-table-column prop="orderType" label="订单类型" width="120">
          <template #default="scope">
            <el-tag :type="getOrderTypeTag(scope.row.orderType)">
              {{ getOrderTypeText(scope.row.orderType) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="订单金额" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.amount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="platformFee" label="平台佣金" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.platformFee.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="actualAmount" label="实际收入" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.actualAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="orderStatus" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.orderStatus)">
              {{ scope.row.orderStatus }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="settled" label="是否结算" width="100" align="center">
          <template #default="scope">
            <el-switch v-model="scope.row.settled" disabled />
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Download } from '@element-plus/icons-vue'

export default {
  name: 'FinanceOrder',
  components: {
    Download
  },
  setup() {
    const filterForm = ref({
      orderType: '',
      dateRange: []
    })
    
    const orderList = ref([])
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    const summary = ref({
      totalOrders: 0,
      totalAmount: 0,
      platformFee: 0
    })
    
    // 模拟订单数据
    const mockOrders = [
      {
        id: 1,
        orderNo: 'M202604230001',
        orderType: 'mall',
        amount: 299.99,
        platformFee: 29.99,
        actualAmount: 270.00,
        orderStatus: '已完成',
        createdAt: '2026-04-23 10:00:00',
        settled: true
      },
      {
        id: 2,
        orderNo: 'D202604230001',
        orderType: 'delivery',
        amount: 29.99,
        platformFee: 3.00,
        actualAmount: 26.99,
        orderStatus: '已完成',
        createdAt: '2026-04-23 11:30:00',
        settled: true
      },
      {
        id: 3,
        orderNo: 'T202604230001',
        orderType: 'travel',
        amount: 49.99,
        platformFee: 5.00,
        actualAmount: 44.99,
        orderStatus: '已完成',
        createdAt: '2026-04-23 14:20:00',
        settled: false
      },
      {
        id: 4,
        orderNo: 'M202604230002',
        orderType: 'mall',
        amount: 159.99,
        platformFee: 15.99,
        actualAmount: 144.00,
        orderStatus: '已完成',
        createdAt: '2026-04-23 09:15:00',
        settled: true
      }
    ]
    
    const getOrderTypeText = (type) => {
      const typeMap = {
        mall: '商城订单',
        delivery: '配送订单',
        travel: '出行订单'
      }
      return typeMap[type] || type
    }
    
    const getOrderTypeTag = (type) => {
      const tagMap = {
        mall: 'success',
        delivery: 'info',
        travel: 'warning'
      }
      return tagMap[type] || 'default'
    }
    
    const getStatusType = (status) => {
      if (status === '已完成') {
        return 'success'
      } else if (status === '待支付') {
        return 'warning'
      } else if (status === '已取消') {
        return 'danger'
      }
      return 'info'
    }
    
    const searchOrders = () => {
      // 实际项目中这里应该调用API获取数据
      orderList.value = mockOrders
      pagination.value.total = mockOrders.length
      
      // 计算汇总数据
      summary.value = {
        totalOrders: mockOrders.length,
        totalAmount: mockOrders.reduce((sum, order) => sum + order.amount, 0),
        platformFee: mockOrders.reduce((sum, order) => sum + order.platformFee, 0)
      }
    }
    
    const resetFilter = () => {
      filterForm.value = {
        orderType: '',
        dateRange: []
      }
      searchOrders()
    }
    
    const handleSizeChange = (size) => {
      pagination.value.pageSize = size
      searchOrders()
    }
    
    const handleCurrentChange = (current) => {
      pagination.value.currentPage = current
      searchOrders()
    }
    
    onMounted(() => {
      searchOrders()
    })
    
    return {
      filterForm,
      orderList,
      pagination,
      summary,
      getOrderTypeText,
      getOrderTypeTag,
      getStatusType,
      searchOrders,
      resetFilter,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.finance-order {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-filter {
  margin-bottom: 20px;
}

.summary {
  margin-bottom: 20px;
}

.summary-value {
  font-size: 24px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 10px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
<template>
  <div class="mall-order">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商城订单管理</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新建订单
          </el-button>
        </div>
      </template>
      
      <div class="order-filter">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="订单状态">
            <el-select v-model="filterForm.status" placeholder="选择状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="待支付" value="pending_payment"></el-option>
              <el-option label="待发货" value="pending_shipping"></el-option>
              <el-option label="待收货" value="pending_receipt"></el-option>
              <el-option label="已完成" value="completed"></el-option>
              <el-option label="已取消" value="cancelled"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="订单编号">
            <el-input v-model="filterForm.orderNo" placeholder="输入订单编号" style="width: 150px;"></el-input>
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
      
      <el-table :data="orderList" style="width: 100%">
        <el-table-column prop="orderNo" label="订单编号" width="180"></el-table-column>
        <el-table-column prop="userName" label="用户" width="120"></el-table-column>
        <el-table-column prop="totalAmount" label="订单金额" width="100" align="right">
          <template #default="scope">
            ¥{{ scope.row.totalAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180"></el-table-column>
        <el-table-column prop="paymentTime" label="支付时间" width="180"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="viewOrderDetail(scope.row.id)">详情</el-button>
            <el-button size="small" type="primary" @click="processOrder(scope.row)">
              {{ getProcessButtonText(scope.row.status) }}
            </el-button>
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
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'MallOrder',
  components: {
    Plus
  },
  setup() {
    const filterForm = ref({
      status: '',
      orderNo: '',
      dateRange: []
    })
    
    const orderList = ref([])
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 模拟订单数据
    const mockOrders = [
      {
        id: 1,
        orderNo: 'M202604230001',
        userName: '张三',
        totalAmount: 299.99,
        status: 'pending_payment',
        createdAt: '2026-04-23 10:00:00',
        paymentTime: null
      },
      {
        id: 2,
        orderNo: 'M202604230002',
        userName: '李四',
        totalAmount: 159.99,
        status: 'pending_shipping',
        createdAt: '2026-04-23 11:30:00',
        paymentTime: '2026-04-23 11:35:00'
      },
      {
        id: 3,
        orderNo: 'M202604230003',
        userName: '王五',
        totalAmount: 89.99,
        status: 'pending_receipt',
        createdAt: '2026-04-23 14:20:00',
        paymentTime: '2026-04-23 14:25:00'
      },
      {
        id: 4,
        orderNo: 'M202604230004',
        userName: '赵六',
        totalAmount: 499.99,
        status: 'completed',
        createdAt: '2026-04-23 09:15:00',
        paymentTime: '2026-04-23 09:20:00'
      }
    ]
    
    const getStatusText = (status) => {
      const statusMap = {
        pending_payment: '待支付',
        pending_shipping: '待发货',
        pending_receipt: '待收货',
        completed: '已完成',
        cancelled: '已取消'
      }
      return statusMap[status] || status
    }
    
    const getStatusType = (status) => {
      const typeMap = {
        pending_payment: 'warning',
        pending_shipping: 'info',
        pending_receipt: 'info',
        completed: 'success',
        cancelled: 'danger'
      }
      return typeMap[status] || 'default'
    }
    
    const getProcessButtonText = (status) => {
      const buttonMap = {
        pending_payment: '催付',
        pending_shipping: '发货',
        pending_receipt: '提醒收货',
        completed: '查看',
        cancelled: '查看'
      }
      return buttonMap[status] || '操作'
    }
    
    const searchOrders = () => {
      // 实际项目中这里应该调用API获取数据
      orderList.value = mockOrders
      pagination.value.total = mockOrders.length
    }
    
    const resetFilter = () => {
      filterForm.value = {
        status: '',
        orderNo: '',
        dateRange: []
      }
      searchOrders()
    }
    
    const viewOrderDetail = (id) => {
      // 跳转到订单详情页
      console.log('查看订单详情:', id)
    }
    
    const processOrder = (order) => {
      // 处理订单
      console.log('处理订单:', order)
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
      getStatusText,
      getStatusType,
      getProcessButtonText,
      searchOrders,
      resetFilter,
      viewOrderDetail,
      processOrder,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.mall-order {
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

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
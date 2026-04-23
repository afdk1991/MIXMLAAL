<template>
  <div class="orders-container">
    <h1>订单管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>订单列表</span>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索订单号" style="width: 300px; margin-right: 10px;">
          <template #append>
            <el-button @click="handleSearch"><el-icon><ElementPlusIconsVue.Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="订单状态" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="待支付" value="pending" />
          <el-option label="已支付" value="paid" />
          <el-option label="已发货" value="shipped" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-table :data="ordersData" style="width: 100%;" border>
        <el-table-column prop="id" label="订单ID" width="100" />
        <el-table-column prop="order_no" label="订单号" />
        <el-table-column prop="user_id" label="用户ID" width="100" />
        <el-table-column prop="total_amount" label="订单金额" width="120" />
        <el-table-column prop="status" label="订单状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getOrderStatusType(row.status)">
              {{ getOrderStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleViewOrder(row)">查看</el-button>
            <el-button size="small" type="primary" @click="handleProcessOrder(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../api'

// 表格数据
const ordersData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 获取订单列表
const getOrderList = async () => {
  try {
    const response = await api.get('/orders', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
    })
    ordersData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取订单列表失败')
    console.error('获取订单列表失败:', error)
  }
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const statusTypes = {
    pending: 'warning',
    paid: 'info',
    shipped: 'primary',
    completed: 'success',
    cancelled: 'danger'
  }
  return statusTypes[status] || 'default'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const statusTexts = {
    pending: '待支付',
    paid: '已支付',
    shipped: '已发货',
    completed: '已完成',
    cancelled: '已取消'
  }
  return statusTexts[status] || '未知'
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getOrderList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getOrderList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getOrderList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getOrderList()
}

// 处理查看订单
const handleViewOrder = (row) => {
  // 跳转到订单详情页
  console.log('查看订单:', row.id)
}

// 处理订单
const handleProcessOrder = (row) => {
  // 处理订单逻辑
  console.log('处理订单:', row.id)
}

// 组件挂载时
onMounted(() => {
  getOrderList()
})
</script>

<style scoped>
.orders-container {
  padding: 20px;
}

.orders-container h1 {
  margin-bottom: 20px;
  color: #303133;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-container {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
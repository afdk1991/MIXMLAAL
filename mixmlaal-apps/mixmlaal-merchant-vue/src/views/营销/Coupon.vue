<template>
  <div class="marketing-coupon">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>优惠券管理</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新建优惠券
          </el-button>
        </div>
      </template>
      
      <div class="coupon-filter">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="优惠券类型">
            <el-select v-model="filterForm.type" placeholder="选择类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="满减券" value="满减券"></el-option>
              <el-option label="折扣券" value="折扣券"></el-option>
              <el-option label="代金券" value="代金券"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="优惠券状态">
            <el-select v-model="filterForm.status" placeholder="选择状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="未开始" value="未开始"></el-option>
              <el-option label="进行中" value="进行中"></el-option>
              <el-option label="已结束" value="已结束"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchCoupons">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="couponList" style="width: 100%">
        <el-table-column prop="couponName" label="优惠券名称" width="180"></el-table-column>
        <el-table-column prop="couponType" label="优惠券类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.couponType)">
              {{ scope.row.couponType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="couponValue" label="优惠券金额" width="120" align="right">
          <template #default="scope">
            {{ scope.row.couponType === '折扣券' ? scope.row.couponValue + '折' : '¥' + scope.row.couponValue.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="minSpend" label="最低消费" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.minSpend.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180"></el-table-column>
        <el-table-column prop="endTime" label="结束时间" width="180"></el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.status }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="总数量" width="100" align="center"></el-table-column>
        <el-table-column prop="usedCount" label="已使用" width="100" align="center"></el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editCoupon(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteCoupon(scope.row.id)">删除</el-button>
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
  name: 'Coupon',
  components: {
    Plus
  },
  setup() {
    const filterForm = ref({
      type: '',
      status: ''
    })
    
    const couponList = ref([])
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 模拟优惠券数据
    const mockCoupons = [
      {
        id: 1,
        couponName: '新人满减券',
        couponType: '满减券',
        couponValue: 20,
        minSpend: 100,
        startTime: '2026-04-01 00:00:00',
        endTime: '2026-04-30 23:59:59',
        status: '进行中',
        totalCount: 1000,
        usedCount: 256
      },
      {
        id: 2,
        couponName: '会员折扣券',
        couponType: '折扣券',
        couponValue: 8.5,
        minSpend: 50,
        startTime: '2026-04-01 00:00:00',
        endTime: '2026-04-30 23:59:59',
        status: '进行中',
        totalCount: 500,
        usedCount: 128
      },
      {
        id: 3,
        couponName: '限时代金券',
        couponType: '代金券',
        couponValue: 10,
        minSpend: 0,
        startTime: '2026-04-01 00:00:00',
        endTime: '2026-04-15 23:59:59',
        status: '已结束',
        totalCount: 200,
        usedCount: 200
      },
      {
        id: 4,
        couponName: '五一满减券',
        couponType: '满减券',
        couponValue: 50,
        minSpend: 200,
        startTime: '2026-05-01 00:00:00',
        endTime: '2026-05-07 23:59:59',
        status: '未开始',
        totalCount: 800,
        usedCount: 0
      }
    ]
    
    const getTypeTag = (type) => {
      const tagMap = {
        '满减券': 'success',
        '折扣券': 'info',
        '代金券': 'warning'
      }
      return tagMap[type] || 'default'
    }
    
    const getStatusType = (status) => {
      if (status === '进行中') {
        return 'success'
      } else if (status === '未开始') {
        return 'warning'
      } else if (status === '已结束') {
        return 'danger'
      }
      return 'default'
    }
    
    const searchCoupons = () => {
      // 实际项目中这里应该调用API获取数据
      couponList.value = mockCoupons
      pagination.value.total = mockCoupons.length
    }
    
    const resetFilter = () => {
      filterForm.value = {
        type: '',
        status: ''
      }
      searchCoupons()
    }
    
    const editCoupon = (id) => {
      // 编辑优惠券
      console.log('编辑优惠券:', id)
    }
    
    const deleteCoupon = (id) => {
      // 删除优惠券
      console.log('删除优惠券:', id)
    }
    
    const handleSizeChange = (size) => {
      pagination.value.pageSize = size
      searchCoupons()
    }
    
    const handleCurrentChange = (current) => {
      pagination.value.currentPage = current
      searchCoupons()
    }
    
    onMounted(() => {
      searchCoupons()
    })
    
    return {
      filterForm,
      couponList,
      pagination,
      getTypeTag,
      getStatusType,
      searchCoupons,
      resetFilter,
      editCoupon,
      deleteCoupon,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.marketing-coupon {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.coupon-filter {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
<template>
  <div class="marketing-activity">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>活动管理</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新建活动
          </el-button>
        </div>
      </template>
      
      <div class="activity-filter">
        <el-form :inline="true" :model="filterForm" class="demo-form-inline">
          <el-form-item label="活动类型">
            <el-select v-model="filterForm.type" placeholder="选择类型">
              <el-option label="全部" value=""></el-option>
              <el-option label="限时折扣" value="限时折扣"></el-option>
              <el-option label="满减活动" value="满减活动"></el-option>
              <el-option label="买赠活动" value="买赠活动"></el-option>
              <el-option label="新品上市" value="新品上市"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="活动状态">
            <el-select v-model="filterForm.status" placeholder="选择状态">
              <el-option label="全部" value=""></el-option>
              <el-option label="未开始" value="未开始"></el-option>
              <el-option label="进行中" value="进行中"></el-option>
              <el-option label="已结束" value="已结束"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="searchActivities">查询</el-button>
            <el-button @click="resetFilter">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <el-table :data="activityList" style="width: 100%">
        <el-table-column prop="activityName" label="活动名称" width="180"></el-table-column>
        <el-table-column prop="activityType" label="活动类型" width="120">
          <template #default="scope">
            <el-tag :type="getTypeTag(scope.row.activityType)">
              {{ scope.row.activityType }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="activityDesc" label="活动描述" width="200">
          <template #default="scope">
            {{ scope.row.activityDesc.slice(0, 30) }}{{ scope.row.activityDesc.length > 30 ? '...' : '' }}
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
        <el-table-column prop="participants" label="参与人数" width="100" align="center"></el-table-column>
        <el-table-column prop="salesAmount" label="销售金额" width="120" align="right">
          <template #default="scope">
            ¥{{ scope.row.salesAmount.toFixed(2) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="scope">
            <el-button size="small" @click="editActivity(scope.row.id)">编辑</el-button>
            <el-button size="small" type="danger" @click="deleteActivity(scope.row.id)">删除</el-button>
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
  name: 'Activity',
  components: {
    Plus
  },
  setup() {
    const filterForm = ref({
      type: '',
      status: ''
    })
    
    const activityList = ref([])
    const pagination = ref({
      currentPage: 1,
      pageSize: 10,
      total: 0
    })
    
    // 模拟活动数据
    const mockActivities = [
      {
        id: 1,
        activityName: '春季促销活动',
        activityType: '限时折扣',
        activityDesc: '春季新品限时8折，满200减50',
        startTime: '2026-04-01 00:00:00',
        endTime: '2026-04-30 23:59:59',
        status: '进行中',
        participants: 1256,
        salesAmount: 258900.50
      },
      {
        id: 2,
        activityName: '会员专享活动',
        activityType: '满减活动',
        activityDesc: '会员购物满300减100，满500减200',
        startTime: '2026-04-01 00:00:00',
        endTime: '2026-04-30 23:59:59',
        status: '进行中',
        participants: 892,
        salesAmount: 189500.80
      },
      {
        id: 3,
        activityName: '新品上市活动',
        activityType: '新品上市',
        activityDesc: '新品上市，首周9折优惠',
        startTime: '2026-03-15 00:00:00',
        endTime: '2026-03-31 23:59:59',
        status: '已结束',
        participants: 654,
        salesAmount: 125600.20
      },
      {
        id: 4,
        activityName: '五一促销活动',
        activityType: '买赠活动',
        activityDesc: '五一期间，买满299送精美礼品',
        startTime: '2026-05-01 00:00:00',
        endTime: '2026-05-07 23:59:59',
        status: '未开始',
        participants: 0,
        salesAmount: 0
      }
    ]
    
    const getTypeTag = (type) => {
      const tagMap = {
        '限时折扣': 'success',
        '满减活动': 'info',
        '买赠活动': 'warning',
        '新品上市': 'primary'
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
    
    const searchActivities = () => {
      // 实际项目中这里应该调用API获取数据
      activityList.value = mockActivities
      pagination.value.total = mockActivities.length
    }
    
    const resetFilter = () => {
      filterForm.value = {
        type: '',
        status: ''
      }
      searchActivities()
    }
    
    const editActivity = (id) => {
      // 编辑活动
      console.log('编辑活动:', id)
    }
    
    const deleteActivity = (id) => {
      // 删除活动
      console.log('删除活动:', id)
    }
    
    const handleSizeChange = (size) => {
      pagination.value.pageSize = size
      searchActivities()
    }
    
    const handleCurrentChange = (current) => {
      pagination.value.currentPage = current
      searchActivities()
    }
    
    onMounted(() => {
      searchActivities()
    })
    
    return {
      filterForm,
      activityList,
      pagination,
      getTypeTag,
      getStatusType,
      searchActivities,
      resetFilter,
      editActivity,
      deleteActivity,
      handleSizeChange,
      handleCurrentChange
    }
  }
}
</script>

<style scoped>
.marketing-activity {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-filter {
  margin-bottom: 20px;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>
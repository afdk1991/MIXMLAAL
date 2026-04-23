<template>
  <div class="merchants-container">
    <h1>商家管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商家列表</span>
          <el-button type="primary" @click="handleAddMerchant">添加商家</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索商家名称" style="width: 300px; margin-right: 10px;">
          <template #append>
            <el-button @click="handleSearch"><el-icon><ElementPlusIconsVue.Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-select v-model="statusFilter" placeholder="状态" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="活跃" value="active" />
          <el-option label="禁用" value="inactive" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-table :data="merchantsData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商家名称" />
        <el-table-column prop="contact_name" label="联系人" />
        <el-table-column prop="contact_phone" label="联系电话" />
        <el-table-column prop="address" label="地址" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditMerchant(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteMerchant(row.id)">删除</el-button>
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

    <!-- 添加/编辑商家对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商家' : '添加商家'"
      width="500px"
    >
      <el-form :model="merchantForm" :rules="merchantRules" ref="merchantFormRef" label-width="100px">
        <el-form-item label="商家名称" prop="name">
          <el-input v-model="merchantForm.name" placeholder="请输入商家名称" />
        </el-form-item>
        <el-form-item label="联系人" prop="contact_name">
          <el-input v-model="merchantForm.contact_name" placeholder="请输入联系人" />
        </el-form-item>
        <el-form-item label="联系电话" prop="contact_phone">
          <el-input v-model="merchantForm.contact_phone" placeholder="请输入联系电话" />
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="merchantForm.address" type="textarea" placeholder="请输入地址" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="merchantForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveMerchant">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../api'

// 表格数据
const merchantsData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const merchantForm = reactive({
  id: '',
  name: '',
  contact_name: '',
  contact_phone: '',
  address: '',
  status: 'active'
})

// 表单规则
const merchantRules = {
  name: [
    { required: true, message: '请输入商家名称', trigger: 'blur' },
    { min: 2, message: '商家名称长度至少为2位', trigger: 'blur' }
  ],
  contact_name: [
    { required: true, message: '请输入联系人', trigger: 'blur' }
  ],
  contact_phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' }
  ],
  address: [
    { required: true, message: '请输入地址', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ]
}

// 获取商家列表
const getMerchantList = async () => {
  try {
    const response = await api.get('/merchants', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
    })
    merchantsData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取商家列表失败')
    console.error('获取商家列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getMerchantList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getMerchantList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getMerchantList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getMerchantList()
}

// 处理添加商家
const handleAddMerchant = () => {
  isEdit.value = false
  merchantForm.id = ''
  merchantForm.name = ''
  merchantForm.contact_name = ''
  merchantForm.contact_phone = ''
  merchantForm.address = ''
  merchantForm.status = 'active'
  dialogVisible.value = true
}

// 处理编辑商家
const handleEditMerchant = (row) => {
  isEdit.value = true
  merchantForm.id = row.id
  merchantForm.name = row.name
  merchantForm.contact_name = row.contact_name
  merchantForm.contact_phone = row.contact_phone
  merchantForm.address = row.address
  merchantForm.status = row.status
  dialogVisible.value = true
}

// 处理保存商家
const handleSaveMerchant = async () => {
  try {
    if (isEdit.value) {
      // 编辑商家
      await api.put(`/merchants/${merchantForm.id}`, merchantForm)
      ElMessage.success('编辑商家成功')
    } else {
      // 添加商家
      await api.post('/merchants', merchantForm)
      ElMessage.success('添加商家成功')
    }
    dialogVisible.value = false
    getMerchantList()
  } catch (error) {
    ElMessage.error('保存商家失败')
    console.error('保存商家失败:', error)
  }
}

// 处理删除商家
const handleDeleteMerchant = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商家吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/merchants/${id}`)
    ElMessage.success('删除商家成功')
    getMerchantList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商家失败')
      console.error('删除商家失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getMerchantList()
})
</script>

<style scoped>
.merchants-container {
  padding: 20px;
}

.merchants-container h1 {
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

.dialog-footer {
  display: flex;
  justify-content: flex-end;
}
</style>
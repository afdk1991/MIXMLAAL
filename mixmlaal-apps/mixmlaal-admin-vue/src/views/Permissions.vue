<template>
  <div class="permissions-container">
    <h1>权限管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>权限列表</span>
          <el-button type="primary" @click="handleAddPermission">添加权限</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索权限名称" style="width: 300px; margin-right: 10px;">
          <template #append>
            <el-button @click="handleSearch"><el-icon><ElementPlusIconsVue.Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-table :data="permissionsData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="权限名称" />
        <el-table-column prop="code" label="权限编码" />
        <el-table-column prop="description" label="权限描述" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditPermission(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeletePermission(row.id)">删除</el-button>
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

    <!-- 添加/编辑权限对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑权限' : '添加权限'"
      width="500px"
    >
      <el-form :model="permissionForm" :rules="permissionRules" ref="permissionFormRef" label-width="100px">
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="permissionForm.name" placeholder="请输入权限名称" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="permissionForm.code" placeholder="请输入权限编码" />
        </el-form-item>
        <el-form-item label="权限描述" prop="description">
          <el-input v-model="permissionForm.description" type="textarea" placeholder="请输入权限描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSavePermission">保存</el-button>
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
const permissionsData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索
const searchQuery = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const permissionForm = reactive({
  id: '',
  name: '',
  code: '',
  description: ''
})

// 表单规则
const permissionRules = {
  name: [
    { required: true, message: '请输入权限名称', trigger: 'blur' },
    { min: 2, message: '权限名称长度至少为2位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入权限编码', trigger: 'blur' },
    { min: 2, message: '权限编码长度至少为2位', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入权限描述', trigger: 'blur' }
  ]
}

// 获取权限列表
const getPermissionList = async () => {
  try {
    const response = await api.get('/permissions', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value
      }
    })
    permissionsData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error('获取权限列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getPermissionList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  currentPage.value = 1
  getPermissionList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getPermissionList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getPermissionList()
}

// 处理添加权限
const handleAddPermission = () => {
  isEdit.value = false
  permissionForm.id = ''
  permissionForm.name = ''
  permissionForm.code = ''
  permissionForm.description = ''
  dialogVisible.value = true
}

// 处理编辑权限
const handleEditPermission = (row) => {
  isEdit.value = true
  permissionForm.id = row.id
  permissionForm.name = row.name
  permissionForm.code = row.code
  permissionForm.description = row.description
  dialogVisible.value = true
}

// 处理保存权限
const handleSavePermission = async () => {
  try {
    if (isEdit.value) {
      // 编辑权限
      await api.put(`/permissions/${permissionForm.id}`, permissionForm)
      ElMessage.success('编辑权限成功')
    } else {
      // 添加权限
      await api.post('/permissions', permissionForm)
      ElMessage.success('添加权限成功')
    }
    dialogVisible.value = false
    getPermissionList()
  } catch (error) {
    ElMessage.error('保存权限失败')
    console.error('保存权限失败:', error)
  }
}

// 处理删除权限
const handleDeletePermission = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个权限吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/permissions/${id}`)
    ElMessage.success('删除权限成功')
    getPermissionList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除权限失败')
      console.error('删除权限失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getPermissionList()
})
</script>

<style scoped>
.permissions-container {
  padding: 20px;
}

.permissions-container h1 {
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
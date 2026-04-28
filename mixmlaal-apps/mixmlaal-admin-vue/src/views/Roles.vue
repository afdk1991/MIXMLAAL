<template>
  <div class="roles-container">
    <h1>角色管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>角色列表</span>
          <el-button type="primary" @click="handleAddRole">添加角色</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索角色名称" style="width: 300px; margin-right: 10px;">
          <template #append>
            <el-button @click="handleSearch"><el-icon><ElementPlusIconsVue.Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-table :data="rolesData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="角色名称" />
        <el-table-column prop="description" label="角色描述" />
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditRole(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteRole(row.id)">删除</el-button>
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

    <!-- 添加/编辑角色对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑角色' : '添加角色'"
      width="500px"
    >
      <el-form :model="roleForm" :rules="roleRules" ref="roleFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="roleForm.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="roleForm.description" type="textarea" placeholder="请输入角色描述" />
        </el-form-item>
        <el-form-item label="权限" prop="permissions">
          <el-select v-model="roleForm.permissions" multiple placeholder="请选择权限">
            <el-option v-for="permission in permissions" :key="permission.id" :label="permission.name" :value="permission.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveRole">保存</el-button>
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
const rolesData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索
const searchQuery = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const roleForm = reactive({
  id: '',
  name: '',
  description: '',
  permissions: []
})

// 表单规则
const roleRules = {
  name: [
    { required: true, message: '请输入角色名称', trigger: 'blur' },
    { min: 2, message: '角色名称长度至少为2位', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入角色描述', trigger: 'blur' }
  ],
  permissions: [
    { required: true, message: '请选择权限', trigger: 'blur' }
  ]
}

// 权限列表
const permissions = ref([])

// 获取角色列表
const getRoleList = async () => {
  try {
    const response = await api.get('/roles', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value
      }
    })
    rolesData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('获取角色列表失败:', error)
  }
}

// 获取权限列表
const getPermissions = async () => {
  try {
    const response = await api.get('/permissions')
    permissions.value = response.data.data
  } catch (error) {
    ElMessage.error('获取权限列表失败')
    console.error('获取权限列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getRoleList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  currentPage.value = 1
  getRoleList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getRoleList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getRoleList()
}

// 处理添加角色
const handleAddRole = () => {
  isEdit.value = false
  roleForm.id = ''
  roleForm.name = ''
  roleForm.description = ''
  roleForm.permissions = []
  dialogVisible.value = true
}

// 处理编辑角色
const handleEditRole = (row) => {
  isEdit.value = true
  roleForm.id = row.id
  roleForm.name = row.name
  roleForm.description = row.description
  roleForm.permissions = row.permissions.map(permission => permission.id)
  dialogVisible.value = true
}

// 处理保存角色
const handleSaveRole = async () => {
  try {
    if (isEdit.value) {
      // 编辑角色
      await api.put(`/roles/${roleForm.id}`, roleForm)
      ElMessage.success('编辑角色成功')
    } else {
      // 添加角色
      await api.post('/roles', roleForm)
      ElMessage.success('添加角色成功')
    }
    dialogVisible.value = false
    getRoleList()
  } catch (error) {
    ElMessage.error('保存角色失败')
    console.error('保存角色失败:', error)
  }
}

// 处理删除角色
const handleDeleteRole = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个角色吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/roles/${id}`)
    ElMessage.success('删除角色成功')
    getRoleList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除角色失败')
      console.error('删除角色失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getRoleList()
  getPermissions()
})
</script>

<style scoped>
.roles-container {
  padding: 20px;
}

.roles-container h1 {
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
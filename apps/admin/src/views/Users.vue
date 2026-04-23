<template>
  <div class="users-container">
    <h1>用户管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleAddUser">添加用户</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索用户名或邮箱" style="width: 300px; margin-right: 10px;">
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
      <el-table :data="usersData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="email" label="邮箱" />
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
            <el-button size="small" @click="handleEditUser(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteUser(row.id)">删除</el-button>
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

    <!-- 添加/编辑用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑用户' : '添加用户'"
      width="500px"
    >
      <el-form :model="userForm" :rules="userRules" ref="userFormRef" label-width="100px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="userForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="userForm.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="密码" prop="password" v-if="!isEdit">
          <el-input v-model="userForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="userForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="userForm.roles" multiple placeholder="请选择角色">
            <el-option v-for="role in roles" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveUser">保存</el-button>
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
const usersData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const userForm = reactive({
  id: '',
  username: '',
  email: '',
  password: '',
  status: 'active',
  roles: []
})

// 表单规则
const userRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, message: '用户名长度至少为2位', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6位', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ],
  roles: [
    { required: true, message: '请选择角色', trigger: 'blur' }
  ]
}

// 角色列表
const roles = ref([])

// 获取用户列表
const getUserList = async () => {
  try {
    const response = await api.get('/users', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
    })
    usersData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取用户列表失败')
    console.error('获取用户列表失败:', error)
  }
}

// 获取角色列表
const getRoles = async () => {
  try {
    const response = await api.get('/roles')
    roles.value = response.data.data
  } catch (error) {
    ElMessage.error('获取角色列表失败')
    console.error('获取角色列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getUserList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getUserList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getUserList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getUserList()
}

// 处理添加用户
const handleAddUser = () => {
  isEdit.value = false
  userForm.id = ''
  userForm.username = ''
  userForm.email = ''
  userForm.password = ''
  userForm.status = 'active'
  userForm.roles = []
  dialogVisible.value = true
}

// 处理编辑用户
const handleEditUser = (row) => {
  isEdit.value = true
  userForm.id = row.id
  userForm.username = row.username
  userForm.email = row.email
  userForm.status = row.status
  userForm.roles = row.roles.map(role => role.id)
  dialogVisible.value = true
}

// 处理保存用户
const handleSaveUser = async () => {
  try {
    if (isEdit.value) {
      // 编辑用户
      await api.put(`/users/${userForm.id}`, userForm)
      ElMessage.success('编辑用户成功')
    } else {
      // 添加用户
      await api.post('/users', userForm)
      ElMessage.success('添加用户成功')
    }
    dialogVisible.value = false
    getUserList()
  } catch (error) {
    ElMessage.error('保存用户失败')
    console.error('保存用户失败:', error)
  }
}

// 处理删除用户
const handleDeleteUser = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/users/${id}`)
    ElMessage.success('删除用户成功')
    getUserList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除用户失败')
      console.error('删除用户失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getUserList()
  getRoles()
})
</script>

<style scoped>
.users-container {
  padding: 20px;
}

.users-container h1 {
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
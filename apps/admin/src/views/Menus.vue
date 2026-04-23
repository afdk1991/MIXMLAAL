<template>
  <div class="menus-container">
    <h1>菜单管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>菜单列表</span>
          <el-button type="primary" @click="handleAddMenu">添加菜单</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索菜单名称" style="width: 300px; margin-right: 10px;">
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
      <el-table :data="menusData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="菜单名称" />
        <el-table-column prop="code" label="菜单编码" />
        <el-table-column prop="path" label="菜单路径" />
        <el-table-column prop="icon" label="图标" width="100">
          <template #default="{ row }">
            <el-icon v-if="row.icon && ElementPlusIconsVue[row.icon]"><component :is="ElementPlusIconsVue[row.icon]" /></el-icon>
            <span v-else>-</span>
          </template>
        </el-table-column>
        <el-table-column prop="parent_id" label="父菜单ID" width="100" />
        <el-table-column prop="sort" label="排序" width="80" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '活跃' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditMenu(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteMenu(row.id)">删除</el-button>
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

    <!-- 添加/编辑菜单对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑菜单' : '添加菜单'"
      width="500px"
    >
      <el-form :model="menuForm" :rules="menuRules" ref="menuFormRef" label-width="100px">
        <el-form-item label="菜单名称" prop="name">
          <el-input v-model="menuForm.name" placeholder="请输入菜单名称" />
        </el-form-item>
        <el-form-item label="菜单编码" prop="code">
          <el-input v-model="menuForm.code" placeholder="请输入菜单编码" />
        </el-form-item>
        <el-form-item label="菜单路径" prop="path">
          <el-input v-model="menuForm.path" placeholder="请输入菜单路径" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="menuForm.icon" placeholder="请输入图标名称" />
        </el-form-item>
        <el-form-item label="父菜单" prop="parent_id">
          <el-select v-model="menuForm.parent_id" placeholder="请选择父菜单">
            <el-option label="无（顶级菜单）" value="" />
            <el-option v-for="menu in menuOptions" :key="menu.id" :label="menu.name" :value="menu.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="menuForm.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="menuForm.status" placeholder="请选择状态">
            <el-option label="活跃" value="active" />
            <el-option label="禁用" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveMenu">保存</el-button>
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
const menusData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const statusFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const menuForm = reactive({
  id: '',
  name: '',
  code: '',
  path: '',
  icon: '',
  parent_id: '',
  sort: 0,
  status: 'active'
})

// 表单规则
const menuRules = {
  name: [
    { required: true, message: '请输入菜单名称', trigger: 'blur' },
    { min: 2, message: '菜单名称长度至少为2位', trigger: 'blur' }
  ],
  code: [
    { required: true, message: '请输入菜单编码', trigger: 'blur' },
    { min: 2, message: '菜单编码长度至少为2位', trigger: 'blur' }
  ],
  path: [
    { required: true, message: '请输入菜单路径', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '请输入排序', trigger: 'blur' },
    { type: 'number', message: '排序必须是数字', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ]
}

// 菜单选项
const menuOptions = ref([])

// 获取菜单列表
const getMenuList = async () => {
  try {
    const response = await api.get('/menus', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
        status: statusFilter.value
      }
    })
    menusData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取菜单列表失败')
    console.error('获取菜单列表失败:', error)
  }
}

// 获取菜单选项（用于父菜单选择）
const getMenuOptions = async () => {
  try {
    const response = await api.get('/menus', {
      params: {
        page_size: 100
      }
    })
    menuOptions.value = response.data.data.list
  } catch (error) {
    ElMessage.error('获取菜单选项失败')
    console.error('获取菜单选项失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getMenuList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
  getMenuList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getMenuList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getMenuList()
}

// 处理添加菜单
const handleAddMenu = () => {
  isEdit.value = false
  menuForm.id = ''
  menuForm.name = ''
  menuForm.code = ''
  menuForm.path = ''
  menuForm.icon = ''
  menuForm.parent_id = ''
  menuForm.sort = 0
  menuForm.status = 'active'
  dialogVisible.value = true
}

// 处理编辑菜单
const handleEditMenu = (row) => {
  isEdit.value = true
  menuForm.id = row.id
  menuForm.name = row.name
  menuForm.code = row.code
  menuForm.path = row.path
  menuForm.icon = row.icon
  menuForm.parent_id = row.parent_id || ''
  menuForm.sort = row.sort
  menuForm.status = row.status
  dialogVisible.value = true
}

// 处理保存菜单
const handleSaveMenu = async () => {
  try {
    // 转换parent_id为null
    const formData = {
      ...menuForm,
      parent_id: menuForm.parent_id === '' ? null : menuForm.parent_id
    }
    
    if (isEdit.value) {
      // 编辑菜单
      await api.put(`/menus/${formData.id}`, formData)
      ElMessage.success('编辑菜单成功')
    } else {
      // 添加菜单
      await api.post('/menus', formData)
      ElMessage.success('添加菜单成功')
    }
    dialogVisible.value = false
    getMenuList()
  } catch (error) {
    ElMessage.error('保存菜单失败')
    console.error('保存菜单失败:', error)
  }
}

// 处理删除菜单
const handleDeleteMenu = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个菜单吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/menus/${id}`)
    ElMessage.success('删除菜单成功')
    getMenuList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除菜单失败')
      console.error('删除菜单失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getMenuList()
  getMenuOptions()
})
</script>

<style scoped>
.menus-container {
  padding: 20px;
}

.menus-container h1 {
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
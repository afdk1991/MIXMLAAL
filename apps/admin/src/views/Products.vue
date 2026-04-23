<template>
  <div class="products-container">
    <h1>商品管理</h1>
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>商品列表</span>
          <el-button type="primary" @click="handleAddProduct">添加商品</el-button>
        </div>
      </template>
      <div class="search-container">
        <el-input v-model="searchQuery" placeholder="搜索商品名称" style="width: 300px; margin-right: 10px;">
          <template #append>
            <el-button @click="handleSearch"><el-icon><ElementPlusIconsVue.Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="商品分类" style="width: 150px; margin-right: 10px;">
          <el-option label="全部" value="" />
          <el-option label="电子产品" value="electronics" />
          <el-option label="服装" value="clothing" />
          <el-option label="食品" value="food" />
          <el-option label="其他" value="other" />
        </el-select>
        <el-button @click="handleReset">重置</el-button>
      </div>
      <el-table :data="productsData" style="width: 100%;" border>
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="商品名称" />
        <el-table-column prop="category" label="分类" width="120" />
        <el-table-column prop="price" label="价格" width="100" />
        <el-table-column prop="stock" label="库存" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button size="small" @click="handleEditProduct(row)">编辑</el-button>
            <el-button size="small" type="danger" @click="handleDeleteProduct(row.id)">删除</el-button>
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

    <!-- 添加/编辑商品对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑商品' : '添加商品'"
      width="500px"
    >
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称" />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="productForm.category" placeholder="请选择分类">
            <el-option label="电子产品" value="electronics" />
            <el-option label="服装" value="clothing" />
            <el-option label="食品" value="food" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>
        <el-form-item label="价格" prop="price">
          <el-input-number v-model="productForm.price" :min="0" :step="0.01" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="productForm.stock" :min="0" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="productForm.description" type="textarea" placeholder="请输入商品描述" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-select v-model="productForm.status" placeholder="请选择状态">
            <el-option label="上架" value="active" />
            <el-option label="下架" value="inactive" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveProduct">保存</el-button>
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
const productsData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)

// 搜索和筛选
const searchQuery = ref('')
const categoryFilter = ref('')

// 对话框
const dialogVisible = ref(false)
const isEdit = ref(false)
const productForm = reactive({
  id: '',
  name: '',
  category: '',
  price: 0,
  stock: 0,
  description: '',
  status: 'active'
})

// 表单规则
const productRules = {
  name: [
    { required: true, message: '请输入商品名称', trigger: 'blur' },
    { min: 2, message: '商品名称长度至少为2位', trigger: 'blur' }
  ],
  category: [
    { required: true, message: '请选择分类', trigger: 'blur' }
  ],
  price: [
    { required: true, message: '请输入价格', trigger: 'blur' },
    { type: 'number', message: '价格必须是数字', trigger: 'blur' },
    { min: 0, message: '价格不能为负数', trigger: 'blur' }
  ],
  stock: [
    { required: true, message: '请输入库存', trigger: 'blur' },
    { type: 'number', message: '库存必须是数字', trigger: 'blur' },
    { min: 0, message: '库存不能为负数', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'blur' }
  ]
}

// 获取商品列表
const getProductList = async () => {
  try {
    const response = await api.get('/products', {
      params: {
        page: currentPage.value,
        page_size: pageSize.value,
        search: searchQuery.value,
        category: categoryFilter.value
      }
    })
    productsData.value = response.data.data.list
    total.value = response.data.data.total
  } catch (error) {
    ElMessage.error('获取商品列表失败')
    console.error('获取商品列表失败:', error)
  }
}

// 处理搜索
const handleSearch = () => {
  currentPage.value = 1
  getProductList()
}

// 处理重置
const handleReset = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  currentPage.value = 1
  getProductList()
}

// 处理分页
const handleSizeChange = (size) => {
  pageSize.value = size
  getProductList()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getProductList()
}

// 处理添加商品
const handleAddProduct = () => {
  isEdit.value = false
  productForm.id = ''
  productForm.name = ''
  productForm.category = ''
  productForm.price = 0
  productForm.stock = 0
  productForm.description = ''
  productForm.status = 'active'
  dialogVisible.value = true
}

// 处理编辑商品
const handleEditProduct = (row) => {
  isEdit.value = true
  productForm.id = row.id
  productForm.name = row.name
  productForm.category = row.category
  productForm.price = row.price
  productForm.stock = row.stock
  productForm.description = row.description
  productForm.status = row.status
  dialogVisible.value = true
}

// 处理保存商品
const handleSaveProduct = async () => {
  try {
    if (isEdit.value) {
      // 编辑商品
      await api.put(`/products/${productForm.id}`, productForm)
      ElMessage.success('编辑商品成功')
    } else {
      // 添加商品
      await api.post('/products', productForm)
      ElMessage.success('添加商品成功')
    }
    dialogVisible.value = false
    getProductList()
  } catch (error) {
    ElMessage.error('保存商品失败')
    console.error('保存商品失败:', error)
  }
}

// 处理删除商品
const handleDeleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.delete(`/products/${id}`)
    ElMessage.success('删除商品成功')
    getProductList()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除商品失败')
      console.error('删除商品失败:', error)
    }
  }
}

// 组件挂载时
onMounted(() => {
  getProductList()
})
</script>

<style scoped>
.products-container {
  padding: 20px;
}

.products-container h1 {
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
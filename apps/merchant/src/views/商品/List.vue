<template>
  <div class="product-list">
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
            <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
          </template>
        </el-input>
        <el-select v-model="categoryId" placeholder="商品分类" style="width: 150px; margin-right: 10px;">
          <el-option label="全部分类" value=""></el-option>
          <el-option label="生鲜" value="1"></el-option>
          <el-option label="日用品" value="2"></el-option>
          <el-option label="零食" value="3"></el-option>
        </el-select>
        <el-select v-model="status" placeholder="商品状态" style="width: 120px; margin-right: 10px;">
          <el-option label="全部" value=""></el-option>
          <el-option label="上架" value="active"></el-option>
          <el-option label="下架" value="inactive"></el-option>
        </el-select>
        <el-button type="default" @click="handleReset">重置</el-button>
      </div>
      <el-table :data="products" style="width: 100%">
        <el-table-column prop="product_no" label="商品编号"></el-table-column>
        <el-table-column label="商品图片">
          <template #default="scope">
            <el-image :src="scope.row.product_image" fit="cover" style="width: 80px; height: 80px;"></el-image>
          </template>
        </el-table-column>
        <el-table-column prop="product_name" label="商品名称"></el-table-column>
        <el-table-column prop="category_name" label="分类"></el-table-column>
        <el-table-column prop="price" label="售价" formatter="formatPrice"></el-table-column>
        <el-table-column prop="stock" label="库存"></el-table-column>
        <el-table-column prop="sales" label="销量"></el-table-column>
        <el-table-column prop="status" label="状态">
          <template #default="scope">
            <el-tag :type="scope.row.status === 'active' ? 'success' : 'info'">
              {{ scope.row.status === 'active' ? '上架' : '下架' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="small" @click="handleEdit(scope.row)">编辑</el-button>
            <el-button type="warning" size="small" @click="handleToggleStatus(scope.row)">
              {{ scope.row.status === 'active' ? '下架' : '上架' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(scope.row)">删除</el-button>
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
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import api from '../../api'

const router = useRouter()
const searchQuery = ref('')
const categoryId = ref('')
const status = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const products = ref([
  {
    product_no: 'PROD001',
    product_image: 'https://via.placeholder.com/80',
    product_name: '新鲜西红柿',
    category_name: '生鲜',
    price: 5.99,
    stock: 100,
    sales: 120,
    status: 'active'
  },
  {
    product_no: 'PROD002',
    product_image: 'https://via.placeholder.com/80',
    product_name: '鸡蛋',
    category_name: '生鲜',
    price: 12.99,
    stock: 200,
    sales: 280,
    status: 'active'
  },
  {
    product_no: 'PROD003',
    product_image: 'https://via.placeholder.com/80',
    product_name: '牛奶',
    category_name: '日用品',
    price: 8.99,
    stock: 150,
    sales: 320,
    status: 'active'
  }
])

const formatPrice = (row, column, cellValue) => {
  return `¥${cellValue}`
}

onMounted(() => {
  getProducts()
})

const getProducts = async () => {
  try {
    // 模拟数据
    total.value = 3
  } catch (error) {
    console.error('获取商品列表失败:', error)
  }
}

const handleSearch = () => {
  currentPage.value = 1
  getProducts()
}

const handleReset = () => {
  searchQuery.value = ''
  categoryId.value = ''
  status.value = ''
  currentPage.value = 1
  getProducts()
}

const handleSizeChange = (size) => {
  pageSize.value = size
  getProducts()
}

const handleCurrentChange = (current) => {
  currentPage.value = current
  getProducts()
}

const handleAddProduct = () => {
  router.push('/product/add')
}

const handleEdit = (product) => {
  router.push(`/product/edit/${product.product_no}`)
}

const handleToggleStatus = async (product) => {
  try {
    await ElMessageBox.confirm(
      product.status === 'active' ? '确定要下架该商品吗？' : '确定要上架该商品吗？',
      '确认操作',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    product.status = product.status === 'active' ? 'inactive' : 'active'
    ElMessage.success(product.status === 'active' ? '商品已上架' : '商品已下架')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const handleDelete = async (product) => {
  try {
    await ElMessageBox.confirm(
      '确定要删除该商品吗？',
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'danger'
      }
    )
    products.value = products.value.filter(p => p.product_no !== product.product_no)
    total.value--
    ElMessage.success('商品已删除')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}
</script>

<style scoped>
.product-list {
  width: 100%;
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
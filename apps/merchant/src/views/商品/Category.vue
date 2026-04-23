<template>
  <div class="product-category">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>商品分类管理</span>
          <el-button type="primary" size="small">
            <el-icon><Plus /></el-icon>
            新增分类
          </el-button>
        </div>
      </template>
      
      <div class="category-list">
        <el-tree
          :data="categoryTree"
          :props="treeProps"
          node-key="id"
          default-expand-all
          @node-click="handleNodeClick"
        >
          <template #default="{ node, data }">
            <div class="tree-node">
              <span>{{ data.name }}</span>
              <div class="node-actions">
                <el-button size="small" @click.stop="editCategory(data)">编辑</el-button>
                <el-button size="small" type="danger" @click.stop="deleteCategory(data.id)">删除</el-button>
                <el-button size="small" @click.stop="addSubCategory(data.id)">添加子分类</el-button>
              </div>
            </div>
          </template>
        </el-tree>
      </div>
      
      <!-- 分类编辑对话框 -->
      <el-dialog
        v-model="dialogVisible"
        :title="dialogTitle"
        width="500px"
      >
        <el-form :model="categoryForm" :rules="categoryRules" ref="categoryFormRef" label-width="100px">
          <el-form-item label="分类名称" prop="name">
            <el-input v-model="categoryForm.name" placeholder="请输入分类名称"></el-input>
          </el-form-item>
          <el-form-item label="父分类" prop="parentId">
            <el-select v-model="categoryForm.parentId" placeholder="选择父分类">
              <el-option label="顶级分类" value="0"></el-option>
              <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="分类排序" prop="sort">
            <el-input v-model="categoryForm.sort" type="number" placeholder="请输入排序值"></el-input>
          </el-form-item>
          <el-form-item label="分类状态" prop="status">
            <el-switch v-model="categoryForm.status" active-text="启用" inactive-text="禁用"></el-switch>
          </el-form-item>
        </el-form>
        <template #footer>
          <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" @click="saveCategory">确定</el-button>
          </span>
        </template>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ProductCategory',
  components: {
    Plus
  },
  setup() {
    const categoryTree = ref([])
    const categories = ref([])
    const dialogVisible = ref(false)
    const dialogTitle = ref('新增分类')
    const categoryFormRef = ref(null)
    const categoryForm = ref({
      id: '',
      name: '',
      parentId: '0',
      sort: 0,
      status: true
    })
    
    const categoryRules = {
      name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 1, max: 50, message: '分类名称长度在1到50个字符之间', trigger: 'blur' }
      ],
      sort: [
        { type: 'number', min: 0, message: '排序值必须大于等于0', trigger: 'blur' }
      ]
    }
    
    const treeProps = {
      children: 'children',
      label: 'name'
    }
    
    // 模拟分类数据
    const mockCategories = [
      {
        id: 1,
        name: '食品饮料',
        parentId: 0,
        sort: 1,
        status: true,
        children: [
          {
            id: 6,
            name: '饮料',
            parentId: 1,
            sort: 1,
            status: true
          },
          {
            id: 7,
            name: '零食',
            parentId: 1,
            sort: 2,
            status: true
          }
        ]
      },
      {
        id: 2,
        name: '生鲜果蔬',
        parentId: 0,
        sort: 2,
        status: true
      },
      {
        id: 3,
        name: '日用百货',
        parentId: 0,
        sort: 3,
        status: true
      },
      {
        id: 4,
        name: '美妆个护',
        parentId: 0,
        sort: 4,
        status: true
      },
      {
        id: 5,
        name: '家居用品',
        parentId: 0,
        sort: 5,
        status: true
      }
    ]
    
    const loadCategories = () => {
      // 实际项目中这里应该调用API获取分类数据
      categoryTree.value = mockCategories
      categories.value = mockCategories.flatMap(cat => {
        const result = [cat]
        if (cat.children) {
          result.push(...cat.children)
        }
        return result
      })
    }
    
    const handleNodeClick = (data) => {
      console.log('点击分类:', data)
    }
    
    const addSubCategory = (parentId) => {
      dialogTitle.value = '新增子分类'
      categoryForm.value = {
        id: '',
        name: '',
        parentId: parentId,
        sort: 0,
        status: true
      }
      dialogVisible.value = true
    }
    
    const editCategory = (data) => {
      dialogTitle.value = '编辑分类'
      categoryForm.value = { ...data }
      dialogVisible.value = true
    }
    
    const deleteCategory = (id) => {
      // 实际项目中这里应该调用API删除分类
      console.log('删除分类:', id)
    }
    
    const saveCategory = () => {
      categoryFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里应该调用API保存分类
          ElMessage.success('分类保存成功')
          dialogVisible.value = false
          loadCategories()
        } else {
          return false
        }
      })
    }
    
    onMounted(() => {
      loadCategories()
    })
    
    return {
      categoryTree,
      categories,
      dialogVisible,
      dialogTitle,
      categoryFormRef,
      categoryForm,
      categoryRules,
      treeProps,
      handleNodeClick,
      addSubCategory,
      editCategory,
      deleteCategory,
      saveCategory
    }
  }
}
</script>

<style scoped>
.product-category {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.category-list {
  margin-top: 20px;
}

.tree-node {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.node-actions {
  display: flex;
  gap: 5px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
<template>
  <div class="product-add">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>添加商品</span>
        </div>
      </template>
      
      <el-form :model="productForm" :rules="productRules" ref="productFormRef" label-width="120px">
        <el-form-item label="商品名称" prop="name">
          <el-input v-model="productForm.name" placeholder="请输入商品名称"></el-input>
        </el-form-item>
        <el-form-item label="商品分类" prop="categoryId">
          <el-select v-model="productForm.categoryId" placeholder="选择商品分类">
            <el-option v-for="category in categories" :key="category.id" :label="category.name" :value="category.id"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="商品价格" prop="price">
          <el-input v-model="productForm.price" type="number" placeholder="请输入商品价格">
            <template #append>¥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="库存数量" prop="stock">
          <el-input v-model="productForm.stock" type="number" placeholder="请输入库存数量"></el-input>
        </el-form-item>
        <el-form-item label="商品描述" prop="description">
          <el-input v-model="productForm.description" type="textarea" rows="4" placeholder="请输入商品描述"></el-input>
        </el-form-item>
        <el-form-item label="商品图片" prop="images">
          <el-upload
            class="upload-demo"
            action="#"
            :on-change="handleImageChange"
            :multiple="true"
            :limit="5"
            :file-list="imageList"
            list-type="picture-card"
          >
            <el-icon><Plus /></el-icon>
            <template #tip>
              <div class="el-upload__tip">
                最多上传5张图片，单张图片不超过2MB
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="商品状态" prop="status">
          <el-switch v-model="productForm.status" active-text="上架" inactive-text="下架"></el-switch>
        </el-form-item>
        <el-form-item label="商品标签">
          <el-tag
            v-for="tag in productForm.tags"
            :key="tag"
            closable
            @close="removeTag(tag)"
          >
            {{ tag }}
          </el-tag>
          <el-input
            v-model="inputTag"
            class="input-new-tag"
            size="small"
            @keyup.enter="addTag"
            placeholder="按回车键添加标签"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">提交</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ProductAdd',
  components: {
    Plus
  },
  setup() {
    const productFormRef = ref(null)
    const productForm = ref({
      name: '',
      categoryId: '',
      price: '',
      stock: '',
      description: '',
      images: [],
      status: true,
      tags: []
    })
    
    const inputTag = ref('')
    const imageList = ref([])
    
    const productRules = {
      name: [
        { required: true, message: '请输入商品名称', trigger: 'blur' },
        { min: 2, max: 50, message: '商品名称长度在2到50个字符之间', trigger: 'blur' }
      ],
      categoryId: [
        { required: true, message: '请选择商品分类', trigger: 'change' }
      ],
      price: [
        { required: true, message: '请输入商品价格', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '商品价格必须大于0', trigger: 'blur' }
      ],
      stock: [
        { required: true, message: '请输入库存数量', trigger: 'blur' },
        { type: 'number', min: 0, message: '库存数量必须大于等于0', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入商品描述', trigger: 'blur' }
      ]
    }
    
    const categories = ref([
      { id: 1, name: '食品饮料' },
      { id: 2, name: '生鲜果蔬' },
      { id: 3, name: '日用百货' },
      { id: 4, name: '美妆个护' },
      { id: 5, name: '家居用品' }
    ])
    
    const addTag = () => {
      if (inputTag.value && !productForm.value.tags.includes(inputTag.value)) {
        productForm.value.tags.push(inputTag.value)
      }
      inputTag.value = ''
    }
    
    const removeTag = (tag) => {
      const index = productForm.value.tags.indexOf(tag)
      if (index !== -1) {
        productForm.value.tags.splice(index, 1)
      }
    }
    
    const handleImageChange = (file, fileList) => {
      imageList.value = fileList
      // 实际项目中这里应该上传图片到服务器
    }
    
    const submitForm = () => {
      productFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里应该调用API提交商品信息
          ElMessage.success('商品添加成功')
          resetForm()
        } else {
          return false
        }
      })
    }
    
    const resetForm = () => {
      productFormRef.value.resetFields()
      imageList.value = []
      productForm.value.tags = []
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取商品分类列表
    })
    
    return {
      productFormRef,
      productForm,
      productRules,
      categories,
      inputTag,
      imageList,
      addTag,
      removeTag,
      handleImageChange,
      submitForm,
      resetForm
    }
  }
}
</script>

<style scoped>
.product-add {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.upload-demo {
  margin-top: 10px;
}

.input-new-tag {
  width: 120px;
  margin-left: 10px;
}
</style>
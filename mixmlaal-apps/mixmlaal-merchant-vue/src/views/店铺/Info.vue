<template>
  <div class="shop-info">
    <el-card shadow="hover">
      <template #header>
        <div class="card-header">
          <span>店铺信息</span>
          <el-button type="primary" @click="handleSave">保存</el-button>
        </div>
      </template>
      <el-form :model="shopForm" label-width="100px" class="shop-form">
        <el-form-item label="店铺名称">
          <el-input v-model="shopForm.shop_name" placeholder="请输入店铺名称"></el-input>
        </el-form-item>
        <el-form-item label="店铺类型">
          <el-select v-model="shopForm.shop_type" placeholder="请选择店铺类型">
            <el-option label="生鲜" value="fresh"></el-option>
            <el-option label="商超" value="supermarket"></el-option>
            <el-option label="餐饮" value="restaurant"></el-option>
            <el-option label="小吃" value="snack"></el-option>
            <el-option label="预制菜" value="premade"></el-option>
            <el-option label="特产" value="specialty"></el-option>
            <el-option label="便民服务" value="service"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="店铺Logo">
          <el-upload
            class="avatar-uploader"
            action="/api/v1/upload"
            :show-file-list="false"
            :on-success="handleLogoUpload"
            :before-upload="beforeLogoUpload"
          >
            <img v-if="shopForm.shop_logo" :src="shopForm.shop_logo" class="avatar">
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="店铺横幅">
          <el-upload
            class="banner-uploader"
            action="/api/v1/upload"
            :show-file-list="false"
            :on-success="handleBannerUpload"
            :before-upload="beforeBannerUpload"
          >
            <img v-if="shopForm.shop_banner" :src="shopForm.shop_banner" class="banner">
            <el-icon v-else class="banner-uploader-icon"><Plus /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="联系人">
          <el-input v-model="shopForm.contact_name" placeholder="请输入联系人姓名"></el-input>
        </el-form-item>
        <el-form-item label="联系电话">
          <el-input v-model="shopForm.contact_phone" placeholder="请输入联系电话"></el-input>
        </el-form-item>
        <el-form-item label="所在省份">
          <el-input v-model="shopForm.province" placeholder="请输入省份"></el-input>
        </el-form-item>
        <el-form-item label="所在城市">
          <el-input v-model="shopForm.city" placeholder="请输入城市"></el-input>
        </el-form-item>
        <el-form-item label="所在区县">
          <el-input v-model="shopForm.district" placeholder="请输入区县"></el-input>
        </el-form-item>
        <el-form-item label="详细地址">
          <el-input v-model="shopForm.address" placeholder="请输入详细地址" type="textarea"></el-input>
        </el-form-item>
        <el-form-item label="营业时间">
          <el-input v-model="shopForm.business_hours" placeholder="如：08:00-22:00"></el-input>
        </el-form-item>
        <el-form-item label="店铺描述">
          <el-input v-model="shopForm.description" placeholder="请输入店铺描述" type="textarea" rows="4"></el-input>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import api from '../../api'

const shopForm = ref({
  shop_name: '',
  shop_type: '',
  shop_logo: '',
  shop_banner: '',
  contact_name: '',
  contact_phone: '',
  province: '',
  city: '',
  district: '',
  address: '',
  business_hours: '',
  description: ''
})

onMounted(() => {
  getShopInfo()
})

const getShopInfo = async () => {
  try {
    // 模拟数据
    shopForm.value = {
      shop_name: '鲜食优选超市',
      shop_type: 'supermarket',
      shop_logo: 'https://via.placeholder.com/100',
      shop_banner: 'https://via.placeholder.com/800x200',
      contact_name: '张三',
      contact_phone: '13800138000',
      province: '北京市',
      city: '北京市',
      district: '朝阳区',
      address: '建国路88号',
      business_hours: '08:00-22:00',
      description: '鲜食优选超市是一家专注于新鲜食材的社区超市，提供各类生鲜、日用品等商品。'
    }
  } catch (error) {
    console.error('获取店铺信息失败:', error)
  }
}

const handleLogoUpload = (response, file, fileList) => {
  shopForm.value.shop_logo = response.data.url
  ElMessage.success('Logo上传成功')
}

const beforeLogoUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG文件!')
  }
  if (!isLt2M) {
    ElMessage.error('文件大小不能超过2MB!')
  }
  return isJPG && isLt2M
}

const handleBannerUpload = (response, file, fileList) => {
  shopForm.value.shop_banner = response.data.url
  ElMessage.success('横幅上传成功')
}

const beforeBannerUpload = (file) => {
  const isJPG = file.type === 'image/jpeg' || file.type === 'image/png'
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isJPG) {
    ElMessage.error('只能上传JPG/PNG文件!')
  }
  if (!isLt5M) {
    ElMessage.error('文件大小不能超过5MB!')
  }
  return isJPG && isLt5M
}

const handleSave = async () => {
  try {
    // 模拟保存
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error('保存失败')
  }
}
</script>

<style scoped>
.shop-info {
  width: 100%;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.shop-form {
  max-width: 800px;
}

.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  border-radius: 4px;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #999;
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}

.banner-uploader .banner {
  width: 400px;
  height: 100px;
  border-radius: 4px;
}

.banner-uploader-icon {
  font-size: 28px;
  color: #999;
  width: 400px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  cursor: pointer;
}
</style>
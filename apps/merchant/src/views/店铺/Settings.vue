<template>
  <div class="shop-settings">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>店铺设置</span>
        </div>
      </template>
      
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基本信息" name="basic">
          <el-form :model="shopForm" :rules="shopRules" ref="shopFormRef" label-width="120px">
            <el-form-item label="店铺名称" prop="name">
              <el-input v-model="shopForm.name" placeholder="请输入店铺名称"></el-input>
            </el-form-item>
            <el-form-item label="店铺地址" prop="address">
              <el-input v-model="shopForm.address" placeholder="请输入店铺地址"></el-input>
            </el-form-item>
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="shopForm.phone" placeholder="请输入联系电话"></el-input>
            </el-form-item>
            <el-form-item label="营业时间" prop="businessHours">
              <el-input v-model="shopForm.businessHours" placeholder="请输入营业时间，如：09:00-21:00"></el-input>
            </el-form-item>
            <el-form-item label="店铺简介" prop="description">
              <el-input v-model="shopForm.description" type="textarea" rows="4" placeholder="请输入店铺简介"></el-input>
            </el-form-item>
            <el-form-item label="店铺Logo">
              <el-upload
                class="upload-demo"
                action="#"
                :on-change="handleLogoChange"
                :limit="1"
                :file-list="logoList"
                list-type="picture"
              >
                <el-icon><Plus /></el-icon>
                <template #tip>
                  <div class="el-upload__tip">
                    请上传店铺Logo，尺寸建议为200x200像素
                  </div>
                </template>
              </el-upload>
            </el-form-item>
            <el-form-item label="店铺状态" prop="status">
              <el-switch v-model="shopForm.status" active-text="营业" inactive-text="休息"></el-switch>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveShopInfo">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="配送设置" name="delivery">
          <el-form :model="deliveryForm" :rules="deliveryRules" ref="deliveryFormRef" label-width="120px">
            <el-form-item label="配送范围" prop="deliveryRange">
              <el-input v-model="deliveryForm.deliveryRange" type="number" placeholder="请输入配送范围（公里）">
                <template #append>公里</template>
              </el-input>
            </el-form-item>
            <el-form-item label="配送费" prop="deliveryFee">
              <el-input v-model="deliveryForm.deliveryFee" type="number" placeholder="请输入基础配送费">
                <template #append>元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="免配送费门槛" prop="freeDeliveryThreshold">
              <el-input v-model="deliveryForm.freeDeliveryThreshold" type="number" placeholder="请输入免配送费门槛">
                <template #append>元</template>
              </el-input>
            </el-form-item>
            <el-form-item label="预计送达时间" prop="estimatedDeliveryTime">
              <el-input v-model="deliveryForm.estimatedDeliveryTime" type="number" placeholder="请输入预计送达时间">
                <template #append>分钟</template>
              </el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="saveDeliverySettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        
        <el-tab-pane label="支付设置" name="payment">
          <el-form :model="paymentForm" :rules="paymentRules" ref="paymentFormRef" label-width="120px">
            <el-form-item label="支持的支付方式">
              <el-checkbox-group v-model="paymentForm.paymentMethods">
                <el-checkbox label="alipay">支付宝</el-checkbox>
                <el-checkbox label="wechat">微信支付</el-checkbox>
                <el-checkbox label="card">银行卡支付</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
            <el-form-item label="支付宝商户ID" prop="alipayMerchantId">
              <el-input v-model="paymentForm.alipayMerchantId" placeholder="请输入支付宝商户ID"></el-input>
            </el-form-item>
            <el-form-item label="微信支付商户ID" prop="wechatMerchantId">
              <el-input v-model="paymentForm.wechatMerchantId" placeholder="请输入微信支付商户ID"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="savePaymentSettings">保存</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'

export default {
  name: 'ShopSettings',
  components: {
    Plus
  },
  setup() {
    const activeTab = ref('basic')
    const shopFormRef = ref(null)
    const deliveryFormRef = ref(null)
    const paymentFormRef = ref(null)
    
    const logoList = ref([])
    
    const shopForm = ref({
      name: '测试店铺',
      address: '北京市朝阳区建国路88号',
      phone: '13800138000',
      businessHours: '09:00-21:00',
      description: '这是一家测试店铺，提供各种商品和服务',
      status: true
    })
    
    const deliveryForm = ref({
      deliveryRange: 5,
      deliveryFee: 5,
      freeDeliveryThreshold: 50,
      estimatedDeliveryTime: 30
    })
    
    const paymentForm = ref({
      paymentMethods: ['alipay', 'wechat'],
      alipayMerchantId: '2021000000000000',
      wechatMerchantId: '1234567890'
    })
    
    const shopRules = {
      name: [
        { required: true, message: '请输入店铺名称', trigger: 'blur' },
        { min: 2, max: 50, message: '店铺名称长度在2到50个字符之间', trigger: 'blur' }
      ],
      address: [
        { required: true, message: '请输入店铺地址', trigger: 'blur' }
      ],
      phone: [
        { required: true, message: '请输入联系电话', trigger: 'blur' }
      ],
      businessHours: [
        { required: true, message: '请输入营业时间', trigger: 'blur' }
      ],
      description: [
        { required: true, message: '请输入店铺简介', trigger: 'blur' }
      ]
    }
    
    const deliveryRules = {
      deliveryRange: [
        { required: true, message: '请输入配送范围', trigger: 'blur' },
        { type: 'number', min: 1, message: '配送范围必须大于0', trigger: 'blur' }
      ],
      deliveryFee: [
        { required: true, message: '请输入配送费', trigger: 'blur' },
        { type: 'number', min: 0, message: '配送费必须大于等于0', trigger: 'blur' }
      ],
      freeDeliveryThreshold: [
        { required: true, message: '请输入免配送费门槛', trigger: 'blur' },
        { type: 'number', min: 0, message: '免配送费门槛必须大于等于0', trigger: 'blur' }
      ],
      estimatedDeliveryTime: [
        { required: true, message: '请输入预计送达时间', trigger: 'blur' },
        { type: 'number', min: 1, message: '预计送达时间必须大于0', trigger: 'blur' }
      ]
    }
    
    const paymentRules = {
      alipayMerchantId: [
        { required: true, message: '请输入支付宝商户ID', trigger: 'blur' }
      ],
      wechatMerchantId: [
        { required: true, message: '请输入微信支付商户ID', trigger: 'blur' }
      ]
    }
    
    const handleLogoChange = (file, fileList) => {
      logoList.value = fileList
      // 实际项目中这里应该上传图片到服务器
    }
    
    const saveShopInfo = () => {
      shopFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里应该调用API保存店铺信息
          ElMessage.success('店铺基本信息保存成功')
        } else {
          return false
        }
      })
    }
    
    const saveDeliverySettings = () => {
      deliveryFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里应该调用API保存配送设置
          ElMessage.success('配送设置保存成功')
        } else {
          return false
        }
      })
    }
    
    const savePaymentSettings = () => {
      paymentFormRef.value.validate((valid) => {
        if (valid) {
          // 实际项目中这里应该调用API保存支付设置
          ElMessage.success('支付设置保存成功')
        } else {
          return false
        }
      })
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取店铺设置信息
    })
    
    return {
      activeTab,
      shopFormRef,
      deliveryFormRef,
      paymentFormRef,
      logoList,
      shopForm,
      deliveryForm,
      paymentForm,
      shopRules,
      deliveryRules,
      paymentRules,
      handleLogoChange,
      saveShopInfo,
      saveDeliverySettings,
      savePaymentSettings
    }
  }
}
</script>

<style scoped>
.shop-settings {
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
</style>
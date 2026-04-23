<template>
  <div class="driver-info">
    <van-nav-bar title="个人信息" left-text="返回" left-arrow @click-left="goBack" />
    
    <div class="info-form">
      <van-cell-group>
        <van-field
          v-model="driverInfo.name"
          label="姓名"
          placeholder="请输入姓名"
          readonly
        />
        <van-field
          v-model="driverInfo.phone"
          label="联系电话"
          placeholder="请输入联系电话"
          readonly
        />
        <van-field
          v-model="driverInfo.idCard"
          label="身份证号"
          placeholder="请输入身份证号"
          readonly
        />
        <van-field
          v-model="driverInfo.licenseNo"
          label="驾驶证号"
          placeholder="请输入驾驶证号"
          readonly
        />
        <van-field
          v-model="driverInfo.licenseExpiry"
          label="驾驶证有效期"
          placeholder="请输入驾驶证有效期"
          readonly
        />
        <van-field
          v-model="driverInfo.joinDate"
          label="加入时间"
          placeholder="请输入加入时间"
          readonly
        />
        <van-field
          v-model="driverInfo.status"
          label="账号状态"
          placeholder="请输入账号状态"
          readonly
        >
          <template #right-icon>
            <van-tag :color="driverInfo.status === '正常' ? '#4caf50' : '#f44336'">
              {{ driverInfo.status }}
            </van-tag>
          </template>
        </van-field>
      </van-cell-group>
    </div>
    
    <div class="action-buttons">
      <van-button type="primary" block @click="editInfo">编辑信息</van-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'DriverInfo',
  setup() {
    const router = useRouter()
    
    const driverInfo = ref({
      name: '王师傅',
      phone: '13800138000',
      idCard: '110101199001011234',
      licenseNo: '111111111111111111',
      licenseExpiry: '2026-01-01',
      joinDate: '2025-01-01',
      status: '正常'
    })
    
    const goBack = () => {
      router.back()
    }
    
    const editInfo = () => {
      // 编辑个人信息
      console.log('编辑个人信息')
      // 实际项目中这里应该跳转到编辑页面或显示编辑对话框
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取司机个人信息
    })
    
    return {
      driverInfo,
      goBack,
      editInfo
    }
  }
}
</script>

<style scoped>
.driver-info {
  padding-bottom: 20px;
}

.info-form {
  margin-top: 10px;
}

.action-buttons {
  margin-top: 30px;
  padding: 0 20px;
}

.action-buttons van-button {
  height: 44px;
  font-size: 16px;
}
</style>
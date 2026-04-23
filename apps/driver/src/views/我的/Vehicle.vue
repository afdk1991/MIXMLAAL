<template>
  <div class="vehicle-management">
    <van-nav-bar title="车辆管理" left-text="返回" left-arrow @click-left="goBack" />
    
    <div class="vehicle-list">
      <van-cell-group v-for="(vehicle, index) in vehicles" :key="index">
        <div class="vehicle-header">
          <span class="vehicle-plate">{{ vehicle.plateNo }}</span>
          <van-tag :color="vehicle.status === '正常' ? '#4caf50' : '#f44336'">
            {{ vehicle.status }}
          </van-tag>
        </div>
        <van-field
          v-model="vehicle.brand"
          label="品牌型号"
          placeholder="请输入品牌型号"
          readonly
        />
        <van-field
          v-model="vehicle.model"
          label="车辆型号"
          placeholder="请输入车辆型号"
          readonly
        />
        <van-field
          v-model="vehicle.color"
          label="车辆颜色"
          placeholder="请输入车辆颜色"
          readonly
        />
        <van-field
          v-model="vehicle.vehicleNo"
          label="车辆识别号"
          placeholder="请输入车辆识别号"
          readonly
        />
        <van-field
          v-model="vehicle.licenseExpiry"
          label="行驶证有效期"
          placeholder="请输入行驶证有效期"
          readonly
        />
        <div class="vehicle-actions">
          <van-button type="primary" size="small" @click="editVehicle(vehicle.id)">编辑</van-button>
          <van-button type="danger" size="small" @click="deleteVehicle(vehicle.id)">删除</van-button>
        </div>
      </van-cell-group>
    </div>
    
    <div class="add-vehicle">
      <van-button type="primary" block @click="addVehicle">添加车辆</van-button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'VehicleManagement',
  setup() {
    const router = useRouter()
    
    const vehicles = ref([
      {
        id: 1,
        plateNo: '京A12345',
        brand: '大众',
        model: '朗逸',
        color: '白色',
        vehicleNo: 'LSVAA2187J2123456',
        licenseExpiry: '2026-01-01',
        status: '正常'
      },
      {
        id: 2,
        plateNo: '京B67890',
        brand: '丰田',
        model: '卡罗拉',
        color: '黑色',
        vehicleNo: 'LFMBEC4A5J1234567',
        licenseExpiry: '2026-06-01',
        status: '正常'
      }
    ])
    
    const goBack = () => {
      router.back()
    }
    
    const addVehicle = () => {
      // 添加车辆
      console.log('添加车辆')
      // 实际项目中这里应该跳转到添加车辆页面或显示添加对话框
    }
    
    const editVehicle = (id) => {
      // 编辑车辆
      console.log('编辑车辆:', id)
      // 实际项目中这里应该跳转到编辑车辆页面或显示编辑对话框
    }
    
    const deleteVehicle = (id) => {
      // 删除车辆
      console.log('删除车辆:', id)
      // 实际项目中这里应该显示确认对话框，然后调用API删除车辆
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取车辆列表
    })
    
    return {
      vehicles,
      goBack,
      addVehicle,
      editVehicle,
      deleteVehicle
    }
  }
}
</script>

<style scoped>
.vehicle-management {
  padding-bottom: 20px;
}

.vehicle-list {
  margin-top: 10px;
}

.vehicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 10px;
}

.vehicle-plate {
  font-size: 16px;
  font-weight: bold;
}

.vehicle-actions {
  display: flex;
  gap: 10px;
  padding: 10px;
  justify-content: flex-end;
}

.add-vehicle {
  margin-top: 20px;
  padding: 0 20px;
}

.add-vehicle van-button {
  height: 44px;
  font-size: 16px;
}
</style>
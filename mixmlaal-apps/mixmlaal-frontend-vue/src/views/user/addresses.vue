<template>
  <div class="addresses-container">
    <div class="header">
      <h2>地址管理</h2>
      <button class="btn btn-primary" @click="showAddAddress = true">新增地址</button>
    </div>
    
    <div class="address-list" v-if="addresses.length > 0">
      <div 
        v-for="address in addresses" 
        :key="address.id" 
        class="address-item"
        :class="{ 'default': address.isDefault }"
      >
        <div class="address-header">
          <div class="name-phone">
            <span class="name">{{ address.name }}</span>
            <span class="phone">{{ address.phone }}</span>
          </div>
          <div v-if="address.isDefault" class="default-tag">默认</div>
        </div>
        <div class="address-detail">
          {{ address.province }}{{ address.city }}{{ address.district }}{{ address.detail }}
        </div>
        <div class="address-actions">
          <button 
            class="action-btn edit" 
            @click="editAddress(address)"
          >
            编辑
          </button>
          <button 
            class="action-btn delete" 
            @click="deleteAddress(address.id)"
          >
            删除
          </button>
          <button 
            v-if="!address.isDefault"
            class="action-btn default" 
            @click="setDefaultAddress(address.id)"
          >
            设置默认
          </button>
        </div>
      </div>
    </div>
    
    <div class="empty-address" v-else>
      <p>暂无地址，点击右上角添加</p>
    </div>
    
    <!-- 新增/编辑地址弹窗 -->
    <div class="modal" v-if="showAddAddress || showEditAddress">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ showEditAddress ? '编辑地址' : '新增地址' }}</h3>
          <button class="close-btn" @click="closeModal">&times;</button>
        </div>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="name">收货人</label>
            <input 
              type="text" 
              id="name" 
              v-model="addressForm.name" 
              placeholder="请输入收货人姓名"
              required
            >
          </div>
          <div class="form-group">
            <label for="phone">手机号</label>
            <input 
              type="tel" 
              id="phone" 
              v-model="addressForm.phone" 
              placeholder="请输入手机号"
              required
            >
          </div>
          <div class="form-group">
            <label for="province">省份</label>
            <input 
              type="text" 
              id="province" 
              v-model="addressForm.province" 
              placeholder="请输入省份"
              required
            >
          </div>
          <div class="form-group">
            <label for="city">城市</label>
            <input 
              type="text" 
              id="city" 
              v-model="addressForm.city" 
              placeholder="请输入城市"
              required
            >
          </div>
          <div class="form-group">
            <label for="district">区县</label>
            <input 
              type="text" 
              id="district" 
              v-model="addressForm.district" 
              placeholder="请输入区县"
              required
            >
          </div>
          <div class="form-group">
            <label for="detail">详细地址</label>
            <textarea 
              id="detail" 
              v-model="addressForm.detail" 
              placeholder="请输入详细地址"
              required
              rows="3"
            ></textarea>
          </div>
          <div class="form-group checkbox">
            <input 
              type="checkbox" 
              id="isDefault" 
              v-model="addressForm.isDefault"
            >
            <label for="isDefault">设为默认地址</label>
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeModal">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '保存中...' : '保存' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useUserStore } from '../../store/user'

const userStore = useUserStore()

const addresses = ref([])
const showAddAddress = ref(false)
const showEditAddress = ref(false)
const currentAddressId = ref(null)
const loading = ref(false)

const addressForm = ref({
  name: '',
  phone: '',
  province: '',
  city: '',
  district: '',
  detail: '',
  isDefault: false
})

onMounted(async () => {
  await fetchAddresses()
})

const fetchAddresses = async () => {
  try {
    await userStore.fetchAddresses()
    addresses.value = userStore.addresses
  } catch (error) {
    console.error('获取地址列表失败:', error)
  }
}

const closeModal = () => {
  showAddAddress.value = false
  showEditAddress.value = false
  currentAddressId.value = null
  resetForm()
}

const resetForm = () => {
  addressForm.value = {
    name: '',
    phone: '',
    province: '',
    city: '',
    district: '',
    detail: '',
    isDefault: false
  }
}

const editAddress = (address) => {
  currentAddressId.value = address.id
  addressForm.value = {
    name: address.name,
    phone: address.phone,
    province: address.province,
    city: address.city,
    district: address.district,
    detail: address.detail,
    isDefault: address.isDefault
  }
  showEditAddress.value = true
}

const handleSubmit = async () => {
  try {
    loading.value = true
    if (showEditAddress.value) {
      await userStore.updateAddress(currentAddressId.value, addressForm.value)
    } else {
      await userStore.addAddress(addressForm.value)
    }
    await fetchAddresses()
    closeModal()
    alert('地址保存成功')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}

const deleteAddress = async (id) => {
  if (confirm('确定要删除此地址吗？')) {
    try {
      await userStore.deleteAddress(id)
      await fetchAddresses()
      alert('地址删除成功')
    } catch (error) {
      alert(error.message)
    }
  }
}

const setDefaultAddress = async (id) => {
  try {
    await userStore.setDefaultAddress(id)
    await fetchAddresses()
    alert('默认地址设置成功')
  } catch (error) {
    alert(error.message)
  }
}
</script>

<style scoped>
.addresses-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 2rem;
}

.header {
  background-color: #fff;
  padding: 1.5rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #409eff;
  color: #fff;
}

.btn-primary:hover {
  background-color: #66b1ff;
}

.btn-secondary {
  background-color: #fff;
  color: #409eff;
  border: 1px solid #409eff;
  margin-right: 1rem;
}

.btn-secondary:hover {
  background-color: #ecf5ff;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.address-item {
  background-color: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: relative;
  border-left: 4px solid #fff;
}

.address-item.default {
  border-left-color: #409eff;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.8rem;
}

.name-phone {
  display: flex;
  gap: 1rem;
}

.name {
  font-weight: bold;
  color: #333;
}

.phone {
  color: #666;
}

.default-tag {
  background-color: #409eff;
  color: #fff;
  padding: 0.2rem 0.6rem;
  border-radius: 10px;
  font-size: 0.8rem;
}

.address-detail {
  color: #666;
  line-height: 1.5;
  margin-bottom: 1rem;
}

.address-actions {
  display: flex;
  gap: 1rem;
  border-top: 1px solid #f0f0f0;
  padding-top: 1rem;
}

.action-btn {
  background: none;
  border: none;
  color: #409eff;
  cursor: pointer;
  font-size: 0.9rem;
  padding: 0.4rem 0;
  transition: all 0.3s ease;
}

.action-btn:hover {
  color: #66b1ff;
}

.action-btn.delete {
  color: #f56c6c;
}

.action-btn.delete:hover {
  color: #f78989;
}

.empty-address {
  background-color: #fff;
  padding: 4rem 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
  color: #999;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: all 0.3s ease;
}

.close-btn:hover {
  color: #333;
}

.form-group {
  padding: 0 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group textarea {
  resize: vertical;
}

.form-group.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-group.checkbox input {
  width: auto;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .addresses-container {
    padding: 1rem;
  }
  
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .btn {
    align-self: flex-end;
  }
  
  .address-actions {
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1;
    min-width: 80px;
  }
}
</style>
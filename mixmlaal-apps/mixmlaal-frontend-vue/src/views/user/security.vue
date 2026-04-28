<template>
  <div class="security-container">
    <div class="header">
      <h2>账户安全</h2>
    </div>
    
    <div class="security-menu">
      <div class="menu-item">
        <div class="item-left">
          <span class="icon">🔐</span>
          <span>修改密码</span>
        </div>
        <button class="item-right" @click="showChangePassword = true">
          <span>修改</span>
          <span class="arrow">→</span>
        </button>
      </div>
      
      <div class="menu-item">
        <div class="item-left">
          <span class="icon">📱</span>
          <span>手机验证</span>
        </div>
        <div class="item-right">
          <span class="status">未绑定</span>
          <span class="arrow">→</span>
        </div>
      </div>
      
      <div class="menu-item">
        <div class="item-left">
          <span class="icon">📧</span>
          <span>邮箱验证</span>
        </div>
        <div class="item-right">
          <span class="status verified">已验证</span>
          <span class="arrow">→</span>
        </div>
      </div>
      
      <div class="menu-item">
        <div class="item-left">
          <span class="icon">🔑</span>
          <span>第三方账号</span>
        </div>
        <div class="item-right">
          <span>管理</span>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>
    
    <!-- 修改密码弹窗 -->
    <div class="modal" v-if="showChangePassword">
      <div class="modal-content">
        <div class="modal-header">
          <h3>修改密码</h3>
          <button class="close-btn" @click="showChangePassword = false">&times;</button>
        </div>
        <form @submit.prevent="handleChangePassword">
          <div class="form-group">
            <label for="oldPassword">当前密码</label>
            <input 
              type="password" 
              id="oldPassword" 
              v-model="passwordForm.oldPassword" 
              placeholder="请输入当前密码"
              required
            >
          </div>
          <div class="form-group">
            <label for="newPassword">新密码</label>
            <input 
              type="password" 
              id="newPassword" 
              v-model="passwordForm.newPassword" 
              placeholder="请输入新密码（至少6位）"
              required
              minlength="6"
            >
          </div>
          <div class="form-group">
            <label for="confirmPassword">确认新密码</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="passwordForm.confirmPassword" 
              placeholder="请确认新密码"
              required
              minlength="6"
            >
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="showChangePassword = false">取消</button>
            <button type="submit" class="btn btn-primary" :disabled="loading">
              {{ loading ? '修改中...' : '确定修改' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../store/auth'

const authStore = useAuthStore()

const showChangePassword = ref(false)
const loading = ref(false)

const passwordForm = ref({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const handleChangePassword = async () => {
  if (passwordForm.value.newPassword !== passwordForm.value.confirmPassword) {
    alert('两次输入的密码不一致')
    return
  }
  
  try {
    loading.value = true
    // 这里可以调用修改密码的API
    // 暂时使用模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    alert('密码修改成功')
    showChangePassword.value = false
    passwordForm.value = {
      oldPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.security-container {
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
}

.header h2 {
  color: #333;
  font-size: 1.5rem;
  margin: 0;
}

.security-menu {
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.item-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon {
  font-size: 1.5rem;
  width: 24px;
  text-align: center;
}

.item-right {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #999;
}

.status {
  font-size: 0.9rem;
}

.status.verified {
  color: #67c23a;
}

.arrow {
  font-size: 1.2rem;
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
  max-width: 400px;
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

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f0f0f0;
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

.btn-primary:disabled {
  background-color: #c0c4cc;
  cursor: not-allowed;
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

@media (max-width: 768px) {
  .security-container {
    padding: 1rem;
  }
  
  .menu-item {
    padding: 1.2rem 1.5rem;
  }
}
</style>
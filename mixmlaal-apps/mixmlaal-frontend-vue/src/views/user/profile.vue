<template>
  <div class="profile-container">
    <div class="header">
      <h2>个人资料</h2>
    </div>
    
    <div class="profile-form">
      <div class="avatar-upload">
        <div class="avatar">
          <img :src="form.avatar || 'https://via.placeholder.com/120'" alt="头像">
          <input type="file" id="avatar" class="avatar-input" @change="handleAvatarUpload">
          <label for="avatar" class="avatar-label">
            <span>更换头像</span>
          </label>
        </div>
      </div>
      
      <form @submit.prevent="handleUpdate">
        <div class="form-group">
          <label for="username">用户名</label>
          <input 
            type="text" 
            id="username" 
            v-model="form.username" 
            placeholder="请输入用户名"
            required
          >
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            placeholder="请输入邮箱"
            required
            readonly
          >
        </div>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          {{ loading ? '保存中...' : '保存修改' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../store/user'

const router = useRouter()
const userStore = useUserStore()

const form = ref({
  username: '',
  email: '',
  avatar: ''
})

const loading = ref(false)

onMounted(async () => {
  try {
    const profile = await userStore.fetchProfile()
    form.value = {
      username: profile.username,
      email: profile.email,
      avatar: profile.avatar
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

const handleAvatarUpload = (event) => {
  const file = event.target.files[0]
  if (file) {
    // 这里可以添加文件上传逻辑
    // 暂时使用占位符
    form.value.avatar = URL.createObjectURL(file)
  }
}

const handleUpdate = async () => {
  try {
    loading.value = true
    await userStore.updateProfile({
      username: form.value.username,
      avatar: form.value.avatar
    })
    alert('资料更新成功')
    router.push('/user-center')
  } catch (error) {
    alert(error.message)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.profile-container {
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

.profile-form {
  background-color: #fff;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-upload {
  display: flex;
  justify-content: center;
  margin-bottom: 2rem;
}

.avatar {
  position: relative;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-input {
  display: none;
}

.avatar-label {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(0, 0, 0, 0.6);
  color: #fff;
  text-align: center;
  padding: 0.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.avatar-label:hover {
  background-color: rgba(0, 0, 0, 0.8);
}

.form-group {
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

.form-group input[readonly] {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  margin-top: 1rem;
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

@media (max-width: 480px) {
  .profile-container {
    padding: 1rem;
  }
  
  .profile-form {
    padding: 1.5rem;
  }
}
</style>
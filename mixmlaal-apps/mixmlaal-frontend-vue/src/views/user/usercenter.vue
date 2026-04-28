<template>
  <div class="user-center">
    <div class="header">
      <div class="user-info">
        <div class="avatar">
          <img :src="user?.avatar || 'https://via.placeholder.com/80'" alt="头像">
        </div>
        <div class="info">
          <h3>{{ user?.username || '用户名' }}</h3>
          <p>{{ user?.email || '邮箱' }}</p>
        </div>
      </div>
      <router-link to="/profile" class="edit-btn">编辑资料</router-link>
    </div>
    
    <div class="menu">
      <router-link to="/profile" class="menu-item">
        <span class="icon">👤</span>
        <span>个人资料</span>
        <span class="arrow">→</span>
      </router-link>
      <router-link to="/addresses" class="menu-item">
        <span class="icon">📍</span>
        <span>地址管理</span>
        <span class="arrow">→</span>
      </router-link>
      <router-link to="/security" class="menu-item">
        <span class="icon">🔒</span>
        <span>账户安全</span>
        <span class="arrow">→</span>
      </router-link>
      <div class="menu-item" @click="handleLogout">
        <span class="icon">🚪</span>
        <span>退出登录</span>
        <span class="arrow">→</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../store/auth'
import { useUserStore } from '../../store/user'

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

const user = computed(() => authStore.currentUser)

onMounted(async () => {
  try {
    await userStore.fetchProfile()
  } catch (error) {
    console.error('获取用户信息失败:', error)
  }
})

const handleLogout = () => {
  if (confirm('确定要退出登录吗？')) {
    authStore.logout()
    router.push('/login')
  }
}
</script>

<style scoped>
.user-center {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.header {
  background-color: #409eff;
  color: #fff;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
}

.info h3 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.info p {
  opacity: 0.9;
}

.edit-btn {
  background-color: rgba(255, 255, 255, 0.2);
  color: #fff;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.menu {
  margin: 1rem;
  background-color: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f0f0f0;
  text-decoration: none;
  color: #333;
  transition: all 0.3s ease;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background-color: #f5f5f5;
}

.icon {
  font-size: 1.5rem;
  margin-right: 1rem;
  width: 24px;
  text-align: center;
}

.arrow {
  margin-left: auto;
  color: #999;
}

@media (max-width: 768px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .user-info {
    width: 100%;
  }
  
  .edit-btn {
    align-self: flex-end;
  }
}
</style>
<template>
  <div class="login-container">
    <div class="logo-section">
      <h1>本地生活服务</h1>
      <p>让生活更便捷</p>
    </div>
    <van-form @submit="handleLogin">
      <van-cell-group inset>
        <van-field
          v-model="loginForm.email"
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          :rules="[{ required: true, message: '请输入邮箱' }]"
        />
        <van-field
          v-model="loginForm.password"
          type="password"
          name="password"
          label="密码"
          placeholder="请输入密码"
          :rules="[{ required: true, message: '请输入密码' }]"
        />
      </van-cell-group>
      <div style="margin: 16px;">
        <van-button round block type="primary" native-type="submit" :loading="loading">
          登录
        </van-button>
      </div>
    </van-form>
    <div class="register-link">
      <span>还没有账号？</span>
      <router-link to="/register">立即注册</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../store/user'
import { showToast } from 'vant'

const router = useRouter()
const userStore = useUserStore()

const loginForm = ref({
  email: '',
  password: ''
})

const loading = ref(false)

const handleLogin = async () => {
  try {
    loading.value = true
    await userStore.login(loginForm.value)
    showToast({ message: '登录成功', position: 'top' })
    router.push('/home')
  } catch (error) {
    showToast({ message: error.message || '登录失败', position: 'top' })
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 60px 20px 20px;
}

.logo-section {
  text-align: center;
  margin-bottom: 60px;
  color: #fff;
}

.logo-section h1 {
  font-size: 28px;
  margin-bottom: 10px;
}

.logo-section p {
  font-size: 14px;
  opacity: 0.9;
}

.register-link {
  text-align: center;
  color: #fff;
  font-size: 14px;
}

.register-link a {
  color: #fff;
  text-decoration: underline;
  margin-left: 5px;
}
</style>
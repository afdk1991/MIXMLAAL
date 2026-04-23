<template>
  <div class="error-container">
    <div class="error-content">
      <el-icon class="error-icon"><Warning /></el-icon>
      <h1>404</h1>
      <p>页面不存在</p>
      <el-button type="primary" @click="goBack">返回首页</el-button>
    </div>
  </div>
</template>

<script setup>
import { Warning } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goBack = () => {
  router.push('/dashboard')
}
</script>

<style scoped>
.error-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f7fa;
}

.error-content {
  text-align: center;
  background-color: #fff;
  padding: 60px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.error-icon {
  font-size: 64px;
  color: #409eff;
  margin-bottom: 20px;
}

.error-content h1 {
  font-size: 48px;
  margin-bottom: 20px;
  color: #303133;
}

.error-content p {
  font-size: 18px;
  margin-bottom: 30px;
  color: #606266;
}

.el-button {
  font-size: 16px;
  padding: 10px 30px;
}
</style>
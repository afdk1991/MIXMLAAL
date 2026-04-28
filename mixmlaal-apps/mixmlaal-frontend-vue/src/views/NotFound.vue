<template>
  <div class="not-found-container">
    <div class="not-found-content">
      <h1 class="not-found-code">404</h1>
      <h2 class="not-found-title">页面未找到</h2>
      <p class="not-found-description">抱歉，您访问的页面不存在或已被移除</p>
      <div class="not-found-actions">
        <button class="not-found-button" @click="goHome">返回首页</button>
        <button class="not-found-button secondary" @click="goBack">返回上一页</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';

const router = useRouter();

const goHome = () => {
  router.push('/');
};

const goBack = () => {
  router.back();
};
</script>

<style scoped>
.not-found-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 40px 20px;
  background-color: var(--color-gray-50);
}

.not-found-content {
  text-align: center;
  max-width: 500px;
  padding: 60px 40px;
  background-color: var(--color-white);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.not-found-code {
  font-size: 80px;
  font-weight: 700;
  color: var(--color-blue-500);
  margin: 0 0 20px;
  line-height: 1;
}

.not-found-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 16px;
}

.not-found-description {
  font-size: 16px;
  color: var(--color-gray-600);
  margin: 0 0 32px;
  line-height: 1.5;
}

.not-found-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.not-found-button {
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.not-found-button:not(.secondary) {
  background-color: var(--color-blue-500);
  color: var(--color-white);
}

.not-found-button:not(.secondary):hover {
  background-color: var(--color-blue-600);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.not-found-button.secondary {
  background-color: var(--color-white);
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.not-found-button.secondary:hover {
  background-color: var(--color-gray-50);
  border-color: var(--color-gray-400);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .not-found-content {
    padding: 40px 20px;
  }
  
  .not-found-code {
    font-size: 60px;
  }
  
  .not-found-title {
    font-size: 20px;
  }
  
  .not-found-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .not-found-button {
    width: 100%;
    max-width: 200px;
  }
}
</style>
<template>
  <div class="status-ui">
    <!-- 加载状态 -->
    <div v-if="loading" class="status-overlay">
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p v-if="loadingText" class="loading-text">{{ loadingText }}</p>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-container" :class="{ 'error-fullscreen': fullscreen }">
      <div class="error-icon">
        <i class="fa fa-exclamation-circle"></i>
      </div>
      <h3 class="error-title">{{ errorTitle || '出错了' }}</h3>
      <p class="error-message">{{ errorMessage || '操作失败，请重试' }}</p>
      <div class="error-actions">
        <button v-if="onRetry" @click="onRetry" class="btn btn-primary">
          重试
        </button>
        <button v-if="onClose" @click="onClose" class="btn btn-outline">
          关闭
        </button>
      </div>
    </div>
    
    <!-- 成功状态 -->
    <div v-if="success" class="success-container" :class="{ 'success-fullscreen': fullscreen }">
      <div class="success-icon">
        <i class="fa fa-check-circle"></i>
      </div>
      <h3 class="success-title">{{ successTitle || '操作成功' }}</h3>
      <p class="success-message">{{ successMessage || '您的操作已完成' }}</p>
      <div class="success-actions">
        <button v-if="onConfirm" @click="onConfirm" class="btn btn-primary">
          确定
        </button>
        <button v-if="onClose" @click="onClose" class="btn btn-outline">
          关闭
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  // 加载状态
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '加载中...'
  },
  
  // 错误状态
  error: {
    type: Boolean,
    default: false
  },
  errorTitle: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  
  // 成功状态
  success: {
    type: Boolean,
    default: false
  },
  successTitle: {
    type: String,
    default: ''
  },
  successMessage: {
    type: String,
    default: ''
  },
  
  // 全屏模式
  fullscreen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['retry', 'close', 'confirm']);

function onRetry() {
  emit('retry');
}

function onClose() {
  emit('close');
}

function onConfirm() {
  emit('confirm');
}
</script>

<style scoped>
.status-ui {
  position: relative;
}

/* 加载状态 */
.status-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  backdrop-filter: blur(2px);
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  background-color: white;
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-xl);
  animation: fadeIn 0.3s ease;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0;
}

/* 错误状态 */
.error-container {
  padding: 2rem;
  background-color: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-danger-light);
  border-radius: var(--radius-md);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.error-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  box-shadow: var(--shadow-xl);
  max-width: 90%;
  width: 400px;
  z-index: 9998;
}

.error-icon {
  font-size: 3rem;
  color: var(--color-danger);
  margin-bottom: 1rem;
  animation: bounceIn 0.5s ease;
}

.error-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 0.5rem 0;
}

.error-message {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* 成功状态 */
.success-container {
  padding: 2rem;
  background-color: rgba(16, 185, 129, 0.1);
  border: 1px solid var(--color-success-light);
  border-radius: var(--radius-md);
  text-align: center;
  animation: fadeIn 0.3s ease;
}

.success-fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  box-shadow: var(--shadow-xl);
  max-width: 90%;
  width: 400px;
  z-index: 9998;
}

.success-icon {
  font-size: 3rem;
  color: var(--color-success);
  margin-bottom: 1rem;
  animation: bounceIn 0.5s ease;
}

.success-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-gray-800);
  margin: 0 0 0.5rem 0;
}

.success-message {
  font-size: 1rem;
  color: var(--color-gray-600);
  margin: 0 0 1.5rem 0;
  line-height: 1.5;
}

/* 操作按钮 */
.error-actions,
.success-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1rem;
}

.btn {
  padding: 0.5rem 1.5rem;
  border: none;
  border-radius: var(--radius-md);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background-color: var(--color-primary);
  color: white;
}

.btn-primary:hover {
  background-color: var(--color-primary-dark);
  transform: translateY(-1px);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.2);
}

.btn-outline {
  background-color: transparent;
  color: var(--color-gray-700);
  border: 1px solid var(--color-gray-300);
}

.btn-outline:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background-color: var(--color-primary-light);
}

/* 动画 */
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes bounceIn {
  0%, 20%, 40%, 60%, 80%, 100% {
    animation-timing-function: cubic-bezier(0.215, 0.610, 0.355, 1.000);
  }
  0% {
    opacity: 0;
    transform: scale3d(0.3, 0.3, 0.3);
  }
  20% {
    transform: scale3d(1.1, 1.1, 1.1);
  }
  40% {
    transform: scale3d(0.9, 0.9, 0.9);
  }
  60% {
    opacity: 1;
    transform: scale3d(1.03, 1.03, 1.03);
  }
  80% {
    transform: scale3d(0.97, 0.97, 0.97);
  }
  100% {
    opacity: 1;
    transform: scale3d(1, 1, 1);
  }
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .status-overlay {
    background-color: rgba(17, 24, 39, 0.9);
  }
  
  .loading-container {
    background-color: var(--color-gray-900);
  }
  
  .loading-text {
    color: var(--color-gray-300);
  }
  
  .error-fullscreen,
  .success-fullscreen {
    background-color: var(--color-gray-900);
  }
  
  .error-title,
  .success-title {
    color: var(--color-gray-100);
  }
  
  .error-message,
  .success-message {
    color: var(--color-gray-300);
  }
  
  .btn-outline {
    color: var(--color-gray-300);
    border-color: var(--color-gray-700);
  }
  
  .btn-outline:hover {
    border-color: var(--color-primary);
    color: var(--color-primary);
    background-color: rgba(59, 130, 246, 0.1);
  }
}
</style>
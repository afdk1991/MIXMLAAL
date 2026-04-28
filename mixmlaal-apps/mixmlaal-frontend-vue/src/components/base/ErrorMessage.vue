<template>
  <div class="error-message" :class="{ 'fullscreen': fullscreen }">
    <div class="error-icon">
      <i class="fa fa-exclamation-circle"></i>
    </div>
    <h3 class="error-title">{{ title || '错误' }}</h3>
    <p class="error-content">{{ message }}</p>
    <div class="error-actions">
      <button v-if="showRetry" class="btn-retry" @click="$emit('retry')">
        重试
      </button>
      <button v-if="showClose" class="btn-close" @click="$emit('close')">
        关闭
      </button>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    required: true
  },
  showRetry: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  fullscreen: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['retry', 'close']);
</script>

<style scoped>
.error-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 8px;
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  max-width: 400px;
  width: 100%;
  text-align: center;
  margin: 0 auto;
}

.error-message.fullscreen {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
  max-width: 90%;
}

.error-icon {
  font-size: 48px;
  color: #dc2626;
  margin-bottom: 16px;
}

.error-title {
  font-size: 18px;
  font-weight: 600;
  color: #b91c1c;
  margin: 0 0 8px 0;
}

.error-content {
  font-size: 14px;
  color: #7f1d1d;
  margin: 0 0 20px 0;
  line-height: 1.4;
}

.error-actions {
  display: flex;
  gap: 12px;
}

.btn-retry, .btn-close {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-retry {
  background-color: #dc2626;
  color: white;
}

.btn-retry:hover {
  background-color: #b91c1c;
}

.btn-close {
  background-color: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.btn-close:hover {
  background-color: #e5e7eb;
}

/* 深色模式适配 */
.dark .error-message {
  background-color: #3f1a1a;
  border: 1px solid #581c1c;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
}

.dark .error-title {
  color: #fecaca;
}

.dark .error-content {
  color: #fecaca;
}

.dark .btn-close {
  background-color: #374151;
  color: #e5e7eb;
  border: 1px solid #4b5563;
}

.dark .btn-close:hover {
  background-color: #4b5563;
}
</style>
<template>
  <div class="notification-container" :class="[type, { show: visible }]">
    <div class="notification-content">
      <div class="notification-icon" v-if="showIcon">
        <span v-if="type === 'success'">✓</span>
        <span v-else-if="type === 'error'">✗</span>
        <span v-else-if="type === 'warning'">!</span>
        <span v-else-if="type === 'info'">i</span>
      </div>
      <div class="notification-text">
        <h4 v-if="title" class="notification-title">{{ title }}</h4>
        <p class="notification-message">{{ message }}</p>
      </div>
      <button class="notification-close" @click="close">
        ×
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const props = defineProps({
  message: {
    type: String,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'info',
    validator: (val) => ['success', 'error', 'warning', 'info'].includes(val)
  },
  duration: {
    type: Number,
    default: 3000
  },
  showIcon: {
    type: Boolean,
    default: true
  },
  closeable: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['close']);

const visible = ref(false);
let timer = null;

const show = () => {
  visible.value = true;
  if (props.duration > 0) {
    timer = setTimeout(() => {
      close();
    }, props.duration);
  }
};

const close = () => {
  visible.value = false;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  setTimeout(() => {
    emit('close');
  }, 300);
};

onMounted(() => {
  // 延迟显示，确保DOM已渲染
  setTimeout(() => {
    show();
  }, 100);
});

onUnmounted(() => {
  if (timer) {
    clearTimeout(timer);
  }
});
</script>

<style scoped>
.notification-container {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 320px;
  min-width: 280px;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  opacity: 0;
  transform: translateX(100%);
  transition: all 0.3s ease;
}

.notification-container.show {
  opacity: 1;
  transform: translateX(0);
}

.notification-content {
  display: flex;
  align-items: flex-start;
}

.notification-icon {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  flex-shrink: 0;
  font-weight: bold;
  font-size: 14px;
}

.notification-text {
  flex: 1;
  min-width: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: #1f2937;
}

.notification-message {
  font-size: 13px;
  margin: 0;
  color: #4b5563;
  line-height: 1.4;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: #9ca3af;
  margin-left: 12px;
  flex-shrink: 0;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background-color: rgba(0, 0, 0, 0.05);
  color: #6b7280;
}

/* 类型样式 */
.notification-container.success {
  background-color: #f0fdf4;
  border-left: 4px solid #10b981;
}

.notification-container.success .notification-icon {
  background-color: #d1fae5;
  color: #059669;
}

.notification-container.error {
  background-color: #fef2f2;
  border-left: 4px solid #ef4444;
}

.notification-container.error .notification-icon {
  background-color: #fee2e2;
  color: #dc2626;
}

.notification-container.warning {
  background-color: #fffbeb;
  border-left: 4px solid #f59e0b;
}

.notification-container.warning .notification-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.notification-container.info {
  background-color: #eff6ff;
  border-left: 4px solid #3b82f6;
}

.notification-container.info .notification-icon {
  background-color: #dbeafe;
  color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .notification-container {
    top: 10px;
    right: 10px;
    left: 10px;
    max-width: none;
  }
}
</style>
<template>
  <div class="progress-container" :class="{ 'vertical': vertical }">
    <div 
      class="progress-bar" 
      :class="{ 'animated': animated }"
      :style="{
        [vertical ? 'height' : 'width']: `${value}%`,
        backgroundColor: color,
        transition: `all ${duration}ms ${easing}`
      }"
    ></div>
    <div v-if="showPercentage" class="progress-percentage">
      {{ value }}%
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  value: {
    type: Number,
    default: 0,
    validator: (val) => val >= 0 && val <= 100
  },
  color: {
    type: String,
    default: '#3b82f6'
  },
  duration: {
    type: Number,
    default: 300
  },
  easing: {
    type: String,
    default: 'ease-in-out'
  },
  vertical: {
    type: Boolean,
    default: false
  },
  showPercentage: {
    type: Boolean,
    default: false
  },
  animated: {
    type: Boolean,
    default: false
  }
});
</script>

<style scoped>
.progress-container {
  position: relative;
  width: 100%;
  height: 8px;
  background-color: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.progress-container.vertical {
  width: 8px;
  height: 100%;
}

.progress-bar {
  width: 0;
  height: 100%;
  border-radius: 4px;
}

.progress-bar.animated {
  animation: pulse 2s infinite;
}

.progress-percentage {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  font-size: 12px;
  font-weight: 500;
  color: #374151;
}

.progress-container.vertical .progress-percentage {
  top: auto;
  bottom: 8px;
  right: 50%;
  transform: translateX(50%);
}

@keyframes pulse {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .progress-container {
    height: 6px;
  }
  
  .progress-container.vertical {
    width: 6px;
  }
  
  .progress-percentage {
    font-size: 10px;
    right: 4px;
  }
  
  .progress-container.vertical .progress-percentage {
    bottom: 4px;
  }
}
</style>
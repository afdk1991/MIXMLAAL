<template>
  <div class="skeleton" :class="{ 'skeleton-animated': animated }">
    <!-- 文本骨架 -->
    <div v-if="type === 'text'" class="skeleton-text" :style="textStyle"></div>
    
    <!-- 圆形骨架 -->
    <div v-else-if="type === 'circle'" class="skeleton-circle" :style="circleStyle"></div>
    
    <!-- 矩形骨架 -->
    <div v-else-if="type === 'rect'" class="skeleton-rect" :style="rectStyle"></div>
    
    <!-- 图片骨架 -->
    <div v-else-if="type === 'image'" class="skeleton-image" :style="imageStyle">
      <div class="skeleton-image-content"></div>
    </div>
    
    <!-- 列表骨架 -->
    <div v-else-if="type === 'list'" class="skeleton-list" :style="listStyle">
      <div v-for="i in count" :key="i" class="skeleton-list-item">
        <div class="skeleton-list-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-list-title"></div>
          <div class="skeleton-list-desc"></div>
        </div>
      </div>
    </div>
    
    <!-- 卡片骨架 -->
    <div v-else-if="type === 'card'" class="skeleton-card" :style="cardStyle">
      <div class="skeleton-card-image"></div>
      <div class="skeleton-card-content">
        <div class="skeleton-card-title"></div>
        <div class="skeleton-card-desc"></div>
        <div class="skeleton-card-actions"></div>
      </div>
    </div>
    
    <!-- 自定义骨架 -->
    <slot v-else></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  // 骨架类型: text, circle, rect, image, list, card
  type: {
    type: String,
    default: 'text'
  },
  // 是否动画
  animated: {
    type: Boolean,
    default: true
  },
  // 宽度
  width: {
    type: [String, Number],
    default: '100%'
  },
  // 高度
  height: {
    type: [String, Number],
    default: '20px'
  },
  // 圆角
  radius: {
    type: [String, Number],
    default: '4px'
  },
  // 数量（用于列表）
  count: {
    type: Number,
    default: 3
  }
});

// 文本骨架样式
const textStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    borderRadius: props.radius
  };
});

// 圆形骨架样式
const circleStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    borderRadius: '50%'
  };
});

// 矩形骨架样式
const rectStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    borderRadius: props.radius
  };
});

// 图片骨架样式
const imageStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    borderRadius: props.radius
  };
});

// 列表骨架样式
const listStyle = computed(() => {
  return {
    width: props.width || '100%'
  };
});

// 卡片骨架样式
const cardStyle = computed(() => {
  return {
    width: props.width || '100%'
  };
});
</script>

<style scoped>
.skeleton {
  position: relative;
  overflow: hidden;
  background-color: var(--color-gray-100);
}

.skeleton-animated::after {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.2),
    transparent
  );
  animation: skeleton-loading 1.5s infinite;
}

@keyframes skeleton-loading {
  0% {
    left: -100%;
  }
  100% {
    left: 100%;
  }
}

/* 文本骨架 */
.skeleton-text {
  display: inline-block;
}

/* 圆形骨架 */
.skeleton-circle {
  display: inline-block;
}

/* 矩形骨架 */
.skeleton-rect {
  display: inline-block;
}

/* 图片骨架 */
.skeleton-image {
  position: relative;
  overflow: hidden;
}

.skeleton-image-content {
  width: 100%;
  height: 100%;
  background-color: var(--color-gray-200);
}

/* 列表骨架 */
.skeleton-list {
  width: 100%;
}

.skeleton-list-item {
  display: flex;
  align-items: center;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-gray-200);
}

.skeleton-list-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: var(--color-gray-200);
  margin-right: var(--spacing-4);
}

.skeleton-list-content {
  flex: 1;
}

.skeleton-list-title {
  width: 70%;
  height: 16px;
  border-radius: 4px;
  background-color: var(--color-gray-200);
  margin-bottom: var(--spacing-2);
}

.skeleton-list-desc {
  width: 90%;
  height: 14px;
  border-radius: 4px;
  background-color: var(--color-gray-200);
}

/* 卡片骨架 */
.skeleton-card {
  width: 100%;
  border-radius: var(--radius-lg);
  overflow: hidden;
  background-color: var(--color-white);
  box-shadow: var(--shadow-sm);
}

.skeleton-card-image {
  width: 100%;
  height: 180px;
  background-color: var(--color-gray-200);
}

.skeleton-card-content {
  padding: var(--spacing-4);
}

.skeleton-card-title {
  width: 60%;
  height: 20px;
  border-radius: 4px;
  background-color: var(--color-gray-200);
  margin-bottom: var(--spacing-3);
}

.skeleton-card-desc {
  width: 100%;
  height: 14px;
  border-radius: 4px;
  background-color: var(--color-gray-200);
  margin-bottom: var(--spacing-4);
}

.skeleton-card-actions {
  width: 40%;
  height: 36px;
  border-radius: 4px;
  background-color: var(--color-gray-200);
}

/* 深色模式 */
@media (prefers-color-scheme: dark) {
  .skeleton {
    background-color: var(--color-gray-800);
  }
  
  .skeleton-image-content,
  .skeleton-list-avatar,
  .skeleton-list-title,
  .skeleton-list-desc,
  .skeleton-card-image,
  .skeleton-card-title,
  .skeleton-card-desc,
  .skeleton-card-actions {
    background-color: var(--color-gray-700);
  }
  
  .skeleton-list-item {
    border-bottom-color: var(--color-gray-700);
  }
  
  .skeleton-card {
    background-color: var(--color-gray-900);
  }
}
</style>

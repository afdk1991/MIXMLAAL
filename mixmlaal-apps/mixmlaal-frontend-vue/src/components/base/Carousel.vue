<template>
  <div class="carousel" ref="carousel">
    <div 
      class="carousel-container" 
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div 
        v-for="(item, index) in items" 
        :key="index" 
        class="carousel-item"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
    
    <!-- 指示器 -->
    <div class="carousel-indicators" v-if="showIndicators">
      <span 
        v-for="(item, index) in items" 
        :key="index"
        class="indicator"
        :class="{ active: index === currentIndex }"
        @click="goTo(index)"
      ></span>
    </div>
    
    <!-- 左右箭头 -->
    <button 
      class="carousel-arrow left" 
      @click="prev" 
      v-if="showArrows"
    >
      &lt;
    </button>
    <button 
      class="carousel-arrow right" 
      @click="next" 
      v-if="showArrows"
    >
      &gt;
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  items: {
    type: Array,
    required: true
  },
  interval: {
    type: Number,
    default: 3000
  },
  showIndicators: {
    type: Boolean,
    default: true
  },
  showArrows: {
    type: Boolean,
    default: true
  },
  autoplay: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['change']);

const carousel = ref(null);
const currentIndex = ref(0);
let timer = null;
let startX = 0;
let currentX = 0;
let isDragging = false;

// 下一张
const next = () => {
  currentIndex.value = (currentIndex.value + 1) % props.items.length;
  emit('change', currentIndex.value);
};

// 上一张
const prev = () => {
  currentIndex.value = (currentIndex.value - 1 + props.items.length) % props.items.length;
  emit('change', currentIndex.value);
};

// 跳转到指定索引
const goTo = (index) => {
  currentIndex.value = index;
  emit('change', currentIndex.value);
};

// 开始自动播放
const startAutoplay = () => {
  if (props.autoplay) {
    timer = setInterval(next, props.interval);
  }
};

// 停止自动播放
const stopAutoplay = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
};

// 监听鼠标事件
const handleMouseEnter = () => {
  stopAutoplay();
};

const handleMouseLeave = () => {
  startAutoplay();
};

// 触摸事件处理
const handleTouchStart = (e) => {
  stopAutoplay();
  isDragging = true;
  startX = e.touches[0].clientX;
  currentX = startX;
};

const handleTouchMove = (e) => {
  if (!isDragging) return;
  currentX = e.touches[0].clientX;
};

const handleTouchEnd = () => {
  if (!isDragging) return;
  
  const distance = currentX - startX;
  const threshold = 50;
  
  if (distance > threshold) {
    // 向右滑动，上一张
    prev();
  } else if (distance < -threshold) {
    // 向左滑动，下一张
    next();
  }
  
  isDragging = false;
  startAutoplay();
};

// 监听items变化
watch(() => props.items, () => {
  currentIndex.value = 0;
  stopAutoplay();
  startAutoplay();
}, { deep: true });

onMounted(() => {
  if (carousel.value) {
    carousel.value.addEventListener('mouseenter', handleMouseEnter);
    carousel.value.addEventListener('mouseleave', handleMouseLeave);
    carousel.value.addEventListener('touchstart', handleTouchStart);
    carousel.value.addEventListener('touchmove', handleTouchMove);
    carousel.value.addEventListener('touchend', handleTouchEnd);
  }
  startAutoplay();
});

onUnmounted(() => {
  if (carousel.value) {
    carousel.value.removeEventListener('mouseenter', handleMouseEnter);
    carousel.value.removeEventListener('mouseleave', handleMouseLeave);
    carousel.value.removeEventListener('touchstart', handleTouchStart);
    carousel.value.removeEventListener('touchmove', handleTouchMove);
    carousel.value.removeEventListener('touchend', handleTouchEnd);
  }
  stopAutoplay();
});
</script>

<style scoped>
.carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 8px;
}

.carousel-container {
  display: flex;
  transition: transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  height: 100%;
  will-change: transform;
}

.carousel-item {
  flex: 0 0 100%;
  height: 100%;
  position: relative;
  overflow: hidden;
}

/* 指示器动画 */
.indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  will-change: width, background-color, border-radius;
}

.indicator.active {
  background-color: white;
  width: 16px;
  border-radius: 4px;
}

.carousel-indicators {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
}

/* 箭头动画 */
.carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(0, 0, 0, 0.3);
  color: white;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  display: flex;
  align-items: center;
  justify-content: center;
  will-change: transform, background-color, box-shadow;
  opacity: 0;
  visibility: hidden;
}

.carousel:hover .carousel-arrow {
  opacity: 1;
  visibility: visible;
}

.carousel-arrow:hover {
  background-color: rgba(0, 0, 0, 0.5);
  transform: translateY(-50%) scale(1.1);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

.carousel-arrow:active {
  transform: translateY(-50%) scale(0.95);
}

.carousel-arrow.left {
  left: 16px;
}

.carousel-arrow.right {
  right: 16px;
}

@media (max-width: 768px) {
  .carousel-arrow {
    width: 28px;
    height: 28px;
    font-size: 14px;
  }
  
  .indicator {
    width: 6px;
    height: 6px;
  }
  
  .indicator.active {
    width: 12px;
  }
}
</style>
<template>
  <div class="lazy-image-container" :class="{ 'loaded': isLoaded, 'error': isError }">
    <!-- 占位符 -->
    <div v-if="!isLoaded && !isError" class="placeholder" :style="placeholderStyle">
      <div v-if="showLoading" class="loading-spinner">
        <svg class="animate-spin h-6 w-6 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div v-else class="placeholder-content">
        <slot name="placeholder">
          <div class="w-full h-full bg-gray-100 rounded"></div>
        </slot>
      </div>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="isError" class="error-state" :style="errorStyle">
      <svg class="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
      </svg>
      <p class="text-gray-500 text-sm">图片加载失败</p>
    </div>
    
    <!-- 实际图片 -->
    <img
      v-if="src && !isError"
      ref="imageRef"
      :src="optimizedSrc"
      :alt="alt"
      :title="title"
      :class="['lazy-image', className]"
      :style="imageStyle"
      @load="handleLoad"
      @error="handleError"
      loading="lazy"
      decoding="async"
      fetchpriority="low"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// 缓存浏览器格式支持检测结果
const browserSupport = {
  webp: null,
  avif: null
};

const props = defineProps({
  src: {
    type: String,
    required: true
  },
  alt: {
    type: String,
    default: ''
  },
  title: {
    type: String,
    default: ''
  },
  className: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  showLoading: {
    type: Boolean,
    default: true
  },
  width: {
    type: [String, Number],
    default: 'auto'
  },
  height: {
    type: [String, Number],
    default: 'auto'
  },
  quality: {
    type: Number,
    default: 80
  },
  format: {
    type: String,
    default: 'auto' // auto, webp, avif, jpg, png
  },
  errorImage: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['load', 'error']);

const imageRef = ref(null);
const isLoaded = ref(false);
const isError = ref(false);
const observer = ref(null);

// 检查WebP支持
function checkWebPSupport() {
  if (browserSupport.webp !== null) return browserSupport.webp;
  
  if (typeof window === 'undefined') {
    browserSupport.webp = false;
    return false;
  }
  
  try {
    const elem = document.createElement('canvas');
    browserSupport.webp = elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return browserSupport.webp;
  } catch (e) {
    browserSupport.webp = false;
    return false;
  }
}

// 检查AVIF支持
function checkAVIFSupport() {
  if (browserSupport.avif !== null) return browserSupport.avif;
  
  if (typeof window === 'undefined') {
    browserSupport.avif = false;
    return false;
  }
  
  try {
    const elem = document.createElement('canvas');
    browserSupport.avif = elem.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    return browserSupport.avif;
  } catch (e) {
    browserSupport.avif = false;
    return false;
  }
}

// 转换为WebP格式
function convertToWebP(url) {
  return url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp');
}

// 转换为AVIF格式
function convertToAVIF(url) {
  return url.replace(/\.(jpg|jpeg|png|gif)$/i, '.avif');
}

// 计算优化后的图片URL
const optimizedSrc = computed(() => {
  if (!props.src) return '';
  
  // 检查是否已经是优化后的URL
  if (props.src.includes('w=') || props.src.includes('h=') || props.src.includes('q=')) {
    return props.src;
  }
  
  // 构建优化后的URL
  let optimizedUrl = props.src;
  
  // 根据设备类型和浏览器支持选择最佳格式
  if (props.format === 'auto') {
    const supportsAVIF = checkAVIFSupport();
    const supportsWebP = checkWebPSupport();
    
    if (supportsAVIF) {
      optimizedUrl = convertToAVIF(props.src);
    } else if (supportsWebP) {
      optimizedUrl = convertToWebP(props.src);
    }
  } else if (props.format === 'webp') {
    optimizedUrl = convertToWebP(props.src);
  } else if (props.format === 'avif') {
    optimizedUrl = convertToAVIF(props.src);
  }
  
  // 添加尺寸和质量参数
  if (props.width || props.height) {
    const width = props.width || 'auto';
    const height = props.height || 'auto';
    optimizedUrl += `?w=${width}&h=${height}&q=${props.quality}`;
  }
  
  return optimizedUrl;
});

// 计算占位符样式
const placeholderStyle = computed(() => {
  return {
    width: props.width,
    height: props.height,
    backgroundImage: props.placeholder ? `url(${props.placeholder})` : 'none'
  };
});

// 计算图片样式
const imageStyle = computed(() => {
  return {
    width: props.width,
    height: props.height
  };
});

// 计算错误状态样式
const errorStyle = computed(() => {
  return {
    width: props.width,
    height: props.height
  };
});

// 处理图片加载完成
function handleLoad() {
  isLoaded.value = true;
  isError.value = false;
  emit('load');
}

// 处理图片加载错误
function handleError() {
  isError.value = true;
  isLoaded.value = false;
  emit('error');
}

// 初始化懒加载
onMounted(() => {
  if (imageRef.value) {
    // 检查是否已经在视口中
    observer.value = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // 图片进入视口，开始加载
          if (observer.value) {
            observer.value.unobserve(entry.target);
          }
        }
      });
    }, {
      rootMargin: '200px', // 提前200px开始加载
      threshold: 0.1
    });
    
    observer.value.observe(imageRef.value);
  }
});

onUnmounted(() => {
  // 清理资源
  if (observer.value && imageRef.value) {
    observer.value.unobserve(imageRef.value);
  }
});
</script>

<style scoped>
.lazy-image-container {
  position: relative;
  overflow: hidden;
  contain: layout style;
}

.placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f3f4f6;
  transition: opacity 0.3s ease;
  will-change: opacity;
}

.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-state {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
}

.lazy-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: opacity 0.3s ease;
  opacity: 0;
  will-change: opacity;
}

.lazy-image-container.loaded .placeholder {
  opacity: 0;
  pointer-events: none;
}

.lazy-image-container.loaded .lazy-image {
  opacity: 1;
}

/* 动画优化 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<template>
  <div id="app" class="app-container" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd" style="touch-action: pan-y;">
    <div class="pull-progress" :style="{ height: progressHeight + 'px' }">
      <div class="pull-progress-bar" :style="{ width: progress + '%' }"></div>
      <div class="pull-progress-text" v-if="isPulling">
        {{ pullText }}
      </div>
    </div>
    <router-view v-slot="{ Component, route }">
      <transition name="page-transition" mode="out-in" :duration="500">
        <component 
          :is="Component" 
          :key="route.fullPath"
          v-memo="[route.fullPath]"
        />
      </transition>
    </router-view>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { batchDOMOperations } from './utils/performance';

// 下拉进度条相关状态
const startY = ref(0);
const currentY = ref(0);
const progress = ref(0);
const progressHeight = ref(0);
const isPulling = ref(false);
const isRefreshing = ref(false);
const isAtTop = ref(true);
const pullText = ref('下拉刷新');

// 处理触摸开始
const handleTouchStart = (e) => {
  // 检查是否在页面顶部且不在刷新中
  if (isRefreshing.value) return;
  
  isAtTop.value = window.scrollY === 0;
  if (isAtTop.value) {
    startY.value = e.touches[0].clientY;
  }
};

// 处理触摸移动
const handleTouchMove = (e) => {
  if (!isAtTop.value || isRefreshing.value) return;
  
  currentY.value = e.touches[0].clientY;
  const distance = currentY.value - startY.value;
  
  if (distance > 0) {
    e.preventDefault(); // 阻止默认滚动
    isPulling.value = true;
    
    // 计算进度和高度，添加弹性效果
    const maxDistance = 150;
    const pullDistance = Math.min(distance, maxDistance);
    // 弹性效果：距离越大，阻力越大
    const elasticDistance = pullDistance < maxDistance 
      ? pullDistance * 0.5 
      : (maxDistance * 0.5) + ((pullDistance - maxDistance) * 0.2);
    
    progress.value = (pullDistance / maxDistance) * 100;
    progressHeight.value = elasticDistance;
    
    // 更新提示文本
    if (progress.value > 80) {
      pullText.value = '释放刷新';
    } else {
      pullText.value = '下拉刷新';
    }
  }
};

// 处理触摸结束
const handleTouchEnd = () => {
  if (!isPulling.value) return;
  
  if (progress.value > 80) {
    // 触发刷新
    refreshPage();
  } else {
    // 重置状态
    resetPullState();
  }
};

// 重置下拉状态
const resetPullState = () => {
  isPulling.value = false;
  // 动画重置
  const resetAnimation = () => {
    if (progressHeight.value > 0) {
      progressHeight.value -= 10;
      progress.value = (progressHeight.value / 75) * 100;
      requestAnimationFrame(resetAnimation);
    } else {
      progressHeight.value = 0;
      progress.value = 0;
      pullText.value = '下拉刷新';
    }
  };
  resetAnimation();
};

// 刷新页面
const refreshPage = async () => {
  isRefreshing.value = true;
  pullText.value = '刷新中...';
  
  try {
    // 模拟网络请求
    await new Promise(resolve => setTimeout(resolve, 1500));
    // 这里可以添加实际的刷新逻辑，例如重新加载数据
    // 刷新完成后可以触发事件通知子组件
    window.dispatchEvent(new CustomEvent('page-refreshed'));
  } catch (error) {
    console.error('刷新失败:', error);
  } finally {
    isRefreshing.value = false;
    resetPullState();
  }
};

// 优化首屏加载
onMounted(() => {
  // 批量处理DOM操作
  batchDOMOperations(() => {
    // 移除加载状态
    document.getElementById('loading')?.remove();
    // 显示应用内容
    document.getElementById('app')?.classList.remove('hidden');
  });
});

onUnmounted(() => {
  // 清理资源
});
</script>

<style>
@import './styles/design-system.css';
@import './styles/responsive.css';

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: var(--font-family-sans);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: var(--color-gray-800);
  background-color: var(--color-gray-50);
  overflow-x: hidden;
}

#app {
  min-height: 100vh;
  transition: opacity 0.3s ease;
}

.app-container {
  position: relative;
  isolation: isolate;
}

.page-transition-enter-active,
.page-transition-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

.page-transition-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.98);
}

.page-transition-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(1.02);
}

.page-transition-enter-active {
  will-change: transform, opacity;
}

.page-transition-leave-active {
  will-change: transform, opacity;
}

/* 加载状态 */
#loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
  z-index: 9999;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid var(--color-gray-200);
  border-top: 4px solid var(--color-blue-500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  opacity: 0;
  visibility: hidden;
}

/* 下拉进度条样式 */
.pull-progress {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  overflow: hidden;
  z-index: 9998;
  transition: height 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: var(--color-gray-50);
}

.pull-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background-color: var(--color-blue-500);
  transition: width 0.3s ease;
  border-radius: 0 0 50% 50%;
}

.pull-progress-text {
  position: relative;
  z-index: 1;
  font-size: 14px;
  color: var(--color-gray-700);
  padding: 10px;
  text-align: center;
}
</style>
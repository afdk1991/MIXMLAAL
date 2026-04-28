<template>
  <div 
    class="virtual-list" 
    :style="containerStyle"
    @scroll="handleScroll"
    ref="containerRef"
  >
    <!-- 占位元素，用于撑开容器高度 -->
    <div 
      class="virtual-list-placeholder"
      :style="{ height: totalHeight + 'px' }"
    ></div>
    
    <!-- 虚拟列表内容 -->
    <div 
      class="virtual-list-content"
      :style="contentStyle"
      ref="contentRef"
    >
      <!-- 渲染可见区域内的项目 -->
      <div
        v-for="(item, index) in visibleItems"
        :key="item[keyField] || index"
        class="virtual-list-item"
        :style="{ height: itemHeight + 'px' }"
      >
        <slot :item="item" :index="index"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';

const props = defineProps({
  // 数据源
  items: {
    type: Array,
    required: true
  },
  // 项目高度（像素）
  itemHeight: {
    type: Number,
    default: 100
  },
  // 额外渲染的项目数量（上下各渲染几个）
  buffer: {
    type: Number,
    default: 5
  },
  // 键字段，用于v-for的key
  keyField: {
    type: String,
    default: 'id'
  },
  // 容器高度
  height: {
    type: [String, Number],
    default: '500px'
  }
});

const emit = defineEmits(['scroll', 'visible-change']);

const containerRef = ref(null);
const contentRef = ref(null);

// 计算总高度
const totalHeight = computed(() => {
  return props.items.length * props.itemHeight;
});

// 计算容器样式
const containerStyle = computed(() => {
  return {
    height: props.height,
    overflow: 'auto',
    position: 'relative'
  };
});

// 计算可见区域的项目
const visibleItems = computed(() => {
  if (!containerRef.value) return [];
  
  const container = containerRef.value;
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  
  // 计算可见区域的起始和结束索引
  const startIndex = Math.max(0, Math.floor(scrollTop / props.itemHeight) - props.buffer);
  const endIndex = Math.min(
    props.items.length,
    Math.ceil((scrollTop + containerHeight) / props.itemHeight) + props.buffer
  );
  
  // 触发可见项目变化事件
  emit('visible-change', {
    start: startIndex,
    end: endIndex
  });
  
  // 返回可见区域内的项目
  return props.items.slice(startIndex, endIndex);
});

// 计算内容样式
const contentStyle = computed(() => {
  if (!containerRef.value) return {};
  
  const scrollTop = containerRef.value.scrollTop;
  const startIndex = Math.max(0, Math.floor(scrollTop / props.itemHeight) - props.buffer);
  const offsetTop = startIndex * props.itemHeight;
  
  return {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    transform: `translateY(${offsetTop}px)`
  };
});

// 处理滚动事件
function handleScroll(e) {
  emit('scroll', e);
  // 触发重新计算
  visibleItems.value;
}

// 监听数据变化
watch(() => props.items.length, () => {
  // 数据变化时，重新计算可见项目
  visibleItems.value;
});

onMounted(() => {
  // 初始化时计算可见项目
  visibleItems.value;
});

onUnmounted(() => {
  // 清理资源
});
</script>

<style scoped>
.virtual-list {
  width: 100%;
  overflow-y: auto;
  position: relative;
  -webkit-overflow-scrolling: touch; /* 平滑滚动 */
}

.virtual-list-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  pointer-events: none;
}

.virtual-list-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  will-change: transform; /* 性能优化 */
}

.virtual-list-item {
  width: 100%;
  box-sizing: border-box;
}
</style>

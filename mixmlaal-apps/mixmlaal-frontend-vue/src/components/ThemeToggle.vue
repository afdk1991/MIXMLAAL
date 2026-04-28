<template>
  <button 
    class="p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors duration-200"
    @click="toggleTheme"
    :title="theme === 'light' ? '切换到深色模式' : '切换到浅色模式'"
  >
    <i v-if="theme === 'light'" class="fa fa-moon-o text-lg"></i>
    <i v-else class="fa fa-sun-o text-lg"></i>
  </button>
</template>

<script setup>
import { useTheme } from '../composables/useTheme';

const { theme, toggleTheme } = useTheme();
</script>

<style scoped>
/* 主题切换按钮样式 */
button {
  transition: all 0.3s ease;
}

button:hover {
  transform: scale(1.1);
}
</style>

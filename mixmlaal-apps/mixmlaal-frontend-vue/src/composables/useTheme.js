import { ref, watch, onMounted } from 'vue';

export function useTheme() {
  const theme = ref('light');
  
  // 初始化主题
  const initTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      theme.value = savedTheme;
    } else {
      // 检测系统偏好
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        theme.value = 'dark';
      }
    }
    applyTheme(theme.value);
  };
  
  // 应用主题
  const applyTheme = (newTheme) => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(newTheme);
    localStorage.setItem('theme', newTheme);
  };
  
  // 切换主题
  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light';
    applyTheme(theme.value);
  };
  
  // 监听主题变化
  watch(theme, (newTheme) => {
    applyTheme(newTheme);
  });
  
  // 组件挂载时初始化主题
  onMounted(() => {
    initTheme();
  });
  
  return {
    theme,
    toggleTheme,
    initTheme
  };
}

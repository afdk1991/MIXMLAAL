import { defineStore } from 'pinia';

/**
 * 主题管理Store
 */
export const useThemeStore = defineStore('theme', {
  state: () => ({
    // 主题模式: light | dark
    theme: localStorage.getItem('theme') || 'light',
  }),
  
  getters: {
    /**
     * 获取当前主题
     */
    currentTheme: (state) => state.theme,
    
    /**
     * 是否为暗黑模式
     */
    isDark: (state) => state.theme === 'dark',
  },
  
  actions: {
    /**
     * 切换主题
     */
    toggleTheme() {
      this.theme = this.theme === 'light' ? 'dark' : 'light';
      this.saveTheme();
      this.applyTheme();
    },
    
    /**
     * 设置主题
     * @param {string} theme - 主题名称: light | dark
     */
    setTheme(theme) {
      this.theme = theme;
      this.saveTheme();
      this.applyTheme();
    },
    
    /**
     * 保存主题到本地存储
     */
    saveTheme() {
      localStorage.setItem('theme', this.theme);
    },
    
    /**
     * 应用主题
     */
    applyTheme() {
      if (this.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    
    /**
     * 初始化主题
     */
    initTheme() {
      this.applyTheme();
    },
  },
});
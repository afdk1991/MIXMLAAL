/**
 * 主题管理模块
 * 提供深色/浅色主题切换和系统主题适配
 */
class Theme {
  constructor() {
    this.logger = console;
    this.currentTheme = 'light';
    this.systemTheme = null;
    this.storageKey = 'theme_preference';
    this.isInitialized = false;
  }

  /**
     * 初始化主题模块
     */
  initialize() {
    this.logger.log('🎨 Theme 模块初始化');

    // 加载保存的主题偏好
    this.loadThemePreference();

    // 检测系统主题
    this.detectSystemTheme();

    // 应用初始主题
    this.applyTheme();

    // 监听系统主题变化
    this.listenSystemThemeChanges();

    this.isInitialized = true;
    return Promise.resolve();
  }

  /**
     * 加载主题偏好
     */
  loadThemePreference() {
    if (window.Storage) {
      this.currentTheme = window.Storage.get(this.storageKey, 'light');
    }
  }

  /**
     * 保存主题偏好
     */
  saveThemePreference() {
    if (window.Storage) {
      window.Storage.set(this.storageKey, this.currentTheme);
    }
  }

  /**
     * 检测系统主题
     */
  detectSystemTheme() {
    if (window.matchMedia) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
      this.systemTheme = prefersDark.matches ? 'dark' : 'light';
    }
  }

  /**
     * 监听系统主题变化
     */
  listenSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = e => {
        this.systemTheme = e.matches ? 'dark' : 'light';

        // 如果当前主题是自动模式，应用系统主题
        if (this.currentTheme === 'auto') {
          this.applyTheme();
        }

        // 触发主题变化事件
        this.emitThemeChange();
      };

      // 添加事件监听器
      mediaQuery.addEventListener('change', handleChange);

      // 保存清理函数
      this.cleanup = () => {
        mediaQuery.removeEventListener('change', handleChange);
      };
    }
  }

  /**
     * 应用主题
     */
  applyTheme() {
    const themeToApply = this.currentTheme === 'auto'
      ? this.systemTheme || 'light'
      : this.currentTheme;

    // 移除所有主题类
    document.documentElement.classList.remove('theme-light', 'theme-dark');

    // 添加当前主题类
    document.documentElement.classList.add(`theme-${themeToApply}`);

    // 设置 CSS 变量
    this.setCSSVariables(themeToApply);

    // 更新 body 样式
    this.updateBodyStyles(themeToApply);

    // 更新组件样式
    this.updateComponentStyles(themeToApply);

    // 保存偏好
    this.saveThemePreference();

    // 触发主题变化事件
    this.emitThemeChange();

    this.logger.log(`🎨 主题已切换为: ${themeToApply}`);
  }

  /**
     * 设置 CSS 变量
     */
  setCSSVariables(theme) {
    const root = document.documentElement;

    if (theme === 'dark') {
      // 深色主题变量
      root.style.setProperty('--bg-primary', '#1F2937');
      root.style.setProperty('--bg-secondary', '#374151');
      root.style.setProperty('--bg-tertiary', '#4B5563');
      root.style.setProperty('--text-primary', '#F9FAFB');
      root.style.setProperty('--text-secondary', '#E5E7EB');
      root.style.setProperty('--text-tertiary', '#D1D5DB');
      root.style.setProperty('--border-color', '#374151');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
      root.style.setProperty('--card-bg', '#374151');
      root.style.setProperty('--header-bg', '#1F2937');
      root.style.setProperty('--nav-bg', '#1F2937');
    } else {
      // 浅色主题变量
      root.style.setProperty('--bg-primary', '#F9FAFB');
      root.style.setProperty('--bg-secondary', '#F3F4F6');
      root.style.setProperty('--bg-tertiary', '#E5E7EB');
      root.style.setProperty('--text-primary', '#1F2937');
      root.style.setProperty('--text-secondary', '#374151');
      root.style.setProperty('--text-tertiary', '#6B7280');
      root.style.setProperty('--border-color', '#E5E7EB');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--card-bg', '#FFFFFF');
      root.style.setProperty('--header-bg', '#FFFFFF');
      root.style.setProperty('--nav-bg', '#FFFFFF');
    }
  }

  /**
     * 更新 body 样式
     */
  updateBodyStyles(theme) {
    const body = document.body;

    if (theme === 'dark') {
      body.style.backgroundColor = 'var(--bg-primary)';
      body.style.color = 'var(--text-primary)';
      body.style.borderColor = 'var(--border-color)';
    } else {
      body.style.backgroundColor = 'var(--bg-primary)';
      body.style.color = 'var(--text-primary)';
      body.style.borderColor = 'var(--border-color)';
    }
  }

  /**
     * 更新组件样式
     */
  updateComponentStyles(theme) {
    // 更新卡片样式
    document.querySelectorAll('.bg-white, .bg-gray-100').forEach(el => {
      el.style.backgroundColor = 'var(--card-bg)';
      el.style.borderColor = 'var(--border-color)';
    });

    // 更新头部样式
    document.querySelectorAll('header, .header').forEach(el => {
      el.style.backgroundColor = 'var(--header-bg)';
      el.style.borderBottomColor = 'var(--border-color)';
    });

    // 更新导航样式
    document.querySelectorAll('nav, .nav').forEach(el => {
      el.style.backgroundColor = 'var(--nav-bg)';
      el.style.borderTopColor = 'var(--border-color)';
    });

    // 更新文本样式
    document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, span').forEach(el => {
      if (!el.style.color || el.style.color === 'var(--text-primary)' ||
                el.style.color === 'var(--text-secondary)' ||
                el.style.color === 'var(--text-tertiary)') {
        el.style.color = 'var(--text-primary)';
      }
    });

    // 更新输入框样式
    document.querySelectorAll('input, textarea, select').forEach(el => {
      el.style.backgroundColor = theme === 'dark' ? 'var(--bg-secondary)' : 'var(--bg-tertiary)';
      el.style.color = 'var(--text-primary)';
      el.style.borderColor = 'var(--border-color)';
    });
  }

  /**
     * 切换主题
     */
  toggleTheme() {
    const themes = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(this.currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    this.setTheme(themes[nextIndex]);
  }

  /**
     * 设置主题
     */
  setTheme(theme) {
    if (!['light', 'dark', 'auto'].includes(theme)) {
      this.logger.warn(`Theme: 无效的主题类型: ${theme}`);
      return;
    }

    this.currentTheme = theme;
    this.applyTheme();
  }

  /**
     * 获取当前主题
     */
  getTheme() {
    return this.currentTheme;
  }

  /**
     * 获取实际应用的主题
     */
  getAppliedTheme() {
    return this.currentTheme === 'auto'
      ? (this.systemTheme || 'light')
      : this.currentTheme;
  }

  /**
     * 获取主题显示名称
     */
  getThemeDisplayName() {
    const names = {
      light: '浅色模式',
      dark: '深色模式',
      auto: '跟随系统',
    };
    return names[this.currentTheme] || '浅色模式';
  }

  /**
     * 获取主题图标
     */
  getThemeIcon() {
    const icons = {
      light: 'fa-sun-o',
      dark: 'fa-moon-o',
      auto: 'fa-adjust',
    };
    return icons[this.currentTheme] || 'fa-sun-o';
  }

  /**
     * 触发主题变化事件
     */
  emitThemeChange() {
    if (window.EventBus) {
      window.EventBus.emit('theme:changed', {
        current: this.currentTheme,
        applied: this.getAppliedTheme(),
        system: this.systemTheme,
      });
    }
  }

  /**
     * 预加载主题资源
     */
  preloadThemeResources() {
    // 可以在这里预加载主题相关的图片或其他资源
    const themes = ['light', 'dark'];
    themes.forEach(theme => {
      // 示例：预加载主题图标
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = `assets/images/theme-${theme}.png`;
      link.media = 'print'; // 不立即加载
      document.head.appendChild(link);

      // 移除预加载链接
      setTimeout(() => {
        document.head.removeChild(link);
      }, 1000);
    });
  }

  /**
     * 检测主题支持
     */
  checkThemeSupport() {
    const support = {
      cssVariables: CSS && CSS.supports && CSS.supports('color', 'var(--test)'),
      matchMedia: !!window.matchMedia,
      localStorage: !!window.localStorage,
    };

    this.logger.log('🎨 主题支持检测:', support);
    return support;
  }

  /**
     * 导出主题配置
     */
  exportConfig() {
    return {
      currentTheme: this.currentTheme,
      systemTheme: this.systemTheme,
      appliedTheme: this.getAppliedTheme(),
      timestamp: Date.now(),
    };
  }

  /**
     * 导入主题配置
     */
  importConfig(config) {
    if (config && config.currentTheme) {
      this.setTheme(config.currentTheme);
    }
  }

  /**
     * 重置主题设置
     */
  reset() {
    this.currentTheme = 'light';
    this.applyTheme();
  }

  /**
     * 销毁主题模块
     */
  destroy() {
    if (this.cleanup) {
      this.cleanup();
    }
    this.isInitialized = false;
  }
}

// 导出主题实例
const ThemeInstance = new Theme();
window.Theme = ThemeInstance;

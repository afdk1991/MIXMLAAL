// MIXMLAAL 应用主入口
class MIXMLAALApp {
  constructor() {
    this.modules = new Map();
    this.isInitialized = false;
    this.startTime = performance.now();
  }

  /**
     * 应用初始化
     */
  async initialize() {
    if (this.isInitialized) { return; }

    try {
      console.log('🚀 MIXMLAAL 应用初始化中...');

      // 记录启动时间
      this.startTime = performance.now();

      // 初始化核心模块
      await this.initCoreModules();

      // 绑定全局事件
      this.bindGlobalEvents();

      // 设置平台检测
      this.setupPlatformDetection();

      // 初始化UI
      this.initializeUI();

      // 初始化完成
      this.isInitialized = true;
      console.log('🎉 MIXMLAAL 应用初始化完成！');

      // 触发初始化完成事件
      this.emit('app:initialized');

      // 性能监控报告
      const endTime = performance.now();
      console.log(`✅ MIXMLAAL 应用启动完成 (耗时: ${(endTime - this.startTime).toFixed(2)}ms)`);
    } catch (error) {
      console.error('❌ 应用初始化失败:', error);
      this.handleFatalError(error);
    }
  }

  /**
     * 初始化核心模块
     */
  async initCoreModules() {
    const coreModules = [
      { name: 'EventBus', module: EventBus },
      { name: 'Storage', module: Storage },
      { name: 'Monitor', module: Monitor },
      { name: 'Network', module: Network },
      { name: 'Theme', module: Theme },
      { name: 'Router', module: Router },
      { name: 'Preview', module: Preview },
      { name: 'Notification', module: Notification },
      { name: 'Performance', module: Performance },
      { name: 'Platform', module: Platform },
      { name: 'State', module: State },
      { name: 'Utils', module: Utils },
    ];

    for (const { name, module } of coreModules) {
      try {
        const instance = typeof module === 'function' ? new module(this) : module;
        if (instance.initialize) {
          await instance.initialize();
        }
        this.modules.set(name, instance);
        console.log(`✅ ${name} 模块初始化完成`);
      } catch (error) {
        console.error(`❌ ${name} 模块初始化失败:`, error);
        throw error;
      }
    }
  }

  /**
     * 绑定全局事件
     */
  bindGlobalEvents() {
    // 页面加载完成
    document.addEventListener('DOMContentLoaded', () => {
      this.emit('dom:loaded');
    });

    // 窗口大小变化
    window.addEventListener('resize', this.debounce(() => {
      this.emit('window:resize', {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 250));

    // 页面可见性变化
    document.addEventListener('visibilitychange', () => {
      this.emit('page:visibilityChange', {
        visible: document.visibilityState === 'visible',
      });
    });

    // 在线/离线状态
    window.addEventListener('online', () => {
      this.emit('network:online');
      this.showToast('网络已连接', 'success');
    });

    window.addEventListener('offline', () => {
      this.emit('network:offline');
      this.showToast('网络连接已断开', 'error');
    });

    // 监听未捕获的错误
    window.addEventListener('error', e => {
      this.handleGlobalError(e);
    });

    // 监听Promise错误
    window.addEventListener('unhandledrejection', e => {
      this.handleUnhandledRejection(e);
    });
  }

  /**
     * 设置平台检测
     */
  setupPlatformDetection() {
    const platformModule = this.getModule('Platform');
    if (platformModule) {
      this.platform = platformModule.getPlatformInfo();

      // 应用平台样式已在 Platform 模块中处理

      // 更新平台指示器
      const platform = this.platform.platform;
      if (platform === 'ios') {
        this.updatePlatformIndicator('iOS 设备', 'text-ios');
      } else if (platform === 'android') {
        this.updatePlatformIndicator('Android 设备', 'text-android');
      }

      this.emit('platform:detected', this.platform);
    } else {
      console.warn('平台检测模块未初始化');
    }
  }

  /**
     * 初始化UI
     */
  initializeUI() {
    // 初始化导航
    this.initializeNavigation();

    // 初始化暗黑模式
    this.initializeDarkMode();

    // 初始化通知
    this.initializeNotifications();

    // 初始化预览模式
    this.initializePreviewMode();

    // 显示欢迎消息
    this.showWelcomeMessage();

    console.log('🎨 UI 初始化完成');
  }

  /**
     * 初始化导航
     */
  initializeNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const navIndicator = document.querySelector('.nav-indicator');
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('pageTitle');

    // 页面标题映射
    const pageTitles = {
      portalPage: 'MIXMLAAL平台',
      socialPage: '社区',
      ecommercePage: '商城',
      platformPage: '开放平台',
      travelPage: '出行服务',
      profilePage: '我的',
      documentPage: '开发文档',
    };

    navItems.forEach((item, index) => {
      item.addEventListener('click', function () {
        const targetPageId = this.getAttribute('data-page');
        // 更新导航
        navItems.forEach(nav => nav.classList.remove('active', 'nav-item-active'));
        this.classList.add('active', 'nav-item-active');
        // 指示器移动
        const indicatorWidth = 100 / navItems.length;
        navIndicator.style.transform = `translateX(${index * indicatorWidth}%)`;
        // 切换页面
        pages.forEach(page => {
          page.id === targetPageId ? (page.classList.remove('hidden'), page.classList.add('active')) : (page.classList.add('hidden'), page.classList.remove('active'));
        });
        // 更新标题
        pageTitle.textContent = pageTitles[targetPageId];
      });
    });
  }

  /**
     * 初始化暗黑模式
     */
  initializeDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
      darkModeToggle.addEventListener('click', function () {
        document.documentElement.classList.toggle('dark');
        this.innerHTML = document.documentElement.classList.contains('dark') ? '<i class="fa fa-sun-o text-lg"></i>' : '<i class="fa fa-moon-o text-lg"></i>';
      });
    }
  }

  /**
     * 初始化通知
     */
  initializeNotifications() {
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationModal = document.getElementById('notificationModal');
    const closeNotificationBtn = document.getElementById('closeNotificationBtn');

    if (notificationBtn && notificationModal && closeNotificationBtn) {
      notificationBtn.addEventListener('click', () => notificationModal.classList.remove('hidden'));
      closeNotificationBtn.addEventListener('click', () => notificationModal.classList.add('hidden'));
    }
  }

  /**
     * 初始化预览模式
     */
  initializePreviewMode() {
    const previewToggle = document.getElementById('previewToggle');
    const previewContainer = document.getElementById('preview-container');
    const previewExit = document.getElementById('preview-exit');
    const previewButtons = document.querySelectorAll('[data-device]');

    if (previewToggle && previewContainer && previewExit) {
      previewToggle.addEventListener('click', () => {
        previewContainer.style.display = 'flex';
        this.updatePreviewContent();
      });

      previewExit.addEventListener('click', () => {
        previewContainer.style.display = 'none';
      });

      previewButtons.forEach(button => {
        button.addEventListener('click', () => {
          const platform = button.getAttribute('data-device');
          this.enterPreviewMode(platform);
        });
      });
    }
  }

  /**
     * 更新平台指示器
     */
  updatePlatformIndicator(text, className) {
    const indicator = document.getElementById('platformIndicator');
    const textEl = document.getElementById('platformText');

    if (indicator && textEl) {
      textEl.textContent = text;
      textEl.className = className;
      indicator.classList.remove('hidden');
    }
  }

  /**
     * 进入预览模式
     */
  enterPreviewMode(platform) {
    const previewDevice = document.getElementById('preview-device');
    if (previewDevice) {
      // 这里不需要添加特殊类，因为预览容器已经有固定样式
      this.updatePreviewContent();
    }
    console.log(`📱 进入预览模式: ${platform}`);
  }

  /**
     * 更新预览内容
     */
  updatePreviewContent() {
    const previewContent = document.getElementById('preview-content');
    const app = document.getElementById('app');
    if (previewContent && app) {
      const appContent = app.cloneNode(true);
      previewContent.innerHTML = '';
      previewContent.appendChild(appContent);
    }
  }

  /**
     * 显示欢迎消息
     */
  showWelcomeMessage() {
    this.showToast('欢迎使用 MIXMLAAL 应用！', 'success', 3000);
  }

  /**
     * 显示提示消息
     */
  showToast(message, type = 'info', duration = 2000) {
    // 移除现有的toast
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建新的toast
    const toast = document.createElement('div');
    toast.className = `toast ${this.getToastClass(type)}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // 显示动画
    setTimeout(() => {
      toast.classList.add('translate-y-0', 'opacity-100');
      toast.classList.remove('-translate-y-10', 'opacity-0');
    }, 100);

    // 自动隐藏
    setTimeout(() => {
      toast.classList.add('-translate-y-10', 'opacity-0');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  }

  /**
     * 获取提示消息的样式类
     */
  getToastClass(type) {
    switch (type) {
      case 'success':
        return 'bg-green-500 text-white';
      case 'error':
        return 'bg-red-500 text-white';
      case 'warning':
        return 'bg-yellow-500 text-white';
      case 'info':
      default:
        return 'bg-blue-500 text-white';
    }
  }

  /**
     * 防抖函数
     */
  debounce(func, wait, options = {}) {
    const utils = this.getModule('Utils');
    if (utils) {
      return utils.debounce(func, wait, options);
    } else {
      // 降级实现
      let timeout;
      return function () {
        const context = this;
        const args = arguments;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
      };
    }
  }

  /**
     * 处理全局错误
     */
  handleGlobalError(e) {
    console.error('🚨 全局错误:', e.error);

    // 记录错误
    this.logError(e.error, 'global');

    // 显示错误提示
    this.showToast('发生了一个错误，请稍后重试', 'error');
  }

  /**
     * 处理未处理的Promise错误
     */
  handleUnhandledRejection(e) {
    console.error('🚨 未处理的Promise错误:', e.reason);

    // 记录错误
    this.logError(e.reason, 'promise');

    // 显示错误提示
    this.showToast('操作失败，请稍后重试', 'error');
  }

  /**
     * 处理致命错误
     */
  handleFatalError(error) {
    // 显示错误页面或通知
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    console.error('致命错误:', errorInfo);

    // 尝试保存错误日志
    const storage = this.getModule('Storage');
    if (storage) {
      storage.set('lastFatalError', errorInfo);
    }

    // 显示错误提示
    this.showErrorNotification('应用启动失败，请刷新页面重试');
  }

  /**
     * 显示错误通知
     */
  showErrorNotification(message) {
    const notification = this.getModule('Notification');
    if (notification) {
      notification.show({
        title: '错误',
        message: message,
        type: 'error',
        duration: 5000,
      });
    } else {
      this.showToast(message, 'error', 5000);
    }
  }

  /**
     * 记录错误
     */
  logError(error, source) {
    console.error(`📝 错误日志 [${source}]:`, error);
    // 这里可以实现错误上报逻辑
  }

  /**
     * 获取模块实例
     */
  getModule(name) {
    return this.modules.get(name);
  }

  /**
     * 注册事件监听器
     */
  on(event, callback) {
    const eventBus = this.getModule('EventBus');
    if (eventBus) {
      eventBus.on(event, callback);
    }
  }

  /**
     * 触发事件
     */
  emit(event, ...args) {
    const eventBus = this.getModule('EventBus');
    if (eventBus) {
      eventBus.emit(event, ...args);
    }
  }

  /**
     * 移除事件监听器
     */
  off(event, callback) {
    const eventBus = this.getModule('EventBus');
    if (eventBus) {
      eventBus.off(event, callback);
    }
  }

  /**
     * 获取应用版本信息
     */
  getVersion() {
    return {
      appName: 'MIXMLAAL',
      version: '1.0.0.0',
      buildDate: '2026-03-26',
      environment: 'production',
    };
  }

  /**
     * 销毁应用
     */
  destroy() {
    console.log('💥 销毁应用');

    // 移除所有事件监听
    window.removeEventListener('load', this.handleLoad);
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('networkChange', this.handleNetworkChange);
    window.removeEventListener('platformChange', this.handlePlatformChange);
    window.removeEventListener('error', this.handleGlobalError);
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);

    // 清空模块
    this.modules.clear();
    this.isInitialized = false;
  }
}

// 全局应用实例
window.MIXMLAAL = new MIXMLAALApp();

// 自动初始化应用
document.addEventListener('DOMContentLoaded', () => {
  window.MIXMLAAL.initialize();
});

// 性能监控
window.performanceMonitor = {
  startTime: performance.now(),

  mark: function (name) {
    performance.mark(name);
  },

  measure: function (name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    const measures = performance.getEntriesByName(name);
    if (measures.length > 0) {
      console.log(`${name}: ${measures[0].duration.toFixed(2)}ms`);
    }
  },

  report: function () {
    const endTime = performance.now();
    console.log(`页面加载总时间: ${(endTime - this.startTime).toFixed(2)}ms`);
  },
};

// 智能预加载
window.smartPreload = {
  preloadImages: function () {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => {
      const src = img.getAttribute('data-src');
      if (src) {
        const preloadImg = new Image();
        preloadImg.src = src;
        preloadImg.onload = function () {
          img.src = src;
          img.removeAttribute('data-src');
        };
      }
    });
  },

  preloadModules: function () {
    // 预加载常用模块
    const modules = ['socialPage', 'ecommercePage', 'travelPage'];
    modules.forEach(module => {
      const page = document.getElementById(module);
      if (page) {
        // 触发浏览器预加载
        page.style.display = 'none';
      }
    });
  },
};

// 图片懒加载
function initLazyLoading() {
  const lazyImages = document.querySelectorAll('img[data-src]');

  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const image = entry.target;
          image.src = image.dataset.src;
          image.removeAttribute('data-src');
          imageObserver.unobserve(image);
        }
      });
    });

    lazyImages.forEach(image => imageObserver.observe(image));
  } else {
    // 降级方案
    lazyImages.forEach(img => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
    });
  }
}

// 骨架屏
window.skeletonLoader = {
  show: function (container) {
    const skeleton = document.createElement('div');
    skeleton.className = 'skeleton-loader';
    skeleton.innerHTML = `
            <div class="animate-pulse space-y-4">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                <div class="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
        `;
    container.appendChild(skeleton);
    return skeleton;
  },

  hide: function (skeleton) {
    if (skeleton) {
      skeleton.remove();
    }
  },
};

// 初始化性能监控
window.performanceMonitor.mark('appStart');

// 初始化智能预加载
document.addEventListener('DOMContentLoaded', () => {
  window.smartPreload.preloadImages();
  window.smartPreload.preloadModules();

  // 初始化图片懒加载
  initLazyLoading();

  // 性能监控报告
  window.performanceMonitor.mark('appReady');
  window.performanceMonitor.measure('appInitialization', 'appStart', 'appReady');
  window.performanceMonitor.report();
});

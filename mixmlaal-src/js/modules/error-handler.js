// 错误处理模块
import { EventBus } from './event-bus.js';

export const ErrorHandler = {
  init() {
    this.setupGlobalErrorHandler();
    this.setupUnhandledRejectionHandler();
    console.log('✅ ErrorHandler 模块初始化完成');
  },

  setupGlobalErrorHandler() {
    window.addEventListener('error', error => {
      this.handleError(error.error || error, 'global');
    });
  },

  setupUnhandledRejectionHandler() {
    window.addEventListener('unhandledrejection', event => {
      this.handleError(event.reason, 'unhandledrejection');
    });
  },

  handleError(error, source = 'unknown') {
    try {
      const errorInfo = {
        message: error.message || '未知错误',
        stack: error.stack || '',
        source: source,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      console.error(`❌ 错误发生 (${source}):`, errorInfo);

      // 发送错误事件
      EventBus.emit('error:occurred', errorInfo);

      // 可以在这里添加错误上报逻辑
      this.reportError(errorInfo);
    } catch (err) {
      console.error('❌ 错误处理失败:', err);
    }
  },

  reportError(errorInfo) {
    // 这里可以实现错误上报到服务器的逻辑
    // 例如使用 fetch 或 axios 发送错误信息
    console.log('📡 上报错误:', errorInfo);
  },

  showError(message) {
    // 显示错误提示
    const toast = document.createElement('div');
    toast.className = 'toast toast-error show';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  },
};

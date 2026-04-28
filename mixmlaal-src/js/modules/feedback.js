// 全局交互反馈模块
export const Feedback = {
  // 显示Toast提示
  showToast(message, type = 'info', duration = 2000) {
    // 创建Toast元素
    const toast = document.createElement('div');
    toast.className = `toast ${type} show`;
    toast.textContent = message;

    // 添加到页面
    document.body.appendChild(toast);

    // 自动移除
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, duration);

    return toast;
  },

  // 显示成功Toast
  showSuccess(message, duration) {
    return this.showToast(message, 'success', duration);
  },

  // 显示错误Toast
  showError(message, duration) {
    return this.showToast(message, 'error', duration);
  },

  // 显示警告Toast
  showWarning(message, duration) {
    return this.showToast(message, 'warning', duration);
  },

  // 显示信息Toast
  showInfo(message, duration) {
    return this.showToast(message, 'info', duration);
  },

  // 显示加载指示器
  showLoading(text = '加载中...') {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (loadingOverlay && loadingText) {
      loadingText.textContent = text;
      loadingOverlay.classList.remove('hidden');
    }
  },

  // 隐藏加载指示器
  hideLoading() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) {
      loadingOverlay.classList.add('hidden');
    }
  },

  // 添加涟漪效果到元素
  addRippleEffect(element) {
    if (!element.classList.contains('ripple')) {
      element.classList.add('ripple');
    }
  },

  // 批量添加涟漪效果
  addRippleEffects(selector) {
    document.querySelectorAll(selector).forEach(element => {
      this.addRippleEffect(element);
    });
  },

  // 初始化全局交互反馈
  init() {
    console.log('Feedback module initialized');

    // 为所有按钮添加涟漪效果
    this.addRippleEffects('button, .btn, .card, .nav-item');
  },
};

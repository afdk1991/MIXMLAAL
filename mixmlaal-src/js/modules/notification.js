// 通知模块
export const Notification = {
  init() {
    console.log('Notification module initialized');
  },
  show(options) {
    const { title, message, type = 'info', duration = 3000 } = options;

    // 移除现有的通知
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
      existingToast.remove();
    }

    // 创建新的通知
    const toast = document.createElement('div');
    toast.className = `toast fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-0 opacity-100 ${this.getTypeClass(type)}`;
    toast.innerHTML = `
            <div class="flex items-center">
                <div class="mr-3">
                    <i class="fa ${this.getIcon(type)}"></i>
                </div>
                <div>
                    <h4 class="font-medium">${title}</h4>
                    <p class="text-sm">${message}</p>
                </div>
            </div>
        `;

    document.body.appendChild(toast);

    // 自动隐藏
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-y-[-20px]');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    }, duration);
  },

  getTypeClass(type) {
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
  },

  getIcon(type) {
    switch (type) {
      case 'success':
        return 'fa-check-circle';
      case 'error':
        return 'fa-exclamation-circle';
      case 'warning':
        return 'fa-exclamation-triangle';
      case 'info':
      default:
        return 'fa-info-circle';
    }
  },
};

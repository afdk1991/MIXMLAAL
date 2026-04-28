/**
 * 通知模块
 * 提供统一的通知系统
 */
class Notification {
  constructor() {
    this.logger = console;
    this.container = null;
    this.notifications = new Map();
    this.maxNotifications = 5;
    this.autoCloseTimeout = 5000;
  }

  /**
     * 初始化通知模块
     */
  initialize() {
    this.logger.log('🔔 Notification 模块初始化');
    this.createContainer();
    return Promise.resolve();
  }

  /**
     * 创建通知容器
     */
  createContainer() {
    this.container = document.createElement('div');
    this.container.id = 'notification-container';
    this.container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none max-w-xs';
    document.body.appendChild(this.container);
  }

  /**
     * 显示通知
     */
  show(options = {}) {
    const {
      title = '通知',
      message = '',
      type = 'info',
      duration = this.autoCloseTimeout,
      showCloseButton = true,
      onClick = null,
      onClose = null,
    } = options;

    const id = this.generateId();
    const notification = this.createNotification({
      id,
      title,
      message,
      type,
      showCloseButton,
      onClick,
      onClose,
      duration,
    });

    // 添加到容器
    this.container.appendChild(notification.element);

    // 保存通知引用
    this.notifications.set(id, notification);

    // 限制通知数量
    this.limitNotifications();

    // 触发显示动画
    setTimeout(() => {
      notification.element.classList.add('show');
    }, 10);

    // 设置自动关闭
    if (duration > 0) {
      notification.timeout = setTimeout(() => {
        this.hide(id);
      }, duration);
    }

    // 触发事件
    this.emitNotificationEvent('show', { id, type, title, message });

    return id;
  }

  /**
     * 创建通知元素
     */
  createNotification({ id, title, message, type, showCloseButton, onClick, onClose, duration }) {
    const element = document.createElement('div');
    element.id = `notification-${id}`;
    element.className = `notification bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 transform translate-x-full opacity-0 transition-all duration-300 ease-out pointer-events-auto max-w-xs`;

    // 设置类型样式
    this.setNotificationType(element, type);

    // 构建内容
    element.innerHTML = `
            <div class="flex items-start gap-3">
                <div class="notification-icon mt-0.5">
                    ${this.getIcon(type)}
                </div>
                <div class="flex-1 min-w-0">
                    <h4 class="font-semibold text-sm text-gray-900 dark:text-white mb-1">${this.escapeHtml(title)}</h4>
                    <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">${this.escapeHtml(message)}</p>
                </div>
                ${showCloseButton ? '<button class="notification-close text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-sm" aria-label="关闭">×</button>' : ''}
            </div>
        `;

    // 绑定事件
    if (onClick) {
      element.addEventListener('click', e => {
        if (!e.target.closest('.notification-close')) {
          onClick({ id, element, type });
        }
      });
    }

    // 关闭按钮事件
    const closeButton = element.querySelector('.notification-close');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        this.hide(id);
      });
    }

    // 鼠标悬停时暂停自动关闭
    element.addEventListener('mouseenter', () => {
      if (notification.timeout) {
        clearTimeout(notification.timeout);
      }
    });

    // 鼠标离开时恢复自动关闭
    element.addEventListener('mouseleave', () => {
      if (duration > 0) {
        notification.timeout = setTimeout(() => {
          this.hide(id);
        }, duration);
      }
    });

    const notification = {
      id,
      element,
      type,
      title,
      message,
      timeout: null,
      onClose,
    };

    return notification;
  }

  /**
     * 设置通知类型样式
     */
  setNotificationType(element, type) {
    const colors = {
      success: 'border-green-500 bg-green-50 dark:bg-green-900/20',
      error: 'border-red-500 bg-red-50 dark:bg-red-900/20',
      warning: 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20',
      info: 'border-blue-500 bg-blue-50 dark:bg-blue-900/20',
    };

    element.classList.add(...(colors[type] || colors.info).split(' '));
  }

  /**
     * 获取通知图标
     */
  getIcon(type) {
    const icons = {
      success: '<i class="fa fa-check-circle text-green-500"></i>',
      error: '<i class="fa fa-exclamation-circle text-red-500"></i>',
      warning: '<i class="fa fa-exclamation-triangle text-yellow-500"></i>',
      info: '<i class="fa fa-info-circle text-blue-500"></i>',
    };

    return icons[type] || icons.info;
  }

  /**
     * 隐藏通知
     */
  hide(id) {
    const notification = this.notifications.get(id);
    if (!notification) { return; }

    // 清除超时
    if (notification.timeout) {
      clearTimeout(notification.timeout);
    }

    // 添加隐藏动画
    notification.element.classList.remove('show');
    notification.element.classList.add('hide');

    // 移除元素
    setTimeout(() => {
      if (notification.element.parentNode) {
        notification.element.parentNode.removeChild(notification.element);
      }

      // 调用关闭回调
      if (notification.onClose) {
        notification.onClose({ id, type: notification.type });
      }

      // 移除引用
      this.notifications.delete(id);

      // 触发事件
      this.emitNotificationEvent('hide', {
        id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
      });
    }, 300);
  }

  /**
     * 隐藏所有通知
     */
  hideAll() {
    const ids = Array.from(this.notifications.keys());
    ids.forEach(id => this.hide(id));
  }

  /**
     * 限制通知数量
     */
  limitNotifications() {
    const notifications = Array.from(this.notifications.values());
    if (notifications.length > this.maxNotifications) {
      const excess = notifications.length - this.maxNotifications;
      for (let i = 0; i < excess; i++) {
        this.hide(notifications[i].id);
      }
    }
  }

  /**
     * 生成通知ID
     */
  generateId() {
    return `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
     * HTML转义
     */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
     * 触发通知事件
     */
  emitNotificationEvent(event, data) {
    if (window.EventBus) {
      window.EventBus.emit(`notification:${event}`, {
        ...data,
        timestamp: Date.now(),
      });
    }
  }

  // 快捷方法
  success(message, options = {}) {
    return this.show({
      type: 'success',
      message,
      ...options,
    });
  }

  error(message, options = {}) {
    return this.show({
      type: 'error',
      message,
      ...options,
    });
  }

  warning(message, options = {}) {
    return this.show({
      type: 'warning',
      message,
      ...options,
    });
  }

  info(message, options = {}) {
    return this.show({
      type: 'info',
      message,
      ...options,
    });
  }

  // 特殊通知类型
  toast(message, duration = 2000) {
    return this.show({
      title: '',
      message,
      type: 'info',
      duration,
      showCloseButton: false,
    });
  }

  confirm(title, message, onConfirm, onCancel) {
    const id = this.show({
      title,
      message,
      type: 'warning',
      duration: 0,
      showCloseButton: false,
      onClick: () => {
        this.hide(id);
        if (onConfirm) { onConfirm(); }
      },
    });

    // 添加取消按钮
    const notification = this.notifications.get(id);
    if (notification) {
      const actions = document.createElement('div');
      actions.className = 'mt-3 flex gap-2 justify-end';
      actions.innerHTML = `
                <button class="px-3 py-1 bg-gray-200 text-gray-800 rounded text-xs" data-action="cancel">取消</button>
                <button class="px-3 py-1 bg-red-500 text-white rounded text-xs" data-action="confirm">确定</button>
            `;

      notification.element.appendChild(actions);

      // 绑定按钮事件
      actions.querySelector('[data-action="cancel"]').addEventListener('click', e => {
        e.stopPropagation();
        this.hide(id);
        if (onCancel) { onCancel(); }
      });

      actions.querySelector('[data-action="confirm"]').addEventListener('click', e => {
        e.stopPropagation();
        this.hide(id);
        if (onConfirm) { onConfirm(); }
      });
    }

    return id;
  }

  // 获取通知数量
  getCount() {
    return this.notifications.size;
  }

  // 获取所有通知
  getAllNotifications() {
    return Array.from(this.notifications.values()).map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
    }));
  }
}

// 导出通知实例
const NotificationInstance = new Notification();
window.Notification = NotificationInstance;

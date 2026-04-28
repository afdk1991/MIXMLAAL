/**
 * 事件总线模块
 * 提供模块间通信机制
 */
class EventBus {
  constructor() {
    this.events = new Map();
    this.logger = console;
  }

  /**
     * 初始化事件总线
     */
  initialize() {
    this.logger.log('🚌 EventBus 模块初始化');
    return Promise.resolve();
  }

  /**
     * 注册事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
  on(event, callback) {
    if (typeof event !== 'string' || typeof callback !== 'function') {
      this.logger.warn('EventBus: 无效的事件参数');
      return;
    }

    if (!this.events.has(event)) {
      this.events.set(event, []);
    }

    const callbacks = this.events.get(event);
    if (!callbacks.includes(callback)) {
      callbacks.push(callback);
    }
  }

  /**
     * 注册一次性事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
  once(event, callback) {
    const onceCallback = (...args) => {
      callback(...args);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
     * 触发事件
     * @param {string} event - 事件名称
     * @param {...*} args - 事件参数
     */
  emit(event, ...args) {
    if (typeof event !== 'string') {
      this.logger.warn('EventBus: 无效的事件名称');
      return;
    }

    const callbacks = this.events.get(event);
    if (!callbacks) {
      return;
    }

    // 复制回调数组，避免在执行过程中修改数组导致的问题
    const callbacksCopy = [...callbacks];

    callbacksCopy.forEach(callback => {
      try {
        callback(...args);
      } catch (error) {
        this.logger.error(`EventBus: 执行事件 ${event} 的回调时出错:`, error);
      }
    });
  }

  /**
     * 移除事件监听器
     * @param {string} event - 事件名称
     * @param {Function} callback - 回调函数
     */
  off(event, callback) {
    if (typeof event !== 'string') {
      this.logger.warn('EventBus: 无效的事件名称');
      return;
    }

    const callbacks = this.events.get(event);
    if (!callbacks) {
      return;
    }

    if (callback) {
      // 移除特定回调
      const index = callbacks.indexOf(callback);
      if (index !== -1) {
        callbacks.splice(index, 1);
      }
    } else {
      // 移除所有回调
      this.events.delete(event);
    }
  }

  /**
     * 移除所有事件监听器
     */
  clear() {
    this.events.clear();
  }

  /**
     * 获取事件监听器数量
     * @param {string} event - 事件名称
     * @returns {number} 监听器数量
     */
  getListenerCount(event) {
    const callbacks = this.events.get(event);
    return callbacks ? callbacks.length : 0;
  }

  /**
     * 获取所有注册的事件名称
     * @returns {string[]} 事件名称数组
     */
  getEvents() {
    return Array.from(this.events.keys());
  }

  /**
     * 检查事件是否有监听器
     * @param {string} event - 事件名称
     * @returns {boolean} 是否有监听器
     */
  hasListeners(event) {
    return this.getListenerCount(event) > 0;
  }
}

// 导出事件总线实例
const EventBusInstance = new EventBus();
window.EventBus = EventBusInstance;

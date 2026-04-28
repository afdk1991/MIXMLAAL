/**
 * 本地存储工具
 * 版本: v1.0.0.0
 * 说明: 封装本地存储操作，添加缓存层，避免频繁读写本地存储
 */

// 内存缓存
const memoryCache = new Map();

// 存储配置
const storageConfig = {
  prefix: 'mixmlaal_', // 存储键前缀
  maxSize: 100, // 内存缓存最大条目数
  expiration: 24 * 60 * 60 * 1000, // 默认过期时间（24小时）
  debounceTime: 300 // 防抖时间（毫秒）
};

// 防抖函数
function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

// 获取存储键
function getStorageKey(key) {
  return storageConfig.prefix + key;
}

// 检查存储项是否过期
function isExpired(item) {
  if (!item || !item.expire) return false;
  return Date.now() > item.expire;
}

// 清理过期存储
function clearExpiredStorage() {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(storageConfig.prefix)) {
        const item = JSON.parse(localStorage.getItem(key));
        if (isExpired(item)) {
          localStorage.removeItem(key);
          memoryCache.delete(key.replace(storageConfig.prefix, ''));
        }
      }
    });
  } catch (error) {
    console.error('清理过期存储失败:', error);
  }
}

// 清理内存缓存（当达到最大容量时）
function cleanMemoryCache() {
  if (memoryCache.size > storageConfig.maxSize) {
    // 清除最早的条目
    const keys = Array.from(memoryCache.keys());
    for (let i = 0; i < keys.length / 2; i++) {
      memoryCache.delete(keys[i]);
    }
  }
}

// 存储数据
const setItem = debounce((key, value, expire = storageConfig.expiration) => {
  try {
    // 构建存储对象
    const storageItem = {
      value,
      expire: expire ? Date.now() + expire : null
    };
    
    // 写入内存缓存
    memoryCache.set(key, storageItem);
    
    // 写入本地存储
    localStorage.setItem(getStorageKey(key), JSON.stringify(storageItem));
    
    // 清理内存缓存
    cleanMemoryCache();
  } catch (error) {
    console.error('存储数据失败:', error);
  }
}, storageConfig.debounceTime);

// 获取数据
function getItem(key, defaultValue = null) {
  try {
    // 先从内存缓存获取
    let item = memoryCache.get(key);
    
    // 如果内存缓存中没有，从本地存储获取
    if (!item) {
      const storageKey = getStorageKey(key);
      const storageValue = localStorage.getItem(storageKey);
      if (storageValue) {
        item = JSON.parse(storageValue);
        memoryCache.set(key, item);
      }
    }
    
    // 检查是否过期
    if (item && !isExpired(item)) {
      return item.value;
    } else {
      // 过期或不存在，清除缓存
      removeItem(key);
      return defaultValue;
    }
  } catch (error) {
    console.error('获取数据失败:', error);
    return defaultValue;
  }
}

// 移除数据
function removeItem(key) {
  try {
    // 从内存缓存移除
    memoryCache.delete(key);
    
    // 从本地存储移除
    localStorage.removeItem(getStorageKey(key));
  } catch (error) {
    console.error('移除数据失败:', error);
  }
}

// 清空所有数据
function clear() {
  try {
    // 清空内存缓存
    memoryCache.clear();
    
    // 清空本地存储中带有前缀的项
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(storageConfig.prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空数据失败:', error);
  }
}

// 内存管理工具
const memoryManager = {
  // 存储定时器和事件监听器
  timers: new Map(),
  eventListeners: new Map(),
  
  // 添加定时器
  addTimer(id, timer) {
    this.timers.set(id, timer);
  },
  
  // 清除定时器
  clearTimer(id) {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      clearInterval(timer);
      this.timers.delete(id);
    }
  },
  
  // 清除所有定时器
  clearAllTimers() {
    this.timers.forEach((timer) => {
      clearTimeout(timer);
      clearInterval(timer);
    });
    this.timers.clear();
  },
  
  // 添加事件监听器
  addEventListener(element, event, handler) {
    if (!this.eventListeners.has(element)) {
      this.eventListeners.set(element, []);
    }
    this.eventListeners.get(element).push({ event, handler });
    element.addEventListener(event, handler);
  },
  
  // 移除事件监听器
  removeEventListener(element, event, handler) {
    const listeners = this.eventListeners.get(element);
    if (listeners) {
      const index = listeners.findIndex(item => item.event === event && item.handler === handler);
      if (index > -1) {
        listeners.splice(index, 1);
        element.removeEventListener(event, handler);
      }
    }
  },
  
  // 移除元素的所有事件监听器
  removeAllEventListeners(element) {
    const listeners = this.eventListeners.get(element);
    if (listeners) {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
      this.eventListeners.delete(element);
    }
  },
  
  // 清除所有资源
  clearAll() {
    this.clearAllTimers();
    this.eventListeners.forEach((listeners, element) => {
      listeners.forEach(({ event, handler }) => {
        element.removeEventListener(event, handler);
      });
    });
    this.eventListeners.clear();
  }
};

// 导出存储工具
export const storage = {
  setItem,
  getItem,
  removeItem,
  clear,
  clearExpired: clearExpiredStorage
};

// 导出内存管理工具
export const memory = memoryManager;

export default {
  storage,
  memory
};

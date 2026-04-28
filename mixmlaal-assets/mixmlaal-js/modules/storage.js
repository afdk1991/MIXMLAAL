/**
 * 本地存储模块
 * 提供安全、可靠的本地数据存储
 */
class Storage {
  constructor() {
    this.prefix = 'mixmlaal_';
    this.logger = console;
    this.isAvailable = this.checkAvailability();
  }

  /**
     * 初始化存储模块
     */
  initialize() {
    this.logger.log('💾 Storage 模块初始化');
    if (!this.isAvailable) {
      this.logger.warn('Storage: localStorage 不可用，使用内存存储作为备选');
    }
    return Promise.resolve();
  }

  /**
     * 检查存储可用性
     */
  checkAvailability() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
     * 设置存储项
     * @param {string} key - 存储键名
     * @param {*} value - 存储值
     * @returns {boolean} 是否成功
     */
  set(key, value) {
    if (typeof key !== 'string') {
      this.logger.warn('Storage: 无效的键名');
      return false;
    }

    try {
      const serializedValue = JSON.stringify({
        value: value,
        timestamp: Date.now(),
        type: typeof value,
      });

      if (this.isAvailable) {
        localStorage.setItem(this.prefix + key, serializedValue);
      } else {
        // 使用内存存储作为备选
        this.memoryStorage = this.memoryStorage || {};
        this.memoryStorage[this.prefix + key] = serializedValue;
      }

      return true;
    } catch (error) {
      this.logger.error('Storage: 设置存储项失败:', error);
      return false;
    }
  }

  /**
     * 获取存储项
     * @param {string} key - 存储键名
     * @param {*} defaultValue - 默认值
     * @returns {*} 存储值或默认值
     */
  get(key, defaultValue = null) {
    if (typeof key !== 'string') {
      this.logger.warn('Storage: 无效的键名');
      return defaultValue;
    }

    try {
      let serializedValue;

      if (this.isAvailable) {
        serializedValue = localStorage.getItem(this.prefix + key);
      } else {
        // 从内存存储获取
        this.memoryStorage = this.memoryStorage || {};
        serializedValue = this.memoryStorage[this.prefix + key];
      }

      if (!serializedValue) {
        return defaultValue;
      }

      const parsed = JSON.parse(serializedValue);

      // 检查数据是否过期
      if (parsed.expireTime && Date.now() > parsed.expireTime) {
        this.remove(key);
        return defaultValue;
      }

      return parsed.value !== undefined ? parsed.value : defaultValue;
    } catch (error) {
      this.logger.error('Storage: 获取存储项失败:', error);
      return defaultValue;
    }
  }

  /**
     * 设置带过期时间的存储项
     * @param {string} key - 存储键名
     * @param {*} value - 存储值
     * @param {number} ttl - 过期时间（毫秒）
     * @returns {boolean} 是否成功
     */
  setWithExpiry(key, value, ttl) {
    const item = {
      value: value,
      timestamp: Date.now(),
      expireTime: Date.now() + ttl,
      type: typeof value,
    };

    return this.set(key, item);
  }

  /**
     * 移除存储项
     * @param {string} key - 存储键名
     * @returns {boolean} 是否成功
     */
  remove(key) {
    if (typeof key !== 'string') {
      this.logger.warn('Storage: 无效的键名');
      return false;
    }

    try {
      if (this.isAvailable) {
        localStorage.removeItem(this.prefix + key);
      } else {
        // 从内存存储移除
        this.memoryStorage = this.memoryStorage || {};
        delete this.memoryStorage[this.prefix + key];
      }

      return true;
    } catch (error) {
      this.logger.error('Storage: 移除存储项失败:', error);
      return false;
    }
  }

  /**
     * 清除所有存储项
     * @returns {boolean} 是否成功
     */
  clear() {
    try {
      if (this.isAvailable) {
        // 只清除当前应用的存储项
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      } else {
        // 清除内存存储
        this.memoryStorage = {};
      }

      return true;
    } catch (error) {
      this.logger.error('Storage: 清除存储项失败:', error);
      return false;
    }
  }

  /**
     * 获取所有存储键名
     * @returns {string[]} 键名数组
     */
  getKeys() {
    try {
      const keys = [];

      if (this.isAvailable) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        });
      } else {
        // 从内存存储获取
        this.memoryStorage = this.memoryStorage || {};
        Object.keys(this.memoryStorage).forEach(key => {
          if (key.startsWith(this.prefix)) {
            keys.push(key.substring(this.prefix.length));
          }
        });
      }

      return keys;
    } catch (error) {
      this.logger.error('Storage: 获取键名失败:', error);
      return [];
    }
  }

  /**
     * 获取存储大小（近似值）
     * @returns {number} 存储大小（字节）
     */
  getSize() {
    try {
      let size = 0;

      if (this.isAvailable) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(this.prefix)) {
            size += localStorage.getItem(key).length;
          }
        });
      }

      return size;
    } catch (error) {
      this.logger.error('Storage: 获取存储大小失败:', error);
      return 0;
    }
  }

  /**
     * 检查键名是否存在
     * @param {string} key - 存储键名
     * @returns {boolean} 是否存在
     */
  has(key) {
    return this.get(key) !== null;
  }

  /**
     * 批量设置存储项
     * @param {Object} items - 键值对对象
     * @returns {boolean} 是否全部成功
     */
  setMultiple(items) {
    if (!items || typeof items !== 'object') {
      this.logger.warn('Storage: 无效的批量数据');
      return false;
    }

    let allSuccess = true;

    Object.entries(items).forEach(([key, value]) => {
      if (!this.set(key, value)) {
        allSuccess = false;
      }
    });

    return allSuccess;
  }

  /**
     * 批量获取存储项
     * @param {string[]} keys - 键名数组
     * @returns {Object} 键值对对象
     */
  getMultiple(keys) {
    if (!Array.isArray(keys)) {
      this.logger.warn('Storage: 无效的键名数组');
      return {};
    }

    const result = {};

    keys.forEach(key => {
      result[key] = this.get(key);
    });

    return result;
  }

  /**
     * 批量移除存储项
     * @param {string[]} keys - 键名数组
     * @returns {boolean} 是否全部成功
     */
  removeMultiple(keys) {
    if (!Array.isArray(keys)) {
      this.logger.warn('Storage: 无效的键名数组');
      return false;
    }

    let allSuccess = true;

    keys.forEach(key => {
      if (!this.remove(key)) {
        allSuccess = false;
      }
    });

    return allSuccess;
  }
}

// 导出存储实例
const StorageInstance = new Storage();
window.Storage = StorageInstance;

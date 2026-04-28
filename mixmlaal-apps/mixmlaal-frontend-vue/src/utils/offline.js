/**
 * Web端离线模式服务
 * 版本: 0.0.0.4
 * 说明: 实现Web端离线模式支持，包括Service Worker、缓存管理和离线数据同步
 */

class OfflineService {
  constructor() {
    this.cacheName = 'mixmlaal-offline-v0.0.0.4';
    this.offlineData = new Map();
    this.syncQueue = [];
    this.isOnline = navigator.onLine;
    this.listeners = new Set();

    this.init();
  }

  /**
   * 初始化离线服务
   */
  init() {
    this.setupNetworkListeners();
    this.registerServiceWorker();
    this.loadOfflineData();
  }

  /**
   * 设置网络监听
   */
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners('online');
      this.syncPendingData();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners('offline');
    });
  }

  /**
   * 注册Service Worker
   */
  async registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/'
        });
        console.log('Service Worker注册成功:', registration.scope);

        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              console.log('有新版本可用');
              this.notifyListeners('update');
            }
          });
        });
      } catch (error) {
        console.error('Service Worker注册失败:', error);
      }
    }
  }

  /**
   * 加载离线数据
   */
  loadOfflineData() {
    try {
      const data = localStorage.getItem('mixmlaal_offline_data');
      if (data) {
        this.offlineData = new Map(JSON.parse(data));
      }

      const syncQueue = localStorage.getItem('mixmlaal_sync_queue');
      if (syncQueue) {
        this.syncQueue = JSON.parse(syncQueue);
      }
    } catch (error) {
      console.error('加载离线数据失败:', error);
    }
  }

  /**
   * 保存离线数据
   */
  saveOfflineData() {
    try {
      localStorage.setItem('mixmlaal_offline_data', JSON.stringify([...this.offlineData]));
      localStorage.setItem('mixmlaal_sync_queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('保存离线数据失败:', error);
    }
  }

  /**
   * 缓存API响应
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 过期时间（毫秒）
   */
  cacheResponse(key, data, ttl = 3600000) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    this.offlineData.set(key, cacheEntry);
    this.saveOfflineData();
  }

  /**
   * 获取缓存的响应
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据或null
   */
  getCachedResponse(key) {
    const entry = this.offlineData.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > entry.ttl) {
      this.offlineData.delete(key);
      this.saveOfflineData();
      return null;
    }

    return entry.data;
  }

  /**
   * 添加到同步队列
   * @param {Object} item - 同步项
   */
  addToSyncQueue(item) {
    this.syncQueue.push({
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString(),
      retries: 0
    });
    this.saveOfflineData();
  }

  /**
   * 同步待处理的数据
   */
  async syncPendingData() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const failedItems = [];

    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
      } catch (error) {
        item.retries++;
        if (item.retries < 3) {
          failedItems.push(item);
        } else {
          console.error('同步失败，已放弃:', item);
        }
      }
    }

    this.syncQueue = failedItems;
    this.saveOfflineData();
  }

  /**
   * 同步单个数据项
   * @param {Object} item - 数据项
   */
  async syncItem(item) {
    const response = await fetch(item.url, {
      method: item.method || 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(item.data)
    });

    if (!response.ok) {
      throw new Error(`同步失败: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * 缓存静态资源
   * @param {Array<string>} urls - 资源URL数组
   */
  async cacheStaticResources(urls) {
    if (!('caches' in window)) return;

    const cache = await caches.open(this.cacheName);
    const options = {
      method: 'GET',
      mode: 'same-origin'
    };

    for (const url of urls) {
      try {
        await cache.add(new Request(url, options));
      } catch (error) {
        console.error('缓存资源失败:', url, error);
      }
    }
  }

  /**
   * 获取离线资源
   * @param {string} url - 资源URL
   * @returns {Response|null} 缓存的响应或null
   */
  async getOfflineResource(url) {
    if (!('caches' in window)) return null;

    const cache = await caches.open(this.cacheName);
    const response = await cache.match(url);
    return response;
  }

  /**
   * 清除过期缓存
   */
  async clearExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.offlineData.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.offlineData.delete(key);
      }
    }
    this.saveOfflineData();
  }

  /**
   * 清除所有缓存
   */
  async clearAllCache() {
    this.offlineData.clear();
    this.syncQueue = [];
    this.saveOfflineData();

    if ('caches' in window) {
      await caches.delete(this.cacheName);
    }
  }

  /**
   * 添加状态监听器
   * @param {Function} callback - 回调函数
   */
  addListener(callback) {
    this.listeners.add(callback);
  }

  /**
   * 移除状态监听器
   * @param {Function} callback - 回调函数
   */
  removeListener(callback) {
    this.listeners.delete(callback);
  }

  /**
   * 通知所有监听器
   * @param {string} status - 状态
   */
  notifyListeners(status) {
    this.listeners.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('通知监听器失败:', error);
      }
    });
  }

  /**
   * 检查是否在线
   * @returns {boolean} 是否在线
   */
  checkOnline() {
    return this.isOnline;
  }

  /**
   * 获取同步队列状态
   * @returns {Object} 同步队列状态
   */
  getSyncStatus() {
    return {
      pending: this.syncQueue.length,
      isOnline: this.isOnline
    };
  }

  /**
   * 离线数据存储
   * @param {string} key - 键
   * @param {any} value - 值
   */
  setItem(key, value) {
    this.offlineData.set(key, {
      data: value,
      timestamp: Date.now(),
      ttl: Infinity
    });
    this.saveOfflineData();
  }

  /**
   * 获取离线数据
   * @param {string} key - 键
   * @returns {any} 值
   */
  getItem(key) {
    const entry = this.offlineData.get(key);
    return entry ? entry.data : null;
  }

  /**
   * 移除离线数据
   * @param {string} key - 键
   */
  removeItem(key) {
    this.offlineData.delete(key);
    this.saveOfflineData();
  }
}

const offlineService = new OfflineService();

module.exports = offlineService;

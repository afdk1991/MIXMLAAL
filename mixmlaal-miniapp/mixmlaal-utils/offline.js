/**
 * 小程序离线模式服务
 * 版本: 0.0.0.4
 * 说明: 实现小程序离线模式支持，包括本地数据存储和离线同步
 */

const { getPlatform, getApi } = require('../platforms/adapter.js');

class OfflineService {
  constructor() {
    this.platform = getPlatform();
    this.api = getApi();
    this.offlineData = new Map();
    this.syncQueue = [];
    this.isOnline = true;
    this.listeners = new Set();

    this.init();
  }

  /**
   * 初始化离线服务
   */
  init() {
    this.loadOfflineData();
    this.checkNetworkStatus();
    this.setupNetworkListener();
  }

  /**
   * 检查网络状态
   */
  checkNetworkStatus() {
    try {
      const networkInfo = this.api.getNetworkInfo();
      this.isOnline = networkInfo.networkType !== 'none';
    } catch (e) {
      this.isOnline = true;
    }
  }

  /**
   * 设置网络监听
   */
  setupNetworkListener() {
    try {
      this.api.onNetworkStatusChange((res) => {
        const wasOffline = !this.isOnline;
        this.isOnline = res.isConnected;

        if (wasOffline && this.isOnline) {
          this.notifyListeners('online');
          this.syncPendingData();
        } else if (!this.isOnline) {
          this.notifyListeners('offline');
        }
      });
    } catch (e) {
      console.error('设置网络监听失败:', e);
    }
  }

  /**
   * 加载离线数据
   */
  loadOfflineData() {
    try {
      const data = this.api.getStorageSync('mixmlaal_offline_data');
      if (data) {
        this.offlineData = new Map(JSON.parse(data));
      }

      const syncQueue = this.api.getStorageSync('mixmlaal_sync_queue');
      if (syncQueue) {
        this.syncQueue = JSON.parse(syncQueue);
      }
    } catch (e) {
      console.error('加载离线数据失败:', e);
    }
  }

  /**
   * 保存离线数据
   */
  saveOfflineData() {
    try {
      this.api.setStorageSync('mixmlaal_offline_data', JSON.stringify([...this.offlineData]));
      this.api.setStorageSync('mixmlaal_sync_queue', JSON.stringify(this.syncQueue));
    } catch (e) {
      console.error('保存离线数据失败:', e);
    }
  }

  /**
   * 缓存数据
   * @param {string} key - 缓存键
   * @param {any} data - 缓存数据
   * @param {number} ttl - 过期时间（毫秒），默认1小时
   */
  cacheData(key, data, ttl = 3600000) {
    const cacheEntry = {
      data,
      timestamp: Date.now(),
      ttl
    };
    this.offlineData.set(key, cacheEntry);
    this.saveOfflineData();
  }

  /**
   * 获取缓存数据
   * @param {string} key - 缓存键
   * @returns {any|null} 缓存数据或null
   */
  getCachedData(key) {
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
    if (!this.isOnline || this.syncQueue.length === 0) {
      return { success: true, synced: 0 };
    }

    const failedItems = [];
    let syncedCount = 0;

    for (const item of this.syncQueue) {
      try {
        await this.syncItem(item);
        syncedCount++;
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

    return {
      success: failedItems.length === 0,
      synced: syncedCount,
      pending: failedItems.length
    };
  }

  /**
   * 同步单个数据项
   * @param {Object} item - 数据项
   */
  async syncItem(item) {
    const { get, post } = require('./request.js');

    let result;
    if (item.method === 'GET') {
      result = await get(item.url, item.data || {});
    } else {
      result = await post(item.url, item.data || {});
    }

    return result;
  }

  /**
   * 本地存储数据
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
   * 获取本地数据
   * @param {string} key - 键
   * @returns {any} 值
   */
  getItem(key) {
    const entry = this.offlineData.get(key);
    return entry ? entry.data : null;
  }

  /**
   * 移除本地数据
   * @param {string} key - 键
   */
  removeItem(key) {
    this.offlineData.delete(key);
    this.saveOfflineData();
  }

  /**
   * 清除所有离线数据
   */
  clearAll() {
    this.offlineData.clear();
    this.syncQueue = [];
    this.saveOfflineData();
  }

  /**
   * 检查是否在线
   * @returns {boolean} 是否在线
   */
  checkOnline() {
    this.checkNetworkStatus();
    return this.isOnline;
  }

  /**
   * 获取同步状态
   * @returns {Object} 同步状态
   */
  getSyncStatus() {
    return {
      pending: this.syncQueue.length,
      isOnline: this.isOnline
    };
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
   * 离线时记录操作，在线后自动同步
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {string} method - 请求方法
   */
  recordOperation(url, data, method = 'POST') {
    if (this.isOnline) {
      return Promise.reject(new Error('网络可用，请直接发起请求'));
    }

    this.addToSyncQueue({
      url,
      data,
      method,
      type: 'operation'
    });

    return Promise.resolve({
      code: 200,
      message: '操作已记录，将在网络恢复后同步',
      data: { queued: true }
    });
  }

  /**
   * 清除过期缓存
   */
  clearExpiredCache() {
    const now = Date.now();
    for (const [key, entry] of this.offlineData.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.offlineData.delete(key);
      }
    }
    this.saveOfflineData();
  }
}

const offlineService = new OfflineService();

module.exports = offlineService;

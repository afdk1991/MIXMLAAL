App({
  globalData: {
    baseUrl: 'https://api.mixmlaal.com/api/v1',
    systemInfo: null,
    statusBarHeight: 0,
    navBarHeight: 44,
    version: {
      version: '0.0.0.4',
      fullVersion: 'MIXMLAAL-0.0.0.4-20260419164720',
      major: 0,
      minor: 0,
      revision: 0,
      build: 4,
      timestamp: '20260419164720',
      project: 'MIXMLAAL',
      versionType: 'build'
    },
    pushEnabled: true,
    offlineEnabled: true,
    pushConfig: {
      orderStatus: 'ORDER_STATUS_TEMPLATE_ID',
      rideStatus: 'RIDE_STATUS_TEMPLATE_ID',
      paymentStatus: 'PAYMENT_STATUS_TEMPLATE_ID',
      promotion: 'PROMOTION_TEMPLATE_ID'
    }
  },

  onLaunch() {
    this.initSystemInfo();
    this.checkUpdate();
    this.logVersion();
    this.initPush();
    this.initOffline();
  },

  /**
   * 初始化离线模式
   */
  initOffline() {
    try {
      const offline = require('./utils/offline.js');
      this.globalData.offlineService = offline;

      this.globalData.offlineEnabled = true;
      console.log('离线模式已启用');

      offline.addListener((status) => {
        console.log('网络状态变化:', status);
        if (status === 'offline') {
          wx.showToast({
            title: '网络已断开，进入离线模式',
            icon: 'none',
            duration: 2000
          });
        } else if (status === 'online') {
          wx.showToast({
            title: '网络已恢复，正在同步数据',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (e) {
      console.error('初始化离线模式失败:', e);
      this.globalData.offlineEnabled = false;
    }
  },

  /**
   * 检查网络状态
   * @returns {boolean} 是否在线
   */
  checkNetwork() {
    const offline = this.globalData.offlineService;
    if (!offline) return true;
    return offline.checkOnline();
  },

  /**
   * 获取离线服务
   * @returns {Object} 离线服务实例
   */
  getOfflineService() {
    return this.globalData.offlineService;
  },

  /**
   * 缓存数据
   * @param {string} key - 键
   * @param {any} data - 数据
   * @param {number} ttl - 过期时间
   */
  cacheData(key, data, ttl) {
    const offline = this.globalData.offlineService;
    if (offline) {
      offline.cacheData(key, data, ttl);
    }
  },

  /**
   * 获取缓存数据
   * @param {string} key - 键
   * @returns {any} 缓存数据
   */
  getCachedData(key) {
    const offline = this.globalData.offlineService;
    if (offline) {
      return offline.getCachedData(key);
    }
    return null;
  },

  /**
   * 记录离线操作
   * @param {string} url - 请求URL
   * @param {Object} data - 请求数据
   * @param {string} method - 请求方法
   */
  recordOfflineOperation(url, data, method) {
    const offline = this.globalData.offlineService;
    if (!offline) {
      return Promise.reject(new Error('离线服务未初始化'));
    }
    return offline.recordOperation(url, data, method);
  },

  /**
   * 同步待处理数据
   */
  syncPendingData() {
    const offline = this.globalData.offlineService;
    if (offline) {
      return offline.syncPendingData();
    }
    return Promise.resolve({ success: true, synced: 0 });
  },

  /**
   * 初始化消息推送
   */
  initPush() {
    try {
      const push = require('./utils/push.js');
      this.globalData.pushService = push;

      push.checkPermission().then(hasPermission => {
        if (!hasPermission) {
          console.log('消息推送权限未开启');
          this.globalData.pushEnabled = false;
        } else {
          this.globalData.pushEnabled = true;
          console.log('消息推送已启用');
        }
      }).catch(err => {
        console.error('检查推送权限失败:', err);
        this.globalData.pushEnabled = false;
      });
    } catch (e) {
      console.error('初始化推送服务失败:', e);
    }
  },

  /**
   * 请求订阅消息
   * @param {string|Array<string>} templateIds - 模板ID
   */
  requestSubscribe(templateIds) {
    const push = this.globalData.pushService;
    if (!push || !this.globalData.pushEnabled) {
      console.warn('推送服务未初始化');
      return Promise.reject(new Error('推送服务未初始化'));
    }
    return push.requestSubscribe(templateIds);
  },

  /**
   * 发送订阅消息
   * @param {Object} params - 消息参数
   */
  sendSubscribeMessage(params) {
    const push = this.globalData.pushService;
    if (!push) {
      return Promise.reject(new Error('推送服务未初始化'));
    }
    return push.sendSubscribeMessage(params);
  },

  logVersion() {
    console.log('MIXMLAAL MiniApp Version:', this.globalData.version.fullVersion);
  },

  initSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      this.globalData.statusBarHeight = systemInfo.statusBarHeight || 0;
      this.globalData.navBarHeight = (systemInfo.statusBarHeight || 0) + 44;
    } catch (e) {
      console.error('获取系统信息失败:', e);
    }
  },

  checkUpdate() {
    if (!wx.getUpdateManager) { return; }

    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate(res => {
      console.log('是否有新版本:', res.hasUpdate);
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: res => {
          if (res.confirm) {
            updateManager.applyUpdate();
          }
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      wx.showToast({
        title: '更新失败，请重试',
        icon: 'none',
      });
    });
  },

  request(options) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: `${this.globalData.baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: options.data || {},
        header: {
          'Content-Type': 'application/json',
          ...options.header,
        },
        success: res => {
          if (res.statusCode === 200) {
            if (res.data.code === 200) {
              resolve(res.data);
            } else {
              wx.showToast({
                title: res.data.message || '请求失败',
                icon: 'none',
              });
              reject(res.data);
            }
          } else {
            wx.showToast({
              title: '网络错误',
              icon: 'none',
            });
            reject(res);
          }
        },
        fail: err => {
          wx.showToast({
            title: '网络连接失败',
            icon: 'none',
          });
          reject(err);
        },
      });
    });
  },
});

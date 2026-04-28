/**
 * 小程序平台适配器
 * 版本: v2.0.0
 * 支持平台: 微信、支付宝、百度、抖音、美团、拼多多、QQ、快手等
 */

const PLATFORM_WECHAT = 'wechat';
const PLATFORM_ALIPAY = 'alipay';
const PLATFORM_BAIDU = 'baidu';
const PLATFORM_BYTEDANCE = 'bytedance';
const PLATFORM_JD = 'jd';
const PLATFORM_MEITUAN = 'meituan';
const PLATFORM_PINDUODUO = 'pinduoduo';
const PLATFORM_KUAISHOU = 'kuaishou';
const PLATFORM_HUAWEI = 'huawei';
const PLATFORM_XIAOMI = 'xiaomi';
const PLATFORM_OPPO = 'oppo';
const PLATFORM_QQ = 'qq';

function getPlatform() {
  if (typeof tt !== 'undefined') {
    return PLATFORM_BYTEDANCE;
  } else if (typeof swan !== 'undefined') {
    return PLATFORM_BAIDU;
  } else if (typeof my !== 'undefined') {
    return PLATFORM_ALIPAY;
  } else if (typeof wx !== 'undefined') {
    return PLATFORM_WECHAT;
  } else if (typeof jd !== 'undefined') {
    return PLATFORM_JD;
  } else if (typeof mt !== 'undefined') {
    return PLATFORM_MEITUAN;
  } else if (typeof PDD !== 'undefined') {
    return PLATFORM_PINDUODUO;
  } else if (typeof ks !== 'undefined') {
    return PLATFORM_KUAISHOU;
  } else if (typeof qh !== 'undefined') {
    return PLATFORM_HUAWEI;
  } else if (typeof mi !== 'undefined') {
    return PLATFORM_XIAOMI;
  } else if (typeof qapp !== 'undefined') {
    return PLATFORM_OPPO;
  } else if (typeof qq !== 'undefined') {
    return PLATFORM_QQ;
  }
  return PLATFORM_WECHAT;
}

const platform = getPlatform();

function getApi() {
  switch (platform) {
    case PLATFORM_ALIPAY:
      return my;
    case PLATFORM_BAIDU:
      return swan;
    case PLATFORM_BYTEDANCE:
      return tt;
    case PLATFORM_JD:
      return jd;
    case PLATFORM_MEITUAN:
      return mt;
    case PLATFORM_PINDUODUO:
      return PDD;
    case PLATFORM_KUAISHOU:
      return ks;
    case PLATFORM_HUAWEI:
      return qh;
    case PLATFORM_XIAOMI:
      return mi;
    case PLATFORM_OPPO:
      return qapp;
    case PLATFORM_QQ:
      return qq;
    case PLATFORM_WECHAT:
    default:
      return wx;
  }
}

const api = getApi();

const requestCache = new Map();
const CACHE_TTL = 60000;
const MAX_CACHE_SIZE = 50;

function getCacheKey(url, data) {
  return `${url}:${JSON.stringify(data || {})}`;
}

function getCached(cacheKey) {
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  requestCache.delete(cacheKey);
  return null;
}

function setCache(cacheKey, data) {
  if (requestCache.size >= MAX_CACHE_SIZE) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
  requestCache.set(cacheKey, { data, timestamp: Date.now() });
}

function clearCache(pattern = null) {
  if (!pattern) {
    requestCache.clear();
    return;
  }
  for (const key of requestCache.keys()) {
    if (key.includes(pattern)) {
      requestCache.delete(key);
    }
  }
}

const platformAdapter = {
  platform,
  api,

  request(options = {}) {
    return api.request(options);
  },

  navigateTo(options) {
    return api.navigateTo(options);
  },

  redirectTo(options) {
    return api.redirectTo(options);
  },

  switchTab(options) {
    return api.switchTab(options);
  },

  reLaunch(options) {
    return api.reLaunch(options);
  },

  navigateBack(options) {
    return api.navigateBack(options);
  },

  showToast(options = {}) {
    const toastOptions = { ...options };
    if (platform === PLATFORM_ALIPAY) {
      toastOptions.content = options.title;
      delete toastOptions.title;
    }
    return api.showToast(toastOptions);
  },

  showLoading(options = {}) {
    const loadingOptions = { ...options };
    if (platform === PLATFORM_ALIPAY) {
      loadingOptions.content = options.title || '';
      delete loadingOptions.title;
    }
    return api.showLoading(loadingOptions);
  },

  hideLoading() {
    return api.hideLoading();
  },

  showModal(options = {}) {
    const modalOptions = { ...options };
    if (platform === PLATFORM_ALIPAY) {
      if (options.confirmText) modalOptions.confirmText = options.confirmText;
      if (options.cancelText) modalOptions.cancelText = options.cancelText;
    }
    return api.showModal(modalOptions);
  },

  showActionSheet(options = {}) {
    return api.showActionSheet(options);
  },

  setStorageSync(key, data) {
    return api.setStorageSync(key, data);
  },

  getStorageSync(key) {
    return api.getStorageSync(key);
  },

  getStorage(options = {}) {
    return api.getStorage(options);
  },

  setStorage(options = {}) {
    return api.setStorage(options);
  },

  removeStorage(options = {}) {
    return api.removeStorage(options);
  },

  clearStorage() {
    return api.clearStorage();
  },

  getStorageInfo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getStorageInfo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getStorageInfo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.getStorageInfo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getStorageInfo(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getStorageInfo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getStorageInfo(options);
    }
  },

  getStorageInfoSync() {
    if (platform === PLATFORM_WECHAT) {
      return api.getStorageInfoSync();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getStorageInfoSync();
    } else if (platform === PLATFORM_BAIDU) {
      return api.getStorageInfoSync();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getStorageInfoSync();
    } else if (platform === PLATFORM_QQ) {
      return api.getStorageInfoSync();
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getStorageInfoSync();
    }
    return {};
  },

  login(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.login(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getAuthCode(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.login(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.login(options);
    } else if (platform === PLATFORM_QQ) {
      return api.login(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.login(options);
    }
  },

  getUserProfile(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getUserProfile(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getOpenUserInfo(options);
    } else {
      return api.getUserInfo(options);
    }
  },

  getUserInfo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getUserInfo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getUserInfo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.getUserInfo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getUserInfo(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getUserInfo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getUserInfo(options);
    }
  },

  createSelectorQuery() {
    return api.createSelectorQuery();
  },

  createIntersectionObserver(options = {}) {
    return api.createIntersectionObserver(options);
  },

  createVideoContext(videoId) {
    if (platform === PLATFORM_WECHAT) {
      return api.createVideoContext(videoId);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.createVideoContext(videoId);
    } else if (platform === PLATFORM_BAIDU) {
      return api.createVideoContext(videoId);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.createVideoContext(videoId);
    } else if (platform === PLATFORM_QQ) {
      return api.createVideoContext(videoId);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.createVideoContext(videoId);
    }
  },

  createCameraContext() {
    if (platform === PLATFORM_WECHAT) {
      return api.createCameraContext();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.createCameraContext();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.createCameraContext();
    }
  },

  createMapContext(mapId) {
    if (platform === PLATFORM_WECHAT) {
      return api.createMapContext(mapId);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.createMapContext(mapId);
    } else if (platform === PLATFORM_BAIDU) {
      return api.createMapContext(mapId);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.createMapContext(mapId);
    } else if (platform === PLATFORM_QQ) {
      return api.createMapContext(mapId);
    }
  },

  createLivePlayerContext(domId) {
    if (platform === PLATFORM_WECHAT) {
      return api.createLivePlayerContext(domId);
    } else if (platform === PLATFORM_QQ) {
      return api.createLivePlayerContext(domId);
    }
  },

  getSystemInfo(options = {}) {
    return api.getSystemInfo(options);
  },

  getSystemInfoSync() {
    if (platform === PLATFORM_WECHAT) {
      return api.getSystemInfoSync();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getSystemInfoSync();
    } else if (platform === PLATFORM_BAIDU) {
      return api.getSystemInfoSync();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getSystemInfoSync();
    } else if (platform === PLATFORM_QQ) {
      return api.getSystemInfoSync();
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getSystemInfoSync();
    }
    return {};
  },

  getDeviceInfo() {
    const sysInfo = this.getSystemInfoSync();
    return {
      platform: platform,
      brand: sysInfo.brand || '',
      model: sysInfo.model || '',
      system: sysInfo.system || '',
      version: sysInfo.version || '',
      screenWidth: sysInfo.screenWidth || 375,
      screenHeight: sysInfo.screenHeight || 812,
      statusBarHeight: sysInfo.statusBarHeight || 20,
      safeArea: sysInfo.safeArea || {},
    };
  },

  canIUse(schema) {
    if (platform === PLATFORM_WECHAT) {
      return api.canIUse(schema);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.canIUse(schema);
    } else if (platform === PLATFORM_BAIDU) {
      return api.canIUse(schema);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.canIUse(schema);
    } else if (platform === PLATFORM_QQ) {
      return api.canIUse(schema);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.canIUse(schema);
    }
    return false;
  },

  getLocation(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getLocation(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getLocation(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.getLocation(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getLocation(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getLocation(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getLocation(options);
    }
  },

  chooseLocation(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseLocation(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseLocation(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.chooseLocation(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.chooseLocation(options);
    }
  },

  openLocation(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.openLocation(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.openLocation(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.openLocation(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.openLocation(options);
    } else if (platform === PLATFORM_QQ) {
      return api.openLocation(options);
    }
  },

  chooseImage(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseImage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseImage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.chooseImage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.chooseImage(options);
    } else if (platform === PLATFORM_QQ) {
      return api.chooseImage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.chooseImage(options);
    }
  },

  chooseVideo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseVideo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseVideo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.chooseVideo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.chooseVideo(options);
    } else if (platform === PLATFORM_QQ) {
      return api.chooseVideo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.chooseVideo(options);
    }
  },

  chooseFile(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseMessageFile(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseFile(options);
    }
  },

  previewImage(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.previewImage(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.previewImage(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.previewImage(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.previewImage(options);
    } else if (platform === PLATFORM_QQ) {
      return api.previewImage(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.previewImage(options);
    }
  },

  makePhoneCall(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.makePhoneCall(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.makePhoneCall(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.makePhoneCall(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.makePhoneCall(options);
    } else if (platform === PLATFORM_QQ) {
      return api.makePhoneCall(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.makePhoneCall(options);
    }
  },

  scanCode(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.scanCode(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.scanCode(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.scanCode(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.scanCode(options);
    } else if (platform === PLATFORM_QQ) {
      return api.scanCode(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.scanCode(options);
    }
  },

  getPhoneNumber(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getPhoneNumber(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getPhoneNumber(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getPhoneNumber(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getPhoneNumber(options);
    }
  },

  getShareInfo(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getShareInfo(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getShareInfo(options);
    }
  },

  showShareMenu(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.showShareMenu(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.showShareMenu(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.showShareMenu(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.showShareMenu(options);
    } else if (platform === PLATFORM_QQ) {
      return api.showShareMenu(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.showShareMenu(options);
    }
  },

  hideShareMenu() {
    if (platform === PLATFORM_WECHAT) {
      return api.hideShareMenu();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.hideShareMenu();
    } else if (platform === PLATFORM_BAIDU) {
      return api.hideShareMenu();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.hideShareMenu();
    } else if (platform === PLATFORM_QQ) {
      return api.hideShareMenu();
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.hideShareMenu();
    }
  },

  updateShareMenu(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.updateShareMenu(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.updateShareMenu(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.updateShareMenu(options);
    } else if (platform === PLATFORM_QQ) {
      return api.updateShareMenu(options);
    }
  },

  setClipboardData(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.setClipboardData(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.setClipboardData(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.setClipboardData(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.setClipboardData(options);
    } else if (platform === PLATFORM_QQ) {
      return api.setClipboardData(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.setClipboardData(options);
    }
  },

  getClipboardData(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.getClipboardData(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.getClipboardData(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.getClipboardData(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.getClipboardData(options);
    } else if (platform === PLATFORM_QQ) {
      return api.getClipboardData(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.getClipboardData(options);
    }
  },

  makeImagePreview(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return api.makeImagePreview(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.previewImage(options);
    }
  },

  pageScrollTo(options = {}) {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return api.pageScrollTo(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.pageScrollTo(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.pageScrollTo(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.pageScrollTo(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.pageScrollTo(options);
    }
  },

  setNavigationBarTitle(title) {
    return api.setNavigationBarTitle({ title });
  },

  showNavigationBarLoading() {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return api.showNavigationBarLoading();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.showNavigationBarLoading();
    } else if (platform === PLATFORM_BAIDU) {
      return api.showNavigationBarLoading();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.showNavigationBarLoading();
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.showNavigationBarLoading();
    }
  },

  hideNavigationBarLoading() {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      return api.hideNavigationBarLoading();
    } else if (platform === PLATFORM_ALIPAY) {
      return api.hideNavigationBarLoading();
    } else if (platform === PLATFORM_BAIDU) {
      return api.hideNavigationBarLoading();
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.hideNavigationBarLoading();
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.hideNavigationBarLoading();
    }
  },

  setNavigationBarColor(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.setNavigationBarColor(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.setNavigationBarColor(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.setNavigationBarColor(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.setNavigationBarColor(options);
    }
  },

  showTabBar(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.showTabBar(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.showTabBar(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.showTabBar(options);
    }
  },

  hideTabBar(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.hideTabBar(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.hideTabBar(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.hideTabBar(options);
    }
  },

  setTabBarStyle(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.setTabBarStyle(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.setTabBarStyle(options);
    }
  },

  setTabBarItem(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.setTabBarItem(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.setTabBarItem(options);
    }
  },

  addCard(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.addCard(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.addCard(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.addCard(options);
    }
  },

  openCard(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.openCard(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.openCard(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.openCard(options);
    }
  },

  chooseAddress(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseAddress(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseAddress(options);
    }
  },

  chooseContact(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.chooseContact(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.chooseContact(options);
    }
  },

  getRunScene() {
    if (platform === PLATFORM_WECHAT) {
      return api.getRunScene();
    }
    return {};
  },

  entry1on1(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return api.entry1on1(options);
    }
  },

  openCustomerServiceChat(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.openCustomerServiceChat(options);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.openCustomerServiceChat(options);
    }
  },

  openUrl(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return api.openUrl(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.openUrl(options);
    } else if (platform === PLATFORM_QQ) {
      return api.openUrl(options);
    }
  },

  tradePay(options = {}) {
    if (platform === PLATFORM_ALIPAY) {
      return api.tradePay(options);
    }
  },

  requestPayment(options = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.requestPayment(options);
    } else if (platform === PLATFORM_BAIDU) {
      return api.pay(options);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.pay(options);
    } else if (platform === PLATFORM_KUAISHOU) {
      return api.pay(options);
    }
  },

  aliPayTradeap(params, callback) {
    if (platform === PLATFORM_ALIPAY) {
      return api.tradePay(params, callback);
    }
  },

  getUpdateManager() {
    if (platform === PLATFORM_WECHAT) {
      return api.getUpdateManager();
    }
    return null;
  },

  getRealtimeLogManager() {
    if (platform === PLATFORM_WECHAT) {
      return api.getRealtimeLogManager();
    }
    return null;
  },

  reportAnalytics(eventName, data = {}) {
    if (platform === PLATFORM_WECHAT) {
      return api.reportAnalytics(eventName, data);
    } else if (platform === PLATFORM_ALIPAY) {
      return api.reportAnalytics(eventName, data);
    } else if (platform === PLATFORM_BYTEDANCE) {
      return api.reportAnalytics(eventName, data);
    }
  },

  pddGoodsDetail(goodsId) {
    if (platform === PLATFORM_PINDUODUO) {
      return PDD.router.navigate({ url: `/pages/goods/detail?goods_id=${goodsId}` });
    }
  },

  pddGroupDetail(groupId) {
    if (platform === PLATFORM_PINDUODUO) {
      return PDD.router.navigate({ url: `/pages/group/detail?group_id=${groupId}` });
    }
  },

  mtStoreDetail(storeId) {
    if (platform === PLATFORM_MEITUAN) {
      return mt.router.navigate({ url: `/pages/store/detail?store_id=${storeId}` });
    }
  },

  mtCouponReceive(couponId) {
    if (platform === PLATFORM_MEITUAN) {
      return mt.router.navigate({ url: `/pages/coupon/receive?coupon_id=${couponId}` });
    }
  },

  qqSetHeaderImage(imageUrl) {
    if (platform === PLATFORM_QQ) {
      return qq.setNavigationBarTitle({ title: '' });
    }
  },

  ksVideoPlay(videoId) {
    if (platform === PLATFORM_KUAISHOU) {
      const videoContext = ks.createVideoContext(videoId);
      videoContext.play();
      return videoContext;
    }
  },

  ksVideoPause(videoId) {
    if (platform === PLATFORM_KUAISHOU) {
      const videoContext = ks.createVideoContext(videoId);
      videoContext.pause();
      return videoContext;
    }
  },

  cache: {
    get: getCached,
    set: setCache,
    clear: clearCache,
  },

  isTransparentTitle() {
    if (platform === PLATFORM_WECHAT) {
      return api.canIUse('pageMeta.default-toolbar');
    }
    return false;
  },
};

module.exports = platformAdapter;
/**
 * 小程序认证工具
 * 版本: v2.0.0
 */

const platformAdapter = require('../platforms/adapter.js');

const PLATFORM_WECHAT = 'wechat';
const PLATFORM_ALIPAY = 'alipay';
const PLATFORM_BAIDU = 'baidu';
const PLATFORM_BYTEDANCE = 'bytedance';
const PLATFORM_QQ = 'qq';
const PLATFORM_KUAISHOU = 'kuaishou';

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function getStorage(key) {
  return platformAdapter.getStorageSync(key);
}

function setStorage(key, value) {
  return platformAdapter.setStorageSync(key, value);
}

function removeStorage(key) {
  return platformAdapter.removeStorage({ key });
}

function getToken() {
  return getStorage('access_token');
}

function setToken(token, refreshToken) {
  setStorage('access_token', token);
  if (refreshToken) {
    setStorage('refresh_token', refreshToken);
  }
}

function clearToken() {
  removeStorage('access_token');
  removeStorage('refresh_token');
}

function getUserInfo() {
  return getStorage('user_info');
}

function setUserInfo(userInfo) {
  setStorage('user_info', userInfo);
}

function clearUserInfo() {
  removeStorage('user_info');
}

async function login() {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === PLATFORM_ALIPAY) {
      api.getAuthCode({
        scopes: ['auth_user'],
        success: (res) => {
          resolve({ code: res.authCode });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_BYTEDANCE) {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_BAIDU) {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_QQ) {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_KUAISHOU) {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    } else {
      api.login({
        success: (res) => {
          resolve({ code: res.code });
        },
        fail: (err) => reject(err)
      });
    }
  });
}

async function getUserProfile(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === PLATFORM_WECHAT) {
      api.getUserProfile({
        desc: options.desc || '用于完善用户资料',
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_ALIPAY) {
      api.getOpenUserInfo({
        success: (res) => {
          resolve(res);
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_BYTEDANCE) {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_BAIDU) {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_QQ) {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else if (platform === PLATFORM_KUAISHOU) {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    } else {
      api.getUserInfo({
        success: (res) => {
          resolve(res.userInfo);
        },
        fail: (err) => reject(err)
      });
    }
  });
}

async function getPhoneNumber(e) {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === PLATFORM_WECHAT) {
      if (e && e.detail) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
          resolve(e.detail);
        } else {
          reject({ errMsg: e.detail.errMsg });
        }
      } else {
        api.getPhoneNumber({
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      }
    } else if (platform === PLATFORM_ALIPAY) {
      if (e && e.detail) {
        if (e.detail.response.responseCode === 'Success') {
          resolve(e.detail);
        } else {
          reject({ errMsg: e.detail.response.responseCode });
        }
      } else {
        api.getPhoneNumber({
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      }
    } else if (platform === PLATFORM_BYTEDANCE) {
      if (e && e.detail) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
          resolve(e.detail);
        } else {
          reject({ errMsg: e.detail.errMsg });
        }
      } else {
        api.getPhoneNumber({
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      }
    } else if (platform === PLATFORM_QQ) {
      if (e && e.detail) {
        if (e.detail.errMsg === 'getPhoneNumber:ok') {
          resolve(e.detail);
        } else {
          reject({ errMsg: e.detail.errMsg });
        }
      } else {
        api.getPhoneNumber({
          success: (res) => resolve(res),
          fail: (err) => reject(err)
        });
      }
    } else {
      if (e && e.detail) {
        resolve(e.detail);
      } else {
        resolve(null);
      }
    }
  });
}

function checkSession() {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
      api.checkSession({
        success: () => resolve(true),
        fail: () => reject(false)
      });
    } else if (platform === PLATFORM_ALIPAY) {
      api.getAuthUserInfo({
        success: () => resolve(true),
        fail: () => reject(false)
      });
    } else {
      resolve(true);
    }
  });
}

function isLoggedIn() {
  const token = getToken();
  return !!token;
}

function logout() {
  clearToken();
  clearUserInfo();
  platformAdapter.clearCache();
}

async function ensureLogin() {
  if (!isLoggedIn()) {
    try {
      await login();
      return true;
    } catch (error) {
      return false;
    }
  }
  return true;
}

module.exports = {
  login,
  getUserProfile,
  getPhoneNumber,
  checkSession,
  isLoggedIn,
  logout,
  ensureLogin,
  getToken,
  setToken,
  clearToken,
  getUserInfo,
  setUserInfo,
  clearUserInfo,
  getPlatform,
  getApi,
  getStorage,
  setStorage,
  removeStorage
};
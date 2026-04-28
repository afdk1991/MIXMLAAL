/**
 * 小程序网络请求工具
 * 版本: v2.0.0
 * 支持平台: 微信、支付宝、百度、抖音等
 */

const platformAdapter = require('../platforms/adapter.js');

const API_BASE_URL = 'http://localhost:3000';
const API_VERSION = 'v1';
const REQUEST_TIMEOUT = 30000;
const MAX_RETRY_COUNT = 3;

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

function getToken() {
  return platformAdapter.getStorageSync('access_token');
}

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function buildUrl(endpoint, params) {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  const queryString = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return `${url}?${queryString}`;
}

function request(options) {
  const api = getApi();
  const platform = getPlatform();
  const defaultOptions = {
    timeout: REQUEST_TIMEOUT,
    header: {
      'Content-Type': 'application/json'
    }
  };

  const token = getToken();
  if (token) {
    defaultOptions.header['Authorization'] = `Bearer ${token}`;
  }

  return new Promise((resolve, reject) => {
    const successHandler = (res) => {
      if (platform === PLATFORM_WECHAT || platform === PLATFORM_QQ) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          if (res.statusCode === 401) {
            clearCache();
            reject({ code: 401, message: '登录已过期' });
          } else {
            reject(res);
          }
        }
      } else {
        if (res.code === 0 || res.code === 'success') {
          resolve(res.data || res);
        } else {
          if (res.code === 401) {
            clearCache();
            reject({ code: 401, message: '登录已过期' });
          } else {
            reject(res);
          }
        }
      }
    };

    const failHandler = (err) => {
      reject(err);
    };

    if (platform === PLATFORM_ALIPAY) {
      api.request({
        ...defaultOptions,
        ...options,
        success: successHandler,
        fail: failHandler
      });
    } else {
      api.request({
        ...defaultOptions,
        ...options,
        success: successHandler,
        fail: failHandler
      });
    }
  });
}

async function requestWithRetry(options, retryCount = 0) {
  try {
    return await request(options);
  } catch (error) {
    if (retryCount < MAX_RETRY_COUNT && shouldRetry(error)) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return requestWithRetry(options, retryCount + 1);
    }
    throw error;
  }
}

function shouldRetry(error) {
  if (error.code === 401) {
    return false;
  }
  if (error.statusCode >= 500) {
    return true;
  }
  if (error.errMsg && error.errMsg.includes('timeout')) {
    return true;
  }
  return false;
}

function get(endpoint, params = {}, options = {}) {
  const cacheKey = getCacheKey(endpoint, params);

  if (!options.noCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return Promise.resolve(cached);
    }
  }

  const url = buildUrl(endpoint, params);
  const requestOptions = {
    url,
    method: 'GET',
    ...options
  };

  return requestWithRetry(requestOptions).then(data => {
    if (!options.noCache) {
      setCache(cacheKey, data);
    }
    return data;
  });
}

function post(endpoint, data = {}, options = {}) {
  const url = buildUrl(endpoint);
  return requestWithRetry({
    url,
    method: 'POST',
    data,
    ...options
  });
}

function put(endpoint, data = {}, options = {}) {
  const url = buildUrl(endpoint);
  return requestWithRetry({
    url,
    method: 'PUT',
    data,
    ...options
  });
}

function del(endpoint, options = {}) {
  const url = buildUrl(endpoint);
  return requestWithRetry({
    url,
    method: 'DELETE',
    ...options
  });
}

function uploadFile(options = {}) {
  const api = getApi();
  const defaultOptions = {
    timeout: REQUEST_TIMEOUT * 2,
    ...options
  };

  const token = getToken();
  if (token) {
    defaultOptions.header = {
      ...defaultOptions.header,
      'Authorization': `Bearer ${token}`
    };
  }

  return new Promise((resolve, reject) => {
    api.uploadFile({
      ...defaultOptions,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            const data = JSON.parse(res.data);
            resolve(data);
          } catch {
            resolve(res.data);
          }
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function downloadFile(options = {}) {
  const api = getApi();
  return new Promise((resolve, reject) => {
    api.downloadFile({
      ...options,
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.tempFilePath);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

module.exports = {
  request,
  get,
  post,
  put,
  delete: del,
  uploadFile,
  downloadFile,
  clearCache,
  getCached,
  setCache,
  getToken,
  buildUrl
};
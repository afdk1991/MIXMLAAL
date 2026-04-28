/**
 * API请求工具
 * 版本: v1.0.0.0
 * 说明: 封装axios请求，添加加载状态和错误处理，支持缓存和防抖节流
 */

import axios from 'axios';
import { useStore } from 'pinia';

// 缓存配置
const cacheConfig = {
  maxAge: 5 * 60 * 1000, // 缓存过期时间（5分钟）
  enabled: true, // 是否启用缓存
  cacheableMethods: ['GET'], // 可缓存的请求方法
  cacheableUrls: [/^\/user\/profile/, /^\/shop\/products/, /^\/shop\/categories/] // 可缓存的URL
};

// 缓存存储
const cacheStorage = new Map();

// 防抖节流配置
const debounceConfig = {
  delay: 300, // 防抖延迟时间（毫秒）
  enabled: true // 是否启用防抖
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

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  },
  // 启用HTTP2
  http2: true
});

// 请求拦截器
api.interceptors.request.use(
  (config) => {
    // 从localStorage获取token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 检查是否需要缓存
    if (cacheConfig.enabled && 
        cacheConfig.cacheableMethods.includes(config.method.toUpperCase()) &&
        cacheConfig.cacheableUrls.some(pattern => pattern.test(config.url))) {
      // 生成缓存键
      const cacheKey = `${config.method}:${config.url}:${JSON.stringify(config.params)}`;
      // 检查缓存是否有效
      const cachedData = cacheStorage.get(cacheKey);
      if (cachedData && Date.now() - cachedData.timestamp < cacheConfig.maxAge) {
        // 返回缓存数据
        return Promise.resolve({ data: cachedData.data });
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
api.interceptors.response.use(
  (response) => {
    // 检查是否需要缓存响应数据
    if (cacheConfig.enabled && 
        cacheConfig.cacheableMethods.includes(response.config.method.toUpperCase()) &&
        cacheConfig.cacheableUrls.some(pattern => pattern.test(response.config.url))) {
      // 生成缓存键
      const cacheKey = `${response.config.method}:${response.config.url}:${JSON.stringify(response.config.params)}`;
      // 存储缓存
      cacheStorage.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      });
    }
    
    return response.data;
  },
  (error) => {
    // 处理错误
    let errorMessage = '网络请求失败，请稍后再试';
    
    if (error.response) {
      // 服务器返回错误
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          errorMessage = data.message || '请求参数错误';
          break;
        case 401:
          errorMessage = '未授权，请重新登录';
          // 清除token并跳转到登录页
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          errorMessage = data.message || '没有权限执行此操作';
          break;
        case 404:
          errorMessage = '请求的资源不存在';
          break;
        case 500:
          errorMessage = data.message || '服务器内部错误';
          break;
        default:
          errorMessage = data.message || `请求失败 (${status})`;
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      errorMessage = '服务器无响应，请稍后再试';
    }
    
    // 显示错误信息
    console.error('API请求错误:', errorMessage);
    
    return Promise.reject(errorMessage);
  }
);

/**
 * 封装API请求
 * @param {string} method - 请求方法
 * @param {string} url - 请求URL
 * @param {Object} data - 请求数据
 * @param {Object} options - 其他选项
 * @returns {Promise}
 */
async function request(method, url, data = {}, options = {}) {
  const store = useStore();
  const { showLoading = true, loadingMessage = '加载中...', useCache = true, useDebounce = false } = options;
  
  try {
    if (showLoading) {
      store.setLoading(true, loadingMessage);
    }
    
    let response;
    switch (method.toUpperCase()) {
      case 'GET':
        response = await api.get(url, { params: data });
        break;
      case 'POST':
        response = await api.post(url, data);
        break;
      case 'PUT':
        response = await api.put(url, data);
        break;
      case 'DELETE':
        response = await api.delete(url, { params: data });
        break;
      default:
        throw new Error('不支持的请求方法');
    }
    
    return response;
  } catch (error) {
    throw error;
  } finally {
    if (showLoading) {
      store.setLoading(false);
    }
  }
}

// 导出请求方法
const apiClient = {
  get: (url, data = {}, options = {}) => request('GET', url, data, options),
  post: (url, data = {}, options = {}) => request('POST', url, data, options),
  put: (url, data = {}, options = {}) => request('PUT', url, data, options),
  delete: (url, data = {}, options = {}) => request('DELETE', url, data, options),
  
  // 清除缓存
  clearCache: () => {
    cacheStorage.clear();
  },
  
  // 清除指定URL的缓存
  clearCacheByUrl: (url) => {
    for (const key of cacheStorage.keys()) {
      if (key.includes(url)) {
        cacheStorage.delete(key);
      }
    }
  },

  ai: {
    chat: (data) => apiClient.post('/ai/chat', data),
    getSuggestions: (params) => apiClient.get('/ai/suggestions', { params }),
    analyzeOrder: (orderId) => apiClient.post(`/ai/analyze-order`, { orderId }),
    predictDemand: (params) => apiClient.get('/ai/predict-demand', { params })
  },

  content: {
    getList: (params) => apiClient.get('/contents', params),
    getById: (id) => apiClient.get(`/contents/${id}`),
    create: (data) => apiClient.post('/contents', data),
    update: (id, data) => apiClient.put(`/contents/${id}`, data),
    delete: (id) => apiClient.delete(`/contents/${id}`)
  },

  contentSync: {
    registerTarget: (data) => apiClient.post('/content-sync/register-target', data),
    unregisterTarget: (data) => apiClient.post('/content-sync/unregister-target', data),
    sync: (params) => apiClient.post('/content-sync/sync', params),
    broadcast: (data) => apiClient.post('/content-sync/broadcast', data),
    getStatus: (params) => apiClient.get('/content-sync/status', params),
    setInterval: (data) => apiClient.post('/content-sync/set-interval', data),
    clearInterval: (data) => apiClient.post('/content-sync/clear-interval', data)
  }
};

// 导出防抖版本的API方法
export const debouncedApi = {
  get: debounce((url, data = {}, options = {}) => apiClient.get(url, data, options), debounceConfig.delay),
  post: debounce((url, data = {}, options = {}) => apiClient.post(url, data, options), debounceConfig.delay),
  put: debounce((url, data = {}, options = {}) => apiClient.put(url, data, options), debounceConfig.delay),
  delete: debounce((url, data = {}, options = {}) => apiClient.delete(url, data, options), debounceConfig.delay)
};

export default apiClient;

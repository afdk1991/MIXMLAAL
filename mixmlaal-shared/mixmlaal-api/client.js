/**
 * API客户端
 * 版本: v2.0.0
 * 说明: 前端统一API请求封装，支持Token刷新、重试机制、请求缓存
 */

const API_BASE_URL = window.API_BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';
const REQUEST_TIMEOUT = 30000;
const MAX_RETRY_COUNT = 3;
const CACHE_ENABLED = true;
const requestCache = new Map();

function getToken() {
  return localStorage.getItem('access_token');
}

function setToken(token, refreshToken) {
  localStorage.setItem('access_token', token);
  if (refreshToken) {
    localStorage.setItem('refresh_token', refreshToken);
  }
}

function clearToken() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
}

function getCacheKey(endpoint, config) {
  return `${endpoint}:${JSON.stringify(config || {})}`;
}

function getCached(cacheKey) {
  if (!CACHE_ENABLED) return null;
  const cached = requestCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < (cached.ttl || 60000)) {
    return cached.data;
  }
  requestCache.delete(cacheKey);
  return null;
}

function setCache(cacheKey, data, ttl = 60000) {
  if (!CACHE_ENABLED) return;
  requestCache.set(cacheKey, { data, timestamp: Date.now(), ttl });
  if (requestCache.size > 100) {
    const oldestKey = requestCache.keys().next().value;
    requestCache.delete(oldestKey);
  }
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

async function refreshToken() {
  const refreshTokenVal = localStorage.getItem('refresh_token');
  if (!refreshTokenVal) {
    clearToken();
    return false;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(`${API_BASE_URL}/api/${API_VERSION}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: refreshTokenVal }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const data = await response.json();
    if (data.status === 'success') {
      setToken(data.data.token, data.data.refreshToken);
      return true;
    }
  } catch (error) {
    console.error('刷新Token失败:', error);
  }

  clearToken();
  return false;
}

async function requestWithRetry(url, config, retryCount = 0) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    const response = await fetch(url, { ...config, signal: controller.signal });
    clearTimeout(timeoutId);

    if (response.status === 401 && retryCount < MAX_RETRY_COUNT) {
      const refreshed = await refreshToken();
      if (refreshed) {
        config.headers.Authorization = `Bearer ${getToken()}`;
        return requestWithRetry(url, config, retryCount + 1);
      }
      window.location.href = '/login.html';
      throw new Error('登录已过期，请重新登录');
    }

    if (!response.ok && retryCount < MAX_RETRY_COUNT) {
      await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
      return requestWithRetry(url, config, retryCount + 1);
    }

    return response;
  } catch (error) {
    if (error.name === 'AbortError' && retryCount < MAX_RETRY_COUNT) {
      return requestWithRetry(url, config, retryCount + 1);
    }
    throw error;
  }
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}/api/${API_VERSION}${endpoint}`;
  const cacheKey = getCacheKey(endpoint, options);

  if (options.method === 'GET' && !options.noCache) {
    const cached = getCached(cacheKey);
    if (cached) {
      return cached;
    }
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await requestWithRetry(url, config);

    if (response.status === 401) {
      const refreshed = await refreshToken();
      if (refreshed) {
        config.headers.Authorization = `Bearer ${getToken()}`;
        const retryResponse = await requestWithRetry(url, config);
        const retryData = await retryResponse.json();
        if (!retryResponse.ok) {
          throw new Error(retryData.message || '请求失败');
        }
        if (options.method === 'GET' && !options.noCache) {
          setCache(cacheKey, retryData, options.cacheTTL);
        }
        return retryData;
      }
      window.location.href = '/login.html';
      throw new Error('登录已过期，请重新登录');
    }

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `请求失败: ${response.status}`);
    }

    if (options.method === 'GET' && !options.noCache) {
      setCache(cacheKey, data, options.cacheTTL);
    }

    return data;
  } catch (error) {
    console.error('API请求错误:', error);
    throw error;
  }
}

function get(endpoint, params = {}, options = {}) {
  const queryString = new URLSearchParams(params).toString();
  const url = queryString ? `${endpoint}?${queryString}` : endpoint;
  return request(url, { method: 'GET', ...options });
}

function post(endpoint, body = {}, options = {}) {
  return request(endpoint, { method: 'POST', body, ...options });
}

function put(endpoint, body = {}, options = {}) {
  return request(endpoint, { method: 'PUT', body, ...options });
}

function del(endpoint, options = {}) {
  return request(endpoint, { method: 'DELETE', ...options });
}

function upload(endpoint, formData, options = {}) {
  return request(endpoint, {
    method: 'POST',
    body: formData,
    headers: { ...options.headers },
    ...options,
  });
}

const API = {
  auth: {
    login: (phone, password) => post('/auth/login', { phone, password }),
    register: data => post('/auth/register', data),
    logout: () => post('/auth/logout'),
    sendSms: (phone, type) => post('/auth/sms/send', { phone, type }),
    getProfile: () => get('/auth/profile'),
    updateProfile: data => put('/auth/profile', data),
    refreshToken: () => post('/auth/refresh'),
  },

  user: {
    getInfo: () => get('/user/info'),
    updateInfo: data => put('/user/info', data),
    getAddresses: () => get('/user/addresses'),
    addAddress: data => post('/user/addresses', data),
    updateAddress: (id, data) => put(`/user/addresses/${id}`, data),
    deleteAddress: id => del(`/user/addresses/${id}`),
    getWallet: () => get('/user/wallet'),
    recharge: data => post('/user/wallet/recharge', data),
    getCoupons: () => get('/user/coupons'),
  },

  ride: {
    estimate: (from, to, type) => post('/ride/estimate', { from, to, type }),
    request: data => post('/ride/request', data),
    getStatus: rideId => get(`/ride/${rideId}/status`),
    cancel: (rideId, reason) => post(`/ride/${rideId}/cancel`, { reason }),
    rate: (rideId, data) => post(`/ride/${rideId}/rate`, data),
    getHistory: params => get('/ride/history', params),
    searchLocation: (keywords, lng, lat) => get('/ride/search-location', { keywords, lng, lat }),
    reverseGeocode: (lng, lat) => get('/ride/reverse-geocode', { lng, lat }),
    getNearbyDrivers: data => get('/ride/nearby-drivers', data),
  },

  shop: {
    getCategories: () => get('/shop/categories'),
    getProducts: params => get('/shop/products', params),
    getProduct: id => get(`/shop/products/${id}`),
    searchProducts: keyword => get('/shop/search', { keyword }),
    createOrder: data => post('/shop/orders', data),
    getOrders: params => get('/shop/orders', params),
    getOrder: id => get(`/shop/orders/${id}`),
    cancelOrder: (id, reason) => post(`/shop/orders/${id}/cancel`, { reason }),
  },

  cart: {
    getCart: () => get('/cart'),
    addToCart: data => post('/cart/add', data),
    updateCart: data => post('/cart/update', data),
    removeFromCart: productId => post(`/cart/remove/${productId}`),
    clearCart: () => post('/cart/clear'),
  },

  payment: {
    create: data => post('/payment/create', data),
    getStatus: (paymentId, channel) => get(`/payment/status/${paymentId}`, { channel }),
    refund: data => post('/payment/refund', data),
    getWechatPayParams: orderId => get(`/payment/wechat/${orderId}`),
    getAlipayParams: orderId => get(`/payment/alipay/${orderId}`),
  },

  social: {
    getPosts: params => get('/social/posts', params),
    getPost: id => get(`/social/posts/${id}`),
    createPost: data => post('/social/posts', data),
    getComments: (postId, params) => get(`/social/posts/${postId}/comments`, params),
    createComment: (postId, data) => post(`/social/posts/${postId}/comments`, data),
  },

  notification: {
    getList: params => get('/notification/list', params),
    getUnreadCount: () => get('/notification/unread-count'),
    markAsRead: id => post(`/notification/${id}/read`),
    markAllAsRead: () => post('/notification/read-all'),
    delete: id => del(`/notification/${id}`),
  },

  wallet: {
    getInfo: () => get('/wallet/info'),
    recharge: data => post('/wallet/recharge', data),
    withdraw: data => post('/wallet/withdraw', data),
    getTransactions: params => get('/wallet/transactions', params),
  },

  analytics: {
    getOverview: params => get('/analytics/overview', params),
    getOrderTrend: params => get('/analytics/order-trend', params),
    getServiceDistribution: params => get('/analytics/service-distribution', params),
    getUserGrowth: params => get('/analytics/user-growth', params),
    getSalesRanking: params => get('/analytics/sales-ranking', params),
  },

  driver: {
    register: data => post('/driver/register', data),
    login: data => post('/driver/login', data),
    getProfile: () => get('/driver/profile'),
    updateProfile: data => post('/driver/profile', data),
    updateLocation: data => post('/driver/location', data),
    getOrders: params => get('/driver/orders', params),
    acceptOrder: orderId => post(`/driver/order/${orderId}/accept`),
    arrivePickup: orderId => post(`/driver/order/${orderId}/arrive`),
    startTrip: orderId => post(`/driver/order/${orderId}/start`),
    completeTrip: orderId => post(`/driver/order/${orderId}/complete`),
  },

  help: {
    getCategories: () => get('/help/categories'),
    getArticles: categoryId => get('/help/articles', { categoryId }),
    getArticleDetail: articleId => get(`/help/article/${articleId}`),
    searchArticles: keyword => get('/help/search', { keyword }),
    submitFeedback: data => post('/help/feedback', data),
  },
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API, getToken, setToken, clearToken, request, clearCache };
} else {
  window.API = API;
  window.APIClient = { getToken, setToken, clearToken, request, clearCache };
}
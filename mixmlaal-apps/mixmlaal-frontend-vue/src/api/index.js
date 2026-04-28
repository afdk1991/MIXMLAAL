import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
const API_PREFIX = '/api/v1';

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

apiClient.interceptors.request.use(
  config => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject({
        status,
        message: data?.message || data?.error || '请求失败',
        data: data
      });
    }
    if (error.request) {
      return Promise.reject({
        status: -1,
        message: '网络错误，请检查您的网络连接',
        data: null
      });
    }
    return Promise.reject({
      status: -2,
      message: error.message || '请求配置错误',
      data: null
    });
  }
);

export default {
  auth: {
    login: (data) => apiClient.post('/auth/login', data),
    register: (data) => apiClient.post('/auth/register', data),
    logout: () => apiClient.post('/auth/logout'),
    getCurrentUser: () => apiClient.get('/auth/me'),
    sendCode: (phone, type) => apiClient.post('/auth/send-code', { phone, type }),
    loginByPhone: (phone, code) => apiClient.post('/auth/phone/login', { phone, code }),
    thirdPartyLogin: (provider, openid, unionid, nickname, avatar) =>
      apiClient.post('/auth/third-party/login', { provider, openid, unionid, nickname, avatar }),
    resetPassword: (data) => apiClient.post('/auth/reset-password', data),
    changePassword: (data) => apiClient.post('/auth/change-password', data)
  },

  user: {
    getProfile: () => apiClient.get('/user/me'),
    updateProfile: (data) => apiClient.put('/user/me', data),
    getAddresses: () => apiClient.get('/address/list'),
    addAddress: (data) => apiClient.post('/address/create', data),
    updateAddress: (id, data) => apiClient.put(`/address/${id}`, data),
    deleteAddress: (id) => apiClient.delete(`/address/${id}`),
    setDefaultAddress: (id) => apiClient.put(`/address/${id}/default`)
  },

  product: {
    getList: (params) => apiClient.get('/product/list', { params }),
    getById: (id) => apiClient.get(`/product/${id}`),
    getCategories: () => apiClient.get('/product/categories'),
    search: (keyword, params) => apiClient.get(`/product/search`, { keyword, ...params })
  },

  cart: {
    getList: () => apiClient.get('/cart/list'),
    add: (productId, quantity) => apiClient.post('/cart/add', { productId, quantity }),
    update: (id, quantity) => apiClient.put(`/cart/${id}`, { quantity }),
    remove: (id) => apiClient.delete(`/cart/${id}`),
    clear: () => apiClient.delete('/cart/clear')
  },

  order: {
    getList: (params) => apiClient.get('/order/list', { params }),
    getById: (id) => apiClient.get(`/order/${id}`),
    create: (data) => apiClient.post('/order/create', data),
    cancel: (id, reason) => apiClient.post(`/order/${id}/cancel`, { reason }),
    confirm: (id) => apiClient.post(`/order/${id}/confirm`),
    getExpress: (id) => apiClient.get(`/order/${id}/express`)
  },

  payment: {
    wechatPay: (orderNo, amount) => apiClient.post('/payment/wechat', { orderNo, amount }),
    alipay: (orderNo, amount) => apiClient.post('/payment/alipay', { orderNo, amount }),
    getStatus: (orderNo) => apiClient.get(`/payment/status/${orderNo}`),
    refund: (orderNo, reason) => apiClient.post('/payment/refund', { orderNo, reason }),
    getHistory: (params) => apiClient.get('/payment/history', { params })
  },

  wallet: {
    getInfo: () => apiClient.get('/wallet/info'),
    recharge: (amount, method) => apiClient.post('/wallet/recharge', { amount, method }),
    withdraw: (amount, bankCard) => apiClient.post('/wallet/withdraw', { amount, bankCard }),
    getTransactions: (params) => apiClient.get('/wallet/transactions', { params })
  },

  ride: {
    getDrivers: (params) => apiClient.get('/ride/drivers', { params }),
    estimatePrice: (data) => apiClient.post('/ride/estimate', data),
    getVehicleTypes: () => apiClient.get('/ride/vehicle-types'),
    createOrder: (data) => apiClient.post('/ride/order/create', data),
    getOrder: (id) => apiClient.get(`/ride/order/${id}`),
    getOrders: (params) => apiClient.get('/ride/orders', { params }),
    cancelOrder: (id, reason) => apiClient.post(`/ride/order/${id}/cancel`, { reason }),
    getDriverLocation: (orderId) => apiClient.get(`/ride/order/${orderId}/driver-location`),
    rateDriver: (orderId, rating, comment) => apiClient.post(`/ride/order/${orderId}/rate`, { rating, comment })
  },

  shop: {
    getProducts: (params) => apiClient.get('/shop/products', { params }),
    getProductById: (id) => apiClient.get(`/shop/products/${id}`),
    getCategories: () => apiClient.get('/shop/categories')
  },

  coupon: {
    getList: () => apiClient.get('/coupon/list'),
    getAvailable: () => apiClient.get('/coupon/available'),
    claim: (couponId) => apiClient.post('/coupon/claim', { couponId })
  },

  notification: {
    getList: (params) => apiClient.get('/notification/list', { params }),
    getUnreadCount: () => apiClient.get('/notification/unread-count'),
    markAsRead: (id) => apiClient.post('/notification/mark-read', { id }),
    markAllAsRead: () => apiClient.post('/notification/mark-all-read')
  },

  ai: {
    chat: (message) => apiClient.post('/ai/chat', { message }),
    getSuggestions: (context) => apiClient.get('/ai/suggestions', { context })
  }
};

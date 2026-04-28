const { get, post } = require('./request');

const authApi = {
  wechatLogin: code => post('/auth/wechat', { code }),

  login: data => post('/auth/login', data),

  register: data => post('/auth/register', data),

  sendSms: phone => post('/auth/sms/send', { phone }),

  refreshToken: () => post('/auth/refresh'),

  logout: () => post('/auth/logout'),
};

const userApi = {
  getProfile: () => get('/user/profile'),

  updateProfile: data => post('/user/profile', data),

  getWallet: () => get('/user/wallet'),

  recharge: data => post('/user/wallet/recharge', data),

  withdrawal: data => post('/user/wallet/withdrawal', data),

  getCoupons: () => get('/user/coupons'),

  getFavorites: () => get('/user/favorites'),

  addFavorite: data => post('/user/favorites', data),

  removeFavorite: id => post(`/user/favorites/${id}/remove`),
};

const rideApi = {
  estimate: data => post('/ride/estimate', data),

  request: data => post('/ride/request', data),

  getStatus: rideId => get(`/ride/${rideId}/status`),

  getNearbyDrivers: data => get('/ride/nearby-drivers', data),

  searchLocation: keyword => get('/ride/search-location', { keyword }),

  reverseGeocode: data => get('/ride/reverse-geocode', data),

  cancel: (rideId, reason) => post(`/ride/${rideId}/cancel`, { reason }),

  rate: (rideId, data) => post(`/ride/${rideId}/rate`, data),
};

const orderApi = {
  getList: params => get('/order/list', params),

  getDetail: orderId => get(`/order/${orderId}/detail`),

  cancel: (orderId, reason) => post(`/order/${orderId}/cancel`, { reason }),

  rate: (orderId, data) => post(`/order/${orderId}/rate`, data),
};

const shopApi = {
  getCategories: () => get('/shop/categories'),

  getProducts: params => get('/shop/products', params),

  getProductDetail: productId => get(`/shop/product/${productId}`),

  searchProducts: keyword => get('/shop/search', { keyword }),
};

const cartApi = {
  getCart: () => get('/cart'),

  addToCart: data => post('/cart/add', data),

  updateCart: data => post('/cart/update', data),

  removeFromCart: productId => post(`/cart/remove/${productId}`),

  clearCart: () => post('/cart/clear'),
};

const paymentApi = {
  create: data => post('/payment/create', data),

  getWechatPayParams: orderId => get(`/payment/wechat/${orderId}`),

  getAlipayParams: orderId => get(`/payment/alipay/${orderId}`),

  refund: data => post('/payment/refund', data),

  getStatus: paymentId => get(`/payment/status/${paymentId}`),
};

const driverApi = {
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
};

const helpApi = {
  getCategories: () => get('/help/categories'),

  getArticles: categoryId => get('/help/articles', { categoryId }),

  getArticleDetail: articleId => get(`/help/article/${articleId}`),

  searchArticles: keyword => get('/help/search', { keyword }),

  submitFeedback: data => post('/help/feedback', data),
};

module.exports = {
  authApi,
  userApi,
  rideApi,
  orderApi,
  shopApi,
  cartApi,
  paymentApi,
  driverApi,
  helpApi,
};

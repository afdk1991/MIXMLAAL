const app = getApp();
const { showToast, showModal } = require('../../utils/util');
const shopApi = require('../../utils/api').shopApi;
const cartApi = require('../../utils/api').cartApi;
const { isLoggedIn } = require('../../utils/storage');

Page({
  data: {
    productId: '',
    product: null,
    quantity: 1,
    currentImageIndex: 0,
    isLoading: true,
  },

  onLoad(options) {
    const { id } = options;
    this.setData({ productId: id });
    this.loadProductDetail();
  },

  async loadProductDetail() {
    try {
      const res = await shopApi.getProductDetail(this.data.productId);
      this.setData({
        product: res.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('加载商品详情失败:', error);
      showToast('商品不存在');
      setTimeout(() => wx.navigateBack(), 1000);
    }
  },

  onSwiperChange(e) {
    this.setData({ currentImageIndex: e.detail.current });
  },

  decreaseQuantity() {
    const { quantity } = this.data;
    if (quantity > 1) {
      this.setData({ quantity: quantity - 1 });
    }
  },

  increaseQuantity() {
    const { quantity, product } = this.data;
    if (quantity < product.stock) {
      this.setData({ quantity: quantity + 1 });
    } else {
      showToast('已达库存上限');
    }
  },

  onQuantityInput(e) {
    let value = parseInt(e.detail.value) || 1;
    const { product } = this.data;

    if (value < 1) { value = 1; }
    if (value > product.stock) { value = product.stock; }

    this.setData({ quantity: value });
  },

  async addToCart() {
    if (!isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { productId, quantity } = this.data;

    try {
      await cartApi.addToCart({
        productId,
        quantity,
      });

      showToast('已加入购物车');
    } catch (error) {
      console.error('加入购物车失败:', error);
    }
  },

  async buyNow() {
    if (!isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { productId, quantity, product } = this.data;

    const orderData = {
      items: [{
        productId,
        quantity,
        price: product.price,
      }],
      totalAmount: product.price * quantity,
    };

    wx.setStorageSync('tempOrder', orderData);
    wx.navigateTo({ url: '/pages/order-create/order-create' });
  },

  onShareAppMessage() {
    const { product } = this.data;
    return {
      title: product.name,
      path: `/pages/product-detail/product-detail?id=${product.id}`,
      imageUrl: product.images[0],
    };
  },
});

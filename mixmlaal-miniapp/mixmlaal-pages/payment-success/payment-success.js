const app = getApp();

Page({
  data: {
    orderId: '',
    order: null,
  },

  onLoad(options) {
    const { orderId } = options;
    this.setData({ orderId });
    this.loadOrderInfo();
  },

  async loadOrderInfo() {
    try {
      const res = await app.request({
        url: `/order/${this.data.orderId}/detail`,
      });

      this.setData({ order: res.data });
    } catch (error) {
      console.error('加载订单信息失败:', error);
    }
  },

  goToOrderList() {
    wx.redirectTo({ url: '/pages/order/order' });
  },

  goToHome() {
    wx.switchTab({ url: '/pages/index/index' });
  },

  goToDetail() {
    wx.redirectTo({
      url: `/pages/order-detail/order-detail?orderId=${this.data.orderId}`,
    });
  },
});

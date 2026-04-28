const app = getApp();
const { showToast, formatPrice, formatDistance, formatTime } = require('../../utils/util');
const rideApi = require('../../utils/api').rideApi;

Page({
  data: {
    orderId: '',
    order: null,
    statusText: {
      pending: '等待接单',
      accepted: '司机已接单',
      arriving: '司机即将到达',
      arrived: '司机已到达',
      in_trip: '行程中',
      completed: '已完成',
      cancelled: '已取消',
    },
    statusColor: {
      pending: '#fa8c16',
      accepted: '#1890ff',
      arriving: '#1890ff',
      arrived: '#52c41a',
      in_trip: '#1890ff',
      completed: '#52c41a',
      cancelled: '#999',
    },
    countdown: 0,
    pollingTimer: null,
  },

  onLoad(options) {
    const { orderId } = options;
    this.setData({ orderId });
    this.loadOrderDetail();
    this.startPolling();
  },

  onUnload() {
    this.stopPolling();
  },

  async loadOrderDetail() {
    try {
      const res = await rideApi.getStatus(this.data.orderId);
      this.setData({ order: res.data });

      if (res.data.status === 'pending') {
        this.startCountdown(res.data.expireTime);
      }
    } catch (error) {
      console.error('获取订单详情失败:', error);
    }
  },

  startPolling() {
    this.pollingTimer = setInterval(() => {
      this.loadOrderDetail();
    }, 3000);
  },

  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  },

  startCountdown(expireTime) {
    const now = Date.now();
    const remaining = Math.max(0, Math.floor((expireTime - now) / 1000));
    this.setData({ countdown: remaining });

    if (remaining > 0) {
      const timer = setInterval(() => {
        const { countdown } = this.data;
        if (countdown <= 1) {
          clearInterval(timer);
          this.setData({ countdown: 0 });
        } else {
          this.setData({ countdown: countdown - 1 });
        }
      }, 1000);
    }
  },

  async cancelOrder() {
    const confirmed = await wx.showModal({
      title: '取消订单',
      content: '确定要取消订单吗？',
    });

    if (!confirmed) { return; }

    try {
      await rideApi.cancel(this.data.orderId, '用户取消');
      showToast('订单已取消');

      setTimeout(() => {
        wx.navigateBack();
      }, 1000);
    } catch (error) {
      console.error('取消订单失败:', error);
    }
  },

  callDriver() {
    const { order } = this.data;
    if (order && order.driverPhone) {
      wx.makePhoneCall({
        phoneNumber: order.driverPhone,
      });
    }
  },

  openMap() {
    const { order } = this.data;
    if (order && order.driverLocation) {
      wx.openLocation({
        latitude: order.driverLocation.lat,
        longitude: order.driverLocation.lng,
        name: '司机位置',
        address: order.driverLocation.address,
      });
    }
  },

  goToPayment() {
    wx.navigateTo({
      url: `/pages/payment/payment?orderId=${this.data.orderId}`,
    });
  },

  async rateOrder() {
    wx.navigateTo({
      url: `/pages/rate/rate?orderId=${this.data.orderId}`,
    });
  },
});

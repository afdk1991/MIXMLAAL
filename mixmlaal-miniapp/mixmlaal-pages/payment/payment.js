const app = getApp();
const { showToast, showLoading, hideLoading } = require('../../utils/util');
const paymentApi = require('../../utils/api').paymentApi;
const { isLoggedIn } = require('../../utils/storage');

Page({
  data: {
    orderId: '',
    order: null,
    paymentMethods: [
      { id: 'wechat', name: '微信支付', icon: '💬' },
      { id: 'alipay', name: '支付宝', icon: '💳' },
      { id: 'balance', name: '余额支付', icon: '💰' },
    ],
    selectedMethod: 'wechat',
    isLoading: false,
  },

  onLoad(options) {
    if (!isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

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
      showToast('订单不存在');
      setTimeout(() => wx.navigateBack(), 1000);
    }
  },

  selectPaymentMethod(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ selectedMethod: id });
  },

  async pay() {
    const { orderId, selectedMethod, order, isLoading } = this.data;

    if (isLoading) { return; }

    this.setData({ isLoading: true });

    try {
      if (selectedMethod === 'wechat') {
        await this.wechatPay(orderId);
      } else if (selectedMethod === 'alipay') {
        await this.alipay(orderId);
      } else if (selectedMethod === 'balance') {
        await this.balancePay(orderId);
      }
    } catch (error) {
      console.error('支付失败:', error);
      showToast('支付失败，请重试');
    } finally {
      this.setData({ isLoading: false });
    }
  },

  async wechatPay(orderId) {
    try {
      const res = await paymentApi.getWechatPayParams(orderId);
      const payParams = res.data;

      await wx.requestPayment({
        timeStamp: payParams.timeStamp,
        nonceStr: payParams.nonceStr,
        package: payParams.package,
        signType: payParams.signType,
        paySign: payParams.paySign,
      });

      showToast('支付成功');

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/payment-success/payment-success?orderId=${orderId}`,
        });
      }, 1000);
    } catch (error) {
      if (error.errMsg === 'requestPayment:fail cancel') {
        showToast('已取消支付');
      } else {
        throw error;
      }
    }
  },

  async alipay(orderId) {
    try {
      const res = await paymentApi.getAlipayParams(orderId);

      showToast('请在外部浏览器完成支付');
    } catch (error) {
      throw error;
    }
  },

  async balancePay(orderId) {
    try {
      const res = await paymentApi.create({
        orderId,
        channel: 'balance',
      });

      showToast('支付成功');

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/payment-success/payment-success?orderId=${orderId}`,
        });
      }, 1000);
    } catch (error) {
      throw error;
    }
  },
});

const app = getApp();
const { showToast } = require('../../utils/util');

Page({
  data: {
    banners: [
      { id: 1, image: '/assets/images/banner1.png', url: '' },
      { id: 2, image: '/assets/images/banner2.png', url: '' },
    ],
    services: [
      { id: 'ride', icon: '🚗', name: '网约车', desc: '一键叫车，安全出行', path: '/pages/ride/ride' },
      { id: 'shop', icon: '🛒', name: '商城', desc: '精选好物，品质保障', path: '/pages/shop/shop' },
      { id: 'help', icon: '❓', name: '帮助', desc: '常见问题解答', path: '/pages/help/help' },
      { id: 'membership', icon: '💎', name: '会员', desc: '专属特权，尽享优惠', path: '/pages/membership/membership' },
      { id: 'feedback', icon: '💬', name: '客服', desc: '在线服务，及时响应', path: '/pages/feedback/feedback' },
    ],
    quickActions: [
      { id: 'economy', name: '经济型', price: '起步价8元', icon: '🚗' },
      { id: 'comfort', name: '舒适型', price: '起步价12元', icon: '🚙' },
      { id: 'premium', name: '豪华型', price: '起步价20元', icon: '🏎️' },
      { id: 'designated', name: '代驾', price: '起步价15元', icon: '👨‍✈️' },
    ],
    hotProducts: [],
    isLoading: false,
    userInfo: null,
  },

  onLoad() {
    this.loadUserInfo();
    this.loadHotProducts();
  },

  onShow() {
    this.loadUserInfo();
  },

  // 加载用户信息
  loadUserInfo() {
    const userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({ userInfo });
    }
  },

  async loadHotProducts() {
    try {
      this.setData({ isLoading: true });
      const res = await app.request({
        url: '/shop/products',
        data: { page: 1, pageSize: 4, sort: 'hot' },
      });

      this.setData({ hotProducts: res.data.list || [] });
    } catch (error) {
      console.error('加载热门商品失败:', error);
      showToast('加载商品失败，请重试');
    } finally {
      this.setData({ isLoading: false });
    }
  },

  onBannerTap(e) {
    const { url } = e.currentTarget.dataset;
    if (url) {
      wx.navigateTo({ url });
    }
  },

  onServiceTap(e) {
    const { path } = e.currentTarget.dataset;

    if (path.includes('help') || path.includes('membership') || path.includes('feedback')) {
      wx.navigateTo({ url: path });
    } else {
      wx.switchTab({ url: path });
    }
  },

  onQuickRide(e) {
    const { id } = e.currentTarget.dataset;

    wx.switchTab({
      url: '/pages/ride/ride',
      success: () => {
        // 通知叫车页面选择对应的车型
        const page = getCurrentPages().find(p => p.route === 'pages/ride/ride');
        if (page) {
          page.setData({ selectedCarType: id });
        }
      }
    });
  },

  goToRide() {
    wx.switchTab({ url: '/pages/ride/ride' });
  },

  goToShop() {
    wx.switchTab({ url: '/pages/shop/shop' });
  },

  goToHelp() {
    wx.navigateTo({ url: '/pages/help/help' });
  },

  goToProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`,
    });
  },

  // 点击个人中心
  goToUserCenter() {
    wx.navigateTo({
      url: '/pages/usercenter/usercenter'
    });
  },

  onPullDownRefresh() {
    this.loadHotProducts().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onShareAppMessage() {
    return {
      title: 'MIXMLAAL - 一站式出行生活服务平台',
      path: '/pages/index/index',
      imageUrl: '/assets/images/share.png'
    };
  },

  onShareTimeline() {
    return {
      title: 'MIXMLAAL - 让出行更美好',
      imageUrl: '/assets/images/share.png'
    };
  }
});

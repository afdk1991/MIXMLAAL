const app = getApp();

Component({
  properties: {
    title: {
      type: String,
      value: '',
    },
    showBack: {
      type: Boolean,
      value: true,
    },
    bgColor: {
      type: String,
      value: '#1890ff',
    },
  },

  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
  },

  attached() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight || 0,
      navBarHeight: (systemInfo.statusBarHeight || 0) + 44,
    });
  },

  methods: {
    goBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack();
      } else {
        wx.switchTab({ url: '/pages/index/index' });
      }
    },
  },
});

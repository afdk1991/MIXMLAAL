const app = getApp();
const { showToast } = require('../../utils/util');
const helpApi = require('../../utils/api').helpApi;

Page({
  data: {
    categories: [],
    articles: [],
    hotArticles: [],
    searchKeyword: '',
    isLoading: true,
  },

  onLoad() {
    this.loadCategories();
    this.loadHotArticles();
  },

  async loadCategories() {
    try {
      const res = await helpApi.getCategories();
      this.setData({
        categories: res.data,
        isLoading: false,
      });
    } catch (error) {
      console.error('加载分类失败:', error);
      this.setData({ isLoading: false });
    }
  },

  async loadHotArticles() {
    try {
      const res = await helpApi.getArticles('hot');
      this.setData({ hotArticles: res.data });
    } catch (error) {
      console.error('加载热门文章失败:', error);
    }
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  async onSearch() {
    const { searchKeyword } = this.data;

    if (!searchKeyword.trim()) {
      showToast('请输入搜索关键词');
      return;
    }

    try {
      const res = await helpApi.searchArticles(searchKeyword);
      this.setData({ articles: res.data });
    } catch (error) {
      console.error('搜索失败:', error);
    }
  },

  goToCategory(e) {
    const { id, name } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/help-category/help-category?id=${id}&name=${name}`,
    });
  },

  goToArticle(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/help-article/help-article?id=${id}`,
    });
  },

  goToFeedback() {
    wx.navigateTo({ url: '/pages/feedback/feedback' });
  },

  makePhoneCall() {
    wx.makePhoneCall({
      phoneNumber: '400-123-4567',
    });
  },
});

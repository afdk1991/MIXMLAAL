const app = getApp();
const { showToast, showLoading, hideLoading } = require('../../utils/util');
const shopApi = require('../../utils/api').shopApi;
const cartApi = require('../../utils/api').cartApi;

Page({
  data: {
    categories: [],
    currentCategory: '',
    products: [],
    page: 1,
    pageSize: 10,
    hasMore: true,
    isLoading: false,
    searchKeyword: '',
    cartCount: 0,
  },

  onLoad() {
    this.loadCategories();
    this.loadProducts();
    this.loadCartCount();
  },

  async loadCategories() {
    try {
      const res = await shopApi.getCategories();
      const categories = [{ id: '', name: '全部' }, ...res.data];
      this.setData({ categories });
    } catch (error) {
      console.error('加载分类失败:', error);
    }
  },

  async loadProducts(refresh = false) {
    const { currentCategory, page, pageSize, isLoading, hasMore, searchKeyword } = this.data;

    if (isLoading || (!refresh && !hasMore)) { return; }

    if (refresh) {
      this.setData({ page: 1, hasMore: true, products: [] });
    }

    this.setData({ isLoading: true });

    try {
      const params = {
        page: refresh ? 1 : page,
        pageSize,
        categoryId: currentCategory,
        keyword: searchKeyword,
      };

      const res = await shopApi.getProducts(params);
      const newProducts = res.data.list || [];

      this.setData({
        products: refresh ? newProducts : [...this.data.products, ...newProducts],
        hasMore: newProducts.length >= pageSize,
        page: (refresh ? 1 : page) + 1,
      });
    } catch (error) {
      console.error('加载商品失败:', error);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  async loadCartCount() {
    try {
      const res = await cartApi.getCart();
      const count = res.data.items.reduce((sum, item) => sum + item.quantity, 0);
      this.setData({ cartCount: count });
    } catch (error) {
      console.error('获取购物车数量失败:', error);
    }
  },

  onCategoryChange(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ currentCategory: id });
    this.loadProducts(true);
  },

  onSearchInput(e) {
    this.setData({ searchKeyword: e.detail.value });
  },

  onSearch() {
    this.loadProducts(true);
  },

  onProductClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`,
    });
  },

  async addToCart(e) {
    const { id } = e.currentTarget.dataset;

    try {
      await cartApi.addToCart({
        productId: id,
        quantity: 1,
      });

      showToast('已加入购物车');
      this.loadCartCount();
    } catch (error) {
      console.error('加入购物车失败:', error);
    }
  },

  goToCart() {
    wx.switchTab({ url: '/pages/cart/cart' });
  },

  onPullDownRefresh() {
    this.loadProducts(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    this.loadProducts();
  },
});

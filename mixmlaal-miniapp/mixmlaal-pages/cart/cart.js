const app = getApp();
const { showToast, showModal, formatPrice } = require('../../utils/util');
const cartApi = require('../../utils/api').cartApi;

Page({
  data: {
    cartItems: [],
    selectedItems: [],
    isAllSelected: false,
    totalPrice: 0,
    isLoading: true,
  },

  onLoad() {
    this.loadCart();
  },

  onShow() {
    this.loadCart();
  },

  async loadCart() {
    try {
      const res = await cartApi.getCart();
      const cartItems = res.data.items.map(item => ({
        ...item,
        selected: this.data.selectedItems.includes(item.id),
      }));

      this.setData({
        cartItems,
        isLoading: false,
      });

      this.calculateTotal();
    } catch (error) {
      console.error('加载购物车失败:', error);
      this.setData({ isLoading: false });
    }
  },

  async updateQuantity(e) {
    const { id, action } = e.currentTarget.dataset;
    const { cartItems } = this.data;
    const item = cartItems.find(i => i.id === id);

    if (!item) { return; }

    let newQuantity = item.quantity;
    if (action === 'increase') {
      newQuantity++;
    } else if (action === 'decrease') {
      if (newQuantity <= 1) {
        await this.removeItem(id);
        return;
      }
      newQuantity--;
    }

    try {
      await cartApi.updateCart({
        itemId: id,
        quantity: newQuantity,
      });

      item.quantity = newQuantity;
      this.setData({ cartItems });
      this.calculateTotal();
    } catch (error) {
      console.error('更新数量失败:', error);
    }
  },

  async removeItem(itemId) {
    const confirmed = await showModal('提示', '确定要删除该商品吗？');

    if (!confirmed) { return; }

    try {
      await cartApi.removeFromCart(itemId);

      const { cartItems, selectedItems } = this.data;
      const newCartItems = cartItems.filter(i => i.id !== itemId);
      const newSelectedItems = selectedItems.filter(id => id !== itemId);

      this.setData({
        cartItems: newCartItems,
        selectedItems: newSelectedItems,
      });

      this.calculateTotal();
      showToast('已删除');
    } catch (error) {
      console.error('删除商品失败:', error);
    }
  },

  toggleSelect(e) {
    const { id } = e.currentTarget.dataset;
    const { selectedItems, cartItems } = this.data;

    const index = selectedItems.indexOf(id);
    if (index > -1) {
      selectedItems.splice(index, 1);
    } else {
      selectedItems.push(id);
    }

    const isAllSelected = selectedItems.length === cartItems.length;

    this.setData({ selectedItems, isAllSelected });
    this.calculateTotal();
  },

  toggleSelectAll() {
    const { isAllSelected, cartItems } = this.data;

    if (isAllSelected) {
      this.setData({
        selectedItems: [],
        isAllSelected: false,
      });
    } else {
      const allIds = cartItems.map(item => item.id);
      this.setData({
        selectedItems: allIds,
        isAllSelected: true,
      });
    }

    this.calculateTotal();
  },

  calculateTotal() {
    const { cartItems, selectedItems } = this.data;
    let total = 0;

    cartItems.forEach(item => {
      if (selectedItems.includes(item.id)) {
        total += item.price * item.quantity;
      }
    });

    this.setData({ totalPrice: total });
  },

  async clearCart() {
    const confirmed = await showModal('提示', '确定要清空购物车吗？');

    if (!confirmed) { return; }

    try {
      await cartApi.clearCart();
      this.setData({
        cartItems: [],
        selectedItems: [],
        totalPrice: 0,
        isAllSelected: false,
      });
      showToast('已清空');
    } catch (error) {
      console.error('清空购物车失败:', error);
    }
  },

  goToProduct(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/product-detail/product-detail?id=${id}`,
    });
  },

  goToShop() {
    wx.switchTab({ url: '/pages/shop/shop' });
  },


});

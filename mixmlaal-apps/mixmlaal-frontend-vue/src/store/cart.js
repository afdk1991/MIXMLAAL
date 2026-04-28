import { defineStore } from 'pinia';

// API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3004';

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [],
    isLoading: false,
    error: null,
    couponCode: '',
    discount: 0,
    shippingFee: 0
  }),

  getters: {
    getItems: state => state.items,
    getItemCount: state => state.items.reduce((total, item) => total + item.quantity, 0),
    getTotalPrice: state => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    getSubtotal: state => state.items.reduce((total, item) => total + (item.price * item.quantity), 0),
    getTotalWithShipping: state => {
      const subtotal = state.items.reduce((total, item) => total + (item.price * item.quantity), 0);
      return subtotal + state.shippingFee - state.discount;
    },
    getError: state => state.error,
    getCouponCode: state => state.couponCode,
    getDiscount: state => state.discount,
    getShippingFee: state => state.shippingFee,
    isEmpty: state => state.items.length === 0
  },

  actions: {
    // 设置商品
    setItems(items) {
      this.items = items;
      this.saveToLocalStorage();
    },

    // 设置错误信息
    setError(error) {
      this.error = error;
    },

    // 设置加载状态
    setLoading(loading) {
      this.isLoading = loading;
    },

    // 设置优惠券
    setCouponCode(couponCode) {
      this.couponCode = couponCode;
      localStorage.setItem('cart_coupon', couponCode);
    },

    // 设置折扣
    setDiscount(discount) {
      this.discount = discount;
    },

    // 设置运费
    setShippingFee(fee) {
      this.shippingFee = fee;
    },

    // 添加商品
    addItem(product, quantity = 1) {
      const existingItem = this.items.find(item => item.productId === product.productId);

      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        this.items.push({
          ...product,
          quantity: quantity,
        });
      }

      this.saveToLocalStorage();
      this.calculateShippingFee();
    },

    // 移除商品
    removeItem(productId) {
      this.items = this.items.filter(item => item.productId !== productId);
      this.saveToLocalStorage();
      this.calculateShippingFee();
    },

    // 更新商品数量
    updateQuantity(productId, quantity) {
      if (quantity <= 0) {
        this.removeItem(productId);
      } else {
        const item = this.items.find(item => item.productId === productId);
        if (item) {
          item.quantity = quantity;
          this.saveToLocalStorage();
          this.calculateShippingFee();
        }
      }
    },

    // 清空购物车
    clearCart() {
      this.items = [];
      this.couponCode = '';
      this.discount = 0;
      this.shippingFee = 0;
      this.saveToLocalStorage();
      localStorage.removeItem('cart_coupon');
    },

    // 保存到本地存储
    saveToLocalStorage() {
      localStorage.setItem('cart', JSON.stringify(this.items));
    },

    // 从本地存储加载
    loadFromLocalStorage() {
      try {
        const cart = localStorage.getItem('cart');
        const coupon = localStorage.getItem('cart_coupon');
        
        if (cart) {
          this.items = JSON.parse(cart);
        }
        
        if (coupon) {
          this.couponCode = coupon;
        }
        
        this.calculateShippingFee();
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        this.items = [];
      }
    },

    // 计算运费
    calculateShippingFee() {
      const itemCount = this.getItemCount;
      if (itemCount === 0) {
        this.shippingFee = 0;
      } else if (this.getSubtotal >= 99) {
        this.shippingFee = 0; // 满99免运费
      } else {
        this.shippingFee = 10; // 基础运费
      }
    },

    // 应用优惠券
    async applyCoupon(couponCode) {
      try {
        this.setLoading(true);
        this.setError(null);

        const response = await fetch(`${API_BASE_URL}/api/v1/coupons/validate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
          body: JSON.stringify({ couponCode, totalAmount: this.getSubtotal }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.setCouponCode(couponCode);
          this.setDiscount(data.data.discount);
          return true;
        } else {
          this.setError(data.message);
          return false;
        }
      } catch (error) {
        this.setError('优惠券验证失败，请稍后重试');
        return false;
      } finally {
        this.setLoading(false);
      }
    },

    // 结算
    async checkout() {
      try {
        this.setLoading(true);
        this.setError(null);

        // 检查是否有选中的商品
        if (this.items.length === 0) {
          this.setError('购物车为空，无法结算');
          return null;
        }

        const response = await fetch(`${API_BASE_URL}/api/v1/order/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('access_token') || 'test-token'}`,
          },
          body: JSON.stringify({
            type: 'ecommerce',
            totalAmount: this.getTotalWithShipping,
            subtotal: this.getSubtotal,
            shippingFee: this.shippingFee,
            discount: this.discount,
            couponCode: this.couponCode,
            items: this.items,
            remark: `购物车结算：${this.items.length}件商品`,
          }),
        });

        const data = await response.json();

        if (data.status === 'success') {
          this.clearCart();
          return data.data.orderId;
        } else {
          this.setError(data.message || '创建订单失败');
          return null;
        }
      } catch (error) {
        console.error('Checkout failed:', error);
        this.setError('结算失败，请稍后重试');
        return null;
      } finally {
        this.setLoading(false);
      }
    },
  },
});

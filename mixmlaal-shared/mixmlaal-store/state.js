/**
 * MIXMLAAL 通用Store模块
 * 版本: v1.0.0.0
 * 说明: 提供全局状态管理，包括用户状态、购物车、主题、语言设置等
 */

class Store {
  constructor() {
    this.state = {
      user: null,
      token: null,
      cart: [],
      theme: 'light',
      language: 'zh-CN',
      notifications: [],
      unreadCount: 0,
      isLoading: false,
    };

    this.listeners = new Map();
    this.init();
  }

  init() {
    this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const userData = localStorage.getItem('mixmlaal_user');
      const token = localStorage.getItem('mixmlaal_token');
      const cartData = localStorage.getItem('mixmlaal_cart');
      const theme = localStorage.getItem('mixmlaal_theme');
      const language = localStorage.getItem('mixmlaal_language');

      if (userData) {
        this.state.user = JSON.parse(userData);
      }
      if (token) {
        this.state.token = token;
      }
      if (cartData) {
        this.state.cart = JSON.parse(cartData);
      }
      if (theme) {
        this.state.theme = theme;
      }
      if (language) {
        this.state.language = language;
      }
    } catch (error) {
      console.error('Load from storage error:', error);
    }
  }

  getState() {
    return { ...this.state };
  }

  setState(newState) {
    const prevState = { ...this.state };
    this.state = { ...this.state, ...newState };
    this.notifyListeners(prevState, this.state);
  }

  subscribe(key, callback) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, []);
    }
    this.listeners.get(key).push(callback);

    return () => {
      const callbacks = this.listeners.get(key);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    };
  }

  notifyListeners(prevState, newState) {
    this.listeners.forEach((callbacks, key) => {
      if (prevState[key] !== newState[key]) {
        callbacks.forEach(callback => callback(newState[key], prevState[key]));
      }
    });
  }

  setUser(user) {
    this.setState({ user });
    if (user) {
      localStorage.setItem('mixmlaal_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('mixmlaal_user');
    }
  }

  setToken(token) {
    this.setState({ token });
    if (token) {
      localStorage.setItem('mixmlaal_token', token);
    } else {
      localStorage.removeItem('mixmlaal_token');
    }
  }

  setTheme(theme) {
    this.setState({ theme });
    localStorage.setItem('mixmlaal_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }

  setLanguage(language) {
    this.setState({ language });
    localStorage.setItem('mixmlaal_language', language);
  }

  addToCart(item) {
    const existingIndex = this.state.cart.findIndex(i => i.productId === item.productId);
    let newCart;

    if (existingIndex > -1) {
      newCart = [...this.state.cart];
      newCart[existingIndex].quantity += item.quantity || 1;
    } else {
      newCart = [...this.state.cart, { ...item, quantity: item.quantity || 1 }];
    }

    this.setState({ cart: newCart });
    localStorage.setItem('mixmlaal_cart', JSON.stringify(newCart));
  }

  removeFromCart(productId) {
    const newCart = this.state.cart.filter(i => i.productId !== productId);
    this.setState({ cart: newCart });
    localStorage.setItem('mixmlaal_cart', JSON.stringify(newCart));
  }

  updateCartQuantity(productId, quantity) {
    const newCart = this.state.cart.map(i => {
      if (i.productId === productId) {
        return { ...i, quantity };
      }
      return i;
    });
    this.setState({ cart: newCart });
    localStorage.setItem('mixmlaal_cart', JSON.stringify(newCart));
  }

  clearCart() {
    this.setState({ cart: [] });
    localStorage.removeItem('mixmlaal_cart');
  }

  getCartTotal() {
    return this.state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getCartCount() {
    return this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
  }

  setNotifications(notifications) {
    this.setState({ notifications });
  }

  addNotification(notification) {
    const newNotifications = [notification, ...this.state.notifications];
    this.setState({
      notifications: newNotifications,
      unreadCount: this.state.unreadCount + 1
    });
  }

  setUnreadCount(count) {
    this.setState({ unreadCount: count });
  }

  markNotificationRead(notificationId) {
    const newNotifications = this.state.notifications.map(n => {
      if (n.notificationId === notificationId && !n.read) {
        return { ...n, read: true };
      }
      return n;
    });
    const unreadCount = newNotifications.filter(n => !n.read).length;
    this.setState({ notifications: newNotifications, unreadCount });
  }

  setLoading(isLoading) {
    this.setState({ isLoading });
  }

  logout() {
    this.setState({
      user: null,
      token: null,
      cart: [],
      notifications: [],
      unreadCount: 0,
    });
    localStorage.removeItem('mixmlaal_user');
    localStorage.removeItem('mixmlaal_token');
    localStorage.removeItem('mixmlaal_cart');
  }

  isLoggedIn() {
    return !!this.state.token && !!this.state.user;
  }
}

const mixmlaalStore = new Store();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = mixmlaalStore;
}

if (typeof window !== 'undefined') {
  window.MIXMLAAL = window.MIXMLAAL || {};
  window.MIXMLAAL.Store = mixmlaalStore;
}
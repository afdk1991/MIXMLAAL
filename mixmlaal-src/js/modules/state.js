// 应用状态管理模块
import { Storage } from './storage.js';
import { EventBus } from './event-bus.js';

export const State = {
  state: {
    user: null,
    isLoggedIn: false,
    theme: 'light',
    language: 'zh-CN',
    notifications: [],
    cart: [],
  },

  init() {
    console.log('State module initialized');
    // 从本地存储加载状态
    const savedState = Storage.get('appState');
    if (savedState) {
      this.state = { ...this.state, ...savedState };
    }
  },

  get(key) {
    return this.state[key];
  },

  set(key, value) {
    this.state[key] = value;
    this.save();
    EventBus.emit(`state:change:${key}`, value);
  },

  update(key, updater) {
    if (typeof updater === 'function') {
      this.state[key] = updater(this.state[key]);
    } else {
      this.state[key] = { ...this.state[key], ...updater };
    }
    this.save();
    EventBus.emit(`state:change:${key}`, this.state[key]);
  },

  save() {
    Storage.set('appState', this.state);
  },

  clear() {
    this.state = {
      user: null,
      isLoggedIn: false,
      theme: 'light',
      language: 'zh-CN',
      notifications: [],
      cart: [],
    };
    this.save();
    EventBus.emit('state:reset');
  },

  // 特定功能的状态管理
  setUser(user) {
    this.set('user', user);
    this.set('isLoggedIn', !!user);
  },

  addToCart(item) {
    const cart = this.get('cart');
    const existingItem = cart.find(i => i.id === item.id);
    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ ...item, quantity: 1 });
    }
    this.set('cart', cart);
  },

  removeFromCart(itemId) {
    const cart = this.get('cart').filter(item => item.id !== itemId);
    this.set('cart', cart);
  },

  addNotification(notification) {
    const notifications = this.get('notifications');
    notifications.unshift({ ...notification, id: Date.now() });
    this.set('notifications', notifications);
  },

  removeNotification(notificationId) {
    const notifications = this.get('notifications').filter(n => n.id !== notificationId);
    this.set('notifications', notifications);
  },
};

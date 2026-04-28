// 本地存储模块
export const Storage = {
  prefix: 'mixmlaal_',
  init() {
    console.log('Storage module initialized');
  },
  set(key, value) {
    try {
      localStorage.setItem(this.prefix + key, JSON.stringify(value));
    } catch (e) {
      console.warn('Storage error:', e);
    }
  },
  get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(this.prefix + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  },
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  },
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  },
};

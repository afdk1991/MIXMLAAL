/**
 * MIXMLAAL 通用工具函数库
 * 版本: v1.0.0.0
 * 说明: 提供平台各模块通用的工具函数
 */

const Utils = {
  /**
   * 防抖函数
   * @param {Function} fn - 要执行的函数
   * @param {number} delay - 延迟时间（毫秒）
   * @returns {Function}
   */
  debounce(fn, delay = 300) {
    let timer = null;
    return function (...args) {
      if (timer) { clearTimeout(timer); }
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },

  /**
   * 节流函数
   * @param {Function} fn - 要执行的函数
   * @param {number} interval - 间隔时间（毫秒）
   * @returns {Function}
   */
  throttle(fn, interval = 300) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= interval) {
        lastTime = now;
        fn.apply(this, args);
      }
    };
  },

  /**
   * 深拷贝
   * @param {*} obj - 要拷贝的对象
   * @returns {*}
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') { return obj; }
    if (obj instanceof Date) { return new Date(obj); }
    if (obj instanceof Array) { return obj.map(item => this.deepClone(item)); }
    if (obj instanceof Object) {
      const cloned = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          cloned[key] = this.deepClone(obj[key]);
        }
      }
      return cloned;
    }
    return obj;
  },

  /**
   * 格式化日期
   * @param {Date|string|number} date - 日期对象或时间戳
   * @param {string} format - 格式模板
   * @returns {string}
   */
  formatDate(date, format = 'YYYY-MM-DD HH:mm:ss') {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');

    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  /**
   * 生成唯一ID
   * @param {string} prefix - ID前缀
   * @returns {string}
   */
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * 本地存储封装
   */
  storage: {
    set(key, value, expire = null) {
      const data = {
        value,
        expire: expire ? Date.now() + expire : null,
      };
      localStorage.setItem(key, JSON.stringify(data));
    },

    get(key) {
      const data = localStorage.getItem(key);
      if (!data) { return null; }
      try {
        const parsed = JSON.parse(data);
        if (parsed.expire && Date.now() > parsed.expire) {
          localStorage.removeItem(key);
          return null;
        }
        return parsed.value;
      } catch {
        return null;
      }
    },

    remove(key) {
      localStorage.removeItem(key);
    },

    clear() {
      localStorage.clear();
    },
  },

  /**
   * URL参数处理
   */
  url: {
    getParam(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    },

    setParam(name, value) {
      const url = new URL(window.location.href);
      url.searchParams.set(name, value);
      window.history.pushState({}, '', url);
    },

    removeParam(name) {
      const url = new URL(window.location.href);
      url.searchParams.delete(name);
      window.history.pushState({}, '', url);
    },
  },

  /**
   * 数据验证
   */
  validator: {
    isPhone(phone) {
      return /^1[3-9]\d{9}$/.test(phone);
    },

    isEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    isIdCard(idCard) {
      return /^\d{17}[\dXx]$/.test(idCard);
    },

    isLicensePlate(plate) {
      return /^[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-HJ-NP-Z0-9]{4,5}[A-HJ-NP-Z0-9挂学警港澳]$/.test(plate);
    },
  },

  /**
   * 金额格式化
   * @param {number} amount - 金额
   * @param {number} decimals - 小数位数
   * @returns {string}
   */
  formatMoney(amount, decimals = 2) {
    return `¥${parseFloat(amount).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
  },

  /**
   * 距离格式化
   * @param {number} meters - 距离（米）
   * @returns {string}
   */
  formatDistance(meters) {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  },

  /**
   * 时间格式化（相对时间）
   * @param {Date|string|number} date - 日期
   * @returns {string}
   */
  formatRelativeTime(date) {
    const now = Date.now();
    const diff = now - new Date(date).getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) { return '刚刚'; }
    if (diff < hour) { return `${Math.floor(diff / minute)}分钟前`; }
    if (diff < day) { return `${Math.floor(diff / hour)}小时前`; }
    if (diff < 7 * day) { return `${Math.floor(diff / day)}天前`; }
    return this.formatDate(date, 'YYYY-MM-DD');
  },

  /**
   * 随机数生成
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number}
   */
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * 数组乱序
   * @param {Array} arr - 数组
   * @returns {Array}
   */
  shuffle(arr) {
    const result = [...arr];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  },

  /**
   * 文件大小格式化
   * @param {number} bytes - 字节数
   * @returns {string}
   */
  formatFileSize(bytes) {
    if (bytes === 0) { return '0 B'; }
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

if (typeof window !== 'undefined') {
  window.MIXMLAAL = window.MIXMLAAL || {};
  window.MIXMLAAL.Utils = Utils;
}

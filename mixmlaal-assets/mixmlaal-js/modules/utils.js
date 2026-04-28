/**
 * 工具函数模块
 * 提供各种实用工具函数
 */
class Utils {
  constructor() {
    this.debounceTimers = new Map();
    this.throttleTimers = new Map();
  }

  /**
     * 初始化工具模块
     */
  initialize() {
    console.log('🛠️ Utils 模块初始化');
    return Promise.resolve();
  }

  // 防抖函数
  debounce(func, wait, options = {}) {
    const { leading = false, trailing = true, maxWait = null } = options;
    let lastCallTime = null;
    let lastInvokeTime = null;
    let result = null;
    let timeout = null;

    const invokeFunc = time => {
      const args = arguments;
      lastInvokeTime = time;
      result = func.apply(this, args);
    };

    const leadingEdge = time => {
      lastInvokeTime = time;
      timeout = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    };

    const remainingWait = time => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      const timeWaiting = wait - timeSinceLastCall;

      return maxWait !== null
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    };

    const shouldInvoke = time => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;

      return (lastCallTime === null || timeSinceLastCall >= wait ||
                    timeSinceLastCall < 0 || (maxWait !== null && timeSinceLastInvoke >= maxWait));
    };

    const timerExpired = () => {
      const time = Date.now();
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      timeout = setTimeout(timerExpired, remainingWait(time));
    };

    const trailingEdge = time => {
      timeout = null;
      if (trailing && lastCallTime !== null) {
        return invokeFunc(time);
      }
      lastCallTime = null;
      lastInvokeTime = null;
      return result;
    };

    const debounced = (...args) => {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);

      lastCallTime = time;

      if (isInvoking) {
        if (timeout === null) {
          return leadingEdge(lastCallTime);
        }
        if (maxWait !== null) {
          timeout = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      if (timeout === null) {
        timeout = setTimeout(timerExpired, wait);
      }
      return result;
    };

    debounced.cancel = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      lastCallTime = null;
      lastInvokeTime = null;
      timeout = null;
    };

    return debounced;
  }

  // 节流函数
  throttle(func, wait, options = {}) {
    const { leading = true, trailing = true } = options;
    const lastFunc = null;
    let lastRan = null;
    let timeout = null;

    const invokeFunc = () => {
      func.apply(this, arguments);
      lastRan = Date.now();
    };

    const throttled = (...args) => {
      const now = Date.now();
      const remaining = wait - (now - lastRan);

      if (remaining <= 0 || remaining > wait) {
        if (timeout !== null) {
          clearTimeout(timeout);
          timeout = null;
        }
        lastRan = now;
        func.apply(this, args);
      } else if (timeout === null && trailing) {
        timeout = setTimeout(() => {
          lastRan = Date.now();
          timeout = null;
          func.apply(this, args);
        }, remaining);
      }
    };

    throttled.cancel = () => {
      if (timeout !== null) {
        clearTimeout(timeout);
      }
      lastRan = null;
      timeout = null;
    };

    return throttled;
  }

  // 深拷贝
  deepClone(obj, hash = new WeakMap()) {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }

    if (hash.has(obj)) {
      return hash.get(obj);
    }

    if (obj instanceof Date) {
      return new Date(obj.getTime());
    }

    if (obj instanceof RegExp) {
      return new RegExp(obj.source, obj.flags);
    }

    if (obj instanceof Array) {
      const cloneArr = [];
      hash.set(obj, cloneArr);
      for (let i = 0; i < obj.length; i++) {
        cloneArr[i] = this.deepClone(obj[i], hash);
      }
      return cloneArr;
    }

    if (obj instanceof Object) {
      const cloneObj = {};
      hash.set(obj, cloneObj);
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloneObj[key] = this.deepClone(obj[key], hash);
        }
      }
      return cloneObj;
    }
  }

  // 格式化日期
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
  }

  // 格式化文件大小
  formatFileSize(bytes) {
    if (bytes === 0) { return '0 Bytes'; }
    if (bytes === null || typeof bytes !== 'number') { return 'Invalid size'; }

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  // 生成唯一ID
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  // 验证邮箱
  isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // 验证手机号
  isValidPhone(phone) {
    const re = /^1[3-9]\d{9}$/;
    return re.test(phone);
  }

  // 验证URL
  isValidURL(url) {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }

  // 截断文本
  truncateText(text, maxLength, suffix = '...') {
    if (!text || text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  // 获取URL参数
  getURLParams(url = window.location.href) {
    const params = new URL(url).searchParams;
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  }

  // 下载文件
  downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || url.split('/').pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // 复制到剪贴板
  async copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        return true;
      } catch (error) {
        console.error('复制失败:', error);
        return false;
      } finally {
        document.body.removeChild(textArea);
      }
    }
  }

  // 检测元素是否在视口中
  isElementInViewport(el) {
    const rect = el.getBoundingClientRect();
    return (
      rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  // 平滑滚动到元素
  scrollToElement(element, options = {}) {
    const { behavior = 'smooth', block = 'start', inline = 'nearest' } = options;
    element.scrollIntoView({ behavior, block, inline });
  }

  // 获取元素的CSS变量值
  getCSSVariable(element, variable) {
    return getComputedStyle(element).getPropertyValue(variable);
  }

  // 设置元素的CSS变量值
  setCSSVariable(element, variable, value) {
    element.style.setProperty(variable, value);
  }

  // 检测暗黑模式
  isDarkMode() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  // 监听暗黑模式变化
  listenDarkModeChange(callback) {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    }
    return () => {};
  }

  // 生成随机颜色
  generateRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // 颜色转换: HEX to RGB
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    } : null;
  }

  // 颜色转换: RGB to HEX
  rgbToHex(r, g, b) {
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  // 延迟函数
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 随机数生成
  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  // 数组去重
  uniqueArray(arr) {
    return [...new Set(arr)];
  }

  // 对象合并
  mergeObjects(target, ...sources) {
    return Object.assign(target, ...sources);
  }

  // 检查对象是否为空
  isEmptyObject(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  }

  // 获取对象的深度
  getObjectDepth(obj) {
    if (typeof obj !== 'object' || obj === null) { return 0; }
    const depths = Object.values(obj).map(value => this.getObjectDepth(value));
    return Math.max(...depths, 0) + 1;
  }

  // 防抖函数（简化版）
  simpleDebounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  }

  // 节流函数（简化版）
  simpleThrottle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }
}

// 导出工具实例
const UtilsInstance = new Utils();
window.Utils = UtilsInstance;

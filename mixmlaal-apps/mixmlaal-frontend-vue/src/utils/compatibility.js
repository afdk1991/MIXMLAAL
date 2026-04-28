/**
 * 兼容性工具
 * 版本: v1.0.0.0
 * 说明: 处理不同环境下的兼容性问题，包括兼容低版本浏览器、统一处理时间格式等
 */

// 时间处理工具
const timeUtils = {
  // 格式化时间
  format: (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    if (!date) return '';
    
    // 转换为Date对象
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    // 检查是否为有效日期
    if (isNaN(d.getTime())) return '';
    
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
  
  // 解析时间
  parse: (dateString) => {
    if (!dateString) return null;
    
    // 处理不同格式的时间字符串
    const formats = [
      'YYYY-MM-DD HH:mm:ss',
      'YYYY/MM/DD HH:mm:ss',
      'YYYY-MM-DD',
      'YYYY/MM/DD',
      'MM-DD-YYYY',
      'MM/DD/YYYY'
    ];
    
    for (const format of formats) {
      const date = timeUtils.parseWithFormat(dateString, format);
      if (date) return date;
    }
    
    // 尝试直接解析
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  },
  
  // 按指定格式解析时间
  parseWithFormat: (dateString, format) => {
    const regex = /(YYYY|MM|DD|HH|mm|ss)/g;
    const matches = format.match(regex);
    
    if (!matches) return null;
    
    let year, month, day, hours = 0, minutes = 0, seconds = 0;
    
    for (const match of matches) {
      const index = format.indexOf(match);
      const length = match.length;
      const value = dateString.substring(index, index + length);
      
      switch (match) {
        case 'YYYY':
          year = parseInt(value, 10);
          break;
        case 'MM':
          month = parseInt(value, 10) - 1;
          break;
        case 'DD':
          day = parseInt(value, 10);
          break;
        case 'HH':
          hours = parseInt(value, 10);
          break;
        case 'mm':
          minutes = parseInt(value, 10);
          break;
        case 'ss':
          seconds = parseInt(value, 10);
          break;
      }
    }
    
    if (year && month !== undefined && day) {
      const date = new Date(year, month, day, hours, minutes, seconds);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  },
  
  // 计算时间差
  diff: (date1, date2, unit = 'millisecond') => {
    const d1 = typeof date1 === 'string' || typeof date1 === 'number' ? new Date(date1) : date1;
    const d2 = typeof date2 === 'string' || typeof date2 === 'number' ? new Date(date2) : date2;
    
    if (isNaN(d1.getTime()) || isNaN(d2.getTime())) return 0;
    
    const diff = Math.abs(d1.getTime() - d2.getTime());
    
    switch (unit) {
      case 'second':
        return Math.floor(diff / 1000);
      case 'minute':
        return Math.floor(diff / (1000 * 60));
      case 'hour':
        return Math.floor(diff / (1000 * 60 * 60));
      case 'day':
        return Math.floor(diff / (1000 * 60 * 60 * 24));
      default:
        return diff;
    }
  },
  
  // 获取相对时间
  fromNow: (date) => {
    const now = new Date();
    const d = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    
    if (isNaN(d.getTime())) return '';
    
    const diff = now.getTime() - d.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return `${days}天前`;
    } else if (hours > 0) {
      return `${hours}小时前`;
    } else if (minutes > 0) {
      return `${minutes}分钟前`;
    } else if (seconds > 0) {
      return `${seconds}秒前`;
    } else {
      return '刚刚';
    }
  }
};

// 兼容性检测
const compatibility = {
  // 检测浏览器类型
  getBrowser: () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf('Chrome') > -1) {
      return 'chrome';
    } else if (userAgent.indexOf('Firefox') > -1) {
      return 'firefox';
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      return 'safari';
    } else if (userAgent.indexOf('Edge') > -1) {
      return 'edge';
    } else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
      return 'ie';
    } else {
      return 'unknown';
    }
  },
  
  // 检测浏览器版本
  getBrowserVersion: () => {
    const userAgent = navigator.userAgent;
    let version = '';
    
    if (userAgent.indexOf('Chrome') > -1) {
      version = userAgent.match(/Chrome\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Firefox') > -1) {
      version = userAgent.match(/Firefox\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      version = userAgent.match(/Version\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Edge') > -1) {
      version = userAgent.match(/Edge\/(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('MSIE') > -1) {
      version = userAgent.match(/MSIE\s(\d+\.\d+)/)[1];
    } else if (userAgent.indexOf('Trident') > -1) {
      version = userAgent.match(/rv:(\d+\.\d+)/)[1];
    }
    
    return version;
  },
  
  // 检测操作系统
  getOS: () => {
    const userAgent = navigator.userAgent;
    
    if (userAgent.indexOf('Windows') > -1) {
      return 'windows';
    } else if (userAgent.indexOf('Macintosh') > -1) {
      return 'mac';
    } else if (userAgent.indexOf('Linux') > -1) {
      return 'linux';
    } else if (userAgent.indexOf('Android') > -1) {
      return 'android';
    } else if (userAgent.indexOf('iPhone') > -1 || userAgent.indexOf('iPad') > -1) {
      return 'ios';
    } else {
      return 'unknown';
    }
  },
  
  // 检测是否支持某个特性
  support: (feature) => {
    switch (feature) {
      case 'Promise':
        return typeof Promise !== 'undefined';
      case 'fetch':
        return typeof fetch !== 'undefined';
      case 'localStorage':
        try {
          localStorage.setItem('test', 'test');
          localStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      case 'sessionStorage':
        try {
          sessionStorage.setItem('test', 'test');
          sessionStorage.removeItem('test');
          return true;
        } catch (e) {
          return false;
        }
      case 'WebSocket':
        return typeof WebSocket !== 'undefined';
      case 'IntersectionObserver':
        return typeof IntersectionObserver !== 'undefined';
      case 'MutationObserver':
        return typeof MutationObserver !== 'undefined';
      case 'ResizeObserver':
        return typeof ResizeObserver !== 'undefined';
      case 'CSSVariables':
        return window.CSS && window.CSS.supports && window.CSS.supports('--a', 0);
      case 'ES6':
        try {
          eval('const a = () => {}');
          return true;
        } catch (e) {
          return false;
        }
      default:
        return false;
    }
  },
  
  // 加载 polyfill
  loadPolyfill: (features) => {
    const polyfills = [];
    
    if (features.includes('Promise') && !compatibility.support('Promise')) {
      polyfills.push('https://cdn.jsdelivr.net/npm/promise-polyfill@8.2.0/dist/polyfill.min.js');
    }
    
    if (features.includes('fetch') && !compatibility.support('fetch')) {
      polyfills.push('https://cdn.jsdelivr.net/npm/whatwg-fetch@3.6.2/dist/fetch.umd.min.js');
    }
    
    if (features.includes('IntersectionObserver') && !compatibility.support('IntersectionObserver')) {
      polyfills.push('https://cdn.jsdelivr.net/npm/intersection-observer@0.12.2/intersection-observer.min.js');
    }
    
    // 加载 polyfill
    polyfills.forEach(src => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      document.head.appendChild(script);
    });
  },
  
  // 检测网络状态
  getNetworkStatus: () => {
    if (navigator.onLine) {
      return 'online';
    } else {
      return 'offline';
    }
  },
  
  // 监听网络状态变化
  onNetworkChange: (callback) => {
    window.addEventListener('online', () => callback('online'));
    window.addEventListener('offline', () => callback('offline'));
  }
};

// 工具函数
const utils = {
  // 深拷贝
  deepClone: (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => utils.deepClone(item));
    if (typeof obj === 'object') {
      const clonedObj = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clonedObj[key] = utils.deepClone(obj[key]);
        }
      }
      return clonedObj;
    }
  },
  
  // 节流函数
  throttle: (fn, delay) => {
    let lastCall = 0;
    return function(...args) {
      const now = Date.now();
      if (now - lastCall >= delay) {
        lastCall = now;
        return fn.apply(this, args);
      }
    };
  },
  
  // 防抖函数
  debounce: (fn, delay) => {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(this, args);
      }, delay);
    };
  },
  
  // 生成唯一ID
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // 检测是否为空
  isEmpty: (value) => {
    if (value === null || value === undefined) return true;
    if (typeof value === 'string') return value.trim() === '';
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === 'object') return Object.keys(value).length === 0;
    return false;
  },
  
  // 安全的JSON解析
  safeJSONParse: (jsonString, defaultValue = null) => {
    try {
      return JSON.parse(jsonString);
    } catch (e) {
      return defaultValue;
    }
  },
  
  // 安全的JSON序列化
  safeJSONStringify: (obj, defaultValue = '{}') => {
    try {
      return JSON.stringify(obj);
    } catch (e) {
      return defaultValue;
    }
  }
};

// 导出工具
export default {
  time: timeUtils,
  compatibility,
  utils
};

// 导出时间处理工具
export { timeUtils };

// 导出兼容性检测工具
export { compatibility };

// 导出工具函数
export { utils };

// 导入共享的工具函数
import sharedUtils from '../../../shared/utils/index.js';

// 扩展共享工具函数
export const Utils = {
  ...sharedUtils,

  // 格式化数字
  formatNumber(num) {
    if (num >= 1000000000) {
      return `${(num / 1000000000).toFixed(1)}G`;
    } else if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  },

  // 检查是否为空对象
  isEmpty(obj) {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
  },

  // 检查是否为数组
  isArray(obj) {
    return Array.isArray(obj);
  },

  // 检查是否为函数
  isFunction(obj) {
    return typeof obj === 'function';
  },

  // 检查是否为字符串
  isString(obj) {
    return typeof obj === 'string';
  },

  // 检查是否为数字
  isNumber(obj) {
    return typeof obj === 'number' && !isNaN(obj);
  },

  // 检查是否为布尔值
  isBoolean(obj) {
    return typeof obj === 'boolean';
  },

  // 检查是否为对象
  isObject(obj) {
    return obj && typeof obj === 'object' && !Array.isArray(obj);
  },
};

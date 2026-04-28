// 跨平台适配工具，模拟uni-app API，使代码能够在多平台运行
import axios from 'axios';
import { useRouter } from 'vue-router';

// 全局router实例
let router = null;

// 平台检测
const platform = {
  isWeb: typeof window !== 'undefined' && typeof window.navigator !== 'undefined',
  isMobile: typeof window !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(window.navigator.userAgent),
  isIOS: typeof window !== 'undefined' && /iPhone|iPad|iPod/i.test(window.navigator.userAgent),
  isAndroid: typeof window !== 'undefined' && /Android/i.test(window.navigator.userAgent),
  isElectron: typeof window !== 'undefined' && window.process && window.process.type === 'renderer',
  isMiniApp: typeof wx !== 'undefined' || typeof my !== 'undefined' || typeof tt !== 'undefined'
};

// 设置router实例
export function setRouter(r) {
  router = r;
}

// 模拟uni.showToast
export function showToast(options) {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      wx.showToast(options);
    } else if (typeof my !== 'undefined') {
      my.showToast(options);
    } else if (typeof tt !== 'undefined') {
      tt.showToast(options);
    }
  } else if (platform.isWeb) {
    // Web环境
    // 创建自定义Toast
    const toast = document.createElement('div');
    toast.className = 'uni-toast';
    toast.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.7);
      color: white;
      padding: 10px 20px;
      border-radius: 4px;
      z-index: 9999;
      font-size: 14px;
    `;
    toast.textContent = options.title;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.remove();
    }, options.duration || 2000);
  }
}

// 模拟uni.request
export async function request(options) {
  try {
    if (platform.isMiniApp) {
      // 小程序环境
      return new Promise((resolve, reject) => {
        if (typeof wx !== 'undefined') {
          wx.request({
            ...options,
            success: resolve,
            fail: reject
          });
        } else if (typeof my !== 'undefined') {
          my.request({
            ...options,
            success: resolve,
            fail: reject
          });
        } else if (typeof tt !== 'undefined') {
          tt.request({
            ...options,
            success: resolve,
            fail: reject
          });
        }
      });
    } else {
      // Web环境
      const response = await axios({
        url: options.url,
        method: options.method || 'GET',
        data: options.data,
        headers: options.header || {}
      });
      return {
        data: response.data
      };
    }
  } catch (error) {
    throw error;
  }
}

// 模拟uni.setStorageSync
export function setStorageSync(key, value) {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      wx.setStorageSync(key, value);
    } else if (typeof my !== 'undefined') {
      my.setStorageSync({ key, data: value });
    } else if (typeof tt !== 'undefined') {
      tt.setStorageSync(key, value);
    }
  } else if (platform.isWeb) {
    // Web环境
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
}

// 模拟uni.getStorageSync
export function getStorageSync(key) {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      return wx.getStorageSync(key);
    } else if (typeof my !== 'undefined') {
      return my.getStorageSync({ key }).data;
    } else if (typeof tt !== 'undefined') {
      return tt.getStorageSync(key);
    }
  } else if (platform.isWeb) {
    // Web环境
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage error:', error);
      return null;
    }
  }
  return null;
}

// 模拟uni.switchTab
export function switchTab(options) {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      wx.switchTab(options);
    } else if (typeof my !== 'undefined') {
      my.switchTab(options);
    } else if (typeof tt !== 'undefined') {
      tt.switchTab(options);
    }
  } else if (platform.isWeb && router) {
    // Web环境
    router.push(options.url);
  }
}

// 模拟uni.navigateTo
export function navigateTo(options) {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      wx.navigateTo(options);
    } else if (typeof my !== 'undefined') {
      my.navigateTo(options);
    } else if (typeof tt !== 'undefined') {
      tt.navigateTo(options);
    }
  } else if (platform.isWeb && router) {
    // Web环境
    router.push(options.url);
  }
}

// 模拟uni.navigateBack
export function navigateBack() {
  if (platform.isMiniApp) {
    // 小程序环境
    if (typeof wx !== 'undefined') {
      wx.navigateBack();
    } else if (typeof my !== 'undefined') {
      my.navigateBack();
    } else if (typeof tt !== 'undefined') {
      tt.navigateBack();
    }
  } else if (platform.isWeb && router) {
    // Web环境
    router.back();
  }
}

// 模拟uni.chooseFile
export function chooseFile(options) {
  if (platform.isMiniApp) {
    // 小程序环境
    return new Promise((resolve, reject) => {
      if (typeof wx !== 'undefined') {
        wx.chooseImage({
          count: options.count || 1,
          success: resolve,
          fail: reject
        });
      } else if (typeof my !== 'undefined') {
        my.chooseImage({
          count: options.count || 1,
          success: resolve,
          fail: reject
        });
      } else if (typeof tt !== 'undefined') {
        tt.chooseImage({
          count: options.count || 1,
          success: resolve,
          fail: reject
        });
      }
    });
  } else if (platform.isWeb) {
    // Web环境
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.extension ? options.extension.join(',') : '*';
      input.multiple = options.count > 1;
      
      input.onchange = (e) => {
        try {
          const files = Array.from(e.target.files);
          const tempFiles = files.map(file => ({
            name: file.name,
            path: URL.createObjectURL(file),
            size: file.size,
            type: file.type
          }));
          resolve({ tempFiles });
        } catch (error) {
          reject(error);
        }
      };
      
      input.onerror = (error) => {
        reject(error);
      };
      
      input.click();
    });
  }
  return Promise.reject(new Error('Platform not supported'));
}

// 导出模拟的uni对象
const uni = {
  showToast,
  request,
  setStorageSync,
  getStorageSync,
  switchTab,
  navigateTo,
  navigateBack,
  chooseFile,
  platform
};

export default uni;
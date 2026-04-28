/**
 * 屏幕适配工具
 * 版本: v1.0.0.0
 * 说明: 处理不同端的屏幕适配问题，包括通用适配规则、分端适配策略、安全区与异形屏适配
 */

// 检测设备类型
const deviceType = {
  // 检测是否为移动设备
  isMobile: () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },
  
  // 检测是否为平板
  isTablet: () => {
    const width = window.innerWidth;
    return width >= 768 && width < 1024;
  },
  
  // 检测是否为PC
  isPC: () => {
    return !deviceType.isMobile() && window.innerWidth >= 1024;
  },
  
  // 检测是否为小程序
  isMiniApp: () => {
    // 微信小程序
    if (typeof wx !== 'undefined' && wx.getSystemInfo) {
      return true;
    }
    // 支付宝小程序
    if (typeof my !== 'undefined' && my.getSystemInfo) {
      return true;
    }
    // 抖音小程序
    if (typeof tt !== 'undefined' && tt.getAppBaseInfo) {
      return true;
    }
    return false;
  },
  
  // 检测是否为APP
  isApp: () => {
    // 检测是否为Capacitor APP
    if (typeof window.Capacitor !== 'undefined') {
      return true;
    }
    // 检测是否为Cordova APP
    if (typeof window.cordova !== 'undefined') {
      return true;
    }
    return false;
  }
};

// 检测屏幕尺寸
const screenSize = {
  // 获取屏幕宽度
  getWidth: () => {
    return window.innerWidth;
  },
  
  // 获取屏幕高度
  getHeight: () => {
    return window.innerHeight;
  },
  
  // 获取设备像素比
  getDPR: () => {
    return window.devicePixelRatio || 1;
  },
  
  // 检测是否为高分辨率屏幕
  isHighDensity: () => {
    return screenSize.getDPR() > 1;
  },
  
  // 检测是否为刘海屏
  isNotchScreen: () => {
    // 检测安全区
    const safeAreaInsetTop = window.safeArea?.top || 0;
    return safeAreaInsetTop > 0;
  },
  
  // 检测是否为横屏
  isLandscape: () => {
    return window.innerWidth > window.innerHeight;
  }
};

// 适配工具
const adaptation = {
  // 初始化适配
  init: () => {
    // 添加设备类型类
    adaptation.addDeviceClass();
    
    // 处理安全区
    adaptation.handleSafeArea();
    
    // 监听屏幕旋转
    window.addEventListener('resize', adaptation.handleResize);
  },
  
  // 添加设备类型类到body
  addDeviceClass: () => {
    const body = document.body;
    
    // 清除旧的设备类
    body.classList.remove('device-mobile', 'device-tablet', 'device-pc', 'device-miniapp', 'device-app');
    
    // 添加新的设备类
    if (deviceType.isMobile()) {
      body.classList.add('device-mobile');
    } else if (deviceType.isTablet()) {
      body.classList.add('device-tablet');
    } else if (deviceType.isPC()) {
      body.classList.add('device-pc');
    }
    
    if (deviceType.isMiniApp()) {
      body.classList.add('device-miniapp');
    }
    
    if (deviceType.isApp()) {
      body.classList.add('device-app');
    }
    
    // 添加横屏类
    if (screenSize.isLandscape()) {
      body.classList.add('device-landscape');
    } else {
      body.classList.remove('device-landscape');
    }
  },
  
  // 处理安全区
  handleSafeArea: () => {
    const body = document.body;
    
    // 检测安全区
    const safeAreaInsetTop = window.safeArea?.top || 0;
    const safeAreaInsetBottom = window.safeArea?.bottom || 0;
    const safeAreaInsetLeft = window.safeArea?.left || 0;
    const safeAreaInsetRight = window.safeArea?.right || 0;
    
    // 设置CSS变量
    document.documentElement.style.setProperty('--safe-area-inset-top', `${safeAreaInsetTop}px`);
    document.documentElement.style.setProperty('--safe-area-inset-bottom', `${safeAreaInsetBottom}px`);
    document.documentElement.style.setProperty('--safe-area-inset-left', `${safeAreaInsetLeft}px`);
    document.documentElement.style.setProperty('--safe-area-inset-right', `${safeAreaInsetRight}px`);
    
    // 添加刘海屏类
    if (safeAreaInsetTop > 0) {
      body.classList.add('device-notch');
    } else {
      body.classList.remove('device-notch');
    }
  },
  
  // 处理屏幕 resize
  handleResize: () => {
    adaptation.addDeviceClass();
    adaptation.handleSafeArea();
  },
  
  // 计算rpx值（参考微信小程序的rpx单位）
  rpx: (value) => {
    const screenWidth = window.innerWidth;
    const designWidth = 750; // 设计稿宽度
    return (value / designWidth) * screenWidth;
  },
  
  // 计算vw值
  vw: (value) => {
    return (value / 100) * window.innerWidth;
  },
  
  // 计算vh值
  vh: (value) => {
    return (value / 100) * window.innerHeight;
  },
  
  // 获取适配后的字体大小
  getFontSize: (size) => {
    const screenWidth = window.innerWidth;
    const designWidth = 375; // 设计稿宽度
    const scale = screenWidth / designWidth;
    return size * scale;
  },
  
  // 获取适配后的间距
  getSpacing: (spacing) => {
    const screenWidth = window.innerWidth;
    const designWidth = 375; // 设计稿宽度
    const scale = screenWidth / designWidth;
    return spacing * scale;
  },
  
  // 检测是否支持触摸
  isTouchDevice: () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },
  
  // 检测是否支持CSS变量
  supportCSSVariables: () => {
    return window.CSS && window.CSS.supports && window.CSS.supports('--a', 0);
  },
  
  // 检测是否支持WebP
  supportWebP: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const elem = document.createElement('canvas');
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    } catch (e) {
      return false;
    }
  },
  
  // 检测是否支持AVIF
  supportAVIF: () => {
    if (typeof window === 'undefined') return false;
    
    try {
      const elem = document.createElement('canvas');
      return elem.toDataURL('image/avif').indexOf('data:image/avif') === 0;
    } catch (e) {
      return false;
    }
  }
};

// 导出适配工具
export default adaptation;

// 导出设备类型检测
export { deviceType };

// 导出屏幕尺寸检测
export { screenSize };

/**
 * 平台检测与适配模块
 * 负责检测用户设备平台并应用相应的样式和行为
 */
class Platform {
  constructor() {
    this.platform = this.detectPlatform();
    this.isMobile = this.detectMobile();
    this.isTablet = this.detectTablet();
    this.isDesktop = !this.isMobile && !this.isTablet;
    this.os = this.detectOS();
    this.browser = this.detectBrowser();
  }

  /**
     * 初始化平台模块
     */
  initialize() {
    console.log('📱 Platform 模块初始化');
    this.applyPlatformStyles();
    this.setupResizeListener();
    return Promise.resolve();
  }

  // 检测平台类型
  detectPlatform() {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
      return 'ios';
    } else if (/Android/.test(ua)) {
      return 'android';
    } else if (/Windows Phone/.test(ua)) {
      return 'windows';
    } else {
      return 'desktop';
    }
  }

  // 检测是否为移动设备
  detectMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  // 检测是否为平板设备
  detectTablet() {
    const ua = navigator.userAgent;
    const isTablet = /iPad|Android(?!.*Mobile)|Tablet|Kindle|Silk|PlayBook/i.test(ua);
    const maxWidth = window.matchMedia('(max-width: 1024px)').matches;
    const minWidth = window.matchMedia('(min-width: 768px)').matches;
    return isTablet || (maxWidth && minWidth);
  }

  // 检测操作系统
  detectOS() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Win') !== -1) { return 'windows'; }
    if (ua.indexOf('Mac') !== -1) { return 'macos'; }
    if (ua.indexOf('Linux') !== -1) { return 'linux'; }
    if (ua.indexOf('Android') !== -1) { return 'android'; }
    if (ua.indexOf('like Mac') !== -1) { return 'ios'; }
    return 'unknown';
  }

  // 检测浏览器
  detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.indexOf('Chrome') !== -1) { return 'chrome'; }
    if (ua.indexOf('Firefox') !== -1) { return 'firefox'; }
    if (ua.indexOf('Safari') !== -1) { return 'safari'; }
    if (ua.indexOf('Edge') !== -1) { return 'edge'; }
    if (ua.indexOf('Opera') !== -1 || ua.indexOf('OPR') !== -1) { return 'opera'; }
    return 'unknown';
  }

  // 应用平台样式
  applyPlatformStyles() {
    const root = document.documentElement;

    // 移除旧的平台类
    document.body.classList.remove('platform-ios', 'platform-android', 'platform-desktop');
    document.body.classList.remove('device-mobile', 'device-tablet', 'device-desktop');

    // 添加新的平台类
    document.body.classList.add(`platform-${this.platform}`);
    document.body.classList.add(`device-${this.isMobile ? 'mobile' : this.isTablet ? 'tablet' : 'desktop'}`);

    // 设置CSS变量
    root.style.setProperty('--platform-primary', this.getPlatformPrimaryColor());
    root.style.setProperty('--platform-shadow', this.getPlatformShadow());
    root.style.setProperty('--platform-radius', this.getPlatformRadius());
  }

  // 获取平台主色调
  getPlatformPrimaryColor() {
    switch (this.platform) {
      case 'ios': return '#007AFF';
      case 'android': return '#34A853';
      case 'windows': return '#0078D7';
      default: return '#1E40AF';
    }
  }

  // 获取平台阴影
  getPlatformShadow() {
    switch (this.platform) {
      case 'ios': return '0 4px 8px rgba(0, 122, 255, 0.2)';
      case 'android': return '0 4px 8px rgba(52, 168, 83, 0.2)';
      default: return '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    }
  }

  // 获取平台圆角
  getPlatformRadius() {
    switch (this.platform) {
      case 'ios': return '12px';
      case 'android': return '8px';
      default: return '6px';
    }
  }

  // 获取平台信息
  getPlatformInfo() {
    return {
      platform: this.platform,
      isMobile: this.isMobile,
      isTablet: this.isTablet,
      isDesktop: this.isDesktop,
      os: this.os,
      browser: this.browser,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      pixelRatio: window.devicePixelRatio,
    };
  }

  // 监听平台变化
  setupResizeListener() {
    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        const newIsMobile = this.detectMobile();
        const newIsTablet = this.detectTablet();

        if (newIsMobile !== this.isMobile || newIsTablet !== this.isTablet) {
          this.isMobile = newIsMobile;
          this.isTablet = newIsTablet;
          this.isDesktop = !newIsMobile && !newIsTablet;
          this.applyPlatformStyles();

          // 触发平台变化事件
          if (window.EventBus) {
            window.EventBus.emit('platform:change', this.getPlatformInfo());
          }
        }
      }, 250);
    });
  }

  // 获取平台类型
  getType() {
    return this.platform;
  }

  // 检查是否为移动设备
  isMobileDevice() {
    return this.isMobile;
  }

  // 检查是否为平板设备
  isTabletDevice() {
    return this.isTablet;
  }

  // 检查是否为桌面设备
  isDesktopDevice() {
    return this.isDesktop;
  }

  // 检查是否为iOS设备
  isIOS() {
    return this.platform === 'ios';
  }

  // 检查是否为Android设备
  isAndroid() {
    return this.platform === 'android';
  }

  // 检查是否为Windows设备
  isWindows() {
    return this.os === 'windows';
  }

  // 检查是否为MacOS设备
  isMacOS() {
    return this.os === 'macos';
  }

  // 检查是否为Linux设备
  isLinux() {
    return this.os === 'linux';
  }
}

// 导出平台实例
const PlatformInstance = new Platform();
window.Platform = PlatformInstance;

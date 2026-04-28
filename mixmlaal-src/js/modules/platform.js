// 平台检测模块
export const Platform = {
  init() {
    console.log('Platform module initialized');
    console.log('Platform info:', this.getPlatformInfo());
  },
  getPlatformInfo() {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent) && !window.MSStream;
    const isAndroid = /Android/.test(userAgent);
    const isMobile = isIOS || isAndroid;
    const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent);
    const isDesktop = !isMobile;

    return {
      platform: isIOS ? 'ios' : isAndroid ? 'android' : 'web',
      isMobile,
      isTablet,
      isDesktop,
      isIOS,
      isAndroid,
      userAgent,
    };
  },

  isIOS() {
    return this.getPlatformInfo().isIOS;
  },

  isAndroid() {
    return this.getPlatformInfo().isAndroid;
  },

  isMobile() {
    return this.getPlatformInfo().isMobile;
  },

  isDesktop() {
    return this.getPlatformInfo().isDesktop;
  },
};

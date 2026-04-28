// 移动端适配工具
export const MobileAdaptation = {
  // 检测是否为移动设备
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // 检测是否为iOS设备
  isIOS() {
    return /iPhone|iPad|iPod/i.test(navigator.userAgent);
  },

  // 检测是否为Android设备
  isAndroid() {
    return /Android/i.test(navigator.userAgent);
  },

  // 获取设备类型
  getDeviceType() {
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPod/i.test(ua)) return 'iPod';
    if (/Android/i.test(ua)) return 'Android';
    if (/Windows Phone/i.test(ua)) return 'Windows Phone';
    return 'Desktop';
  },

  // 初始化移动端适配
  init() {
    const deviceType = this.getDeviceType().toLowerCase();
    document.documentElement.classList.add(`device-${deviceType}`);

    if (window.innerWidth > window.innerHeight) {
      document.documentElement.classList.add('landscape');
    } else {
      document.documentElement.classList.add('portrait');
    }
  }
};

export default MobileAdaptation;
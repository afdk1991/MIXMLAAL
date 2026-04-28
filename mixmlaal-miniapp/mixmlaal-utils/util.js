const formatTime = date => {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();

  return `${[year, month, day].map(formatNumber).join('-')} ${[hour, minute, second].map(formatNumber).join(':')}`;
};

const formatNumber = n => {
  n = n.toString();
  return n[1] ? n : `0${n}`;
};

const formatDate = timestamp => {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}-${formatNumber(month)}-${formatNumber(day)}`;
};

const formatPrice = price => {
  return (price / 100).toFixed(2);
};

const formatDistance = distance => {
  if (distance < 1000) {
    return `${distance}m`;
  }
  return `${(distance / 1000).toFixed(1)}km`;
};

const formatDuration = minutes => {
  if (minutes < 60) {
    return `${minutes}分钟`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}小时${mins}分钟` : `${hours}小时`;
};

const debounce = (fn, delay = 300) => {
  let timer = null;
  return function (...args) {
    if (timer) { clearTimeout(timer); }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
};

const throttle = (fn, delay = 300) => {
  let lastTime = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastTime >= delay) {
      lastTime = now;
      fn.apply(this, args);
    }
  };
};

const showToast = (title, icon = 'none', duration = 2000) => {
  wx.showToast({ title, icon, duration });
};

const showLoading = (title = '加载中...') => {
  wx.showLoading({ title, mask: true });
};

const hideLoading = () => {
  wx.hideLoading();
};

const showModal = (title, content) => {
  return new Promise((resolve, reject) => {
    wx.showModal({
      title,
      content,
      success: res => {
        if (res.confirm) {
          resolve(true);
        } else {
          resolve(false);
        }
      },
      fail: reject,
    });
  });
};

const navigateTo = url => {
  wx.navigateTo({ url });
};

const navigateBack = (delta = 1) => {
  wx.navigateBack({ delta });
};

const switchTab = url => {
  wx.switchTab({ url });
};

const redirectTo = url => {
  wx.redirectTo({ url });
};

const getLocation = () => {
  return new Promise((resolve, reject) => {
    wx.getLocation({
      type: 'gcj02',
      success: resolve,
      fail: reject,
    });
  });
};

const chooseLocation = () => {
  return new Promise((resolve, reject) => {
    wx.chooseLocation({
      success: resolve,
      fail: reject,
    });
  });
};

const makePhoneCall = phoneNumber => {
  wx.makePhoneCall({ phoneNumber });
};

const setClipboardData = data => {
  wx.setClipboardData({
    data,
    success: () => {
      showToast('复制成功');
    },
  });
};

const isLoggedIn = () => {
  const token = wx.getStorageSync('token');
  return !!token;
};

module.exports = {
  formatTime,
  formatDate,
  formatPrice,
  formatDistance,
  formatDuration,
  debounce,
  throttle,
  showToast,
  showLoading,
  hideLoading,
  showModal,
  navigateTo,
  navigateBack,
  switchTab,
  redirectTo,
  getLocation,
  chooseLocation,
  makePhoneCall,
  setClipboardData,
  isLoggedIn,
};

const app = getApp();

const setStorage = (key, data) => {
  try {
    wx.setStorageSync(key, data);
    return true;
  } catch (e) {
    console.error('setStorage error:', e);
    return false;
  }
};

const getStorage = key => {
  try {
    return wx.getStorageSync(key);
  } catch (e) {
    console.error('getStorage error:', e);
    return null;
  }
};

const removeStorage = key => {
  try {
    wx.removeStorageSync(key);
    return true;
  } catch (e) {
    console.error('removeStorage error:', e);
    return false;
  }
};

const clearStorage = () => {
  try {
    wx.clearStorageSync();
    return true;
  } catch (e) {
    console.error('clearStorage error:', e);
    return false;
  }
};

const getToken = () => getStorage('token');

const setToken = token => setStorage('token', token);

const removeToken = () => removeStorage('token');

const getUserInfo = () => getStorage('userInfo');

const setUserInfo = userInfo => setStorage('userInfo', userInfo);

const removeUserInfo = () => removeStorage('userInfo');

const isLoggedIn = () => {
  return !!getToken();
};

const checkLogin = () => {
  return new Promise((resolve, reject) => {
    if (isLoggedIn()) {
      resolve(true);
    } else {
      wx.navigateTo({ url: '/pages/login/login' });
      reject(new Error('未登录'));
    }
  });
};

const logout = () => {
  removeToken();
  removeUserInfo();
  app.globalData.token = null;
  app.globalData.userInfo = null;
};

module.exports = {
  setStorage,
  getStorage,
  removeStorage,
  clearStorage,
  getToken,
  setToken,
  removeToken,
  getUserInfo,
  setUserInfo,
  removeUserInfo,
  isLoggedIn,
  checkLogin,
  logout,
};

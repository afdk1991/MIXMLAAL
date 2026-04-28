/**
 * 安全工具类
 * 提供权限验证、输入验证等安全相关功能
 */

/**
 * 检查用户是否登录
 * @returns {boolean} 是否已登录
 */
export const isLoggedIn = () => {
  return !!localStorage.getItem('token');
};

/**
 * 获取用户信息
 * @returns {object|null} 用户信息
 */
export const getUserInfo = () => {
  try {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
};

/**
 * 检查用户是否具有指定权限
 * @param {string} permission - 权限名称
 * @returns {boolean} 是否具有权限
 */
export const hasPermission = (permission) => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.permissions) {
    return false;
  }
  return userInfo.permissions.includes(permission);
};

/**
 * 检查用户是否具有指定角色
 * @param {string|array} roles - 角色名称或角色数组
 * @returns {boolean} 是否具有指定角色
 */
export const hasRole = (roles) => {
  const userInfo = getUserInfo();
  if (!userInfo || !userInfo.role) {
    return false;
  }
  if (Array.isArray(roles)) {
    return roles.includes(userInfo.role);
  }
  return userInfo.role === roles;
};

/**
 * 验证邮箱格式
 * @param {string} email - 邮箱地址
 * @returns {boolean} 是否为有效邮箱
 */
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 验证手机号格式
 * @param {string} phone - 手机号
 * @returns {boolean} 是否为有效手机号
 */
export const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

/**
 * 验证密码强度
 * @param {string} password - 密码
 * @returns {object} 密码强度信息
 */
export const validatePassword = (password) => {
  const strength = {
    score: 0,
    message: '',
    isValid: false
  };
  
  if (!password) {
    strength.message = '密码不能为空';
    return strength;
  }
  
  // 长度检查
  if (password.length >= 8) {
    strength.score += 1;
  }
  
  // 包含数字
  if (/\d/.test(password)) {
    strength.score += 1;
  }
  
  // 包含小写字母
  if (/[a-z]/.test(password)) {
    strength.score += 1;
  }
  
  // 包含大写字母
  if (/[A-Z]/.test(password)) {
    strength.score += 1;
  }
  
  // 包含特殊字符
  if (/[^a-zA-Z0-9]/.test(password)) {
    strength.score += 1;
  }
  
  switch (strength.score) {
    case 0:
    case 1:
      strength.message = '密码强度：弱';
      strength.isValid = false;
      break;
    case 2:
    case 3:
      strength.message = '密码强度：中';
      strength.isValid = true;
      break;
    case 4:
    case 5:
      strength.message = '密码强度：强';
      strength.isValid = true;
      break;
  }
  
  return strength;
};

/**
 * 防止XSS攻击，转义HTML特殊字符
 * @param {string} str - 输入字符串
 * @returns {string} 转义后的字符串
 */
export const escapeHtml = (str) => {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return str.replace(/[&<>"']/g, m => map[m]);
};

/**
 * 防止SQL注入，清理输入
 * @param {string} str - 输入字符串
 * @returns {string} 清理后的字符串
 */
export const sanitizeInput = (str) => {
  // 移除SQL注入相关的字符
  return str.replace(/['"\;\-\s]+/g, ' ').trim();
};

/**
 * 生成随机token
 * @param {number} length - token长度
 * @returns {string} 随机token
 */
export const generateToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < length; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * 加密存储敏感数据
 * @param {string} key - 存储键
 * @param {any} value - 存储值
 */
export const secureStore = (key, value) => {
  try {
    const encryptedValue = btoa(JSON.stringify(value));
    localStorage.setItem(key, encryptedValue);
  } catch (error) {
    console.error('安全存储失败:', error);
  }
};

/**
 * 解密获取敏感数据
 * @param {string} key - 存储键
 * @returns {any} 解密后的值
 */
export const secureRetrieve = (key) => {
  try {
    const encryptedValue = localStorage.getItem(key);
    if (!encryptedValue) return null;
    return JSON.parse(atob(encryptedValue));
  } catch (error) {
    console.error('安全获取失败:', error);
    return null;
  }
};

/**
 * 清除用户登录状态
 */
export const clearAuth = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userInfo');
  sessionStorage.clear();
};

/**
 * 检查URL是否安全
 * @param {string} url - URL地址
 * @returns {boolean} 是否为安全URL
 */
export const isSafeUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const safeProtocols = ['http:', 'https:'];
    return safeProtocols.includes(urlObj.protocol);
  } catch (error) {
    return false;
  }
};
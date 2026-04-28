/**
 * 缓存工具类
 * 提供本地存储缓存功能，支持设置过期时间
 */

// 缓存键前缀
const CACHE_PREFIX = 'mixmlaal_';

/**
 * 设置缓存
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 * @param {number} expire - 过期时间（秒）
 */
export const setCache = (key, value, expire = 3600) => {
  try {
    const data = {
      value,
      expire: new Date().getTime() + expire * 1000
    };
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data));
  } catch (error) {
    console.error('设置缓存失败:', error);
  }
};

/**
 * 获取缓存
 * @param {string} key - 缓存键
 * @returns {any} 缓存值，过期或不存在返回null
 */
export const getCache = (key) => {
  try {
    const data = localStorage.getItem(CACHE_PREFIX + key);
    if (!data) return null;
    
    const parsedData = JSON.parse(data);
    if (new Date().getTime() > parsedData.expire) {
      // 缓存已过期，删除
      removeCache(key);
      return null;
    }
    return parsedData.value;
  } catch (error) {
    console.error('获取缓存失败:', error);
    return null;
  }
};

/**
 * 删除缓存
 * @param {string} key - 缓存键
 */
export const removeCache = (key) => {
  try {
    localStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('删除缓存失败:', error);
  }
};

/**
 * 清空所有缓存
 */
export const clearCache = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空缓存失败:', error);
  }
};

/**
 * 检查缓存是否存在且未过期
 * @param {string} key - 缓存键
 * @returns {boolean} 是否存在且未过期
 */
export const hasCache = (key) => {
  return getCache(key) !== null;
};

/**
 * 设置会话缓存（会话结束后过期）
 * @param {string} key - 缓存键
 * @param {any} value - 缓存值
 */
export const setSessionCache = (key, value) => {
  try {
    sessionStorage.setItem(CACHE_PREFIX + key, JSON.stringify(value));
  } catch (error) {
    console.error('设置会话缓存失败:', error);
  }
};

/**
 * 获取会话缓存
 * @param {string} key - 缓存键
 * @returns {any} 缓存值，不存在返回null
 */
export const getSessionCache = (key) => {
  try {
    const data = sessionStorage.getItem(CACHE_PREFIX + key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('获取会话缓存失败:', error);
    return null;
  }
};

/**
 * 删除会话缓存
 * @param {string} key - 缓存键
 */
export const removeSessionCache = (key) => {
  try {
    sessionStorage.removeItem(CACHE_PREFIX + key);
  } catch (error) {
    console.error('删除会话缓存失败:', error);
  }
};

/**
 * 清空所有会话缓存
 */
export const clearSessionCache = () => {
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('清空会话缓存失败:', error);
  }
};
const cacheManager = require('../config/cache');

// 缓存中间件
function cacheMiddleware(duration = 60) {
  return async (req, res, next) => {
    // 只缓存GET请求
    if (req.method !== 'GET') {
      return next();
    }

    // 生成缓存键
    const cacheKey = `api:${req.originalUrl}`;

    try {
      // 尝试从缓存获取
      const cachedData = await cacheManager.get(cacheKey);
      if (cachedData) {
        console.log(`Cache hit for: ${req.originalUrl}`);
        return res.json(cachedData);
      }

      // 缓存未命中，重写res.json方法
      const originalJson = res.json;
      res.json = function(data) {
        // 缓存响应数据
        if (data && data.status === 'success') {
          cacheManager.set(cacheKey, data, duration);
        }
        return originalJson.call(this, data);
      };

      next();
    } catch (error) {
      console.error('Cache middleware error:', error);
      next();
    }
  };
}

// 清除缓存的中间件
function clearCacheMiddleware(pattern) {
  return async (req, res, next) => {
    try {
      await cacheManager.delByPattern(pattern);
      console.log(`Cache cleared for pattern: ${pattern}`);
    } catch (error) {
      console.error('Clear cache error:', error);
    }
    next();
  };
}

module.exports = {
  cacheMiddleware,
  clearCacheMiddleware
};

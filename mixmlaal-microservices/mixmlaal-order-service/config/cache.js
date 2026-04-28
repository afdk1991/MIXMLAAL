const Redis = require('ioredis');
const NodeCache = require('node-cache');

// 本地缓存配置
const localCache = new NodeCache({
  stdTTL: 60, // 默认过期时间60秒
  checkperiod: 120, // 每120秒检查一次过期项
  maxKeys: 10000 // 最大缓存键数
});

// Redis缓存配置
let redisClient = null;

if (process.env.REDIS_HOST) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || '',
    db: process.env.REDIS_DB || 0
  });

  redisClient.on('error', (error) => {
    console.error('Redis连接错误:', error);
  });

  redisClient.on('connect', () => {
    console.log('Redis连接成功');
  });
}

// 缓存键生成函数
const generateCacheKey = (prefix, ...args) => {
  return `${prefix}:${args.join(':')}`;
};

// 多级缓存获取
const get = async (key) => {
  // 先从本地缓存获取
  const localValue = localCache.get(key);
  if (localValue !== undefined) {
    return localValue;
  }

  // 再从Redis获取
  if (redisClient) {
    try {
      const redisValue = await redisClient.get(key);
      if (redisValue) {
        // 将Redis值同步到本地缓存
        localCache.set(key, JSON.parse(redisValue));
        return JSON.parse(redisValue);
      }
    } catch (error) {
      console.error('Redis获取失败:', error);
    }
  }

  return null;
};

// 多级缓存设置
const set = async (key, value, ttl = 60) => {
  // 设置本地缓存
  localCache.set(key, value, ttl);

  // 设置Redis缓存
  if (redisClient) {
    try {
      await redisClient.set(key, JSON.stringify(value), 'EX', ttl);
    } catch (error) {
      console.error('Redis设置失败:', error);
    }
  }
};

// 多级缓存删除
const del = async (key) => {
  // 删除本地缓存
  localCache.del(key);

  // 删除Redis缓存
  if (redisClient) {
    try {
      await redisClient.del(key);
    } catch (error) {
      console.error('Redis删除失败:', error);
    }
  }
};

// 缓存批量删除
const delPattern = async (pattern) => {
  if (redisClient) {
    try {
      const keys = await redisClient.keys(pattern);
      if (keys.length > 0) {
        await redisClient.del(keys);
        // 本地缓存也需要清理
        keys.forEach(key => {
          localCache.del(key);
        });
      }
    } catch (error) {
      console.error('Redis批量删除失败:', error);
    }
  }
};

module.exports = {
  get,
  set,
  del,
  delPattern,
  generateCacheKey
};
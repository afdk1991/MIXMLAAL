const redis = require('redis');
require('dotenv').config();

// Redis 连接配置
const redisClient = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => {
      // 指数退避重试策略
      return Math.min(retries * 100, 3000);
    }
  }
});

// 错误处理
redisClient.on('error', (err) => {
  console.error('Redis 连接错误:', err);
});

// 连接成功处理
redisClient.on('connect', () => {
  console.log('Redis 连接成功');
});

// 断开连接处理
redisClient.on('end', () => {
  console.log('Redis 连接断开');
});

// 连接 Redis
const connectRedis = async () => {
  try {
    await redisClient.connect();
    console.log('Redis 连接成功');
  } catch (error) {
    console.error('Redis 连接失败:', error);
  }
};

// 关闭 Redis 连接
const closeRedis = async () => {
  try {
    await redisClient.quit();
    console.log('Redis 连接已关闭');
  } catch (error) {
    console.error('关闭 Redis 连接失败:', error);
  }
};

// 缓存操作封装
const cache = {
  // 设置缓存
  set: async (key, value, ttl = 3600) => {
    try {
      const jsonValue = JSON.stringify(value);
      await redisClient.set(key, jsonValue, { EX: ttl });
      return true;
    } catch (error) {
      console.error('设置缓存失败:', error);
      return false;
    }
  },

  // 获取缓存
  get: async (key) => {
    try {
      const value = await redisClient.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('获取缓存失败:', error);
      return null;
    }
  },

  // 删除缓存
  del: async (key) => {
    try {
      await redisClient.del(key);
      return true;
    } catch (error) {
      console.error('删除缓存失败:', error);
      return false;
    }
  },

  // 清除所有缓存
  flushAll: async () => {
    try {
      await redisClient.flushAll();
      return true;
    } catch (error) {
      console.error('清除所有缓存失败:', error);
      return false;
    }
  }
};

module.exports = {
  redisClient,
  connectRedis,
  closeRedis,
  cache
};
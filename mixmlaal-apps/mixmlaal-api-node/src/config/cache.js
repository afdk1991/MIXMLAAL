const Redis = require('ioredis');
const NodeCache = require('node-cache');
require('dotenv').config();

// 本地缓存配置
const localCache = new NodeCache({
  stdTTL: 60, // 默认缓存时间60秒
  checkperiod: 120, // 每120秒检查一次过期缓存
  maxKeys: 10000 // 最大缓存键数
});

// Redis集群配置
const redisCluster = new Redis.Cluster([
  {
    host: process.env.REDIS_HOST1 || 'localhost',
    port: process.env.REDIS_PORT1 || 6379
  },
  {
    host: process.env.REDIS_HOST2 || 'localhost',
    port: process.env.REDIS_PORT2 || 6380
  },
  {
    host: process.env.REDIS_HOST3 || 'localhost',
    port: process.env.REDIS_PORT3 || 6381
  }
], {
  redisOptions: {
    password: process.env.REDIS_PASSWORD || '',
    db: 0
  },
  clusterOptions: {
    maxRedirections: 16,
    retryDelayOnFailure: 100,
    retryDelayOnReconnecting: 100,
    maxRetriesPerRequest: 3
  }
});

// 缓存键前缀
const CACHE_PREFIX = {
  USER: 'user:',
  PRODUCT: 'product:',
  ORDER: 'order:',
  CONFIG: 'config:',
  HOT: 'hot:'
};

// 多级缓存管理类
class CacheManager {
  constructor() {
    this.localCache = localCache;
    this.redis = redisCluster;
    this.prefixes = CACHE_PREFIX;
  }

  // 生成缓存键
  generateKey(prefix, id) {
    return `${prefix}${id}`;
  }

  // 设置缓存（多级）
  async set(key, value, ttl = 60) {
    try {
      // 设置本地缓存
      this.localCache.set(key, value, ttl);
      
      // 设置Redis缓存
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      await this.redis.set(key, value, 'EX', ttl);
      
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }

  // 获取缓存（多级）
  async get(key) {
    try {
      // 先从本地缓存获取
      let value = this.localCache.get(key);
      if (value !== undefined) {
        return value;
      }
      
      // 再从Redis获取
      value = await this.redis.get(key);
      if (value) {
        try {
          value = JSON.parse(value);
        } catch (e) {
          // 非JSON格式，直接返回
        }
        // 更新本地缓存
        this.localCache.set(key, value);
        return value;
      }
      
      return null;
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }

  // 删除缓存（多级）
  async del(key) {
    try {
      // 删除本地缓存
      this.localCache.del(key);
      
      // 删除Redis缓存
      await this.redis.del(key);
      
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }

  // 批量删除缓存
  async delByPattern(pattern) {
    try {
      // 获取匹配的键
      const keys = await this.redis.keys(pattern);
      if (keys.length > 0) {
        // 删除本地缓存
        keys.forEach(key => this.localCache.del(key));
        
        // 删除Redis缓存
        await this.redis.del(keys);
      }
      return true;
    } catch (error) {
      console.error('Cache delete by pattern error:', error);
      return false;
    }
  }

  // 缓存预热
  async preheatCache() {
    try {
      // 预热热点数据
      // 这里可以根据业务需求添加具体的预热逻辑
      console.log('Cache preheated successfully');
      return true;
    } catch (error) {
      console.error('Cache preheat error:', error);
      return false;
    }
  }

  // 测试缓存连接
  async testConnection() {
    try {
      await this.redis.ping();
      console.log('Redis connection has been established successfully.');
      return true;
    } catch (error) {
      console.error('Unable to connect to Redis:', error);
      return false;
    }
  }
}

module.exports = new CacheManager();

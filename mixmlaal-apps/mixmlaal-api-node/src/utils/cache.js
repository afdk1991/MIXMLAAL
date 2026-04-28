/**
 * 高级缓存服务
 * 版本: v2.0.0.0
 * 说明: 提供Redis缓存操作功能，包含内存缓存降级方案
 */

const redis = require('redis');

class CacheService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.memoryCache = new Map(); // 内存缓存作为降级方案
    this.memoryCacheTTL = new Map(); // 内存缓存的过期时间
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      dels: 0,
      errors: 0
    };
    this.prefix = process.env.CACHE_PREFIX || 'mixmlaal:';
    this.defaultTTL = parseInt(process.env.CACHE_TTL) || 3600;
  }

  /**
   * 初始化Redis连接
   */
  async init() {
    try {
      console.log('开始初始化缓存服务...');

      if (process.env.NODE_ENV === 'production') {
        const redisUrl = process.env.REDIS_URL || `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
        this.client = redis.createClient({
          url: redisUrl,
          password: process.env.REDIS_PASSWORD,
          socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => Math.min(retries * 100, 3000)
          }
        });

        this.client.on('error', err => {
          console.warn('Redis错误:', err.message);
          this.connected = false;
        });

        this.client.on('connect', () => {
          console.log('Redis连接成功');
          this.connected = true;
        });

        this.client.on('end', () => {
          console.log('Redis连接断开');
          this.connected = false;
        });

        // 尝试连接Redis，但不阻塞服务器启动
        this.client.connect().catch(err => {
          console.warn('Redis连接失败，使用内存缓存作为降级方案:', err.message);
          this.connected = false;
        });
        console.log('缓存服务初始化完成（生产环境）');
      } else {
        // 开发环境使用内存缓存
        console.log('开发环境，使用内存缓存');
        this.connected = false;
      }

      // 启动内存缓存清理定时器
      this.startMemoryCacheCleanup();
      // 执行缓存预热
      await this.preloadCache();
    } catch (error) {
      console.error('缓存服务初始化失败:', error.message);
      // 缓存初始化失败不影响系统运行，使用内存缓存
      this.connected = false;
    }
  }

  /**
   * 启动内存缓存清理定时器
   */
  startMemoryCacheCleanup() {
    setInterval(() => {
      const now = Date.now();
      for (const [key, expiry] of this.memoryCacheTTL.entries()) {
        if (now > expiry) {
          this.memoryCache.delete(key);
          this.memoryCacheTTL.delete(key);
        }
      }
    }, 60000); // 每分钟清理一次
  }

  /**
   * 缓存预热
   */
  async preloadCache() {
    try {
      console.log('开始缓存预热...');
      // 这里可以添加需要预热的缓存数据
      // 例如：系统配置、常用商品数据等
      
      // 示例：预热系统配置
      const systemConfigs = {
        platformName: '米小米拉阿狸',
        platformCommissionRate: 0.27,
        freeShippingThreshold: 99,
        defaultShippingFee: 10
      };
      await this.set('system:configs', systemConfigs, 86400);
      
      console.log('缓存预热完成');
    } catch (error) {
      console.error('缓存预热失败:', error.message);
    }
  }

  /**
   * 设置缓存
   * @param {string} key - 缓存键
   * @param {any} value - 缓存值
   * @param {number} ttl - 过期时间（秒）
   */
  async set(key, value, ttl = this.defaultTTL) {
    try {
      const fullKey = this.generateKey(key);
      const jsonValue = JSON.stringify(value);

      // 尝试使用Redis
      if (this.connected && this.client) {
        await this.client.set(fullKey, jsonValue, {
          EX: ttl,
        });
      } else {
        // 使用内存缓存作为降级
        this.memoryCache.set(fullKey, jsonValue);
        this.memoryCacheTTL.set(fullKey, Date.now() + ttl * 1000);
      }

      this.stats.sets++;
      return true;
    } catch (error) {
      console.error('设置缓存错误:', error);
      this.stats.errors++;
      // 尝试使用内存缓存作为降级
      try {
        const fullKey = this.generateKey(key);
        this.memoryCache.set(fullKey, JSON.stringify(value));
        this.memoryCacheTTL.set(fullKey, Date.now() + ttl * 1000);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * 获取缓存
   * @param {string} key - 缓存键
   * @returns {any} 缓存值
   */
  async get(key) {
    try {
      const fullKey = this.generateKey(key);

      // 尝试使用Redis
      if (this.connected && this.client) {
        const value = await this.client.get(fullKey);
        if (value) {
          this.stats.hits++;
          return JSON.parse(value);
        }
      }

      // 尝试使用内存缓存
      const memoryValue = this.memoryCache.get(fullKey);
      if (memoryValue) {
        // 检查是否过期
        const expiry = this.memoryCacheTTL.get(fullKey);
        if (Date.now() <= expiry) {
          this.stats.hits++;
          return JSON.parse(memoryValue);
        } else {
          // 过期了，删除
          this.memoryCache.delete(fullKey);
          this.memoryCacheTTL.delete(fullKey);
        }
      }

      this.stats.misses++;
      return null;
    } catch (error) {
      console.error('获取缓存错误:', error);
      this.stats.errors++;
      // 尝试使用内存缓存作为降级
      try {
        const fullKey = this.generateKey(key);
        const memoryValue = this.memoryCache.get(fullKey);
        if (memoryValue) {
          const expiry = this.memoryCacheTTL.get(fullKey);
          if (Date.now() <= expiry) {
            return JSON.parse(memoryValue);
          }
        }
      } catch (e) {
        // 忽略错误
      }
      return null;
    }
  }

  /**
   * 删除缓存
   * @param {string} key - 缓存键
   */
  async del(key) {
    try {
      const fullKey = this.generateKey(key);

      // 尝试使用Redis
      if (this.connected && this.client) {
        await this.client.del(fullKey);
      }

      // 同时从内存缓存中删除
      this.memoryCache.delete(fullKey);
      this.memoryCacheTTL.delete(fullKey);

      this.stats.dels++;
      return true;
    } catch (error) {
      console.error('删除缓存错误:', error);
      this.stats.errors++;
      // 尝试从内存缓存中删除
      try {
        const fullKey = this.generateKey(key);
        this.memoryCache.delete(fullKey);
        this.memoryCacheTTL.delete(fullKey);
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * 批量设置缓存
   * @param {Array} items - 缓存项数组，每项包含key, value, ttl
   */
  async setBatch(items) {
    try {
      if (!items || !Array.isArray(items)) {
        return false;
      }

      // 尝试使用Redis pipeline
      if (this.connected && this.client) {
        const pipeline = this.client.pipeline();
        for (const item of items) {
          const fullKey = this.generateKey(item.key);
          pipeline.set(fullKey, JSON.stringify(item.value), {
            EX: item.ttl || this.defaultTTL,
          });
        }
        await pipeline.exec();
      } else {
        // 使用内存缓存
        for (const item of items) {
          const fullKey = this.generateKey(item.key);
          this.memoryCache.set(fullKey, JSON.stringify(item.value));
          this.memoryCacheTTL.set(fullKey, Date.now() + (item.ttl || this.defaultTTL) * 1000);
        }
      }

      this.stats.sets += items.length;
      return true;
    } catch (error) {
      console.error('批量设置缓存错误:', error);
      this.stats.errors++;
      return false;
    }
  }

  /**
   * 批量获取缓存
   * @param {Array} keys - 缓存键数组
   */
  async getBatch(keys) {
    try {
      if (!keys || !Array.isArray(keys)) {
        return [];
      }

      const results = [];

      // 尝试使用Redis
      if (this.connected && this.client) {
        const fullKeys = keys.map(key => this.generateKey(key));
        const values = await this.client.mGet(fullKeys);
        for (let i = 0; i < values.length; i++) {
          if (values[i]) {
            results.push(JSON.parse(values[i]));
            this.stats.hits++;
          } else {
            results.push(null);
            this.stats.misses++;
          }
        }
      } else {
        // 使用内存缓存
        for (const key of keys) {
          const fullKey = this.generateKey(key);
          const value = this.memoryCache.get(fullKey);
          if (value) {
            const expiry = this.memoryCacheTTL.get(fullKey);
            if (Date.now() <= expiry) {
              results.push(JSON.parse(value));
              this.stats.hits++;
            } else {
              results.push(null);
              this.memoryCache.delete(fullKey);
              this.memoryCacheTTL.delete(fullKey);
              this.stats.misses++;
            }
          } else {
            results.push(null);
            this.stats.misses++;
          }
        }
      }

      return results;
    } catch (error) {
      console.error('批量获取缓存错误:', error);
      this.stats.errors++;
      // 尝试使用内存缓存
      const results = [];
      for (const key of keys) {
        try {
          const fullKey = this.generateKey(key);
          const value = this.memoryCache.get(fullKey);
          if (value) {
            const expiry = this.memoryCacheTTL.get(fullKey);
            if (Date.now() <= expiry) {
              results.push(JSON.parse(value));
            } else {
              results.push(null);
            }
          } else {
            results.push(null);
          }
        } catch (e) {
          results.push(null);
        }
      }
      return results;
    }
  }

  /**
   * 批量删除缓存
   * @param {Array} keys - 缓存键数组
   */
  async delBatch(keys) {
    try {
      if (!keys || !Array.isArray(keys)) {
        return false;
      }

      const fullKeys = keys.map(key => this.generateKey(key));

      // 尝试使用Redis
      if (this.connected && this.client) {
        await this.client.del(fullKeys);
      }

      // 同时从内存缓存中删除
      for (const key of fullKeys) {
        this.memoryCache.delete(key);
        this.memoryCacheTTL.delete(key);
      }

      this.stats.dels += keys.length;
      return true;
    } catch (error) {
      console.error('批量删除缓存错误:', error);
      this.stats.errors++;
      // 尝试从内存缓存中删除
      try {
        for (const key of keys) {
          const fullKey = this.generateKey(key);
          this.memoryCache.delete(fullKey);
          this.memoryCacheTTL.delete(fullKey);
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * 清除所有缓存
   */
  async clear() {
    try {
      // 尝试使用Redis
      if (this.connected && this.client) {
        await this.client.flushAll();
      }

      // 清空内存缓存
      this.memoryCache.clear();
      this.memoryCacheTTL.clear();

      return true;
    } catch (error) {
      console.error('清除缓存错误:', error);
      // 尝试清空内存缓存
      try {
        this.memoryCache.clear();
        this.memoryCacheTTL.clear();
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * 清除指定前缀的缓存
   * @param {string} prefix - 缓存前缀
   */
  async clearByPrefix(prefix) {
    try {
      const fullPrefix = this.generateKey(prefix);

      // 尝试使用Redis
      if (this.connected && this.client) {
        const keys = await this.client.keys(`${fullPrefix}*`);
        if (keys.length > 0) {
          await this.client.del(keys);
        }
      }

      // 同时从内存缓存中删除
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(fullPrefix)) {
          this.memoryCache.delete(key);
          this.memoryCacheTTL.delete(key);
        }
      }

      return true;
    } catch (error) {
      console.error('清除前缀缓存错误:', error);
      // 尝试从内存缓存中删除
      try {
        const fullPrefix = this.generateKey(prefix);
        for (const key of this.memoryCache.keys()) {
          if (key.startsWith(fullPrefix)) {
            this.memoryCache.delete(key);
            this.memoryCacheTTL.delete(key);
          }
        }
        return true;
      } catch (e) {
        return false;
      }
    }
  }

  /**
   * 获取缓存统计信息
   * @returns {Object} 统计信息
   */
  getStats() {
    return {
      ...this.stats,
      memoryCacheSize: this.memoryCache.size,
      redisConnected: this.connected
    };
  }

  /**
   * 重置统计信息
   */
  resetStats() {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      dels: 0,
      errors: 0
    };
  }

  /**
   * 关闭Redis连接
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        this.connected = false;
        console.log('Redis连接已关闭');
      }
      // 清空内存缓存
      this.memoryCache.clear();
      this.memoryCacheTTL.clear();
    } catch (error) {
      console.error('关闭Redis连接错误:', error);
    }
  }

  /**
   * 生成缓存键
   * @param {string} prefix - 前缀
   * @param {string} ...args - 其他参数
   * @returns {string} 缓存键
   */
  generateKey(prefix, ...args) {
    return `${this.prefix}${prefix}${args.length > 0 ? ':' : ''}${args.join(':')}`;
  }

  /**
   * 获取缓存键的过期时间
   * @param {string} key - 缓存键
   * @returns {number} 过期时间（秒）
   */
  async getTTL(key) {
    try {
      const fullKey = this.generateKey(key);
      if (this.connected && this.client) {
        const ttl = await this.client.ttl(fullKey);
        return ttl;
      }
      // 内存缓存的TTL
      const expiry = this.memoryCacheTTL.get(fullKey);
      if (expiry) {
        return Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      }
      return -1;
    } catch (error) {
      console.error('获取TTL错误:', error);
      return -1;
    }
  }

  /**
   * 设置缓存的过期时间
   * @param {string} key - 缓存键
   * @param {number} ttl - 过期时间（秒）
   */
  async expire(key, ttl) {
    try {
      const fullKey = this.generateKey(key);
      if (this.connected && this.client) {
        await this.client.expire(fullKey, ttl);
      }
      // 更新内存缓存的TTL
      if (this.memoryCache.has(fullKey)) {
        this.memoryCacheTTL.set(fullKey, Date.now() + ttl * 1000);
      }
      return true;
    } catch (error) {
      console.error('设置过期时间错误:', error);
      return false;
    }
  }
}

// 导出单例
const cacheService = new CacheService();
module.exports = cacheService;
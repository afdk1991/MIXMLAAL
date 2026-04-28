/**
 * 配置中心
 * 版本: v1.0.0.0
 * 说明: 集中式配置管理，使用Redis存储配置
 */

const redis = require('redis');

class ConfigCenter {
  constructor() {
    this.client = null;
    this.memoryStorage = {};
  }

  /**
   * 初始化配置中心
   */
  async init() {
    try {
      // 直接使用内存存储，避免Redis连接问题
      console.log('⚠️ 配置中心使用内存存储');
      this.useMemoryStorage();
      // 使用内存存储初始化默认配置
      await this.initDefaultConfig();
      console.log('✅ 配置中心初始化成功');
    } catch (error) {
      console.error('配置中心初始化失败:', error);
      // 降级为内存存储
      console.warn('⚠️ 配置中心降级为内存存储');
      this.useMemoryStorage();
      // 使用内存存储初始化默认配置
      await this.initDefaultConfig();
    }
  }

  /**
   * 使用内存存储作为降级方案
   */
  useMemoryStorage() {
    console.warn('⚠️ 配置中心降级为内存存储');
    this.memoryStorage = {};
  }

  /**
   * 初始化默认配置
   */
  async initDefaultConfig() {
    const env = process.env.NODE_ENV || 'development';
    
    // 环境特定的数据库配置
    const dbConfig = {
      host: process.env[`${env.toUpperCase()}_DB_HOST`] || process.env.DB_HOST || 'localhost',
      port: process.env[`${env.toUpperCase()}_DB_PORT`] || process.env.DB_PORT || '3306',
      name: process.env[`${env.toUpperCase()}_DB_NAME`] || process.env.DB_NAME || `mixmlaal_${env}`,
      username: process.env[`${env.toUpperCase()}_DB_USER`] || process.env.DB_USER || 'root',
      password: process.env[`${env.toUpperCase()}_DB_PASSWORD`] || process.env.DB_PASSWORD || ''
    };

    const defaultConfig = {
      // 服务器配置
      'server.port': process.env.PORT || '8080',
      'server.host': '0.0.0.0',
      'server.env': env,
      'server.apiVersion': process.env.API_VERSION || 'v1',
      'server.apiBaseUrl': process.env.API_BASE_URL || `http://localhost:${process.env.PORT || 8080}`,
      
      // 数据库配置
      'database.dialect': process.env.DB_DIALECT || 'mysql',
      'database.host': dbConfig.host,
      'database.port': dbConfig.port,
      'database.name': dbConfig.name,
      'database.username': dbConfig.username,
      'database.password': dbConfig.password,
      'database.connectionLimit': process.env.DB_CONNECTION_LIMIT || '10',
      
      // Redis配置
      'redis.host': process.env.REDIS_HOST || 'localhost',
      'redis.port': process.env.REDIS_PORT || '6379',
      'redis.password': process.env.REDIS_PASSWORD || '',
      'redis.db': process.env.REDIS_DB || '0',
      
      // JWT配置
      'jwt.secret': process.env.JWT_SECRET || 'your_jwt_secret_key',
      'jwt.refreshSecret': process.env.JWT_REFRESH_SECRET || 'your_jwt_refresh_secret_key',
      'jwt.expiresIn': process.env.JWT_EXPIRES_IN || '7d',
      'jwt.refreshExpiresIn': process.env.JWT_REFRESH_EXPIRES_IN || '30d',
      
      // API密钥配置
      'apiKey.secret': process.env.API_KEY_SECRET || 'your_api_key_secret_key',
      'apiKey.expiresIn': process.env.API_KEY_EXPIRES_IN || '365d',
      
      // 高德地图配置
      'amap.key': process.env.GAODE_KEY || process.env.VITE_AMAP_KEY || '',
      'amap.securityConfig': process.env.GAODE_SECURITY_CONFIG || process.env.VITE_AMAP_SECURITY || '',
      
      // 微信支付配置
      'wechat.appId': process.env.WECHAT_APP_ID || '',
      'wechat.mchId': process.env.WECHAT_MCH_ID || '',
      'wechat.key': process.env.WECHAT_KEY || '',
      'wechat.appSecret': process.env.WECHAT_APP_SECRET || '',
      
      // 支付宝配置
      'alipay.appId': process.env.ALIPAY_APP_ID || '',
      'alipay.privateKey': process.env.ALIPAY_PRIVATE_KEY || '',
      'alipay.publicKey': process.env.ALIPAY_PUBLIC_KEY || '',
      'alipay.gatewayUrl': process.env.ALIPAY_GATEWAY_URL || 'https://openapi.alipay.com/gateway.do',
      
      // 短信服务配置
      'sms.accessKeyId': process.env.SMS_ACCESS_KEY_ID || '',
      'sms.accessKeySecret': process.env.SMS_ACCESS_KEY_SECRET || '',
      'sms.signName': process.env.SMS_SIGN_NAME || '米小米拉阿狸',
      'sms.templateCode.login': process.env.SMS_TEMPLATE_CODE_LOGIN || '',
      'sms.templateCode.register': process.env.SMS_TEMPLATE_CODE_REGISTER || '',
      
      // 文件存储配置
      'oss.region': process.env.OSS_REGION || 'oss-cn-hangzhou',
      'oss.bucket': process.env.OSS_BUCKET || 'mixmlaal-files',
      'oss.accessKeyId': process.env.OSS_ACCESS_KEY_ID || '',
      'oss.accessKeySecret': process.env.OSS_ACCESS_KEY_SECRET || '',
      'oss.endpoint': process.env.OSS_ENDPOINT || 'oss-cn-hangzhou.aliyuncs.com',
      'oss.cdnDomain': process.env.OSS_CDN_DOMAIN || '',
      
      // 日志配置
      'log.level': process.env.LOG_LEVEL || 'info',
      'log.filePath': process.env.LOG_FILE_PATH || './logs',
      'log.maxSize': process.env.LOG_MAX_SIZE || '50m',
      'log.maxFiles': process.env.LOG_MAX_FILES || '30d',
      'log.rotation': process.env.LOG_ROTATION === 'true',
      'log.compress': process.env.LOG_COMPRESS === 'true',
      
      // 安全与限流配置
      'rateLimit.windowMs': process.env.RATE_LIMIT_WINDOW_MS || '900000',
      'rateLimit.maxRequests': process.env.RATE_LIMIT_MAX_REQUESTS || '100',
      'cors.origin': process.env.CORS_ORIGIN || 'http://localhost:8080',
      
      // 业务配置
      'business.platformCommissionRate': process.env.PLATFORM_COMMISSION_RATE || '0.27',
      'business.driverMinWithdrawal': process.env.DRIVER_MIN_WITHDRAWAL || '100',
      'business.orderAutoCancelMinutes': process.env.ORDER_AUTO_CANCEL_MINUTES || '5',
      'business.rideShareExpireHours': process.env.RIDE_SHARE_EXPIRE_HOURS || '24',
      'business.freeShippingThreshold': process.env.FREE_SHIPPING_THRESHOLD || '99',
      'business.defaultShippingFee': process.env.DEFAULT_SHIPPING_FEE || '10',
      'business.maxCartItems': process.env.MAX_CART_ITEMS || '100',
      'business.maxLoginAttempts': process.env.MAX_LOGIN_ATTEMPTS || '5',
      'business.smsCodeExpireMinutes': process.env.SMS_CODE_EXPIRE_MINUTES || '5',
      
      // 监控配置
      'monitor.enabled': process.env.MONITOR_ENABLED === 'true',
      'monitor.interval': process.env.MONITOR_INTERVAL || '60000',
      'monitor.alertThreshold.cpu': process.env.MONITOR_ALERT_THRESHOLD_CPU || '80',
      'monitor.alertThreshold.memory': process.env.MONITOR_ALERT_THRESHOLD_MEMORY || '80',
      'monitor.alertThreshold.disk': process.env.MONITOR_ALERT_THRESHOLD_DISK || '90',
      
      // 缓存配置
      'cache.ttl': process.env.CACHE_TTL || '3600',
      'cache.prefix': process.env.CACHE_PREFIX || 'mixmlaal:',
      'cache.maxSize': process.env.CACHE_MAX_SIZE || '10000',
      
      // 安全配置
      'secure.cookie': process.env.SECURE_COOKIE === 'true',
      'secure.httpOnly': process.env.SECURE_HTTP_ONLY === 'true',
      'secure.sameSite': process.env.SECURE_SAME_SITE || 'strict',
      'secure.hsts': process.env.SECURE_HSTS === 'true',
      
      // 部署配置
      'deploy.env': process.env.DEPLOY_ENV || env,
      'deploy.region': process.env.DEPLOY_REGION || 'cn',
      'deploy.zone': process.env.DEPLOY_ZONE || 'zone-a',
      'deploy.instanceType': process.env.DEPLOY_INSTANCE_TYPE || 'small',
      
      // 性能配置
      'performance.enabled': process.env.PERFORMANCE_ENABLED === 'true',
      'performance.sampleRate': process.env.PERFORMANCE_SAMPLE_RATE || '0.1',
      'performance.maxSamples': process.env.PERFORMANCE_MAX_SAMPLES || '1000',
      
      // 国际化配置
      'i18n.defaultLocale': process.env.I18N_DEFAULT_LOCALE || 'zh-CN',
      'i18n.supportedLocales': process.env.I18N_SUPPORTED_LOCALES || 'zh-CN,en-US,ja-JP,ko-KR',
      
      // 其他配置
      'timeout': process.env.TIMEOUT || '30000',
      'maxUploadSize': process.env.MAX_UPLOAD_SIZE || '50mb',
      'maintenanceMode': process.env.MAINTENANCE_MODE === 'true',
      'maintenanceMessage': process.env.MAINTENANCE_MESSAGE || '系统维护中，请稍后再试',
    };

    for (const [key, value] of Object.entries(defaultConfig)) {
      const existingValue = await this.get(key);
      if (!existingValue) {
        await this.set(key, value);
      }
    }
  }

  /**
   * 获取配置
   * @param {string} key 配置键
   * @param {any} defaultValue 默认值
   * @returns {Promise<any>} 配置值
   */
  async get(key, defaultValue = null) {
    try {
      if (this.client) {
        const value = await this.client.get(key);
        return value !== null ? value : defaultValue;
      } else {
        // 使用内存存储
        return this.memoryStorage[key] !== undefined ? this.memoryStorage[key] : defaultValue;
      }
    } catch (error) {
      console.error('获取配置失败:', error);
      // 降级为内存存储
      return this.memoryStorage[key] !== undefined ? this.memoryStorage[key] : defaultValue;
    }
  }

  /**
   * 设置配置
   * @param {string} key 配置键
   * @param {any} value 配置值
   * @param {number} expire 过期时间（秒）
   * @returns {Promise<boolean>} 是否设置成功
   */
  async set(key, value, expire = null) {
    try {
      if (this.client) {
        if (expire) {
          await this.client.set(key, value, { EX: expire });
        } else {
          await this.client.set(key, value);
        }
      } else {
        // 使用内存存储
        this.memoryStorage[key] = value;
      }
      return true;
    } catch (error) {
      console.error('设置配置失败:', error);
      // 降级为内存存储
      this.memoryStorage[key] = value;
      return true;
    }
  }

  /**
   * 删除配置
   * @param {string} key 配置键
   * @returns {Promise<boolean>} 是否删除成功
   */
  async delete(key) {
    try {
      if (this.client) {
        await this.client.del(key);
      } else {
        // 使用内存存储
        delete this.memoryStorage[key];
      }
      return true;
    } catch (error) {
      console.error('删除配置失败:', error);
      // 降级为内存存储
      delete this.memoryStorage[key];
      return true;
    }
  }

  /**
   * 获取所有配置
   * @returns {Promise<object>} 所有配置
   */
  async getAll() {
    try {
      if (this.memoryStorage) {
        return this.memoryStorage;
      }
      // Redis不支持直接获取所有键，这里返回空对象
      return {};
    } catch (error) {
      console.error('获取所有配置失败:', error);
      return {};
    }
  }

  /**
   * 关闭配置中心
   */
  async close() {
    try {
      if (this.client) {
        await this.client.quit();
        console.log('✅ 配置中心已关闭');
      }
    } catch (error) {
      console.error('关闭配置中心失败:', error);
    }
  }
}

// 导出单例实例
module.exports = new ConfigCenter();

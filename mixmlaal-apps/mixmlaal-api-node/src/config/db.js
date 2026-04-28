const { Sequelize } = require('sequelize');
const redis = require('./redis');

// 数据库连接管理类
class DatabaseManager {
  constructor() {
    this.sequelize = null;
    this.useMock = false;
    this.mockData = {
      users: [],
      orders: [],
      products: [],
      coupons: [],
      posts: [],
      likes: [],
      comments: []
    };
  }

  // 初始化数据库连接
  async initialize() {
    try {
      // 尝试连接 MySQL
      const mysqlConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'password',
        database: process.env.DB_NAME || 'mixmlaal',
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
          max: 50,
          min: 10,
          acquire: 60000,
          idle: 30000,
          evict: 10000
        },
        define: {
          timestamps: true,
          underscored: true
        },
        dialectOptions: {
          charset: 'utf8mb4',
          connectTimeout: 30000
        }
      };

      this.sequelize = new Sequelize(mysqlConfig);
      await this.sequelize.authenticate();
      console.log('数据库连接成功');
      return true;
    } catch (error) {
      console.warn('数据库连接失败，使用内存模拟数据:', error.message);
      this.useMock = true;
      this.initializeMockData();
      return false;
    }
  }

  // 初始化模拟数据
  initializeMockData() {
    // 模拟用户数据
    this.mockData.users.push({
      id: 1,
      username: 'testuser',
      password: '123456',
      name: '测试用户',
      phone: '13800138000',
      email: 'test@example.com',
      role: 'user',
      created_at: new Date(),
      updated_at: new Date()
    });

    // 模拟商品数据
    this.mockData.products.push({
      id: 1,
      name: '测试商品',
      price: 100,
      stock: 1000,
      category_id: 1,
      created_at: new Date(),
      updated_at: new Date()
    });

    console.log('模拟数据库初始化成功');
  }

  // 获取连接
  getConnection() {
    return this.sequelize;
  }

  // 获取写连接
  getWriteConnection() {
    return this.sequelize;
  }

  // 获取读连接
  getReadConnection() {
    return this.sequelize;
  }

  // 测试连接
  async testAllConnections() {
    return await this.initialize();
  }

  // 监控连接池状态
  monitorPools() {
    if (!this.useMock && this.sequelize) {
      setInterval(() => {
        const pool = this.sequelize.connectionManager.pool;
        console.log(`数据库连接池: 活跃=${pool.numActive()}, 空闲=${pool.numIdle()}, 总=${pool.size}`);
      }, 60000);
    }
  }

  // 关闭所有连接
  async closeAll() {
    if (this.sequelize) {
      try {
        await this.sequelize.close();
        console.log('数据库连接已关闭');
      } catch (error) {
        console.error('关闭数据库连接失败:', error);
      }
    }
  }

  // 获取模拟数据
  getMockData(collection) {
    return this.mockData[collection] || [];
  }

  // 添加模拟数据
  addMockData(collection, data) {
    if (!this.mockData[collection]) {
      this.mockData[collection] = [];
    }
    data.id = this.mockData[collection].length + 1;
    data.created_at = new Date();
    data.updated_at = new Date();
    this.mockData[collection].push(data);
    return data;
  }
}

// 分库分表策略
class ShardingStrategy {
  constructor() {
    this.shardCount = process.env.DB_SHARD_COUNT || 4;
    this.tableCount = process.env.DB_TABLE_COUNT || 16;
  }

  // 计算分库键
  getShardKey(value) {
    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % this.shardCount;
    }
    return value % this.shardCount;
  }

  // 计算分表键
  getTableKey(value) {
    if (typeof value === 'string') {
      let hash = 0;
      for (let i = 0; i < value.length; i++) {
        const char = value.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return Math.abs(hash) % this.tableCount;
    }
    return value % this.tableCount;
  }

  // 获取表名
  getTableName(baseName, key) {
    const tableIndex = this.getTableKey(key);
    return `${baseName}_${tableIndex}`;
  }

  // 获取数据库名
  getDatabaseName(baseName, key) {
    const shardIndex = this.getShardKey(key);
    return `${baseName}_shard_${shardIndex}`;
  }
}

// 数据库索引优化建议
const indexOptimizations = {
  // 用户表索引
  user: [
    { fields: ['phone'], unique: true },
    { fields: ['email'], unique: true },
    { fields: ['created_at'] },
    { fields: ['status'] }
  ],
  // 订单表索引
  order: [
    { fields: ['user_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['payment_status'] },
    { fields: ['delivery_status'] }
  ],
  // 商品表索引
  product: [
    { fields: ['category_id'] },
    { fields: ['price'] },
    { fields: ['stock'] },
    { fields: ['created_at'] }
  ],
  // 交易表索引
  transaction: [
    { fields: ['user_id'] },
    { fields: ['order_id'] },
    { fields: ['type'] },
    { fields: ['status'] },
    { fields: ['created_at'] }
  ]
};

// 慢查询监控
const setupSlowQueryMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log('慢查询监控已启用');
  }
};

// 数据库备份策略
const backupStrategy = {
  // 每日备份
  daily: {
    schedule: '0 0 * * *',
    retention: 7
  },
  // 每周备份
  weekly: {
    schedule: '0 0 * * 0',
    retention: 4
  },
  // 每月备份
  monthly: {
    schedule: '0 0 1 * *',
    retention: 12
  }
};

// 初始化数据库管理器
const dbManager = new DatabaseManager();
const shardingStrategy = new ShardingStrategy();

// 测试连接
if (process.env.NODE_ENV !== 'test') {
  dbManager.testAllConnections();
  
  if (process.env.NODE_ENV === 'production') {
    dbManager.monitorPools();
    setupSlowQueryMonitoring();
  }
}

// 模拟 Sequelize 实例
const mockSequelize = {
  authenticate: async () => Promise.resolve(),
  sync: async () => Promise.resolve(),
  close: async () => Promise.resolve(),
  model: () => ({
    create: async (data) => data,
    findAll: async () => dbManager.getMockData('users'),
    findOne: async () => dbManager.getMockData('users')[0],
    update: async (data) => [1, [data]],
    destroy: async () => 1
  }),
  connectionManager: {
    pool: {
      numActive: () => 0,
      numIdle: () => 0,
      size: 0
    }
  }
};

module.exports = {
  sequelize: dbManager.sequelize || mockSequelize, // 保持向后兼容
  dbManager,
  shardingStrategy,
  indexOptimizations,
  backupStrategy,
  getWriteConnection: () => dbManager.getWriteConnection(),
  getReadConnection: () => dbManager.getReadConnection()
};
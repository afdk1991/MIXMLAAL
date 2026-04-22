const { Sequelize } = require('sequelize');
require('dotenv').config();

// 分库分表配置
const shardingConfig = {
  // 数据库分片配置
  databases: [
    {
      name: 'mixmlaal_0',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    },
    {
      name: 'mixmlaal_1',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    }
  ],
  
  // 表分片规则
  tables: {
    users: {
      shardKey: 'id',
      shardMethod: 'hash',
      shardCount: 2,
      tableCount: 4
    },
    orders: {
      shardKey: 'user_id',
      shardMethod: 'hash',
      shardCount: 2,
      tableCount: 4
    },
    products: {
      shardKey: 'id',
      shardMethod: 'hash',
      shardCount: 2,
      tableCount: 4
    }
  }
};

// 分片计算函数
function getShardIndex(value, shardCount) {
  if (typeof value === 'number') {
    return value % shardCount;
  }
  // 字符串哈希
  let hash = 0;
  for (let i = 0; i < value.length; i++) {
    const char = value.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash) % shardCount;
}

// 获取表名
function getTableName(baseName, shardKey, tableCount) {
  const index = getShardIndex(shardKey, tableCount);
  return `${baseName}_${index}`;
}

// 获取数据库连接
function getDatabaseConnection(shardKey, shardCount) {
  const shardIndex = getShardIndex(shardKey, shardCount);
  const dbConfig = shardingConfig.databases[shardIndex];
  
  return new Sequelize({
    dialect: 'mysql',
    host: dbConfig.host,
    port: dbConfig.port,
    username: dbConfig.username,
    password: dbConfig.password,
    database: dbConfig.name,
    logging: false,
    pool: {
      max: 50,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  });
}

module.exports = {
  shardingConfig,
  getShardIndex,
  getTableName,
  getDatabaseConnection
};

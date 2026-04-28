const { Sequelize } = require('sequelize');
require('dotenv').config();

// 主库配置（写操作）
const masterConfig = {
  dialect: 'mysql',
  host: process.env.DB_MASTER_HOST || 'localhost',
  port: process.env.DB_MASTER_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'mixmlaal',
  logging: false,
  pool: {
    max: 50,
    min: 10,
    acquire: 30000,
    idle: 10000
  }
};

// 从库配置（读操作）
const slaveConfigs = [
  {
    dialect: 'mysql',
    host: process.env.DB_SLAVE1_HOST || 'localhost',
    port: process.env.DB_SLAVE1_PORT || 3307,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mixmlaal',
    logging: false,
    pool: {
      max: 50,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  },
  {
    dialect: 'mysql',
    host: process.env.DB_SLAVE2_HOST || 'localhost',
    port: process.env.DB_SLAVE2_PORT || 3308,
    username: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mixmlaal',
    logging: false,
    pool: {
      max: 50,
      min: 10,
      acquire: 30000,
      idle: 10000
    }
  }
];

// 创建主库连接
const masterSequelize = new Sequelize(masterConfig);

// 创建从库连接池
const slaveSequelizes = slaveConfigs.map(config => new Sequelize(config));

// 读写分离中间件
class DatabaseCluster {
  constructor() {
    this.master = masterSequelize;
    this.slaves = slaveSequelizes;
    this.currentSlaveIndex = 0;
  }

  // 获取写连接
  getWriteConnection() {
    return this.master;
  }

  // 获取读连接（轮询）
  getReadConnection() {
    if (this.slaves.length === 0) {
      return this.master;
    }
    const slave = this.slaves[this.currentSlaveIndex];
    this.currentSlaveIndex = (this.currentSlaveIndex + 1) % this.slaves.length;
    return slave;
  }

  // 测试连接
  async testConnections() {
    try {
      await this.master.authenticate();
      console.log('Master database connection has been established successfully.');
      
      for (let i = 0; i < this.slaves.length; i++) {
        await this.slaves[i].authenticate();
        console.log(`Slave ${i + 1} database connection has been established successfully.`);
      }
      return true;
    } catch (error) {
      console.error('Unable to connect to the database:', error);
      return false;
    }
  }
}

module.exports = new DatabaseCluster();

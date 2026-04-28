const { Sequelize } = require('sequelize');
const mongoose = require('mongoose');
require('dotenv').config();

// 环境变量验证
const validateEnvVariables = () => {
  const requiredEnvVars = [
    'MYSQL_HOST',
    'MYSQL_PORT',
    'MYSQL_USER',
    'MYSQL_PASSWORD',
    'MYSQL_DATABASE',
    'MONGODB_URI'
  ];
  
  const missingVars = [];
  requiredEnvVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error('缺少必要的环境变量:', missingVars);
    throw new Error('缺少必要的环境变量');
  }
};

// 验证环境变量
validateEnvVariables();

// 数据库连接池配置验证
const validatePoolConfig = (poolConfig) => {
  if (!poolConfig || typeof poolConfig !== 'object') {
    throw new Error('数据库连接池配置无效');
  }
  
  const requiredPoolProps = ['max', 'min', 'acquire', 'idle'];
  requiredPoolProps.forEach(prop => {
    if (typeof poolConfig[prop] !== 'number' || poolConfig[prop] < 0) {
      throw new Error(`数据库连接池配置 ${prop} 无效`);
    }
  });
};

// MySQL 连接配置
const poolConfig = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
};

// 验证连接池配置
validatePoolConfig(poolConfig);

const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  username: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  logging: console.log,
  pool: poolConfig
});

// MongoDB 连接配置
const mongooseOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  family: 4
};

const mongooseConnection = mongoose.connect(
  process.env.MONGODB_URI,
  mongooseOptions
);

// 测试数据库连接
const testDatabaseConnection = async () => {
  try {
    // 测试 MySQL 连接
    await sequelize.authenticate();
    console.log('MySQL 连接成功');
    
    // 测试 MongoDB 连接
    await mongooseConnection;
    console.log('MongoDB 连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error);
    throw error;
  }
};

module.exports = {
  sequelize,
  mongooseConnection,
  testDatabaseConnection
};
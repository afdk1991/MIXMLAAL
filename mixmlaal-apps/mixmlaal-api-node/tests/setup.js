/**
 * 测试环境配置文件
 * 版本: v1.0.0.0
 * 说明: 配置测试环境
 */

// 设置环境变量
process.env.NODE_ENV = 'test';
process.env.PORT = '8081';
process.env.API_PREFIX = '/api/v1';
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '24h';
process.env.DB_HOST = 'localhost';
process.env.DB_PORT = '3306';
process.env.DB_USER = 'root';
process.env.DB_PASSWORD = 'password';
process.env.DB_NAME = 'mixmlaal_test';
process.env.REDIS_HOST = 'localhost';
process.env.REDIS_PORT = '6379';
process.env.MONGO_URI = 'mongodb://localhost:27017/mixmlaal_test';
process.env.CORS_ORIGIN = '*';

// 模拟数据库连接
const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');

// 模拟mongoose连接
jest.mock('mongoose', () => ({
  connect: jest.fn().mockResolvedValue({}),
  disconnect: jest.fn().mockResolvedValue({}),
  model: jest.fn().mockReturnValue({
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue({})
  })
}));

// 模拟Sequelize连接
jest.mock('sequelize', () => ({
  Sequelize: jest.fn().mockImplementation(() => ({
    authenticate: jest.fn().mockResolvedValue({}),
    close: jest.fn().mockResolvedValue({}),
    define: jest.fn().mockReturnValue({})
  }))
}));

// 模拟Redis连接
jest.mock('redis', () => ({
  createClient: jest.fn().mockReturnValue({
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn().mockResolvedValue({}),
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1)
  })
}));

// 模拟winston日志
jest.mock('winston', () => ({
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn()
}));

// 模拟bcrypt
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn().mockResolvedValue(true)
}));

// 模拟jsonwebtoken
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn().mockReturnValue('mock-token'),
  verify: jest.fn().mockReturnValue({ id: '1', email: 'test@example.com' })
}));
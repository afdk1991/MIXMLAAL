/**
 * 认证路由测试
 * 版本: v1.0.0.0
 * 说明: 测试认证相关的API路由
 */

const request = require('supertest');
const express = require('express');
const authRoutes = require('../../src/routes/auth');

// 创建测试应用
const app = express();
app.use(express.json());
app.use('/api/v1/auth', authRoutes);

// 模拟数据库和服务
jest.mock('../../src/services/authService', () => ({
  login: jest.fn().mockResolvedValue({
    userId: 'USER123',
    phone: '13800138000',
    nickname: '测试用户',
    role: 'user'
  }),
  register: jest.fn().mockResolvedValue({
    userId: 'USER124',
    phone: '13800138001',
    nickname: '新用户',
    role: 'user'
  }),
  sendVerificationCode: jest.fn().mockResolvedValue({ success: true })
}));

jest.mock('../../src/utils/jwt', () => ({
  generateToken: jest.fn().mockReturnValue('mock-token')
}));

describe('Auth Routes', () => {
  describe('POST /api/v1/auth/login', () => {
    it('should return 200 with token and user info on successful login', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '13800138000',
          password: 'password123'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBe('mock-token');
      expect(response.body.data.user).toBeDefined();
    });

    it('should return 400 with validation error for invalid phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: 'invalid-phone',
          password: 'password123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });

    it('should return 400 with validation error for short password', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          phone: '13800138000',
          password: '123'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should return 201 with token and user info on successful registration', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: '13800138001',
          password: 'password123',
          nickname: '新用户'
        });

      expect(response.statusCode).toBe(201);
      expect(response.body.status).toBe('success');
      expect(response.body.data.token).toBe('mock-token');
      expect(response.body.data.user).toBeDefined();
    });

    it('should return 400 with validation error for invalid phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          phone: 'invalid-phone',
          password: 'password123',
          nickname: '新用户'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/v1/auth/send-code', () => {
    it('should return 200 on successful code sending', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-code')
        .send({
          phone: '13800138000'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
    });

    it('should return 400 with validation error for invalid phone', async () => {
      const response = await request(app)
        .post('/api/v1/auth/send-code')
        .send({
          phone: 'invalid-phone'
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });
});

/**
 * API集成测试
 * 版本: v1.0.0.0
 * 说明: 测试整个API服务的集成功能
 */

const request = require('supertest');
const app = require('../../src/app');

describe('API集成测试', () => {
  let token;

  // 测试前获取认证令牌
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      });
    
    if (response.status === 200) {
      token = response.body.data.token;
    }
  });

  // 测试健康检查接口
  describe('健康检查接口', () => {
    test('GET /api/v1/health 应该返回健康状态', async () => {
      const response = await request(app).get('/api/v1/health');
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('OK');
      expect(response.body.data.status).toBe('healthy');
    });
  });

  // 测试版本信息接口
  describe('版本信息接口', () => {
    test('GET /api/v1/version 应该返回版本信息', async () => {
      const response = await request(app).get('/api/v1/version');
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('success');
      expect(response.body.data).toHaveProperty('version');
    });
  });

  // 测试认证接口
  describe('认证接口', () => {
    test('POST /api/v1/auth/register 应该成功注册用户', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: `test${Date.now()}@example.com`,
          password: 'password123',
          name: 'Test User'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('注册成功');
    });

    test('POST /api/v1/auth/login 应该成功登录', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data).toHaveProperty('token');
    });
  });

  // 测试用户接口（需要认证）
  describe('用户接口', () => {
    test('GET /api/v1/user/profile 应该返回用户信息', async () => {
      if (!token) {
        console.log('跳过用户接口测试，因为没有获取到认证令牌');
        return;
      }
      
      const response = await request(app)
        .get('/api/v1/user/profile')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取用户信息成功');
    });
  });

  // 测试AI接口（需要认证）
  describe('AI接口', () => {
    test('POST /api/v1/ai/chat 应该成功处理聊天请求', async () => {
      if (!token) {
        console.log('跳过AI接口测试，因为没有获取到认证令牌');
        return;
      }
      
      const response = await request(app)
        .post('/api/v1/ai/chat')
        .set('Authorization', `Bearer ${token}`)
        .send({
          message: 'Hello, AI!'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('聊天请求处理成功');
    });
  });

  // 测试合规接口（需要认证）
  describe('合规接口', () => {
    test('POST /api/v1/compliance/check 应该成功处理合规检查请求', async () => {
      if (!token) {
        console.log('跳过合规接口测试，因为没有获取到认证令牌');
        return;
      }
      
      const response = await request(app)
        .post('/api/v1/compliance/check')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'data-privacy',
          data: { userId: '123' }
        });
      
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('合规检查请求处理成功');
    });
  });

  // 测试404接口
  describe('404接口', () => {
    test('GET /api/v1/nonexistent 应该返回404错误', async () => {
      const response = await request(app).get('/api/v1/nonexistent');
      expect(response.status).toBe(404);
      expect(response.body.code).toBe(404);
      expect(response.body.message).toBe('接口不存在');
    });
  });
});
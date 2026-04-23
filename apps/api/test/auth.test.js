const request = require('supertest')
const app = require('../src/app')
const { User } = require('../src/models')

// 测试认证相关功能
describe('认证功能测试', () => {
  // 测试注册功能
  describe('POST /api/v1/auth/register', () => {
    test('应该成功注册新用户', async () => {
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        })
      
      expect(response.statusCode).toBe(201)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('注册成功')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.username).toBe('testuser')
      expect(response.body.data.user.email).toBe('test@example.com')
    })

    test('应该返回400错误，当邮箱已存在时', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'existinguser',
          email: 'existing@example.com',
          password: 'password123'
        })
      
      // 再次使用相同的邮箱注册
      const response = await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'anotheruser',
          email: 'existing@example.com',
          password: 'password123'
        })
      
      expect(response.statusCode).toBe(400)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('邮箱已存在')
    })
  })

  // 测试登录功能
  describe('POST /api/v1/auth/login', () => {
    test('应该成功登录并返回token', async () => {
      // 先注册一个用户
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        })
      
      // 登录
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        })
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('登录成功')
      expect(response.body.data).toHaveProperty('access_token')
      expect(response.body.data).toHaveProperty('user')
    })

    test('应该返回401错误，当邮箱或密码错误时', async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'wrongpassword'
        })
      
      expect(response.statusCode).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('邮箱或密码错误')
    })
  })

  // 测试获取当前用户信息
  describe('GET /api/v1/auth/me', () => {
    test('应该成功获取当前用户信息', async () => {
      // 先注册并登录
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'meuser',
          email: 'me@example.com',
          password: 'password123'
        })
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'me@example.com',
          password: 'password123'
        })
      
      const token = loginResponse.body.data.access_token
      
      // 获取当前用户信息
      const response = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('获取用户信息成功')
      expect(response.body.data.user).toHaveProperty('id')
      expect(response.body.data.user.email).toBe('me@example.com')
    })

    test('应该返回401错误，当未提供token时', async () => {
      const response = await request(app)
        .get('/api/v1/auth/me')
      
      expect(response.statusCode).toBe(401)
      expect(response.body.success).toBe(false)
      expect(response.body.message).toBe('未提供认证令牌')
    })
  })

  // 测试退出登录
  describe('POST /api/v1/auth/logout', () => {
    test('应该成功退出登录', async () => {
      // 先注册并登录
      await request(app)
        .post('/api/v1/auth/register')
        .send({
          username: 'logoutuser',
          email: 'logout@example.com',
          password: 'password123'
        })
      
      const loginResponse = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'logout@example.com',
          password: 'password123'
        })
      
      const token = loginResponse.body.data.access_token
      
      // 退出登录
      const response = await request(app)
        .post('/api/v1/auth/logout')
        .set('Authorization', `Bearer ${token}`)
      
      expect(response.statusCode).toBe(200)
      expect(response.body.success).toBe(true)
      expect(response.body.message).toBe('退出登录成功')
    })
  })
})

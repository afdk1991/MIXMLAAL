const request = require('supertest');
const app = require('../mixmlaal-apps/mixmlaal-api-node/src/app');

describe('API Service Tests', () => {
  let token;
  let testOrderId;
  let testAddressId;

  // 登录获取token
  beforeAll(async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        username: 'admin',
        password: 'password'
      });
    token = response.body.data.token;
  });

  // 测试认证API
  describe('Authentication API', () => {
    test('POST /api/auth/login - 登录成功', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'password'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('登录成功');
      expect(response.body.data.token).toBeDefined();
    });

    test('POST /api/auth/login - 登录失败（用户名或密码错误）', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'admin',
          password: 'wrongpassword'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(401);
      expect(response.body.message).toBe('用户名或密码错误');
    });

    test('POST /api/auth/register - 注册新用户', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'testuser',
          password: 'password123',
          email: 'test@example.com',
          role: 'user'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('注册成功');
    });

    test('POST /api/auth/logout - 登出', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('登出成功');
    });

    test('POST /api/auth/refresh - 刷新token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('token刷新成功');
      expect(response.body.data.token).toBeDefined();
    });

    test('GET /api/auth/me - 获取当前用户信息', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取用户信息成功');
      expect(response.body.data.username).toBe('admin');
    });
  });

  // 测试客户API
  describe('Customer API', () => {
    test('GET /api/customer/orders - 获取订单列表', async () => {
      const response = await request(app)
        .get('/api/customer/orders')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取订单列表成功');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    test('POST /api/customer/orders - 创建订单', async () => {
      const response = await request(app)
        .post('/api/customer/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          items: [
            {
              productId: 1,
              quantity: 2,
              price: 100
            }
          ],
          addressId: 1,
          totalAmount: 200,
          paymentMethod: 'online'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('订单创建成功');
      expect(response.body.data.orderId).toBeDefined();
      testOrderId = response.body.data.orderId;
    });

    test('GET /api/customer/orders/:id - 获取订单详情', async () => {
      if (testOrderId) {
        const response = await request(app)
          .get(`/api/customer/orders/${testOrderId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe('获取订单详情成功');
        expect(response.body.data.id).toBe(testOrderId);
      }
    });

    test('GET /api/customer/orders/:id/track - 订单追踪', async () => {
      if (testOrderId) {
        const response = await request(app)
          .get(`/api/customer/orders/${testOrderId}/track`)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe('获取订单追踪信息成功');
        expect(response.body.data.status).toBeDefined();
      }
    });

    test('POST /api/customer/orders/:id/pay - 支付订单', async () => {
      if (testOrderId) {
        const response = await request(app)
          .post(`/api/customer/orders/${testOrderId}/pay`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            paymentMethod: 'online',
            transactionId: 'test_transaction_123'
          });
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe('支付成功');
      }
    });

    test('GET /api/customer/profile - 获取客户信息', async () => {
      const response = await request(app)
        .get('/api/customer/profile')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取客户信息成功');
      expect(response.body.data.username).toBeDefined();
    });

    test('PUT /api/customer/profile - 更新客户信息', async () => {
      const response = await request(app)
        .put('/api/customer/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test User',
          phone: '13800138000',
          email: 'test@example.com'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('更新客户信息成功');
    });

    test('GET /api/customer/addresses - 获取地址列表', async () => {
      const response = await request(app)
        .get('/api/customer/addresses')
        .set('Authorization', `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取地址列表成功');
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    test('POST /api/customer/addresses - 添加地址', async () => {
      const response = await request(app)
        .post('/api/customer/addresses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Test Address',
          phone: '13800138000',
          province: '北京市',
          city: '北京市',
          district: '朝阳区',
          detail: '测试地址',
          isDefault: false
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('添加地址成功');
      expect(response.body.data.addressId).toBeDefined();
      testAddressId = response.body.data.addressId;
    });

    test('PUT /api/customer/addresses/:id - 更新地址', async () => {
      if (testAddressId) {
        const response = await request(app)
          .put(`/api/customer/addresses/${testAddressId}`)
          .set('Authorization', `Bearer ${token}`)
          .send({
            name: 'Updated Address',
            phone: '13900139000',
            detail: '更新后的测试地址'
          });
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe('更新地址成功');
      }
    });

    test('DELETE /api/customer/addresses/:id - 删除地址', async () => {
      if (testAddressId) {
        const response = await request(app)
          .delete(`/api/customer/addresses/${testAddressId}`)
          .set('Authorization', `Bearer ${token}`);
        expect(response.status).toBe(200);
        expect(response.body.code).toBe(200);
        expect(response.body.message).toBe('删除地址成功');
      }
    });
  });

  // 测试调度API
  describe('Dispatch API', () => {
    test('POST /api/dispatch/intelligent-dispatch - 智能派车', async () => {
      const response = await request(app)
        .post('/api/dispatch/intelligent-dispatch')
        .set('Authorization', `Bearer ${token}`)
        .send({
          orderIds: [1, 2, 3],
          warehouseId: 1
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('智能派车成功');
      expect(response.body.data.tasks).toBeDefined();
    });

    test('POST /api/dispatch/optimize-route - 路线优化', async () => {
      const response = await request(app)
        .post('/api/dispatch/optimize-route')
        .set('Authorization', `Bearer ${token}`)
        .send({
          waypoints: [
            { lat: 39.9042, lng: 116.4074 },
            { lat: 39.9142, lng: 116.4174 },
            { lat: 39.9242, lng: 116.4274 }
          ],
          vehicleType: 'van'
        });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('路线优化成功');
      expect(response.body.data.optimizedRoute).toBeDefined();
    });

    test('GET /api/dispatch/predict-order-volume - 预测订单量', async () => {
      const response = await request(app)
        .get('/api/dispatch/predict-order-volume')
        .set('Authorization', `Bearer ${token}`)
        .query({ date: '2026-04-17' });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('预测订单量成功');
      expect(response.body.data.predictedVolume).toBeDefined();
    });

    test('GET /api/dispatch/statistics - 获取调度统计', async () => {
      const response = await request(app)
        .get('/api/dispatch/statistics')
        .set('Authorization', `Bearer ${token}`)
        .query({ startDate: '2026-04-01', endDate: '2026-04-16' });
      expect(response.status).toBe(200);
      expect(response.body.code).toBe(200);
      expect(response.body.message).toBe('获取调度统计成功');
      expect(response.body.data.totalOrders).toBeDefined();
    });
  });
});
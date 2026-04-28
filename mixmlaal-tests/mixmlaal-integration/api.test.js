const request = require('supertest');
const app = require('../../mixmlaal-apps/mixmlaal-api-node/src/app');
const { User, sequelize } = require('../../mixmlaal-apps/mixmlaal-api-node/src/models');

let token;
let testUser;

beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  testUser = await User.create({
    username: 'testuser',
    password: '123456',
    name: '测试用户',
    phone: '13800138000',
    email: 'test@example.com',
    role: 'user'
  });
  
  const loginResponse = await request(app)
    .post('/api/v1/auth/login')
    .send({
      username: 'testuser',
      password: '123456'
    });
  
  token = loginResponse.body.data.token;
});

describe('认证系统测试', () => {
  test('登录测试', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'testuser',
        password: '123456'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.token).toBeTruthy();
  });
  
  test('获取当前用户信息', async () => {
    const response = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.username).toBe('testuser');
  });
});

describe('用户系统测试', () => {
  test('获取用户信息', async () => {
    const response = await request(app)
      .get('/api/v1/user/me')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.name).toBe('测试用户');
  });
  
  test('更新用户信息', async () => {
    const response = await request(app)
      .put('/api/v1/user/me')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '更新的测试用户'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.name).toBe('更新的测试用户');
  });
});

describe('地址管理测试', () => {
  test('添加地址', async () => {
    const response = await request(app)
      .post('/api/v1/address/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: '张三',
        phone: '13800138000',
        address: '北京市朝阳区',
        latitude: 39.9042,
        longitude: 116.4074,
        isDefault: true
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.id).toBeTruthy();
  });
  
  test('获取地址列表', async () => {
    const response = await request(app)
      .get('/api/v1/address/list')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(Array.isArray(response.body.data)).toBe(true);
  });
});

describe('商品系统测试', () => {
  test('获取商品列表', async () => {
    const response = await request(app)
      .get('/api/v1/product/list');
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(Array.isArray(response.body.data.items)).toBe(true);
  });
});

describe('购物车测试', () => {
  test('添加商品到购物车', async () => {
    const response = await request(app)
      .post('/api/v1/cart/add')
      .set('Authorization', `Bearer ${token}`)
      .send({
        productId: 1,
        quantity: 2
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
  
  test('获取购物车列表', async () => {
    const response = await request(app)
      .get('/api/v1/cart/list')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('订单系统测试', () => {
  test('创建订单', async () => {
    const response = await request(app)
      .post('/api/v1/order/create')
      .set('Authorization', `Bearer ${token}`)
      .send({
        items: [{
          productId: 1,
          quantity: 1
        }],
        addressId: 1,
        remark: '测试订单'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
    expect(response.body.data.orderNo).toBeTruthy();
  });
});

describe('支付系统测试', () => {
  test('微信支付', async () => {
    const response = await request(app)
      .post('/api/v1/payment/wechat')
      .set('Authorization', `Bearer ${token}`)
      .send({
        orderNo: 'TEST123',
        amount: 100
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('外卖系统测试', () => {
  test('获取商家列表', async () => {
    const response = await request(app)
      .get('/api/v1/food/merchants');
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('跑腿系统测试', () => {
  test('预估费用', async () => {
    const response = await request(app)
      .post('/api/v1/errand/estimate')
      .send({
        from: { lat: 39.9042, lng: 116.4074 },
        to: { lat: 39.9142, lng: 116.4174 },
        weight: 2
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('社交系统测试', () => {
  test('发布动态', async () => {
    const response = await request(app)
      .post('/api/v1/social/posts')
      .set('Authorization', `Bearer ${token}`)
      .send({
        content: '测试动态内容'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
  
  test('获取动态列表', async () => {
    const response = await request(app)
      .get('/api/v1/social/posts');
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('优惠券系统测试', () => {
  test('获取可用优惠券', async () => {
    const response = await request(app)
      .get('/api/v1/coupon/available');
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
  
  test('获取用户优惠券', async () => {
    const response = await request(app)
      .get('/api/v1/coupon/list')
      .set('Authorization', `Bearer ${token}`);
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
  
  test('领取优惠券', async () => {
    const response = await request(app)
      .post('/api/v1/coupon/claim')
      .set('Authorization', `Bearer ${token}`)
      .send({
        couponId: 1
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('社交系统测试扩展', () => {
  test('点赞动态', async () => {
    const response = await request(app)
      .post('/api/v1/social/like')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId: 1
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
  
  test('评论动态', async () => {
    const response = await request(app)
      .post('/api/v1/social/comment')
      .set('Authorization', `Bearer ${token}`)
      .send({
        postId: 1,
        content: '测试评论内容'
      });
    
    expect(response.status).toBe(200);
    expect(response.body.code).toBe(200);
  });
});

describe('边界情况测试', () => {
  test('无效的登录凭证', async () => {
    const response = await request(app)
      .post('/api/v1/auth/login')
      .send({
        username: 'invalid',
        password: 'invalid'
      });
    
    expect(response.status).toBe(401);
  });
  
  test('未授权访问需要认证的接口', async () => {
    const response = await request(app)
      .get('/api/v1/user/me');
    
    expect(response.status).toBe(401);
  });
});

afterAll(async () => {
  await sequelize.close();
});

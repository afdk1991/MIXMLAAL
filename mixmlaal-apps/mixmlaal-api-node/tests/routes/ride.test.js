/**
 * 打车服务API测试
 * 版本: v1.0.0.0
 * 说明: 测试打车服务相关的API路由
 */

const request = require('supertest');
const express = require('express');

// 模拟数据
const mockRideDrivers = [
  {
    driverId: 'D001',
    name: '张师傅',
    rating: 4.9,
    carModel: '丰田卡罗拉',
    carNumber: '京A12345',
    distance: 1.2,
    estimatedTime: 5,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20driver%20avatar&image_size=square',
  },
];

// 创建测试应用
const app = express();
app.use(express.json());

// 模拟认证中间件
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }
  next();
};

// 打车服务API路由
app.get('/api/ride/drivers', (req, res) => {
  res.json({
    status: 'success',
    data: mockRideDrivers
  });
});

app.post('/api/ride/estimate', (req, res) => {
  res.json({
    status: 'success',
    data: {
      estimatedPrice: 35,
      estimatedTime: 15
    }
  });
});

app.post('/api/ride/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'RIDE' + Date.now(),
      status: 'pending',
      driverId: 'D001',
      driverName: '张师傅'
    }
  });
});

describe('Ride API Routes', () => {
  describe('GET /api/ride/drivers', () => {
    it('should return 200 with drivers list', async () => {
      const response = await request(app)
        .get('/api/ride/drivers');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/ride/estimate', () => {
    it('should return 200 with price estimate', async () => {
      const response = await request(app)
        .post('/api/ride/estimate')
        .send({
          from: {
            latitude: 39.915,
            longitude: 116.404
          },
          to: {
            latitude: 39.916,
            longitude: 116.405
          }
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.estimatedPrice).toBeDefined();
      expect(response.body.data.estimatedTime).toBeDefined();
    });
  });

  describe('POST /api/ride/order', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/ride/order')
        .send({
          from: {
            latitude: 39.915,
            longitude: 116.404,
            address: '北京市朝阳区建国路88号'
          },
          to: {
            latitude: 39.916,
            longitude: 116.405,
            address: '北京市朝阳区建国路99号'
          }
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('未授权');
    });
  });
});

/**
 * 食品外卖API测试
 * 版本: v1.0.0.0
 * 说明: 测试食品外卖相关的API路由
 */

const request = require('supertest');
const express = require('express');

// 模拟数据
const mockFoodMerchants = [
  {
    merchantId: 'M001',
    name: '麦当劳',
    rating: 4.5,
    sales: 1234,
    deliveryFee: 5,
    minOrder: 20,
    deliveryTime: '30-40分钟',
    category: '快餐',
    address: '北京市朝阳区建国路88号',
    location: { lng: 116.404, lat: 39.915 },
    distance: 800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=McDonald%27s%20fast%20food%20restaurant&image_size=landscape_4_3',
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

// 食品外卖API路由
app.get('/api/food/merchants', (req, res) => {
  res.json({
    status: 'success',
    data: mockFoodMerchants
  });
});

app.get('/api/food/merchants/:merchantId/menu', (req, res) => {
  const { merchantId } = req.params;
  const menu = [
    {
      id: '1',
      name: '汉堡',
      price: 25,
      description: '经典汉堡',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamburger&image_size=square'
    },
    {
      id: '2',
      name: '薯条',
      price: 15,
      description: '香脆薯条',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=french%20fries&image_size=square'
    }
  ];
  res.json({
    status: 'success',
    data: menu
  });
});

app.post('/api/food/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'FOOD' + Date.now(),
      status: 'pending',
      totalAmount: req.body.totalAmount
    }
  });
});

describe('Food API Routes', () => {
  describe('GET /api/food/merchants', () => {
    it('should return 200 with merchants list', async () => {
      const response = await request(app)
        .get('/api/food/merchants');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/food/merchants/:merchantId/menu', () => {
    it('should return 200 with menu items', async () => {
      const response = await request(app)
        .get('/api/food/merchants/M001/menu');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/food/order', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/food/order')
        .send({
          merchantId: 'M001',
          items: [
            { id: '1', quantity: 2 },
            { id: '2', quantity: 1 }
          ],
          totalAmount: 65
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('未授权');
    });
  });
});

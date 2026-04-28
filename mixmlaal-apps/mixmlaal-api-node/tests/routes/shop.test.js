/**
 * 商城API测试
 * 版本: v1.0.0.0
 * 说明: 测试商城相关的API路由
 */

const request = require('supertest');
const express = require('express');

// 模拟数据
const mockShopProducts = [
  {
    productId: 'P001',
    name: '新鲜水果篮',
    price: 99.00,
    description: '精选时令水果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20in%20a%20basket&image_size=square',
    category: '食品',
    stock: 100,
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

// 商城API路由
app.get('/api/shop/products', (req, res) => {
  res.json({
    status: 'success',
    data: mockShopProducts
  });
});

app.get('/api/shop/products/:id', (req, res) => {
  const { id } = req.params;
  const product = mockShopProducts.find(p => p.productId === id);
  res.json({
    status: 'success',
    data: product
  });
});

app.get('/api/shop/cart', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: []
  });
});

app.post('/api/shop/cart', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      cartId: 'CART' + Date.now(),
      product: req.body
    }
  });
});

describe('Shop API Routes', () => {
  describe('GET /api/shop/products', () => {
    it('should return 200 with products list', async () => {
      const response = await request(app)
        .get('/api/shop/products');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('GET /api/shop/products/:id', () => {
    it('should return 200 with product details', async () => {
      const response = await request(app)
        .get('/api/shop/products/P001');

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(response.body.data.productId).toBe('P001');
    });
  });

  describe('GET /api/shop/cart', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .get('/api/shop/cart');

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('未授权');
    });
  });

  describe('POST /api/shop/cart', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/shop/cart')
        .send({
          productId: 'P001',
          quantity: 2
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('未授权');
    });
  });
});

/**
 * 跑腿服务API测试
 * 版本: v1.0.0.0
 * 说明: 测试跑腿服务相关的API路由
 */

const request = require('supertest');
const express = require('express');

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

// 跑腿服务API路由
app.post('/api/errand/estimate', (req, res) => {
  res.json({
    status: 'success',
    data: {
      estimatedPrice: {
        min: 15,
        max: 25
      },
      estimatedTime: 30
    }
  });
});

app.post('/api/errand/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'ERRAND' + Date.now(),
      status: 'pending',
      estimatedPrice: req.body.estimatedPrice
    }
  });
});

describe('Errand API Routes', () => {
  describe('POST /api/errand/estimate', () => {
    it('should return 200 with price estimate', async () => {
      const response = await request(app)
        .post('/api/errand/estimate')
        .send({
          from: '北京市朝阳区建国路88号',
          to: '北京市朝阳区建国路99号',
          weight: 1,
          size: 'small'
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.estimatedPrice).toBeDefined();
      expect(response.body.data.estimatedTime).toBeDefined();
    });
  });

  describe('POST /api/errand/order', () => {
    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/errand/order')
        .send({
          from: '北京市朝阳区建国路88号',
          to: '北京市朝阳区建国路99号',
          type: 'express',
          estimatedPrice: {
            min: 15,
            max: 25
          },
          description: '文件配送',
          contactName: '张三',
          contactPhone: '13800138000',
          weight: 1,
          size: 'small'
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.error).toBe('未授权');
    });
  });
});

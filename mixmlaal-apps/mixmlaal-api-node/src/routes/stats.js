const express = require('express');
const router = express.Router();

/**
 * 数据统计模块路由
 * 对应域名: stats.laal.top
 * 用途: 数据统计入口
 */

// 获取平台统计概览
router.get('/overview', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      users: {
        total: 1000000,
        active: 500000,
        new: 10000
      },
      orders: {
        total: 500000,
        completed: 450000,
        pending: 50000
      },
      sales: {
        total: 1000000000,
        daily: 10000000,
        monthly: 300000000
      },
      products: {
        total: 100000,
        active: 80000,
        new: 5000
      }
    }
  });
});

// 获取用户统计
router.get('/users', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      trends: [
        { date: '2024-01-01', count: 1000 },
        { date: '2024-01-02', count: 1200 },
        { date: '2024-01-03', count: 1500 },
        { date: '2024-01-04', count: 1300 },
        { date: '2024-01-05', count: 1800 }
      ],
      demographics: {
        age: [
          { range: '18-24', percentage: 20 },
          { range: '25-34', percentage: 40 },
          { range: '35-44', percentage: 25 },
          { range: '45+', percentage: 15 }
        ],
        gender: [
          { gender: 'male', percentage: 55 },
          { gender: 'female', percentage: 45 }
        ],
        location: [
          { region: '北京', percentage: 20 },
          { region: '上海', percentage: 15 },
          { region: '广州', percentage: 10 },
          { region: '深圳', percentage: 8 },
          { region: '其他', percentage: 47 }
        ]
      }
    }
  });
});

// 获取订单统计
router.get('/orders', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      trends: [
        { date: '2024-01-01', count: 1000, amount: 100000 },
        { date: '2024-01-02', count: 1200, amount: 120000 },
        { date: '2024-01-03', count: 1500, amount: 150000 },
        { date: '2024-01-04', count: 1300, amount: 130000 },
        { date: '2024-01-05', count: 1800, amount: 180000 }
      ],
      statusDistribution: [
        { status: 'pending', percentage: 10 },
        { status: 'processing', percentage: 20 },
        { status: 'completed', percentage: 60 },
        { status: 'cancelled', percentage: 10 }
      ],
      paymentMethods: [
        { method: 'alipay', percentage: 40 },
        { method: 'wechat', percentage: 35 },
        { method: 'bank', percentage: 20 },
        { method: 'other', percentage: 5 }
      ]
    }
  });
});

// 获取商品统计
router.get('/products', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      topSelling: [
        { id: 1, name: 'iPhone 15', sales: 10000, revenue: 69990000 },
        { id: 2, name: 'MacBook Pro', sales: 5000, revenue: 64995000 },
        { id: 3, name: 'AirPods Pro', sales: 8000, revenue: 15992000 },
        { id: 4, name: 'iPad Pro', sales: 3000, revenue: 17997000 },
        { id: 5, name: 'Apple Watch', sales: 4000, revenue: 11996000 }
      ],
      categories: [
        { name: '电子产品', percentage: 40 },
        { name: '服装', percentage: 25 },
        { name: '食品', percentage: 15 },
        { name: '家居', percentage: 10 },
        { name: '其他', percentage: 10 }
      ],
      stockStatus: [
        { status: 'in_stock', percentage: 80 },
        { status: 'low_stock', percentage: 15 },
        { status: 'out_of_stock', percentage: 5 }
      ]
    }
  });
});

// 获取流量统计
router.get('/traffic', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      trends: [
        { date: '2024-01-01', visitors: 10000, pageviews: 50000 },
        { date: '2024-01-02', visitors: 12000, pageviews: 60000 },
        { date: '2024-01-03', visitors: 15000, pageviews: 75000 },
        { date: '2024-01-04', visitors: 13000, pageviews: 65000 },
        { date: '2024-01-05', visitors: 18000, pageviews: 90000 }
      ],
      sources: [
        { source: 'direct', percentage: 30 },
        { source: 'search', percentage: 40 },
        { source: 'social', percentage: 20 },
        { source: 'referral', percentage: 10 }
      ],
      devices: [
        { device: 'mobile', percentage: 60 },
        { device: 'desktop', percentage: 30 },
        { device: 'tablet', percentage: 10 }
      ]
    }
  });
});

// 导出统计数据
router.get('/export', (req, res) => {
  const { type, format = 'xlsx' } = req.query;
  res.json({
    code: 200,
    message: '数据导出成功',
    data: {
      downloadUrl: `https://stats.laal.top/exports/${type}_${Date.now()}.${format}`,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
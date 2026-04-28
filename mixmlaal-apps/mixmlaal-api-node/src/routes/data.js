const express = require('express');
const router = express.Router();

/**
 * 数据中心模块路由
 * 对应域名: data.laal.top
 * 用途: 数据中心入口
 */

// 获取数据概览
router.get('/overview', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      totalUsers: 10000,
      activeUsers: 5000,
      totalOrders: 50000,
      totalSales: 1000000,
      averageOrderValue: 20,
      conversionRate: 5
    }
  });
});

// 获取用户数据分析
router.get('/users', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      trends: [
        { date: '2024-01-01', count: 100 },
        { date: '2024-01-02', count: 120 },
        { date: '2024-01-03', count: 150 },
        { date: '2024-01-04', count: 130 },
        { date: '2024-01-05', count: 180 }
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
        ]
      }
    }
  });
});

// 获取订单数据分析
router.get('/orders', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      trends: [
        { date: '2024-01-01', count: 1000, amount: 20000 },
        { date: '2024-01-02', count: 1200, amount: 24000 },
        { date: '2024-01-03', count: 1500, amount: 30000 },
        { date: '2024-01-04', count: 1300, amount: 26000 },
        { date: '2024-01-05', count: 1800, amount: 36000 }
      ],
      statusDistribution: [
        { status: 'pending', percentage: 10 },
        { status: 'processing', percentage: 20 },
        { status: 'completed', percentage: 60 },
        { status: 'cancelled', percentage: 10 }
      ]
    }
  });
});

// 获取商品数据分析
router.get('/products', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      topSelling: [
        { id: 1, name: '商品1', sales: 1000, revenue: 99000 },
        { id: 2, name: '商品2', sales: 800, revenue: 159200 },
        { id: 3, name: '商品3', sales: 600, revenue: 59400 },
        { id: 4, name: '商品4', sales: 400, revenue: 39600 },
        { id: 5, name: '商品5', sales: 300, revenue: 29700 }
      ],
      categories: [
        { name: '电子产品', percentage: 40 },
        { name: '服装', percentage: 25 },
        { name: '食品', percentage: 15 },
        { name: '其他', percentage: 20 }
      ]
    }
  });
});

// 导出数据
router.get('/export', (req, res) => {
  res.json({
    code: 200,
    message: '数据导出成功',
    data: {
      downloadUrl: 'https://data.laal.top/exports/data_20240101.xlsx',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
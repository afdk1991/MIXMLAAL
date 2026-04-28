const express = require('express');
const router = express.Router();

/**
 * 用户中心模块路由
 * 对应域名: center.laal.top
 * 用途: 用户中心入口
 */

// 获取用户信息
router.get('/profile', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: 1,
      username: 'user1',
      email: 'user1@example.com',
      phone: '13800138000',
      avatar: 'https://img.laal.top/avatar/1.jpg',
      nickname: '测试用户',
      gender: 'male',
      birthday: '1990-01-01',
      createdAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 更新用户信息
router.put('/profile', (req, res) => {
  res.json({
    code: 200,
    message: '信息更新成功',
    data: req.body
  });
});

// 获取用户订单
router.get('/orders', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 10,
      page: 1,
      pageSize: 10,
      orders: [
        {
          id: 1,
          orderNo: '202401010001',
          amount: 99,
          status: 'completed',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          orderNo: '202401020001',
          amount: 199,
          status: 'pending',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取用户收藏
router.get('/favorites', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        type: 'product',
        productId: 1,
        productName: '商品1',
        productImage: 'https://img.laal.top/product/1.jpg',
        price: 99,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        type: 'post',
        postId: 1,
        postTitle: '欢迎使用拉阿狸平台',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  });
});

// 获取用户地址
router.get('/addresses', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '张三',
        phone: '13800138000',
        province: '北京市',
        city: '北京市',
        district: '朝阳区',
        address: '某某街道某某小区1号楼101',
        isDefault: true
      },
      {
        id: 2,
        name: '李四',
        phone: '13900139000',
        province: '上海市',
        city: '上海市',
        district: '浦东新区',
        address: '某某街道某某大厦20层',
        isDefault: false
      }
    ]
  });
});

module.exports = router;
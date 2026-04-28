const express = require('express');
const router = express.Router();

/**
 * 用户管理模块路由
 * 对应域名: user.laal.top
 * 用途: 用户管理入口
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

// 修改密码
router.put('/password', (req, res) => {
  const { oldPassword, newPassword } = req.body;
  res.json({
    code: 200,
    message: '密码修改成功',
    data: {
      updatedAt: new Date().toISOString()
    }
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

// 添加地址
router.post('/addresses', (req, res) => {
  res.json({
    code: 200,
    message: '地址添加成功',
    data: {
      id: 3,
      ...req.body,
      createdAt: new Date().toISOString()
    }
  });
});

// 更新地址
router.put('/addresses/:id', (req, res) => {
  res.json({
    code: 200,
    message: '地址更新成功',
    data: {
      id: parseInt(req.params.id),
      ...req.body,
      updatedAt: new Date().toISOString()
    }
  });
});

// 删除地址
router.delete('/addresses/:id', (req, res) => {
  res.json({
    code: 200,
    message: '地址删除成功',
    data: {
      id: parseInt(req.params.id)
    }
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
          amount: 6999,
          status: 'completed',
          productName: 'iPhone 15',
          productImage: 'https://img.laal.top/product/iphone15.jpg',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          orderNo: '202401020001',
          amount: 1999,
          status: 'pending',
          productName: 'AirPods Pro',
          productImage: 'https://img.laal.top/product/airpods.jpg',
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
        productName: 'iPhone 15',
        productImage: 'https://img.laal.top/product/iphone15.jpg',
        price: 6999,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        type: 'shop',
        shopId: 1,
        shopName: '拉阿狸官方旗舰店',
        shopLogo: 'https://img.laal.top/shop/logo1.jpg',
        createdAt: '2024-01-01T00:00:00Z'
      }
    ]
  });
});

module.exports = router;
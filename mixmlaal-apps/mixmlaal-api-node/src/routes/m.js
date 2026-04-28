const express = require('express');
const router = express.Router();

/**
 * 移动端H5模块路由
 * 对应域名: m.laal.top
 * 用途: 移动端适配入口
 */

// 获取H5首页数据
router.get('/home', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      banners: [
        {
          id: 1,
          image: 'https://img.laal.top/banner/h5-1.jpg',
          link: 'https://m.laal.top/promotion/1',
          title: 'H5专享'
        },
        {
          id: 2,
          image: 'https://img.laal.top/banner/h5-2.jpg',
          link: 'https://m.laal.top/promotion/2',
          title: '限时优惠'
        }
      ],
      categories: [
        { id: 1, name: '推荐', icon: 'recommend' },
        { id: 2, name: '新品', icon: 'new' },
        { id: 3, name: '热卖', icon: 'hot' },
        { id: 4, name: '优惠', icon: 'discount' }
      ],
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 1000
        },
        {
          id: 2,
          name: 'AirPods Pro',
          price: 1999,
          image: 'https://img.laal.top/product/airpods.jpg',
          sales: 800
        },
        {
          id: 3,
          name: 'MacBook Pro',
          price: 12999,
          image: 'https://img.laal.top/product/macbook.jpg',
          sales: 500
        }
      ]
    }
  });
});

// H5登录
router.post('/login', (req, res) => {
  const { username, password } = req.body;
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token: 'h5-token-123',
      user: {
        id: 1,
        username,
        nickname: 'H5用户',
        avatar: 'https://img.laal.top/avatar/1.jpg'
      }
    }
  });
});

// 获取用户信息
router.get('/user', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: 1,
      username: 'user1',
      nickname: 'H5用户',
      avatar: 'https://img.laal.top/avatar/1.jpg',
      points: 1000,
      level: 5
    }
  });
});

// H5订单
router.get('/orders', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      orders: [
        {
          id: 1,
          orderNo: '202401010001',
          amount: 6999,
          status: 'completed',
          productName: 'iPhone 15',
          productImage: 'https://img.laal.top/product/iphone15.jpg',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  });
});

// H5购物车
router.get('/cart', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      items: [
        {
          id: 1,
          productId: 1,
          productName: 'iPhone 15',
          price: 6999,
          quantity: 1,
          image: 'https://img.laal.top/product/iphone15.jpg'
        }
      ],
      totalPrice: 6999,
      totalItems: 1
    }
  });
});

// H5搜索
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 1000
        }
      ],
      suggestions: ['iPhone', 'iPhone 15', 'iPhone 15 Pro']
    }
  });
});

// H5支付
router.post('/pay', (req, res) => {
  const { orderId, amount } = req.body;
  res.json({
    code: 200,
    message: '支付成功',
    data: {
      orderId,
      amount,
      transactionId: 'TRX-123456',
      paidAt: new Date().toISOString()
    }
  });
});

module.exports = router;
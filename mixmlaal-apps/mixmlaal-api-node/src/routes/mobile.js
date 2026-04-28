const express = require('express');
const router = express.Router();

/**
 * 移动终端专用模块路由
 * 对应域名: mobile.laal.top
 * 用途: 移动终端专用入口
 */

// 获取移动端首页数据
router.get('/home', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      banners: [
        {
          id: 1,
          image: 'https://img.laal.top/banner/mobile1.jpg',
          link: 'https://mobile.laal.top/promotion/1',
          title: '移动端专享'
        },
        {
          id: 2,
          image: 'https://img.laal.top/banner/mobile2.jpg',
          link: 'https://mobile.laal.top/promotion/2',
          title: '限时特惠'
        }
      ],
      quickActions: [
        { id: 1, name: '扫码', icon: 'scan', link: 'https://mobile.laal.top/scan' },
        { id: 2, name: '定位', icon: 'location', link: 'https://mobile.laal.top/location' },
        { id: 3, name: '分享', icon: 'share', link: 'https://mobile.laal.top/share' },
        { id: 4, name: '客服', icon: 'service', link: 'https://mobile.laal.top/service' }
      ],
      recommendProducts: [
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
        }
      ],
      hotActivities: [
        {
          id: 1,
          title: '移动端专享折扣',
          description: '移动端下单额外95折',
          link: 'https://mobile.laal.top/activity/1'
        },
        {
          id: 2,
          title: '签到领积分',
          description: '每日签到领10积分',
          link: 'https://mobile.laal.top/signin'
        }
      ]
    }
  });
});

// 移动端登录
router.post('/login', (req, res) => {
  const { phone, code } = req.body;
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token: 'mobile-token-123',
      user: {
        id: 1,
        phone,
        nickname: '手机用户',
        avatar: 'https://img.laal.top/avatar/1.jpg'
      }
    }
  });
});

// 获取验证码
router.post('/sms/code', (req, res) => {
  const { phone } = req.body;
  res.json({
    code: 200,
    message: '验证码发送成功',
    data: {
      phone,
      expireAt: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    }
  });
});

// 移动端设置
router.get('/settings', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      notifications: {
        push: true,
        email: true,
        sms: false
      },
      privacy: {
        location: true,
        camera: true,
        microphone: false
      },
      appearance: {
        theme: 'light',
        fontScale: 1.0
      }
    }
  });
});

router.put('/settings', (req, res) => {
  res.json({
    code: 200,
    message: '设置更新成功',
    data: req.body
  });
});

// 移动端订单
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

// 移动端支付
router.post('/pay', (req, res) => {
  const { orderId, amount, payMethod } = req.body;
  res.json({
    code: 200,
    message: '支付成功',
    data: {
      orderId,
      amount,
      payMethod,
      transactionId: 'TRX-123456',
      paidAt: new Date().toISOString()
    }
  });
});

// 移动端分享
router.post('/share', (req, res) => {
  const { content, type } = req.body;
  res.json({
    code: 200,
    message: '分享成功',
    data: {
      content,
      type,
      shareUrl: 'https://mobile.laal.top/share/' + Math.random().toString(36).substr(2, 9)
    }
  });
});

module.exports = router;
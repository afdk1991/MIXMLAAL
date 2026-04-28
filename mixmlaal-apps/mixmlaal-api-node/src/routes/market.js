const express = require('express');
const router = express.Router();

/**
 * 营销模块路由
 * 对应域名: market.laal.top
 * 用途: 营销模块入口
 */

// 获取营销活动列表
router.get('/activities', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        title: '新年特惠',
        description: '全场商品8折起',
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        image: 'https://img.laal.top/banner/market1.jpg',
        status: 'active'
      },
      {
        id: 2,
        title: '新品上市',
        description: '新品首周9折',
        startTime: '2024-01-15T00:00:00Z',
        endTime: '2024-01-21T23:59:59Z',
        image: 'https://img.laal.top/banner/market2.jpg',
        status: 'active'
      },
      {
        id: 3,
        title: '情人节活动',
        description: '情侣商品买一送一',
        startTime: '2024-02-01T00:00:00Z',
        endTime: '2024-02-14T23:59:59Z',
        image: 'https://img.laal.top/banner/market3.jpg',
        status: 'upcoming'
      }
    ]
  });
});

// 获取活动详情
router.get('/activities/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      title: '新年特惠',
      description: '全场商品8折起，部分商品低至5折',
      startTime: '2024-01-01T00:00:00Z',
      endTime: '2024-01-31T23:59:59Z',
      image: 'https://img.laal.top/banner/market1.jpg',
      status: 'active',
      rules: [
        '活动时间：2024年1月1日 - 2024年1月31日',
        '全场商品8折起',
        '部分商品低至5折',
        '活动最终解释权归拉阿狸所有'
      ],
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          originalPrice: 7999,
          image: 'https://img.laal.top/product/iphone15.jpg'
        },
        {
          id: 2,
          name: 'MacBook Pro',
          price: 12999,
          originalPrice: 13999,
          image: 'https://img.laal.top/product/macbook.jpg'
        }
      ]
    }
  });
});

// 获取优惠券列表
router.get('/coupons', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '满1000减100',
        type: '满减',
        value: 100,
        minSpend: 1000,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        status: 'active'
      },
      {
        id: 2,
        name: '全场9折',
        type: '折扣',
        value: 90,
        minSpend: 0,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        status: 'active'
      }
    ]
  });
});

// 领取优惠券
router.post('/coupons/:id/claim', (req, res) => {
  res.json({
    code: 200,
    message: '优惠券领取成功',
    data: {
      couponId: parseInt(req.params.id),
      couponCode: 'COUPON-123456',
      claimedAt: new Date().toISOString()
    }
  });
});

// 获取用户优惠券
router.get('/user/coupons', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '满1000减100',
        type: '满减',
        value: 100,
        minSpend: 1000,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        status: 'active',
        code: 'COUPON-123456'
      },
      {
        id: 2,
        name: '全场9折',
        type: '折扣',
        value: 90,
        minSpend: 0,
        startTime: '2024-01-01T00:00:00Z',
        endTime: '2024-01-31T23:59:59Z',
        status: 'active',
        code: 'COUPON-789012'
      }
    ]
  });
});

// 获取促销商品
router.get('/promotions', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        productId: 1,
        productName: 'iPhone 15',
        originalPrice: 7999,
        promotionPrice: 6999,
        discount: 0.87,
        image: 'https://img.laal.top/product/iphone15.jpg',
        endTime: '2024-01-31T23:59:59Z'
      },
      {
        id: 2,
        productId: 2,
        productName: 'MacBook Pro',
        originalPrice: 13999,
        promotionPrice: 12999,
        discount: 0.93,
        image: 'https://img.laal.top/product/macbook.jpg',
        endTime: '2024-01-31T23:59:59Z'
      }
    ]
  });
});

module.exports = router;
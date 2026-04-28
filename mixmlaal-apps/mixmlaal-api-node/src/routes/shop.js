const express = require('express');
const router = express.Router();

/**
 * 线上店铺模块路由
 * 对应域名: shop.laal.top
 * 用途: 线上店铺入口
 */

// 获取店铺列表
router.get('/list', (req, res) => {
  const { category, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      shops: [
        {
          id: 1,
          name: '拉阿狸官方旗舰店',
          logo: 'https://img.laal.top/shop/logo1.jpg',
          description: '拉阿狸官方旗舰店，提供优质商品',
          rating: 4.8,
          sales: 10000,
          followers: 50000,
          category: '电子产品',
          address: '北京市朝阳区'
        },
        {
          id: 2,
          name: '时尚潮流店',
          logo: 'https://img.laal.top/shop/logo2.jpg',
          description: '时尚潮流服饰',
          rating: 4.6,
          sales: 5000,
          followers: 20000,
          category: '服装',
          address: '上海市浦东新区'
        }
      ]
    }
  });
});

// 获取店铺详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: '拉阿狸官方旗舰店',
      logo: 'https://img.laal.top/shop/logo1.jpg',
      banner: 'https://img.laal.top/shop/banner1.jpg',
      description: '拉阿狸官方旗舰店，提供优质商品和服务',
      rating: 4.8,
      sales: 10000,
      followers: 50000,
      category: '电子产品',
      address: '北京市朝阳区某某大厦1001室',
      phone: '010-12345678',
      businessHours: '周一至周日 9:00-21:00',
      services: ['7天无理由退换', '正品保障', '闪电发货'],
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
        }
      ]
    }
  });
});

// 关注店铺
router.post('/:id/follow', (req, res) => {
  res.json({
    code: 200,
    message: '关注成功',
    data: {
      shopId: parseInt(req.params.id),
      followers: 50001
    }
  });
});

// 取消关注
router.delete('/:id/follow', (req, res) => {
  res.json({
    code: 200,
    message: '取消关注成功',
    data: {
      shopId: parseInt(req.params.id),
      followers: 49999
    }
  });
});

// 获取店铺商品
router.get('/:id/products', (req, res) => {
  const { page = 1, pageSize = 20, sort = 'default' } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          originalPrice: 7999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 1000,
          rating: 4.8
        },
        {
          id: 2,
          name: 'AirPods Pro',
          price: 1999,
          originalPrice: 2499,
          image: 'https://img.laal.top/product/airpods.jpg',
          sales: 800,
          rating: 4.7
        }
      ]
    }
  });
});

// 获取店铺评价
router.get('/:id/reviews', (req, res) => {
  const { page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 1000,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      reviews: [
        {
          id: 1,
          user: 'user1',
          rating: 5,
          content: '店铺服务很好，商品质量不错',
          images: ['https://img.laal.top/reviews/review1.jpg'],
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          user: 'user2',
          rating: 4,
          content: '商品不错，物流很快',
          images: [],
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 搜索店铺
router.get('/search', (req, res) => {
  const { keyword, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 10,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      shops: [
        {
          id: 1,
          name: '拉阿狸官方旗舰店',
          logo: 'https://img.laal.top/shop/logo1.jpg',
          rating: 4.8,
          sales: 10000
        }
      ]
    }
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();

/**
 * 电商商城模块路由
 * 对应域名: mall.laal.top
 * 用途: 电商商城入口
 */

// 获取商城首页数据
router.get('/home', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      banners: [
        {
          id: 1,
          image: 'https://img.laal.top/banner/mall1.jpg',
          link: 'https://mall.laal.top/promotion/1',
          title: '新年特惠'
        },
        {
          id: 2,
          image: 'https://img.laal.top/banner/mall2.jpg',
          link: 'https://mall.laal.top/promotion/2',
          title: '新品上市'
        }
      ],
      categories: [
        { id: 1, name: '电子产品', icon: 'electronics' },
        { id: 2, name: '服装', icon: 'clothing' },
        { id: 3, name: '食品', icon: 'food' },
        { id: 4, name: '家居', icon: 'home' },
        { id: 5, name: '美妆', icon: 'beauty' },
        { id: 6, name: '运动', icon: 'sports' }
      ],
      hotProducts: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          originalPrice: 7999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 1000
        },
        {
          id: 2,
          name: 'MacBook Pro',
          price: 12999,
          originalPrice: 13999,
          image: 'https://img.laal.top/product/macbook.jpg',
          sales: 500
        }
      ],
      recommendProducts: [
        {
          id: 3,
          name: 'AirPods Pro',
          price: 1999,
          originalPrice: 2499,
          image: 'https://img.laal.top/product/airpods.jpg',
          sales: 800
        },
        {
          id: 4,
          name: 'iPad Pro',
          price: 5999,
          originalPrice: 6499,
          image: 'https://img.laal.top/product/ipad.jpg',
          sales: 300
        }
      ]
    }
  });
});

// 获取商品列表
router.get('/products', (req, res) => {
  const { categoryId, page = 1, pageSize = 20, sort = 'default' } = req.query;
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
          rating: 4.8,
          categoryId: 1,
          categoryName: '电子产品'
        },
        {
          id: 2,
          name: 'MacBook Pro',
          price: 12999,
          originalPrice: 13999,
          image: 'https://img.laal.top/product/macbook.jpg',
          sales: 500,
          rating: 4.9,
          categoryId: 1,
          categoryName: '电子产品'
        }
      ]
    }
  });
});

// 获取商品详情
router.get('/products/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: 'iPhone 15',
      price: 6999,
      originalPrice: 7999,
      images: [
        'https://img.laal.top/product/iphone15-1.jpg',
        'https://img.laal.top/product/iphone15-2.jpg',
        'https://img.laal.top/product/iphone15-3.jpg'
      ],
      description: 'iPhone 15 采用全新设计，搭载 A17 Pro 芯片，性能更加强大。',
      specs: [
        { name: '屏幕', value: '6.1英寸 Super Retina XDR' },
        { name: '处理器', value: 'A17 Pro' },
        { name: '存储', value: '128GB' },
        { name: '相机', value: '4800万像素主摄' }
      ],
      sales: 1000,
      rating: 4.8,
      reviews: 200,
      stock: 500,
      categoryId: 1,
      categoryName: '电子产品'
    }
  });
});

// 搜索商品
router.get('/search', (req, res) => {
  const { keyword, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 50,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 1000
        },
        {
          id: 5,
          name: 'iPhone 15 Pro',
          price: 8999,
          image: 'https://img.laal.top/product/iphone15pro.jpg',
          sales: 800
        }
      ]
    }
  });
});

// 加入购物车
router.post('/cart/add', (req, res) => {
  const { productId, quantity } = req.body;
  res.json({
    code: 200,
    message: '加入购物车成功',
    data: {
      cartId: 1,
      productId,
      quantity,
      totalItems: 5
    }
  });
});

// 获取购物车
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
        },
        {
          id: 2,
          productId: 2,
          productName: 'MacBook Pro',
          price: 12999,
          quantity: 1,
          image: 'https://img.laal.top/product/macbook.jpg'
        }
      ],
      totalPrice: 19998,
      totalItems: 2
    }
  });
});

module.exports = router;
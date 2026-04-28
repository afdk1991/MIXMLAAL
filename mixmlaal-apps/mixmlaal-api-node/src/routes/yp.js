const express = require('express');
const router = express.Router();

/**
 * 商品资源模块路由
 * 对应域名: yp.laal.top
 * 用途: 商品资源入口
 */

// 获取商品分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '电子产品', icon: 'electronics' },
      { id: 2, name: '服装', icon: 'clothing' },
      { id: 3, name: '食品', icon: 'food' },
      { id: 4, name: '家居', icon: 'home' },
      { id: 5, name: '美妆', icon: 'beauty' },
      { id: 6, name: '运动', icon: 'sports' }
    ]
  });
});

// 获取商品列表
router.get('/list', (req, res) => {
  const { categoryId, page = 1, pageSize = 20, sort = 'default' } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 1000,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          originalPrice: 7999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 10000,
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
          sales: 5000,
          rating: 4.9,
          categoryId: 1,
          categoryName: '电子产品'
        }
      ]
    }
  });
});

// 获取商品详情
router.get('/:id', (req, res) => {
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
      sales: 10000,
      rating: 4.8,
      reviews: 2000,
      stock: 5000,
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
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      products: [
        {
          id: 1,
          name: 'iPhone 15',
          price: 6999,
          image: 'https://img.laal.top/product/iphone15.jpg',
          sales: 10000
        },
        {
          id: 5,
          name: 'iPhone 15 Pro',
          price: 8999,
          image: 'https://img.laal.top/product/iphone15pro.jpg',
          sales: 8000
        }
      ]
    }
  });
});

// 获取热门商品
router.get('/hot', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: 'iPhone 15',
        price: 6999,
        image: 'https://img.laal.top/product/iphone15.jpg',
        sales: 10000
      },
      {
        id: 2,
        name: 'MacBook Pro',
        price: 12999,
        image: 'https://img.laal.top/product/macbook.jpg',
        sales: 5000
      },
      {
        id: 3,
        name: 'AirPods Pro',
        price: 1999,
        image: 'https://img.laal.top/product/airpods.jpg',
        sales: 8000
      }
    ]
  });
});

// 获取新品
router.get('/new', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 6,
        name: 'iPhone 15 Pro Max',
        price: 9999,
        image: 'https://img.laal.top/product/iphone15promax.jpg',
        sales: 3000,
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 7,
        name: 'iPad Air',
        price: 4799,
        image: 'https://img.laal.top/product/ipadair.jpg',
        sales: 2000,
        createdAt: '2024-01-02T00:00:00Z'
      }
    ]
  });
});

module.exports = router;
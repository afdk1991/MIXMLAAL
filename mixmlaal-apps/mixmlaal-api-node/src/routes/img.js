const express = require('express');
const router = express.Router();

/**
 * 图片资源模块路由
 * 对应域名: img.laal.top
 * 用途: 图片资源入口
 */

// 获取图片分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '头像', path: 'avatar' },
      { id: 2, name: '商品', path: 'product' },
      { id: 3, name: ' banner', path: 'banner' },
      { id: 4, name: '图标', path: 'icons' },
      { id: 5, name: '新闻', path: 'news' },
      { id: 6, name: '用户上传', path: 'user' }
    ]
  });
});

// 获取图片列表
router.get('/list', (req, res) => {
  const { category, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      images: [
        {
          id: 1,
          name: 'avatar1.jpg',
          url: 'https://img.laal.top/avatar/avatar1.jpg',
          category: 'avatar',
          size: 102400,
          width: 200,
          height: 200,
          format: 'jpg',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'product1.jpg',
          url: 'https://img.laal.top/product/product1.jpg',
          category: 'product',
          size: 512000,
          width: 800,
          height: 800,
          format: 'jpg',
          createdAt: '2024-01-02T00:00:00Z'
        },
        {
          id: 3,
          name: 'banner1.jpg',
          url: 'https://img.laal.top/banner/banner1.jpg',
          category: 'banner',
          size: 1024000,
          width: 1920,
          height: 600,
          format: 'jpg',
          createdAt: '2024-01-03T00:00:00Z'
        }
      ]
    }
  });
});

// 上传图片
router.post('/upload', (req, res) => {
  res.json({
    code: 200,
    message: '图片上传成功',
    data: {
      id: 1,
      name: 'upload.jpg',
      url: 'https://img.laal.top/user/upload.jpg',
      size: 102400,
      width: 800,
      height: 600,
      format: 'jpg',
      createdAt: new Date().toISOString()
    }
  });
});

// 获取图片信息
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: 'avatar1.jpg',
      url: 'https://img.laal.top/avatar/avatar1.jpg',
      category: 'avatar',
      size: 102400,
      width: 200,
      height: 200,
      format: 'jpg',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 删除图片
router.delete('/:id', (req, res) => {
  res.json({
    code: 200,
    message: '图片删除成功',
    data: {
      id: parseInt(req.params.id)
    }
  });
});

// 图片处理
router.post('/process', (req, res) => {
  const { imageId, operation, params } = req.body;
  res.json({
    code: 200,
    message: '图片处理成功',
    data: {
      imageId,
      operation,
      resultUrl: 'https://img.laal.top/processed/image1.jpg',
      params
    }
  });
});

// 获取图片统计
router.get('/stats', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      totalImages: 1000,
      totalSize: 1024000000, // 1GB
      categories: [
        { name: 'avatar', count: 200, size: 20480000 },
        { name: 'product', count: 500, size: 512000000 },
        { name: 'banner', count: 100, size: 102400000 },
        { name: 'icons', count: 100, size: 10240000 },
        { name: 'news', count: 50, size: 51200000 },
        { name: 'user', count: 50, size: 51200000 }
      ]
    }
  });
});

module.exports = router;
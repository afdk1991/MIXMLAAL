const express = require('express');
const router = express.Router();

/**
 * 资源存储模块路由
 * 对应域名: store.laal.top
 * 用途: 资源存储入口
 */

// 获取存储桶列表
router.get('/buckets', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: 'images',
        description: '图片存储',
        size: 1024000000, // 1GB
        used: 512000000, // 500MB
        files: 1000,
        status: 'active'
      },
      {
        id: 2,
        name: 'videos',
        description: '视频存储',
        size: 10240000000, // 10GB
        used: 5120000000, // 5GB
        files: 100,
        status: 'active'
      },
      {
        id: 3,
        name: 'documents',
        description: '文档存储',
        size: 1024000000, // 1GB
        used: 256000000, // 250MB
        files: 500,
        status: 'active'
      }
    ]
  });
});

// 创建存储桶
router.post('/buckets', (req, res) => {
  const { name, description, size } = req.body;
  res.json({
    code: 200,
    message: '存储桶创建成功',
    data: {
      id: 4,
      name,
      description,
      size,
      used: 0,
      files: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    }
  });
});

// 获取存储桶详情
router.get('/buckets/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: 'images',
      description: '图片存储',
      size: 1024000000,
      used: 512000000,
      files: 1000,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 上传文件
router.post('/upload', (req, res) => {
  res.json({
    code: 200,
    message: '文件上传成功',
    data: {
      id: 1,
      name: 'example.jpg',
      size: 102400,
      bucket: 'images',
      url: 'https://store.laal.top/images/example.jpg',
      type: 'image/jpeg',
      uploadedAt: new Date().toISOString()
    }
  });
});

// 获取文件列表
router.get('/files', (req, res) => {
  const { bucket, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 1000,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      files: [
        {
          id: 1,
          name: 'example1.jpg',
          size: 102400,
          bucket: bucket || 'images',
          url: 'https://store.laal.top/images/example1.jpg',
          type: 'image/jpeg',
          uploadedAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          name: 'example2.jpg',
          size: 204800,
          bucket: bucket || 'images',
          url: 'https://store.laal.top/images/example2.jpg',
          type: 'image/jpeg',
          uploadedAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取文件详情
router.get('/files/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      name: 'example.jpg',
      size: 102400,
      bucket: 'images',
      url: 'https://store.laal.top/images/example.jpg',
      type: 'image/jpeg',
      uploadedAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 删除文件
router.delete('/files/:id', (req, res) => {
  res.json({
    code: 200,
    message: '文件删除成功',
    data: {
      id: parseInt(req.params.id)
    }
  });
});

// 下载文件
router.get('/files/:id/download', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      fileId: parseInt(req.params.id),
      downloadUrl: 'https://store.laal.top/download/example.jpg',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
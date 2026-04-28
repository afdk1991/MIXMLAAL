const express = require('express');
const router = express.Router();

/**
 * 博客模块路由
 * 对应域名: blog.laal.top
 * 用途: 博客模块入口
 */

// 获取博客列表
router.get('/posts', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: 1,
      pageSize: 10,
      posts: [
        {
          id: 1,
          title: '欢迎使用拉阿狸平台',
          content: '这是一篇测试文章',
          author: 'admin',
          category: '公告',
          tags: ['平台', '公告'],
          views: 1000,
          comments: 10,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '平台功能介绍',
          content: '拉阿狸平台提供多种功能',
          author: 'admin',
          category: '教程',
          tags: ['功能', '教程'],
          views: 500,
          comments: 5,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取博客详情
router.get('/posts/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      title: '欢迎使用拉阿狸平台',
      content: '这是一篇测试文章，详细内容...',
      author: 'admin',
      category: '公告',
      tags: ['平台', '公告'],
      views: 1000,
      comments: 10,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 获取博客分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '公告', count: 10 },
      { id: 2, name: '教程', count: 20 },
      { id: 3, name: '技术', count: 30 },
      { id: 4, name: '生活', count: 15 }
    ]
  });
});

// 获取博客标签
router.get('/tags', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '平台', count: 20 },
      { id: 2, name: '功能', count: 15 },
      { id: 3, name: '教程', count: 10 },
      { id: 4, name: '技术', count: 25 }
    ]
  });
});

// 发表评论
router.post('/posts/:id/comments', (req, res) => {
  res.json({
    code: 200,
    message: '评论发表成功',
    data: {
      id: 1,
      content: req.body.content,
      author: 'user1',
      createdAt: new Date().toISOString()
    }
  });
});

module.exports = router;
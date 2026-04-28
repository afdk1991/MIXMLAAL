const express = require('express');
const router = express.Router();

/**
 * WordPress相关模块路由
 * 对应域名: wp.laal.top
 * 用途: WordPress相关入口
 */

// 获取WordPress文章列表
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
          title: '欢迎使用WordPress',
          content: '这是一篇WordPress文章',
          author: 'admin',
          category: '默认分类',
          tags: ['WordPress', '教程'],
          views: 1000,
          comments: 10,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'WordPress使用指南',
          content: 'WordPress使用指南内容',
          author: 'admin',
          category: '教程',
          tags: ['WordPress', '指南'],
          views: 500,
          comments: 5,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取WordPress页面列表
router.get('/pages', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      pages: [
        {
          id: 1,
          title: '首页',
          content: '首页内容',
          slug: 'home',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '关于我们',
          content: '关于我们内容',
          slug: 'about',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  });
});

// 获取WordPress分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '默认分类', slug: 'uncategorized', count: 10 },
      { id: 2, name: '教程', slug: 'tutorial', count: 20 },
      { id: 3, name: '新闻', slug: 'news', count: 15 }
    ]
  });
});

// 获取WordPress标签
router.get('/tags', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: 'WordPress', slug: 'wordpress', count: 20 },
      { id: 2, name: '教程', slug: 'tutorial', count: 15 },
      { id: 3, name: '指南', slug: 'guide', count: 10 }
    ]
  });
});

// 获取WordPress评论
router.get('/comments', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 50,
      page: 1,
      pageSize: 10,
      comments: [
        {
          id: 1,
          postId: 1,
          content: '这是一条评论',
          author: 'user1',
          authorEmail: 'user1@example.com',
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  });
});

// 搜索WordPress内容
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      posts: [
        {
          id: 1,
          title: '欢迎使用WordPress',
          content: '这是一篇WordPress文章',
          type: 'post'
        }
      ],
      pages: [
        {
          id: 2,
          title: '关于我们',
          content: '关于我们内容',
          type: 'page'
        }
      ]
    }
  });
});

module.exports = router;
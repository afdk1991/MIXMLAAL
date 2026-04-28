const express = require('express');
const router = express.Router();

/**
 * 新闻资讯模块路由
 * 对应域名: xw.laal.top
 * 用途: 新闻资讯入口
 */

// 获取新闻列表
router.get('/list', (req, res) => {
  const { category, page = 1, pageSize = 10 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 1000,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      news: [
        {
          id: 1,
          title: '拉阿狸平台正式上线',
          summary: '拉阿狸平台于今日正式上线，为用户提供全方位的服务',
          content: '拉阿狸平台于2024年1月1日正式上线，为用户提供电商、社交、出行等全方位的服务...',
          category: '平台新闻',
          image: 'https://img.laal.top/news/news1.jpg',
          views: 100000,
          comments: 500,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '新年特惠活动开始',
          summary: '拉阿狸平台推出新年特惠活动，全场商品8折起',
          content: '为庆祝新年，拉阿狸平台推出新年特惠活动，全场商品8折起，部分商品低至5折...',
          category: '促销活动',
          image: 'https://img.laal.top/news/news2.jpg',
          views: 80000,
          comments: 300,
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取新闻详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      title: '拉阿狸平台正式上线',
      content: `# 拉阿狸平台正式上线

拉阿狸平台于2024年1月1日正式上线，为用户提供电商、社交、出行等全方位的服务。

## 平台特色

- 一站式服务：整合电商、社交、出行等多种服务
- 多端适配：支持PC、手机、小程序、APP等多种终端
- 安全可靠：采用多重安全措施，保障用户数据安全

## 未来规划

平台将不断完善功能，为用户提供更好的服务体验。`,
      category: '平台新闻',
      images: [
        'https://img.laal.top/news/news1-1.jpg',
        'https://img.laal.top/news/news1-2.jpg'
      ],
      views: 100001,
      comments: 501,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 获取新闻分类
router.get('/categories/list', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '平台新闻', count: 100 },
      { id: 2, name: '促销活动', count: 200 },
      { id: 3, name: '行业动态', count: 300 },
      { id: 4, name: '技术资讯', count: 150 },
      { id: 5, name: '生活资讯', count: 250 }
    ]
  });
});

// 搜索新闻
router.get('/search', (req, res) => {
  const { keyword, page = 1, pageSize = 10 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      news: [
        {
          id: 1,
          title: '拉阿狸平台正式上线',
          summary: '拉阿狸平台于今日正式上线，为用户提供全方位的服务',
          category: '平台新闻',
          image: 'https://img.laal.top/news/news1.jpg',
          views: 100000,
          createdAt: '2024-01-01T00:00:00Z'
        }
      ]
    }
  });
});

// 发表评论
router.post('/:id/comments', (req, res) => {
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

// 获取评论列表
router.get('/:id/comments', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        content: '恭喜平台上线！',
        author: 'user1',
        createdAt: '2024-01-01T00:00:00Z'
      },
      {
        id: 2,
        content: '期待平台越做越好',
        author: 'user2',
        createdAt: '2024-01-01T01:00:00Z'
      }
    ]
  });
});

module.exports = router;
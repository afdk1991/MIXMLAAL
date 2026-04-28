const express = require('express');
const router = express.Router();

/**
 * 视频模块路由
 * 对应域名: sp.laal.top
 * 用途: 视频模块入口
 */

// 获取视频分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '电影', icon: 'movie' },
      { id: 2, name: '电视剧', icon: 'tv' },
      { id: 3, name: '综艺', icon: 'variety' },
      { id: 4, name: '动漫', icon: 'anime' },
      { id: 5, name: '教育', icon: 'education' },
      { id: 6, name: '音乐', icon: 'music' }
    ]
  });
});

// 获取视频列表
router.get('/list', (req, res) => {
  const { categoryId, page = 1, pageSize = 20, sort = 'latest' } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 1000,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      videos: [
        {
          id: 1,
          title: '电影标题1',
          cover: 'https://img.laal.top/video/cover1.jpg',
          duration: '02:30:00',
          views: 100000,
          likes: 5000,
          categoryId: 1,
          categoryName: '电影',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '电视剧标题1',
          cover: 'https://img.laal.top/video/cover2.jpg',
          duration: '04:00:00',
          views: 50000,
          likes: 2000,
          categoryId: 2,
          categoryName: '电视剧',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ]
    }
  });
});

// 获取视频详情
router.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    code: 200,
    message: 'success',
    data: {
      id: parseInt(id),
      title: '电影标题1',
      cover: 'https://img.laal.top/video/cover1.jpg',
      videoUrl: 'https://sp.laal.top/video/1.mp4',
      duration: '02:30:00',
      description: '这是一部精彩的电影',
      views: 100001,
      likes: 5001,
      comments: 1000,
      categoryId: 1,
      categoryName: '电影',
      tags: ['动作', '科幻'],
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  });
});

// 搜索视频
router.get('/search', (req, res) => {
  const { keyword, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      videos: [
        {
          id: 1,
          title: '电影标题1',
          cover: 'https://img.laal.top/video/cover1.jpg',
          duration: '02:30:00',
          views: 100000,
          likes: 5000
        }
      ]
    }
  });
});

// 播放视频
router.get('/:id/play', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      videoId: parseInt(req.params.id),
      videoUrl: 'https://sp.laal.top/video/1.mp4',
      quality: '1080p',
      subtitles: [
        { id: 1, language: '中文', url: 'https://sp.laal.top/subtitles/1.zh.srt' },
        { id: 2, language: '英文', url: 'https://sp.laal.top/subtitles/1.en.srt' }
      ]
    }
  });
});

// 点赞视频
router.post('/:id/like', (req, res) => {
  res.json({
    code: 200,
    message: '点赞成功',
    data: {
      videoId: parseInt(req.params.id),
      likes: 5002
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

module.exports = router;
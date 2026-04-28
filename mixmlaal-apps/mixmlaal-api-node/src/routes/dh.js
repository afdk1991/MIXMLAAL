const express = require('express');
const router = express.Router();

/**
 * 导航模块路由
 * 对应域名: dh.laal.top
 * 用途: 导航模块入口
 */

// 获取导航分类
router.get('/categories', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      { id: 1, name: '生活服务', icon: 'life' },
      { id: 2, name: '出行服务', icon: 'car' },
      { id: 3, name: '购物消费', icon: 'shopping' },
      { id: 4, name: '休闲娱乐', icon: 'entertainment' },
      { id: 5, name: '教育学习', icon: 'education' },
      { id: 6, name: '医疗健康', icon: 'health' }
    ]
  });
});

// 获取导航站点
router.get('/sites', (req, res) => {
  const { categoryId, page = 1, pageSize = 20 } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: {
      total: 100,
      page: parseInt(page),
      pageSize: parseInt(pageSize),
      sites: [
        {
          id: 1,
          name: '百度',
          url: 'https://www.baidu.com',
          icon: 'https://img.laal.top/icons/baidu.png',
          categoryId: 1,
          categoryName: '生活服务',
          description: '百度搜索',
          clicks: 10000,
          rating: 4.5
        },
        {
          id: 2,
          name: '淘宝',
          url: 'https://www.taobao.com',
          icon: 'https://img.laal.top/icons/taobao.png',
          categoryId: 3,
          categoryName: '购物消费',
          description: '淘宝商城',
          clicks: 8000,
          rating: 4.3
        },
        {
          id: 3,
          name: '腾讯视频',
          url: 'https://v.qq.com',
          icon: 'https://img.laal.top/icons/tencent-video.png',
          categoryId: 4,
          categoryName: '休闲娱乐',
          description: '腾讯视频',
          clicks: 6000,
          rating: 4.2
        }
      ]
    }
  });
});

// 搜索导航站点
router.get('/search', (req, res) => {
  const { keyword } = req.query;
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '百度',
        url: 'https://www.baidu.com',
        icon: 'https://img.laal.top/icons/baidu.png',
        categoryName: '生活服务',
        description: '百度搜索'
      },
      {
        id: 4,
        name: '百度地图',
        url: 'https://map.baidu.com',
        icon: 'https://img.laal.top/icons/baidu-map.png',
        categoryName: '出行服务',
        description: '百度地图'
      }
    ]
  });
});

// 获取推荐站点
router.get('/recommended', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '百度',
        url: 'https://www.baidu.com',
        icon: 'https://img.laal.top/icons/baidu.png',
        categoryName: '生活服务'
      },
      {
        id: 2,
        name: '淘宝',
        url: 'https://www.taobao.com',
        icon: 'https://img.laal.top/icons/taobao.png',
        categoryName: '购物消费'
      },
      {
        id: 3,
        name: '腾讯视频',
        url: 'https://v.qq.com',
        icon: 'https://img.laal.top/icons/tencent-video.png',
        categoryName: '休闲娱乐'
      },
      {
        id: 4,
        name: '百度地图',
        url: 'https://map.baidu.com',
        icon: 'https://img.laal.top/icons/baidu-map.png',
        categoryName: '出行服务'
      }
    ]
  });
});

// 点击统计
router.post('/sites/:id/click', (req, res) => {
  res.json({
    code: 200,
    message: '点击统计成功',
    data: {
      siteId: parseInt(req.params.id),
      clickCount: 10001
    }
  });
});

module.exports = router;
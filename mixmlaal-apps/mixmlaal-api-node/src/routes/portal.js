const express = require('express');
const router = express.Router();

/**
 * 门户首页模块路由
 * 对应域名: portal.laal.top
 * 用途: 门户首页入口
 */

// 获取门户首页数据
router.get('/home', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      banners: [
        {
          id: 1,
          image: 'https://img.laal.top/banner/portal1.jpg',
          link: 'https://portal.laal.top/promotion/1',
          title: '欢迎访问拉阿狸门户'
        },
        {
          id: 2,
          image: 'https://img.laal.top/banner/portal2.jpg',
          link: 'https://portal.laal.top/promotion/2',
          title: '一站式服务平台'
        }
      ],
      modules: [
        {
          id: 1,
          name: '电商',
          icon: 'shopping',
          link: 'https://mall.laal.top',
          description: '在线购物，品质保证'
        },
        {
          id: 2,
          name: '出行',
          icon: 'car',
          link: 'https://ride.laal.top',
          description: '便捷出行，安全可靠'
        },
        {
          id: 3,
          name: '社交',
          icon: 'chat',
          link: 'https://social.laal.top',
          description: '互动交流，连接你我'
        },
        {
          id: 4,
          name: '视频',
          icon: 'video',
          link: 'https://video.laal.top',
          description: '精彩视频，应有尽有'
        },
        {
          id: 5,
          name: '新闻',
          icon: 'news',
          link: 'https://news.laal.top',
          description: '最新资讯，实时更新'
        },
        {
          id: 6,
          name: '工具',
          icon: 'tools',
          link: 'https://gy.laal.top',
          description: '实用工具，方便快捷'
        }
      ],
      news: [
        {
          id: 1,
          title: '拉阿狸平台正式上线',
          link: 'https://news.laal.top/1',
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: '新年特惠活动开始',
          link: 'https://news.laal.top/2',
          createdAt: '2024-01-02T00:00:00Z'
        }
      ],
      quickLinks: [
        { id: 1, name: '登录', link: 'https://login.laal.top' },
        { id: 2, name: '注册', link: 'https://auth.laal.top/register' },
        { id: 3, name: '帮助', link: 'https://help.laal.top' },
        { id: 4, name: '联系我们', link: 'https://support.laal.top/contact' }
      ]
    }
  });
});

// 获取平台介绍
router.get('/about', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      name: '拉阿狸平台',
      description: '拉阿狸是一个综合性的一站式服务平台，为用户提供电商、出行、社交、视频等多种服务。',
      vision: '成为全球领先的综合服务平台',
      mission: '为用户提供便捷、安全、高效的服务体验',
      values: ['用户至上', '创新进取', '诚信经营', '合作共赢'],
      development: [
        { year: 2023, event: '平台筹备' },
        { year: 2024, event: '平台上线' },
        { year: 2025, event: '业务扩展' },
        { year: 2026, event: '全球化布局' }
      ]
    }
  });
});

// 获取平台统计
router.get('/stats', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      users: 1000000,
      products: 100000,
      orders: 500000,
      transactions: 1000000000,
      partners: 1000,
      countries: 10
    }
  });
});

// 获取合作伙伴
router.get('/partners', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: [
      {
        id: 1,
        name: '阿里巴巴',
        logo: 'https://img.laal.top/partners/alibaba.png',
        link: 'https://www.alibaba.com'
      },
      {
        id: 2,
        name: '腾讯',
        logo: 'https://img.laal.top/partners/tencent.png',
        link: 'https://www.tencent.com'
      },
      {
        id: 3,
        name: '百度',
        logo: 'https://img.laal.top/partners/baidu.png',
        link: 'https://www.baidu.com'
      }
    ]
  });
});

// 获取联系方式
router.get('/contact', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      phone: '400-123-4567',
      email: 'contact@laal.top',
      address: '北京市朝阳区某某大厦1001室',
      workingHours: '周一至周日 9:00-21:00',
      social: [
        { name: '微信', link: 'https://wechat.laal.top' },
        { name: '微博', link: 'https://weibo.com/laal' },
        { name: '抖音', link: 'https://dy.laal.top' }
      ]
    }
  });
});

module.exports = router;
const express = require('express');
const router = express.Router();

/**
 * APP端接口模块路由
 * 对应域名: app.laal.top
 * 用途: APP端接口入口
 */

// APP版本检查
router.get('/version', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      latestVersion: '1.0.0',
      minVersion: '0.9.0',
      updateUrl: 'https://app.laal.top/download',
      updateMessage: '新增功能，优化性能'
    }
  });
});

// APP登录
router.post('/login', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      token: 'app-token-123',
      user: {
        id: 1,
        username: 'user1',
        avatar: 'https://img.laal.top/avatar/1.jpg'
      }
    }
  });
});

// 获取APP首页数据
router.get('/home', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      banners: [
        {
          id: 1,
          image: 'https://img.laal.top/banner/1.jpg',
          link: 'https://laal.top/promotion/1'
        }
      ],
      categories: [
        { id: 1, name: '商城', icon: 'shopping' },
        { id: 2, name: '出行', icon: 'car' },
        { id: 3, name: '社交', icon: 'chat' },
        { id: 4, name: '视频', icon: 'video' }
      ],
      recommendProducts: [
        {
          id: 1,
          name: '商品1',
          price: 99,
          image: 'https://img.laal.top/product/1.jpg'
        }
      ]
    }
  });
});

// APP推送设置
router.get('/notification/settings', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      pushEnabled: true,
      categories: [
        { id: 'order', name: '订单通知', enabled: true },
        { id: 'promotion', name: '促销通知', enabled: true },
        { id: 'system', name: '系统通知', enabled: true }
      ]
    }
  });
});

router.put('/notification/settings', (req, res) => {
  res.json({
    code: 200,
    message: '设置更新成功',
    data: req.body
  });
});

module.exports = router;
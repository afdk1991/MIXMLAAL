const express = require('express');
const authRoutes = require('./auth');
const menuRoutes = require('./menu');
const travelRoutes = require('./出行/travel');
const deliveryRoutes = require('./配送/delivery');
const mallRoutes = require('./商城/mall');
const articleRoutes = require('./内容/article');
const videoRoutes = require('./视频/video');
const postRoutes = require('./社交/post');

const router = express.Router();

// 健康检查
router.get('/health', (req, res) => {
  res.status(200).json({
    code: 0,
    message: '服务正常',
    data: {
      status: 'ok',
      timestamp: new Date().toISOString()
    }
  });
});

// 认证路由
router.use('/auth', authRoutes);

// 菜单路由
router.use('/', menuRoutes);

// 出行服务路由
router.use('/', travelRoutes);

// 配送服务路由
router.use('/', deliveryRoutes);

// 商城服务路由
router.use('/', mallRoutes);

// 内容资讯路由
router.use('/', articleRoutes);

// 视频服务路由
router.use('/', videoRoutes);

// 社交服务路由
router.use('/', postRoutes);

module.exports = router;
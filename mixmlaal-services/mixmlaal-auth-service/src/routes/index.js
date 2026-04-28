const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');

// 登录
router.post('/login', authController.login);

// 注册
router.post('/register', authController.register);

// 登出
router.post('/logout', authMiddleware, authController.logout);

// 刷新token
router.post('/refresh', authController.refreshToken);

// 获取当前用户信息
router.get('/me', authMiddleware, authController.getMe);

module.exports = router;
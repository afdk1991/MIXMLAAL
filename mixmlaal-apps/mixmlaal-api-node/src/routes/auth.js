const express = require('express');
const { register, login, refreshToken, logout, getCurrentUser } = require('../controllers/auth');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 刷新令牌
router.post('/refresh', refreshToken);

// 退出登录
router.post('/logout', authMiddleware, logout);

// 获取当前用户信息
router.get('/me', authMiddleware, getCurrentUser);

module.exports = router;
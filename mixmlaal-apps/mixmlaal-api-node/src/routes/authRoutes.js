const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const { authMiddleware } = require('../middleware/auth');

// 发送验证码
router.post('/send-code', authController.sendVerificationCode);

// 手机号验证码登录
router.post('/login-by-phone', authController.loginByPhone);

// 第三方登录
router.post('/third-party-login', authController.thirdPartyLogin);

// 登录
router.post('/login', authController.login);

// 注册
router.post('/register', authController.register);

// 获取当前用户信息
router.get('/me', authMiddleware, authController.getCurrentUser);

// 更新用户信息
router.put('/me', authMiddleware, authController.updateUser);

// 修改密码
router.put('/change-password', authMiddleware, authController.changePassword);

// 发送重置密码验证码
router.post('/send-reset-code', authController.sendResetCode);

// 重置密码
router.post('/reset-password', authController.resetPassword);

// 账号注销
router.delete('/account', authMiddleware, authController.deleteAccount);

// 绑定第三方账号
router.post('/bind-third-party', authMiddleware, authController.bindThirdParty);

// 解绑第三方账号
router.post('/unbind-third-party', authMiddleware, authController.unbindThirdParty);

module.exports = router;

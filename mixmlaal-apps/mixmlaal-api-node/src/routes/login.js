const express = require('express');
const router = express.Router();

/**
 * 登录验证模块路由
 * 对应域名: login.laal.top
 * 用途: 登录验证入口
 */

// 用户登录
router.post('/user', (req, res) => {
  const { username, password, rememberMe } = req.body;
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token: 'user-token-123',
      user: {
        id: 1,
        username,
        nickname: '测试用户',
        avatar: 'https://img.laal.top/avatar/1.jpg',
        role: 'user'
      },
      expiresAt: rememberMe ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() : new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// 管理员登录
router.post('/admin', (req, res) => {
  const { username, password } = req.body;
  res.json({
    code: 200,
    message: '登录成功',
    data: {
      token: 'admin-token-123',
      user: {
        id: 1,
        username,
        role: 'admin'
      },
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

// 验证码
router.get('/captcha', (req, res) => {
  res.json({
    code: 200,
    message: 'success',
    data: {
      captchaId: 'captcha-123',
      imageUrl: 'https://login.laal.top/captcha/image/captcha-123'
    }
  });
});

// 验证验证码
router.post('/captcha/verify', (req, res) => {
  const { captchaId, code } = req.body;
  res.json({
    code: 200,
    message: '验证码验证成功',
    data: {
      captchaId,
      valid: true
    }
  });
});

// 忘记密码
router.post('/forgot', (req, res) => {
  const { email } = req.body;
  res.json({
    code: 200,
    message: '重置密码链接已发送',
    data: {
      email,
      resetUrl: 'https://login.laal.top/reset-password?token=reset-token-123'
    }
  });
});

// 重置密码
router.post('/reset', (req, res) => {
  const { token, newPassword } = req.body;
  res.json({
    code: 200,
    message: '密码重置成功',
    data: {
      token
    }
  });
});

// 登出
router.post('/logout', (req, res) => {
  res.json({
    code: 200,
    message: '登出成功',
    data: null
  });
});

// 刷新token
router.post('/refresh', (req, res) => {
  const { refreshToken } = req.body;
  res.json({
    code: 200,
    message: 'token刷新成功',
    data: {
      token: 'new-token-123',
      refreshToken: 'new-refresh-token-123',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    }
  });
});

module.exports = router;
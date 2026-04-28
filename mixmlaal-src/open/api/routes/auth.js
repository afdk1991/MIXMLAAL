/**
 * 认证路由
 * 版本: v1.0.0.0
 * 说明: 用户注册、登录、Token刷新等认证相关接口
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const { authenticate, generateAccessToken, logout } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

// 生成用户ID
const generateUserId = () => `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * @route   POST /api/v1/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 参数验证
    if (!phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: '手机号和密码不能为空',
      });
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: '手机号格式不正确',
      });
    }

    // 密码强度验证
    if (password.length < 6) {
      return res.status(400).json({
        status: 'error',
        message: '密码长度不能少于6位',
      });
    }

    // 检查手机号是否已注册
    const existingUsers = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: 'error',
        message: '该手机号已注册',
      });
    }

    // TODO: 验证短信验证码
    // const isValidCode = await verifySmsCode(phone, verifyCode);
    // if (!isValidCode) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: '验证码错误或已过期'
    //   });
    // }

    // 创建用户
    const userId = generateUserId();
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();

    await db.run(
      'INSERT INTO users (userId, phone, password, nickname, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, phone, passwordHash, `用户${phone.slice(-4)}`, now, now],
    );

    // 生成Token
    const token = generateAccessToken({ userId, phone });

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        token,
        userId,
        user: {
          phone,
          userId,
        },
      },
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      status: 'error',
      message: '注册失败，请稍后重试',
    });
  }
});

/**
 * @route   POST /api/v1/auth/login
 * @desc    用户登录（手机号+密码）
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 参数验证
    if (!phone || !password) {
      return res.status(400).json({
        status: 'error',
        message: '手机号和密码不能为空',
      });
    }

    // 查找用户
    const users = await db.execute('SELECT * FROM users WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(401).json({
        status: 'error',
        message: '手机号或密码错误',
      });
    }

    const user = users[0];

    // 验证密码
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({
        status: 'error',
        message: '手机号或密码错误',
      });
    }

    // 更新最后登录时间
    await db.run(
      'UPDATE users SET updatedAt = ? WHERE userId = ?',
      [new Date().toISOString(), user.userId],
    );

    // 返回用户信息（隐藏密码）
    const userInfo = {
      userId: user.userId,
      phone: user.phone,
      nickname: user.nickname,
      avatar: user.avatar,
      email: user.email,
    };

    // 生成Token
    const token = generateAccessToken({ userId: user.userId, phone: user.phone });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user: userInfo,
      },
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后重试',
    });
  }
});

/**
 * @route   POST /api/v1/auth/login/email
 * @desc    邮箱登录
 * @access  Public
 */
router.post('/login/email', async (req, res) => {
  try {
    const { email, password } = req.body;

    // 参数验证
    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: '邮箱和密码不能为空',
      });
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        status: 'error',
        message: '邮箱格式不正确',
      });
    }

    // TODO: 查找用户
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: '邮箱或密码错误'
    //   });
    // }

    // TODO: 验证密码
    // const isValidPassword = await bcrypt.compare(password, user.password);
    // if (!isValidPassword) {
    //   return res.status(401).json({
    //     status: 'error',
    //     message: '邮箱或密码错误'
    //   });
    // }

    // 模拟用户数据
    const user = {
      userId: `user_${Date.now()}`,
      email,
      nickname: email.split('@')[0],
      avatar: null,
    };

    // 生成Token
    const token = generateAccessToken({ userId: user.userId, email });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error('邮箱登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后重试',
    });
  }
});

/**
 * @route   POST /api/v1/auth/login/sms
 * @desc    短信验证码登录
 * @access  Public
 */
router.post('/login/sms', async (req, res) => {
  try {
    const { phone, verifyCode } = req.body;

    // 参数验证
    if (!phone || !verifyCode) {
      return res.status(400).json({
        status: 'error',
        message: '手机号和验证码不能为空',
      });
    }

    // 手机号格式验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: '手机号格式不正确',
      });
    }

    // TODO: 验证短信验证码
    // const isValidCode = await verifySmsCode(phone, verifyCode);
    // if (!isValidCode) {
    //   return res.status(400).json({
    //     status: 'error',
    //     message: '验证码错误或已过期'
    //   });
    // }

    // TODO: 查找或创建用户
    // let user = await User.findOne({ phone });
    // if (!user) {
    //   user = await User.create({
    //     phone,
    //     nickname: '用户' + phone.slice(-4),
    //     createdAt: new Date()
    //   });
    // }

    // 模拟用户数据
    const user = {
      userId: `user_${Date.now()}`,
      phone,
      nickname: `用户${phone.slice(-4)}`,
      avatar: null,
    };

    // 生成Token
    const token = generateAccessToken({ userId: user.userId, phone });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    console.error('短信登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '登录失败，请稍后重试',
    });
  }
});

/**
 * @route   POST /api/v1/auth/qrcode/generate
 * @desc    生成扫码登录二维码
 * @access  Public
 */
router.post('/qrcode/generate', async (req, res) => {
  try {
    // 生成唯一的二维码ID
    const qrcodeId = `qr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: 将二维码ID存入Redis，设置5分钟过期
    // await redis.setex(`qrcode:${qrcodeId}`, 300, JSON.stringify({
    //   status: 'pending',
    //   createdAt: new Date()
    // }));

    // 生成二维码内容（包含二维码ID）
    const qrcodeContent = JSON.stringify({
      type: 'login',
      qrcodeId,
      timestamp: Date.now(),
    });

    res.json({
      status: 'success',
      message: '二维码生成成功',
      data: {
        qrcodeId,
        qrcodeContent,
        expireTime: 300, // 5分钟过期
      },
    });
  } catch (error) {
    console.error('生成二维码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '生成二维码失败',
    });
  }
});

/**
 * @route   GET /api/v1/auth/qrcode/status/:qrcodeId
 * @desc    查询二维码登录状态
 * @access  Public
 */
router.get('/qrcode/status/:qrcodeId', async (req, res) => {
  try {
    const { qrcodeId } = req.params;

    // TODO: 从Redis查询二维码状态
    // const qrcodeData = await redis.get(`qrcode:${qrcodeId}`);
    // if (!qrcodeData) {
    //   return res.status(404).json({
    //     status: 'error',
    //     message: '二维码已过期或不存在'
    //   });
    // }
    // const data = JSON.parse(qrcodeData);

    // 模拟状态
    const data = {
      status: 'pending', // pending, scanned, confirmed, expired
      scannedAt: null,
      confirmedAt: null,
    };

    res.json({
      status: 'success',
      data: {
        qrcodeId,
        ...data,
      },
    });
  } catch (error) {
    console.error('查询二维码状态错误:', error);
    res.status(500).json({
      status: 'error',
      message: '查询状态失败',
    });
  }
});

/**
 * @route   POST /api/v1/auth/qrcode/confirm
 * @desc    APP确认扫码登录
 * @access  Private
 */
router.post('/qrcode/confirm', async (req, res) => {
  try {
    // QR码登录逻辑待实现

    // TODO: 验证二维码状态
    // const qrcodeData = await redis.get(`qrcode:${qrcodeId}`);
    // if (!qrcodeData) {
    //   return res.status(404).json({
    //     status: 'error',
    //     message: '二维码已过期或不存在'
    //   });
    // }

    // TODO: 获取用户信息
    // const user = await User.findById(userId);
    // if (!user) {
    //   return res.status(404).json({
    //     status: 'error',
    //     message: '用户不存在'
    //   });
    // }

    // TODO: 更新二维码状态为已确认
    // await redis.setex(`qrcode:${qrcodeId}`, 300, JSON.stringify({
    //   status: 'confirmed',
    //   userId: user._id,
    //   confirmedAt: new Date()
    // }));

    res.json({
      status: 'success',
      message: '登录确认成功',
    });
  } catch (error) {
    console.error('确认扫码登录错误:', error);
    res.status(500).json({
      status: 'error',
      message: '确认登录失败',
    });
  }
});

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    刷新Token
 * @access  Private
 */
router.post('/refresh', authenticate, async (req, res) => {
  try {
    // 使用中间件导出的刷新Token函数
    const { refreshToken } = require('../middleware/auth');
    return refreshToken(req, res);
  } catch (error) {
    console.error('Token刷新错误:', error);
    res.status(401).json({
      status: 'error',
      message: 'Token无效或已过期',
    });
  }
});

/**
 * @route   POST /api/v1/auth/logout
 * @desc    用户登出
 * @access  Private
 */
router.post('/logout', authenticate, async (req, res) => {
  return logout(req, res);
});

/**
 * @route   POST /api/v1/auth/sms/send
 * @desc    发送短信验证码
 * @access  Public
 */
router.post('/sms/send', async (req, res) => {
  try {
    const { phone, type = 'register' } = req.body;

    // 手机号验证
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        status: 'error',
        message: '手机号格式不正确',
      });
    }

    // 生成6位验证码
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    // TODO: 调用短信服务发送验证码
    // await sendSms(phone, verifyCode);

    // TODO: 将验证码存入Redis，设置5分钟过期
    // await redis.setex(`sms:${phone}`, 300, verifyCode);

    console.log(`短信验证码 [${type}]: ${phone} -> ${verifyCode}`);

    res.json({
      status: 'success',
      message: '验证码已发送',
      data: {
        // 仅开发环境返回验证码
        verifyCode: process.env.NODE_ENV === 'development' ? verifyCode : undefined,
      },
    });
  } catch (error) {
    console.error('发送验证码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '验证码发送失败',
    });
  }
});

module.exports = router;

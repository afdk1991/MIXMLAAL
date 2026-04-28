const express = require('express');
const router = express.Router();
const passport = require('passport');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 注册
router.post('/register', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少6位'),
  body('name').notEmpty().withMessage('请输入姓名')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { phone, password, name } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({ status: 'error', message: '手机号已注册' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await User.create({
      phone,
      password: hashedPassword,
      name,
      role: 'user'
    });

    // 生成token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.status(201).json({
      status: 'success',
      message: '注册成功',
      data: {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({ status: 'error', message: '注册失败' });
  }
});

// 登录
router.post('/login', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('password').notEmpty().withMessage('请输入密码')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { phone, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { phone } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: '手机号或密码错误' });
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ status: 'error', message: '手机号或密码错误' });
    }

    // 生成token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({ status: 'error', message: '登录失败' });
  }
});

// 短信验证码登录
router.post('/login/sms', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码'),
  body('code').isLength({ min: 6, max: 6 }).withMessage('请输入6位验证码')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { phone, code } = req.body;

    // 验证验证码（这里应该从缓存中获取验证码进行验证）
    // 实际项目中应该使用Redis存储验证码
    if (code !== '123456') { // 模拟验证码验证
      return res.status(401).json({ status: 'error', message: '验证码错误' });
    }

    // 查找用户
    let user = await User.findOne({ where: { phone } });

    // 如果用户不存在，自动注册
    if (!user) {
      user = await User.create({
        phone,
        password: await bcrypt.hash('123456', 10), // 默认密码
        name: `用户${phone.slice(-4)}`,
        role: 'user'
      });
    }

    // 生成token
    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        token
      }
    });
  } catch (error) {
    console.error('短信登录失败:', error);
    res.status(500).json({ status: 'error', message: '登录失败' });
  }
});

// 发送短信验证码
router.post('/send-sms', [
  body('phone').isMobilePhone('zh-CN').withMessage('请输入有效的手机号码')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { phone } = req.body;

    // 生成验证码（实际项目中应该使用随机生成的验证码）
    const code = '123456'; // 模拟验证码

    // 发送短信（实际项目中应该调用短信API）
    console.log(`向${phone}发送验证码: ${code}`);

    // 存储验证码到缓存（实际项目中应该使用Redis）
    // redis.set(`sms:${phone}`, code, 'EX', 300); // 5分钟过期

    res.json({
      status: 'success',
      message: '验证码发送成功',
      data: {
        phone,
        code // 实际项目中不应该返回验证码
      }
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({ status: 'error', message: '发送验证码失败' });
  }
});

// 第三方登录
router.post('/login/third-party', [
  body('platform').notEmpty().withMessage('请指定登录平台'),
  body('token').notEmpty().withMessage('请提供平台token')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const { platform, token, userInfo } = req.body;

    // 验证第三方token（实际项目中应该调用第三方API验证）
    // 这里模拟验证成功
    const thirdPartyId = `third_${platform}_${Date.now()}`;

    // 查找用户
    let user = await User.findOne({ where: { thirdPartyId } });

    // 如果用户不存在，自动注册
    if (!user) {
      user = await User.create({
        thirdPartyId,
        phone: userInfo?.phone || '',
        name: userInfo?.name || `用户${Date.now()}`,
        role: 'user'
      });
    }

    // 生成token
    const jwtToken = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });

    res.json({
      status: 'success',
      message: '登录成功',
      data: {
        userId: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        token: jwtToken
      }
    });
  } catch (error) {
    console.error('第三方登录失败:', error);
    res.status(500).json({ status: 'error', message: '登录失败' });
  }
});

// 退出登录
router.post('/logout', (req, res) => {
  // 实际项目中应该将token加入黑名单
  res.json({ status: 'success', message: '退出登录成功' });
});

module.exports = router;
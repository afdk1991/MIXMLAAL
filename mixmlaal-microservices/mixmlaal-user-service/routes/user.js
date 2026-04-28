const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const auth = require('../middleware/auth');

// 获取用户信息
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'phone', 'name', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({ status: 'error', message: '获取用户信息失败' });
  }
});

// 更新用户信息
router.put('/me', auth, [
  body('name').optional().notEmpty().withMessage('姓名不能为空'),
  body('password').optional().isLength({ min: 6 }).withMessage('密码长度至少6位')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const user = await User.findByPk(req.user.userId);

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }

    // 更新用户信息
    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    await user.save();

    res.json({
      status: 'success',
      message: '更新成功',
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ status: 'error', message: '更新用户信息失败' });
  }
});

// 获取用户列表（管理员）
router.get('/', auth(['admin']), async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    const offset = (page - 1) * limit;

    const where = {};
    if (role) {
      where.role = role;
    }

    const users = await User.findAndCountAll({
      where,
      attributes: ['id', 'phone', 'name', 'role', 'createdAt'],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      status: 'success',
      data: {
        users: users.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.count,
          totalPages: Math.ceil(users.count / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表失败:', error);
    res.status(500).json({ status: 'error', message: '获取用户列表失败' });
  }
});

// 获取用户详情（管理员）
router.get('/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'phone', 'name', 'role', 'createdAt']
    });

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }

    res.json({
      status: 'success',
      data: user
    });
  } catch (error) {
    console.error('获取用户详情失败:', error);
    res.status(500).json({ status: 'error', message: '获取用户详情失败' });
  }
});

// 更新用户信息（管理员）
router.put('/:id', auth(['admin']), [
  body('name').optional().notEmpty().withMessage('姓名不能为空'),
  body('role').optional().isIn(['user', 'admin', 'driver', 'merchant']).withMessage('无效的角色')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ status: 'error', message: errors.array()[0].msg });
  }

  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }

    // 更新用户信息
    if (req.body.name) {
      user.name = req.body.name;
    }

    if (req.body.role) {
      user.role = req.body.role;
    }

    await user.save();

    res.json({
      status: 'success',
      message: '更新成功',
      data: {
        id: user.id,
        phone: user.phone,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({ status: 'error', message: '更新用户信息失败' });
  }
});

// 删除用户（管理员）
router.delete('/:id', auth(['admin']), async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'error', message: '用户不存在' });
    }

    await user.destroy();

    res.json({
      status: 'success',
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({ status: 'error', message: '删除用户失败' });
  }
});

module.exports = router;
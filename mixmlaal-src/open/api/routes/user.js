/**
 * 用户路由
 * 版本: v1.0.0.0
 * 说明: 用户信息、资料管理相关接口
 */

const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const db = require('../utils/database.sqlite');

/**
 * @route   GET /api/v1/user/profile
 * @desc    获取用户信息
 * @access  Private
 */
router.get('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await db.execute('SELECT * FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const user = users[0];
    res.json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          phone: user.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}` : '',
          nickname: user.nickname,
          avatar: user.avatar,
          email: user.email,
          gender: user.gender || 'unknown',
          birthday: user.birthday,
          level: user.level || 1,
          points: user.points || 0,
          balance: user.balance || 0,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败',
    });
  }
});

/**
 * @route   PUT /api/v1/user/profile
 * @desc    更新用户信息
 * @access  Private
 */
router.put('/profile', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, email, gender, birthday } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }
    if (gender !== undefined) {
      updateFields.push('gender = ?');
      updateValues.push(gender);
    }
    if (birthday !== undefined) {
      updateFields.push('birthday = ?');
      updateValues.push(birthday);
    }

    if (updateFields.length > 0) {
      updateFields.push('updatedAt = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(userId);

      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE userId = ?`;
      await db.run(sql, updateValues);
    }

    res.json({
      status: 'success',
      message: '用户信息更新成功',
      data: {
        nickname,
        avatar,
        email,
        gender,
        birthday,
      },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新用户信息失败',
    });
  }
});

/**
 * @route   GET /api/v1/user/orders
 * @desc    获取用户订单列表
 * @access  Private
 */
router.get('/orders', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const orders = await db.execute(
      'SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC LIMIT ? OFFSET ?',
      [userId, parseInt(limit, 10), offset],
    );

    const countResult = await db.execute(
      'SELECT COUNT(*) as total FROM orders WHERE userId = ?',
      [userId],
    );

    res.json({
      status: 'success',
      data: {
        orders,
        pagination: {
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          total: countResult[0].total,
        },
      },
    });
  } catch (error) {
    console.error('获取订单列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取订单列表失败',
    });
  }
});

/**
 * @route   GET /api/v1/user/info
 * @desc    获取用户基本信息
 * @access  Private
 */
router.get('/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;

    const users = await db.execute('SELECT * FROM users WHERE userId = ?', [userId]);

    if (users.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: '用户不存在',
      });
    }

    const user = users[0];
    res.json({
      status: 'success',
      data: {
        user: {
          userId: user.userId,
          phone: user.phone ? `${user.phone.slice(0, 3)}****${user.phone.slice(-4)}` : '',
          nickname: user.nickname,
          avatar: user.avatar,
          email: user.email,
          level: user.level || 1,
          points: user.points || 0,
        },
      },
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取用户信息失败',
    });
  }
});

/**
 * @route   PUT /api/v1/user/info
 * @desc    更新用户基本信息
 * @access  Private
 */
router.put('/info', authenticate, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { nickname, avatar, email } = req.body;

    const updateFields = [];
    const updateValues = [];

    if (nickname !== undefined) {
      updateFields.push('nickname = ?');
      updateValues.push(nickname);
    }
    if (avatar !== undefined) {
      updateFields.push('avatar = ?');
      updateValues.push(avatar);
    }
    if (email !== undefined) {
      updateFields.push('email = ?');
      updateValues.push(email);
    }

    if (updateFields.length > 0) {
      updateFields.push('updatedAt = ?');
      updateValues.push(new Date().toISOString());
      updateValues.push(userId);

      const sql = `UPDATE users SET ${updateFields.join(', ')} WHERE userId = ?`;
      await db.run(sql, updateValues);
    }

    res.json({
      status: 'success',
      message: '用户信息更新成功',
      data: { nickname, avatar, email },
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: '更新用户信息失败',
    });
  }
});

/**
 * @route   GET /api/v1/user/addresses
 * @desc    获取用户地址列表
 * @access  Private
 */
router.get('/addresses', authenticate, async (req, res) => {
  try {
    const _userId = req.user.userId;

    const addresses = [
      {
        id: 'addr_001',
        name: '家',
        contact: '用户',
        phone: '138****8888',
        address: '北京市海淀区中关村大街1号',
        isDefault: true,
      },
    ];

    res.json({
      status: 'success',
      data: { addresses },
    });
  } catch (error) {
    console.error('获取地址列表错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取地址列表失败',
    });
  }
});

module.exports = router;

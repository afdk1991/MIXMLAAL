const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authController = {
  // 登录
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // 查找用户
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.json({
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({
          code: 401,
          message: '用户名或密码错误',
          data: null
        });
      }

      // 生成token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '24h'
        }
      );

      // 生成refresh token
      const refreshToken = jwt.sign(
        {
          id: user.id
        },
        process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        {
          expiresIn: '7d'
        }
      );

      // 更新最后登录时间
      await user.update({ last_login: new Date() });

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          refreshToken,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
          }
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
    }
  },

  // 注册
  register: async (req, res) => {
    const { username, password, name, role, phone, email } = req.body;

    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.json({
          code: 400,
          message: '用户名已存在',
          data: null
        });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        name,
        role,
        phone,
        email
      });

      res.json({
        code: 200,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          role: user.role
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null
      });
    }
  },

  // 登出
  logout: async (req, res) => {
    // 客户端删除token即可，服务端无需特殊处理
    res.json({
      code: 200,
      message: '登出成功',
      data: null
    });
  },

  // 刷新token
  refreshToken: async (req, res) => {
    const { refreshToken } = req.body;

    try {
      // 验证refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key');

      // 查找用户
      const user = await User.findByPk(decoded.id);
      if (!user) {
        return res.json({
          code: 401,
          message: '用户不存在',
          data: null
        });
      }

      // 生成新的token
      const newToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '24h'
        }
      );

      res.json({
        code: 200,
        message: '刷新token成功',
        data: {
          token: newToken
        }
      });
    } catch (error) {
      res.json({
        code: 401,
        message: 'refresh token无效或已过期',
        data: null
      });
    }
  },

  // 获取当前用户信息
  getMe: async (req, res) => {
    const userId = req.user?.id;

    if (!userId) {
      return res.json({
        code: 401,
        message: '未授权',
        data: null
      });
    }

    try {
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'name', 'role', 'phone', 'email', 'created_at', 'last_login']
      });

      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取用户信息成功',
        data: user
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取用户信息失败',
        data: null
      });
    }
  }
};

module.exports = authController;
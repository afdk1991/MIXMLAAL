const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { User } = require('../models');
const { Op } = require('sequelize');
require('dotenv').config();

// 验证码存储（生产环境应使用Redis）
const verificationCodes = new Map();
const resetTokens = new Map();

// 生成验证码
function generateCode(length = 6) {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// 清理过期验证码
function cleanupExpiredCodes() {
  const now = Date.now();
  for (const [key, value] of verificationCodes.entries()) {
    if (value.expiresAt < now) {
      verificationCodes.delete(key);
    }
  }
}

// 认证控制器
class AuthController {
  // 发送验证码
  async sendVerificationCode(req, res) {
    try {
      const { phone, type } = req.body;

      if (!phone) {
        return res.json({
          code: 400,
          message: '请输入手机号',
          data: null
        });
      }

      // 生成验证码
      const code = generateCode();
      const key = `${phone}_${type}`;

      // 存储验证码（5分钟有效期）
      verificationCodes.set(key, {
        code,
        expiresAt: Date.now() + 5 * 60 * 1000,
        attempts: 0
      });

      // 清理过期验证码
      cleanupExpiredCodes();

      // 实际生产环境应调用短信服务发送验证码
      // 这里模拟发送成功
      console.log(`验证码已发送至 ${phone}: ${code}`);

      res.json({
        code: 200,
        message: '验证码已发送',
        data: {
          expiresIn: 300
        }
      });
    } catch (error) {
      console.error('发送验证码失败:', error);
      res.status(500).json({
        code: 500,
        message: '发送验证码失败',
        data: null
      });
    }
  }

  // 手机号验证码登录
  async loginByPhone(req, res) {
    try {
      const { phone, code } = req.body;

      if (!phone || !code) {
        return res.json({
          code: 400,
          message: '请输入手机号和验证码',
          data: null
        });
      }

      // 验证验证码
      const key = `${phone}_login`;
      const storedData = verificationCodes.get(key);

      if (!storedData) {
        return res.json({
          code: 400,
          message: '验证码已过期，请重新获取',
          data: null
        });
      }

      if (storedData.code !== code) {
        storedData.attempts++;
        if (storedData.attempts >= 3) {
          verificationCodes.delete(key);
          return res.json({
            code: 400,
            message: '验证码错误次数过多，请重新获取',
            data: null
          });
        }
        return res.json({
          code: 400,
          message: '验证码错误',
          data: null
        });
      }

      // 验证通过，删除验证码
      verificationCodes.delete(key);

      // 查找或创建用户
      let user = await User.findOne({ where: { phone } });

      if (!user) {
        // 自动注册新用户
        const username = `user_${phone.slice(-8)}`;
        user = await User.create({
          username,
          phone,
          role: 'user',
          thirdPartyProvider: 'none'
        });
      }

      // 生成token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            membershipLevel: user.membershipLevel,
            points: user.points
          }
        }
      });
    } catch (error) {
      console.error('手机号登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
    }
  }

  // 第三方登录（微信/QQ/Google）
  async thirdPartyLogin(req, res) {
    try {
      const { provider, openid, unionid, nickname, avatar } = req.body;

      if (!provider || !openid) {
        return res.json({
          code: 400,
          message: '缺少登录参数',
          data: null
        });
      }

      // 查找已绑定该第三方账号的用户
      const query = {};
      if (provider === 'wechat') {
        query.wechatOpenid = openid;
      } else if (provider === 'qq') {
        query.qqOpenid = openid;
      } else if (provider === 'google') {
        query.googleOpenid = openid;
      }

      let user = await User.findOne({ where: query });

      // 如果用户不存在，自动创建
      if (!user) {
        const username = `${provider}_${openid.slice(0, 8)}`;
        user = await User.create({
          username,
          name: nickname || username,
          avatar: avatar || null,
          role: 'user',
          thirdPartyProvider: provider,
          thirdPartyId: openid,
          [provider === 'wechat' ? 'wechatOpenid' : provider === 'qq' ? 'qqOpenid' : 'googleOpenid']: openid,
          wechatUnionid: provider === 'wechat' ? unionid : null
        });
      } else if (nickname || avatar) {
        // 更新用户信息
        await user.update({
          name: nickname || user.name,
          avatar: avatar || user.avatar
        });
      }

      // 生成token
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.role
        },
        process.env.JWT_SECRET || 'your-jwt-secret',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            phone: user.phone,
            role: user.role,
            avatar: user.avatar,
            membershipLevel: user.membershipLevel,
            points: user.points
          },
          isNewUser: !user.name || user.name.startsWith(`${provider}_`)
        }
      });
    } catch (error) {
      console.error('第三方登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
    }
  }

  // 登录
  async login(req, res) {
    try {
      const { username, password } = req.body;

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

      // 检查用户状态
      if (user.status === 'inactive') {
        return res.json({
          code: 403,
          message: '账号已被禁用',
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
        process.env.JWT_SECRET || 'your-jwt-secret',
        {
          expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
      );

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            phone: user.phone,
            role: user.role
          }
        }
      });
    } catch (error) {
      console.error('登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '登录失败',
        data: null
      });
    }
  }

  // 注册
  async register(req, res) {
    try {
      const { username, password, name, phone, email, role } = req.body;

      // 检查用户名是否已存在
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.json({
          code: 400,
          message: '用户名已存在',
          data: null
        });
      }

      // 检查手机号是否已存在
      if (phone) {
        const existingPhone = await User.findOne({ where: { phone } });
        if (existingPhone) {
          return res.json({
            code: 400,
            message: '手机号已被注册',
            data: null
          });
        }
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      const user = await User.create({
        username,
        password: hashedPassword,
        name,
        phone,
        email,
        role: role || 'user'
      });

      res.json({
        code: 200,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('注册失败:', error);
      res.status(500).json({
        code: 500,
        message: '注册失败',
        data: null
      });
    }
  }

  // 获取当前用户信息
  async getCurrentUser(req, res) {
    try {
      const userId = req.user.id;

      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'name', 'phone', 'email', 'role', 'status', 'createdAt', 'avatar', 'membershipLevel', 'points']
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
      console.error('获取用户信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取用户信息失败',
        data: null
      });
    }
  }

  // 更新用户信息
  async updateUser(req, res) {
    try {
      const userId = req.user.id;
      const { name, phone, email, avatar } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 更新用户信息
      await user.update({
        name: name || user.name,
        phone: phone || user.phone,
        email: email || user.email,
        avatar: avatar || user.avatar
      });

      res.json({
        code: 200,
        message: '更新用户信息成功',
        data: {
          id: user.id,
          username: user.username,
          name: user.name,
          phone: user.phone,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (error) {
      console.error('更新用户信息失败:', error);
      res.status(500).json({
        code: 500,
        message: '更新用户信息失败',
        data: null
      });
    }
  }

  // 修改密码
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { oldPassword, newPassword } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
      if (!isPasswordValid) {
        return res.json({
          code: 401,
          message: '旧密码错误',
          data: null
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await user.update({ password: hashedPassword });

      res.json({
        code: 200,
        message: '密码修改成功',
        data: null
      });
    } catch (error) {
      console.error('修改密码失败:', error);
      res.status(500).json({
        code: 500,
        message: '修改密码失败',
        data: null
      });
    }
  }

  // 发送重置密码验证码
  async sendResetCode(req, res) {
    try {
      const { email } = req.body;

      if (!email) {
        return res.json({
          code: 400,
          message: '请输入邮箱',
          data: null
        });
      }

      // 查找用户
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 生成重置令牌
      const resetToken = crypto.randomBytes(32).toString('hex');
      const key = `reset_${email}`;

      resetTokens.set(key, {
        token: resetToken,
        userId: user.id,
        expiresAt: Date.now() + 30 * 60 * 1000 // 30分钟有效期
      });

      // 实际生产环境应发送邮件
      console.log(`密码重置链接已发送至 ${email}: ${resetToken}`);

      res.json({
        code: 200,
        message: '重置链接已发送至邮箱',
        data: {
          expiresIn: 1800
        }
      });
    } catch (error) {
      console.error('发送重置链接失败:', error);
      res.status(500).json({
        code: 500,
        message: '发送重置链接失败',
        data: null
      });
    }
  }

  // 重置密码
  async resetPassword(req, res) {
    try {
      const { email, token, newPassword } = req.body;

      if (!email || !token || !newPassword) {
        return res.json({
          code: 400,
          message: '缺少必要参数',
          data: null
        });
      }

      // 验证重置令牌
      const key = `reset_${email}`;
      const storedData = resetTokens.get(key);

      if (!storedData || storedData.token !== token) {
        return res.json({
          code: 400,
          message: '无效的重置令牌',
          data: null
        });
      }

      if (storedData.expiresAt < Date.now()) {
        resetTokens.delete(key);
        return res.json({
          code: 400,
          message: '重置令牌已过期',
          data: null
        });
      }

      // 查找用户
      const user = await User.findByPk(storedData.userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await user.update({ password: hashedPassword });

      // 删除令牌
      resetTokens.delete(key);

      res.json({
        code: 200,
        message: '密码重置成功',
        data: null
      });
    } catch (error) {
      console.error('重置密码失败:', error);
      res.status(500).json({
        code: 500,
        message: '重置密码失败',
        data: null
      });
    }
  }

  // 账号注销
  async deleteAccount(req, res) {
    try {
      const userId = req.user.id;
      const { password } = req.body;

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.json({
          code: 401,
          message: '密码错误',
          data: null
        });
      }

      // 删除用户（实际生产环境应标记为删除而非直接删除）
      await user.update({ status: 'inactive' });

      res.json({
        code: 200,
        message: '账号注销成功',
        data: null
      });
    } catch (error) {
      console.error('账号注销失败:', error);
      res.status(500).json({
        code: 500,
        message: '账号注销失败',
        data: null
      });
    }
  }

  // 绑定第三方账号
  async bindThirdParty(req, res) {
    try {
      const userId = req.user.id;
      const { provider, openid, unionid } = req.body;

      if (!provider || !openid) {
        return res.json({
          code: 400,
          message: '缺少绑定参数',
          data: null
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 检查是否已被其他用户绑定
      const query = {};
      if (provider === 'wechat') {
        query.wechatOpenid = openid;
      } else if (provider === 'qq') {
        query.qqOpenid = openid;
      } else if (provider === 'google') {
        query.googleOpenid = openid;
      }

      const existingUser = await User.findOne({ where: query });
      if (existingUser && existingUser.id !== userId) {
        return res.json({
          code: 400,
          message: '该账号已被其他用户绑定',
          data: null
        });
      }

      // 更新绑定信息
      const updateData = {
        thirdPartyProvider: provider,
        thirdPartyId: openid
      };

      if (provider === 'wechat') {
        updateData.wechatOpenid = openid;
        if (unionid) updateData.wechatUnionid = unionid;
      } else if (provider === 'qq') {
        updateData.qqOpenid = openid;
      } else if (provider === 'google') {
        updateData.googleOpenid = openid;
      }

      await user.update(updateData);

      res.json({
        code: 200,
        message: '绑定成功',
        data: {
          provider
        }
      });
    } catch (error) {
      console.error('绑定第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '绑定失败',
        data: null
      });
    }
  }

  // 解绑第三方账号
  async unbindThirdParty(req, res) {
    try {
      const userId = req.user.id;
      const { provider } = req.body;

      if (!provider) {
        return res.json({
          code: 400,
          message: '请选择要解绑的平台',
          data: null
        });
      }

      const user = await User.findByPk(userId);
      if (!user) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 更新解绑信息
      const updateData = {
        thirdPartyProvider: 'none',
        thirdPartyId: null
      };

      if (provider === 'wechat') {
        updateData.wechatOpenid = null;
        updateData.wechatUnionid = null;
      } else if (provider === 'qq') {
        updateData.qqOpenid = null;
      } else if (provider === 'google') {
        updateData.googleOpenid = null;
      }

      await user.update(updateData);

      res.json({
        code: 200,
        message: '解绑成功',
        data: {
          provider
        }
      });
    } catch (error) {
      console.error('解绑第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '解绑失败',
        data: null
      });
    }
  }
}

module.exports = new AuthController();

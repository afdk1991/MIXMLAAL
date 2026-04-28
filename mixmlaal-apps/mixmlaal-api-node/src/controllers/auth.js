const bcrypt = require('bcrypt');
const { User, Role, Permission } = require('../models');
const { generateAccessToken, generateRefreshToken, verifyToken } = require('../config/jwt');
const { cache } = require('../config/redis');

// 注册
const register = async (req, res) => {
  try {
    const { phone, password, nickname } = req.body;
    
    // 检查手机号是否已存在
    const existingUser = await User.findOne({ where: { phone } });
    if (existingUser) {
      return res.status(400).json({
        code: 20001,
        message: '手机号已注册',
        data: null
      });
    }
    
    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // 创建用户
    const user = await User.create({
      phone,
      password: hashedPassword,
      nickname
    });
    
    // 为新用户分配默认角色（普通用户）
    const defaultRole = await Role.findOne({ where: { name: '普通用户' } });
    if (defaultRole) {
      await user.addRole(defaultRole);
    }
    
    // 生成令牌
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // 缓存令牌
    await cache.set(`token:${user.id}`, accessToken, 15 * 60); // 15分钟
    await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7天
    
    res.status(200).json({
      code: 0,
      message: '注册成功',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          user_level: user.user_level
        },
        access_token: accessToken,
        refresh_token: refreshToken
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      code: 40001,
      message: '注册失败',
      data: null
    });
  }
};

// 登录
const login = async (req, res) => {
  try {
    const { phone, password } = req.body;
    
    // 查找用户
    const user = await User.findOne({
      where: { phone },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions'
            }
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        code: 20001,
        message: '用户不存在',
        data: null
      });
    }
    
    // 检查密码
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({
        code: 10002,
        message: '密码错误',
        data: null
      });
    }
    
    // 检查用户状态
    if (user.status === 0) {
      return res.status(403).json({
        code: 20002,
        message: '账号已被禁用',
        data: null
      });
    }
    
    // 提取角色和权限
    const roles = user.roles.map(role => role.name);
    const permissions = user.roles
      .flatMap(role => role.permissions)
      .map(permission => permission.code);
    
    // 生成令牌
    const accessToken = generateAccessToken({
      ...user.toJSON(),
      roles,
      permissions
    });
    const refreshToken = generateRefreshToken(user);
    
    // 缓存令牌
    await cache.set(`token:${user.id}`, accessToken, 15 * 60); // 15分钟
    await cache.set(`refresh_token:${user.id}`, refreshToken, 7 * 24 * 60 * 60); // 7天
    
    res.status(200).json({
      code: 0,
      message: '登录成功',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          user_level: user.user_level,
          roles,
          permissions
        },
        access_token: accessToken,
        refresh_token: refreshToken
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 40001,
      message: '登录失败',
      data: null
    });
  }
};

// 刷新令牌
const refreshToken = async (req, res) => {
  try {
    const { refresh_token } = req.body;
    
    if (!refresh_token) {
      return res.status(400).json({
        code: 10002,
        message: '缺少刷新令牌',
        data: null
      });
    }
    
    // 验证刷新令牌
    const decoded = verifyToken(refresh_token);
    if (!decoded) {
      return res.status(401).json({
        code: 10003,
        message: '刷新令牌无效或已过期',
        data: null
      });
    }
    
    // 从缓存中验证刷新令牌
    const cacheKey = `refresh_token:${decoded.id}`;
    const cachedRefreshToken = await cache.get(cacheKey);
    if (!cachedRefreshToken) {
      return res.status(401).json({
        code: 10003,
        message: '刷新令牌已被注销',
        data: null
      });
    }
    
    // 查找用户
    const user = await User.findOne({
      where: { id: decoded.id },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions'
            }
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        code: 20001,
        message: '用户不存在',
        data: null
      });
    }
    
    // 提取角色和权限
    const roles = user.roles.map(role => role.name);
    const permissions = user.roles
      .flatMap(role => role.permissions)
      .map(permission => permission.code);
    
    // 生成新令牌
    const accessToken = generateAccessToken({
      ...user.toJSON(),
      roles,
      permissions
    });
    const newRefreshToken = generateRefreshToken(user);
    
    // 更新缓存
    await cache.set(`token:${user.id}`, accessToken, 15 * 60); // 15分钟
    await cache.set(`refresh_token:${user.id}`, newRefreshToken, 7 * 24 * 60 * 60); // 7天
    
    res.status(200).json({
      code: 0,
      message: '令牌刷新成功',
      data: {
        access_token: accessToken,
        refresh_token: newRefreshToken
      }
    });
  } catch (error) {
    console.error('刷新令牌错误:', error);
    res.status(500).json({
      code: 40001,
      message: '刷新令牌失败',
      data: null
    });
  }
};

// 退出登录
const logout = async (req, res) => {
  try {
    const user = req.user;
    
    // 清除缓存中的令牌
    await cache.del(`token:${user.id}`);
    await cache.del(`refresh_token:${user.id}`);
    
    res.status(200).json({
      code: 0,
      message: '退出登录成功',
      data: null
    });
  } catch (error) {
    console.error('退出登录错误:', error);
    res.status(500).json({
      code: 40001,
      message: '退出登录失败',
      data: null
    });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findOne({
      where: { id: req.user.id },
      include: [
        {
          model: Role,
          as: 'roles',
          include: [
            {
              model: Permission,
              as: 'permissions'
            }
          ]
        }
      ]
    });
    
    if (!user) {
      return res.status(404).json({
        code: 20001,
        message: '用户不存在',
        data: null
      });
    }
    
    // 提取角色和权限
    const roles = user.roles.map(role => role.name);
    const permissions = user.roles
      .flatMap(role => role.permissions)
      .map(permission => permission.code);
    
    res.status(200).json({
      code: 0,
      message: '获取用户信息成功',
      data: {
        user: {
          id: user.id,
          phone: user.phone,
          nickname: user.nickname,
          avatar: user.avatar,
          gender: user.gender,
          birthday: user.birthday,
          email: user.email,
          real_name: user.real_name,
          user_level: user.user_level,
          user_points: user.user_points,
          balance: user.balance,
          roles,
          permissions
        }
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 40001,
      message: '获取用户信息失败',
      data: null
    });
  }
};

module.exports = {
  register,
  login,
  refreshToken,
  logout,
  getCurrentUser
};
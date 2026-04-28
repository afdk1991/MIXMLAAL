const { Op, sequelize } = require('sequelize');
const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');
const AuditLog = require('../models/AuditLog');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const securityController = {
  // 登录
  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      // 查找用户
      const user = await User.findOne({
        where: {
          username
        },
        include: [Role]
      });

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
          role: user.Role?.name || 'user'
        },
        process.env.JWT_SECRET || 'your-secret-key',
        {
          expiresIn: '24h'
        }
      );

      // 记录登录日志
      await AuditLog.create({
        user_id: user.id,
        action: 'login',
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

      res.json({
        code: 200,
        message: '登录成功',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.Role?.name || 'user'
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
    const { username, password, name, role_id } = req.body;

    try {
      // 检查用户名是否已存在
      const existingUser = await User.findOne({
        where: {
          username
        }
      });

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
        role_id: role_id || 2 // 默认角色
      });

      // 记录注册日志
      await AuditLog.create({
        user_id: user.id,
        action: 'register',
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

      res.json({
        code: 200,
        message: '注册成功',
        data: {
          id: user.id,
          username: user.username,
          name: user.name
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

  // 刷新token
  refreshToken: async (req, res) => {
    const { token } = req.body;

    try {
      // 验证token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

      // 查找用户
      const user = await User.findByPk(decoded.id, {
        include: [Role]
      });

      if (!user) {
        return res.json({
          code: 401,
          message: '用户不存在',
          data: null
        });
      }

      // 生成新token
      const newToken = jwt.sign(
        {
          id: user.id,
          username: user.username,
          role: user.Role?.name || 'user'
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
      res.status(401).json({
        code: 401,
        message: 'token无效',
        data: null
      });
    }
  },

  // 退出登录
  logout: async (req, res) => {
    const { user } = req;

    try {
      // 记录退出登录日志
      await AuditLog.create({
        user_id: user.id,
        action: 'logout',
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

      res.json({
        code: 200,
        message: '退出登录成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '退出登录失败',
        data: null
      });
    }
  },

  // 获取当前用户信息
  getCurrentUser: async (req, res) => {
    const { user } = req;

    try {
      const currentUser = await User.findByPk(user.id, {
        include: [Role]
      });

      if (!currentUser) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      res.json({
        code: 200,
        message: '获取用户信息成功',
        data: {
          id: currentUser.id,
          username: currentUser.username,
          name: currentUser.name,
          role: currentUser.Role?.name || 'user'
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取用户信息失败',
        data: null
      });
    }
  },

  // 修改密码
  changePassword: async (req, res) => {
    const { user } = req;
    const { oldPassword, newPassword } = req.body;

    try {
      // 查找用户
      const currentUser = await User.findByPk(user.id);

      if (!currentUser) {
        return res.json({
          code: 404,
          message: '用户不存在',
          data: null
        });
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(oldPassword, currentUser.password);
      if (!isPasswordValid) {
        return res.json({
          code: 400,
          message: '旧密码错误',
          data: null
        });
      }

      // 加密新密码
      const hashedPassword = await bcrypt.hash(newPassword, 10);

      // 更新密码
      await currentUser.update({
        password: hashedPassword
      });

      // 记录修改密码日志
      await AuditLog.create({
        user_id: user.id,
        action: 'change_password',
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

      res.json({
        code: 200,
        message: '修改密码成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '修改密码失败',
        data: null
      });
    }
  },

  // 加密
  encrypt: async (req, res) => {
    const { data } = req.body;

    try {
      // 使用AES-256-CBC加密
      const algorithm = 'aes-256-cbc';
      const key = crypto.randomBytes(32);
      const iv = crypto.randomBytes(16);

      const cipher = crypto.createCipheriv(algorithm, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'base64');
      encrypted += cipher.final('base64');

      res.json({
        code: 200,
        message: '加密成功',
        data: {
          encrypted: encrypted,
          key: key.toString('base64'),
          iv: iv.toString('base64')
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '加密失败',
        data: null
      });
    }
  },

  // 解密
  decrypt: async (req, res) => {
    const { encrypted, key, iv } = req.body;

    try {
      // 使用AES-256-CBC解密
      const algorithm = 'aes-256-cbc';
      const keyBuffer = Buffer.from(key, 'base64');
      const ivBuffer = Buffer.from(iv, 'base64');

      const decipher = crypto.createDecipheriv(algorithm, keyBuffer, ivBuffer);
      let decrypted = decipher.update(encrypted, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      res.json({
        code: 200,
        message: '解密成功',
        data: {
          decrypted: decrypted
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '解密失败',
        data: null
      });
    }
  },

  // 获取审计日志
  getAuditLogs: async (req, res) => {
    try {
      const { page = 1, page_size = 10, user_id, action } = req.query;
      const offset = (page - 1) * page_size;

      const where = {};
      if (user_id) {
        where.user_id = user_id;
      }
      if (action) {
        where.action = action;
      }

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit: parseInt(page_size),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      res.json({
        code: 200,
        message: '获取审计日志成功',
        data: {
          items: rows,
          total: count,
          page: parseInt(page),
          page_size: parseInt(page_size)
        }
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取审计日志失败',
        data: null
      });
    }
  },

  // 添加审计日志
  addAuditLog: async (req, res) => {
    const { user } = req;
    const { action, details } = req.body;

    try {
      const auditLog = await AuditLog.create({
        user_id: user.id,
        action,
        details,
        ip: req.ip,
        user_agent: req.headers['user-agent']
      });

      res.json({
        code: 200,
        message: '添加审计日志成功',
        data: auditLog
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '添加审计日志失败',
        data: null
      });
    }
  },

  // 获取权限列表
  getPermissions: async (req, res) => {
    try {
      const permissions = await Permission.findAll();

      res.json({
        code: 200,
        message: '获取权限列表成功',
        data: permissions
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取权限列表失败',
        data: null
      });
    }
  },

  // 添加权限
  addPermission: async (req, res) => {
    const { name, description } = req.body;

    try {
      const permission = await Permission.create({
        name,
        description
      });

      res.json({
        code: 200,
        message: '添加权限成功',
        data: permission
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '添加权限失败',
        data: null
      });
    }
  },

  // 更新权限
  updatePermission: async (req, res) => {
    const { id } = req.params;
    const { name, description } = req.body;

    try {
      const permission = await Permission.findByPk(id);

      if (!permission) {
        return res.json({
          code: 404,
          message: '权限不存在',
          data: null
        });
      }

      await permission.update({
        name,
        description
      });

      res.json({
        code: 200,
        message: '更新权限成功',
        data: permission
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新权限失败',
        data: null
      });
    }
  },

  // 删除权限
  deletePermission: async (req, res) => {
    const { id } = req.params;

    try {
      const permission = await Permission.findByPk(id);

      if (!permission) {
        return res.json({
          code: 404,
          message: '权限不存在',
          data: null
        });
      }

      await permission.destroy();

      res.json({
        code: 200,
        message: '删除权限成功',
        data: null
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除权限失败',
        data: null
      });
    }
  },

  // 获取角色列表
  getRoles: async (req, res) => {
    try {
      const roles = await Role.findAll({
        include: [Permission]
      });

      res.json({
        code: 200,
        message: '获取角色列表成功',
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '获取角色列表失败',
        data: null
      });
    }
  },

  // 添加角色
  addRole: async (req, res) => {
    const { name, description, permission_ids } = req.body;

    try {
      // 开始事务
      const transaction = await Role.sequelize.transaction();

      try {
        // 创建角色
        const role = await Role.create(
          {
            name,
            description
          },
          { transaction }
        );

        // 关联权限
        if (permission_ids && permission_ids.length > 0) {
          await role.setPermissions(permission_ids, { transaction });
        }

        // 提交事务
        await transaction.commit();

        // 重新查询角色，包含权限
        const createdRole = await Role.findByPk(role.id, {
          include: [Permission]
        });

        res.json({
          code: 200,
          message: '添加角色成功',
          data: createdRole
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '添加角色失败',
        data: null
      });
    }
  },

  // 更新角色
  updateRole: async (req, res) => {
    const { id } = req.params;
    const { name, description, permission_ids } = req.body;

    try {
      // 开始事务
      const transaction = await Role.sequelize.transaction();

      try {
        // 查找角色
        const role = await Role.findByPk(id, { transaction });

        if (!role) {
          await transaction.rollback();
          return res.json({
            code: 404,
            message: '角色不存在',
            data: null
          });
        }

        // 更新角色
        await role.update(
          {
            name,
            description
          },
          { transaction }
        );

        // 更新权限
        if (permission_ids && permission_ids.length > 0) {
          await role.setPermissions(permission_ids, { transaction });
        }

        // 提交事务
        await transaction.commit();

        // 重新查询角色，包含权限
        const updatedRole = await Role.findByPk(role.id, {
          include: [Permission]
        });

        res.json({
          code: 200,
          message: '更新角色成功',
          data: updatedRole
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '更新角色失败',
        data: null
      });
    }
  },

  // 删除角色
  deleteRole: async (req, res) => {
    const { id } = req.params;

    try {
      // 开始事务
      const transaction = await Role.sequelize.transaction();

      try {
        // 查找角色
        const role = await Role.findByPk(id, { transaction });

        if (!role) {
          await transaction.rollback();
          return res.json({
            code: 404,
            message: '角色不存在',
            data: null
          });
        }

        // 解除权限关联
        await role.setPermissions([], { transaction });

        // 删除角色
        await role.destroy({ transaction });

        // 提交事务
        await transaction.commit();

        res.json({
          code: 200,
          message: '删除角色成功',
          data: null
        });
      } catch (error) {
        // 回滚事务
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '删除角色失败',
        data: null
      });
    }
  }
};

module.exports = securityController;
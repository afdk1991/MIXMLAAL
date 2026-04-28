const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

class AuthService {
  async register(username, email, password) {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('邮箱已被注册');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name: username,
      thirdPartyProvider: 'none'
    });

    const token = this.generateToken(user);

    return { user: this.sanitizeUser(user), token };
  }

  async login(email, password) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('邮箱或密码错误');
    }

    if (user.thirdPartyProvider !== 'none') {
      throw new Error('请使用第三方登录');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('邮箱或密码错误');
    }

    const token = this.generateToken(user);

    return { user: this.sanitizeUser(user), token };
  }

  async thirdPartyLogin(provider, openid, userInfo = {}) {
    let user = null;
    let isNewUser = false;

    switch (provider) {
      case 'wechat':
        user = await User.findOne({ where: { wechatOpenid: openid } });
        break;
      case 'qq':
        user = await User.findOne({ where: { qqOpenid: openid } });
        break;
      case 'google':
        user = await User.findOne({ where: { googleOpenid: openid } });
        break;
      default:
        throw new Error('不支持的第三方登录提供商');
    }

    if (!user) {
      const randomUsername = `${provider}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const defaultName = userInfo.name || `${provider}用户`;

      user = await User.create({
        username: randomUsername,
        name: defaultName,
        email: userInfo.email || null,
        avatar: userInfo.avatar || null,
        password: null,
        thirdPartyProvider: provider,
        thirdPartyId: openid,
        role: 'user'
      });

      switch (provider) {
        case 'wechat':
          await user.update({ wechatOpenid: openid });
          break;
        case 'qq':
          await user.update({ qqOpenid: openid });
          break;
        case 'google':
          await user.update({ googleOpenid: openid });
          break;
      }

      isNewUser = true;
    }

    const token = this.generateToken(user);

    return {
      user: this.sanitizeUser(user),
      token,
      isNewUser
    };
  }

  async bindThirdParty(userId, provider, openid) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.thirdPartyProvider !== 'none') {
      throw new Error('该账户已绑定第三方登录');
    }

    const existingUser = await this.findUserByProvider(provider, openid);
    if (existingUser) {
      throw new Error('该第三方账号已被其他用户绑定');
    }

    switch (provider) {
      case 'wechat':
        await user.update({ wechatOpenid: openid, thirdPartyProvider: provider });
        break;
      case 'qq':
        await user.update({ qqOpenid: openid, thirdPartyProvider: provider });
        break;
      case 'google':
        await user.update({ googleOpenid: openid, thirdPartyProvider: provider });
        break;
      default:
        throw new Error('不支持的第三方登录提供商');
    }

    return { message: '绑定成功', user: this.sanitizeUser(user) };
  }

  async unbindThirdParty(userId, provider) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    if (user.password === null) {
      throw new Error('无法解绑第三方登录，请先设置密码');
    }

    switch (provider) {
      case 'wechat':
        await user.update({ wechatOpenid: null, thirdPartyProvider: 'none' });
        break;
      case 'qq':
        await user.update({ qqOpenid: null, thirdPartyProvider: 'none' });
        break;
      case 'google':
        await user.update({ googleOpenid: null, thirdPartyProvider: 'none' });
        break;
      default:
        throw new Error('不支持的第三方登录提供商');
    }

    return { message: '解绑成功' };
  }

  async findUserByProvider(provider, openid) {
    switch (provider) {
      case 'wechat':
        return await User.findOne({ where: { wechatOpenid: openid } });
      case 'qq':
        return await User.findOne({ where: { qqOpenid: openid } });
      case 'google':
        return await User.findOne({ where: { googleOpenid: openid } });
      default:
        return null;
    }
  }

  generateToken(user) {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  sanitizeUser(user) {
    return {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      avatar: user.avatar,
      thirdPartyProvider: user.thirdPartyProvider,
      createdAt: user.createdAt
    };
  }

  async resetPassword(email, newPassword) {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('用户不存在');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await user.update({ password: hashedPassword });

    return { message: '密码重置成功' };
  }

  async getUserById(userId) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }
    return this.sanitizeUser(user);
  }

  async updateUser(userId, updates) {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('用户不存在');
    }

    const allowedUpdates = ['name', 'phone', 'avatar', 'username'];
    const filteredUpdates = {};

    for (const key of allowedUpdates) {
      if (updates[key] !== undefined) {
        filteredUpdates[key] = updates[key];
      }
    }

    await user.update(filteredUpdates);
    return this.sanitizeUser(user);
  }
}

module.exports = new AuthService();
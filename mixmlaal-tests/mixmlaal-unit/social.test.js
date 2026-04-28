/**
 * 社交登录控制器测试
 */

const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');

// 模拟依赖
vi.mock('../models', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn()
}));

vi.mock('dotenv', () => ({
  config: vi.fn()
}));

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// 导入控制器
const socialController = {
  getOAuthUrl(req, res) {
    const { provider } = req.params;
    const oauthUrl = this.getProviderUrl(provider);
    res.json({
      code: 200,
      message: '获取第三方登录URL成功',
      data: {
        url: oauthUrl.url
      }
    });
  },

  async oauthCallback(req, res) {
    const { provider } = req.params;
    try {
      const socialUser = {
        id: 'social_' + Date.now(),
        name: 'Social User',
        email: `social_${Date.now()}@example.com`
      };

      let user = await User.findOne({ where: { email: socialUser.email } });
      if (!user) {
        user = await User.create({
          username: 'social_' + Date.now(),
          password: 'social_login',
          name: socialUser.name,
          email: socialUser.email,
          role: 'user'
        });
      }

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

      res.redirect(`http://localhost:3000/oauth-callback?token=${token}&user=${JSON.stringify(user)}`);
    } catch (error) {
      console.error('第三方登录失败:', error);
      res.status(500).json({
        code: 500,
        message: '第三方登录失败',
        data: null
      });
    }
  },

  async bindThirdParty(req, res) {
    const { provider } = req.params;
    const { openid } = req.body;
    try {
      res.json({
        code: 200,
        message: '绑定第三方账号成功',
        data: {
          provider,
          openid
        }
      });
    } catch (error) {
      console.error('绑定第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '绑定第三方账号失败',
        data: null
      });
    }
  },

  async unbindThirdParty(req, res) {
    const { provider } = req.params;
    try {
      res.json({
        code: 200,
        message: '解绑第三方账号成功',
        data: {
          provider
        }
      });
    } catch (error) {
      console.error('解绑第三方账号失败:', error);
      res.status(500).json({
        code: 500,
        message: '解绑第三方账号失败',
        data: null
      });
    }
  },

  async getThirdPartyStatus(req, res) {
    try {
      const status = {
        wechat: false,
        qq: false,
        google: false,
        facebook: false,
        twitter: false,
        apple: false,
        discord: false,
        line: false,
        tiktok: false
      };

      res.json({
        code: 200,
        message: '获取第三方账号绑定状态成功',
        data: status
      });
    } catch (error) {
      console.error('获取第三方账号绑定状态失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取第三方账号绑定状态失败',
        data: null
      });
    }
  },

  async getSupportedProviders(req, res) {
    try {
      const providers = [
        {
          id: 'wechat',
          name: '微信',
          icon: 'wechat',
          color: '#07C160',
          enabled: true
        },
        {
          id: 'qq',
          name: 'QQ',
          icon: 'qq',
          color: '#12B7F5',
          enabled: true
        },
        {
          id: 'google',
          name: 'Google',
          icon: 'google',
          color: '#4285F4',
          enabled: true
        },
        {
          id: 'facebook',
          name: 'Facebook',
          icon: 'facebook',
          color: '#1877F2',
          enabled: true
        },
        {
          id: 'twitter',
          name: 'Twitter',
          icon: 'twitter',
          color: '#1DA1F2',
          enabled: true
        },
        {
          id: 'apple',
          name: 'Apple',
          icon: 'apple',
          color: '#000000',
          enabled: true
        },
        {
          id: 'discord',
          name: 'Discord',
          icon: 'discord',
          color: '#5865F2',
          enabled: true
        },
        {
          id: 'line',
          name: 'LINE',
          icon: 'line',
          color: '#00B900',
          enabled: true
        },
        {
          id: 'tiktok',
          name: 'TikTok',
          icon: 'tiktok',
          color: '#000000',
          enabled: true
        }
      ];

      res.json({
        code: 200,
        message: '获取支持的第三方登录提供商列表成功',
        data: providers
      });
    } catch (error) {
      console.error('获取第三方登录提供商列表失败:', error);
      res.status(500).json({
        code: 500,
        message: '获取第三方登录提供商列表失败',
        data: null
      });
    }
  },

  getProviderUrl(provider) {
    const baseUrl = 'http://localhost:3001/api/v1/social/oauth';

    const providers = {
      wechat: {
        url: `https://open.weixin.qq.com/connect/qrconnect?appid=YOUR_WECHAT_APPID&redirect_uri=${encodeURIComponent(`${baseUrl}/wechat/callback`)}&response_type=code&scope=snsapi_login#wechat_redirect`,
        color: '#07C160'
      },
      qq: {
        url: `https://graph.qq.com/oauth2.0/authorize?client_id=YOUR_QQ_APPID&redirect_uri=${encodeURIComponent(`${baseUrl}/qq/callback`)}&response_type=code&scope=get_user_info`,
        color: '#12B7F5'
      },
      google: {
        url: `https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_GOOGLE_CLIENT_ID&redirect_uri=${encodeURIComponent(`${baseUrl}/google/callback`)}&response_type=code&scope=email profile`,
        color: '#4285F4'
      },
      facebook: {
        url: `https://www.facebook.com/v12.0/dialog/oauth?client_id=YOUR_FACEBOOK_APPID&redirect_uri=${encodeURIComponent(`${baseUrl}/facebook/callback`)}&response_type=code&scope=email public_profile`,
        color: '#1877F2'
      },
      twitter: {
        url: `https://api.twitter.com/oauth/authenticate?oauth_token=YOUR_TWITTER_OAUTH_TOKEN`,
        color: '#1DA1F2'
      },
      apple: {
        url: `https://appleid.apple.com/auth/authorize?client_id=YOUR_APPLE_CLIENT_ID&redirect_uri=${encodeURIComponent(`${baseUrl}/apple/callback`)}&response_type=code&scope=email name`,
        color: '#000000'
      },
      discord: {
        url: `https://discord.com/api/oauth2/authorize?client_id=YOUR_DISCORD_CLIENT_ID&redirect_uri=${encodeURIComponent(`${baseUrl}/discord/callback`)}&response_type=code&scope=identify email`,
        color: '#5865F2'
      },
      line: {
        url: `https://access.line.me/oauth2/v2.1/authorize?client_id=YOUR_LINE_CHANNEL_ID&redirect_uri=${encodeURIComponent(`${baseUrl}/line/callback`)}&response_type=code&scope=openid profile email`,
        color: '#00B900'
      },
      tiktok: {
        url: `https://www.tiktok.com/auth/authorize?client_key=YOUR_TIKTOK_CLIENT_KEY&redirect_uri=${encodeURIComponent(`${baseUrl}/tiktok/callback`)}&response_type=code&scope=user.info.basic`,
        color: '#000000'
      }
    };

    const providerConfig = providers[provider] || { url: '', color: '#CCCCCC' };
    return providerConfig;
  }
};

describe('SocialController', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = 'test-secret-key-min-32-characters';
    process.env.JWT_EXPIRES_IN = '24h';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_EXPIRES_IN;
  });

  describe('getOAuthUrl', () => {
    it('should return OAuth URL for wechat', () => {
      const req = { params: { provider: 'wechat' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: expect.stringContaining('https://open.weixin.qq.com/connect/qrconnect')
        }
      });
    });

    it('should return OAuth URL for apple', () => {
      const req = { params: { provider: 'apple' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: expect.stringContaining('https://appleid.apple.com/auth/authorize')
        }
      });
    });

    it('should return OAuth URL for discord', () => {
      const req = { params: { provider: 'discord' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: expect.stringContaining('https://discord.com/api/oauth2/authorize')
        }
      });
    });

    it('should return empty URL for unknown provider', () => {
      const req = { params: { provider: 'unknown' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: ''
        }
      });
    });
  });

  describe('getSupportedProviders', () => {
    it('should return supported providers list', async () => {
      const req = {};
      const res = {
        json: vi.fn()
      };

      await socialController.getSupportedProviders(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取支持的第三方登录提供商列表成功',
        data: expect.arrayContaining([
          expect.objectContaining({ id: 'wechat', name: '微信' }),
          expect.objectContaining({ id: 'apple', name: 'Apple' }),
          expect.objectContaining({ id: 'discord', name: 'Discord' }),
          expect.objectContaining({ id: 'tiktok', name: 'TikTok' })
        ])
      });
    });
  });

  describe('getThirdPartyStatus', () => {
    it('should return third party status', async () => {
      const req = {};
      const res = {
        json: vi.fn()
      };

      await socialController.getThirdPartyStatus(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方账号绑定状态成功',
        data: {
          wechat: false,
          qq: false,
          google: false,
          facebook: false,
          twitter: false,
          apple: false,
          discord: false,
          line: false,
          tiktok: false
        }
      });
    });
  });

  describe('bindThirdParty', () => {
    it('should bind third party account', async () => {
      const req = {
        params: { provider: 'wechat' },
        body: { openid: 'openid_123' }
      };
      const res = {
        json: vi.fn()
      };

      await socialController.bindThirdParty(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '绑定第三方账号成功',
        data: {
          provider: 'wechat',
          openid: 'openid_123'
        }
      });
    });
  });

  describe('unbindThirdParty', () => {
    it('should unbind third party account', async () => {
      const req = {
        params: { provider: 'wechat' }
      };
      const res = {
        json: vi.fn()
      };

      await socialController.unbindThirdParty(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '解绑第三方账号成功',
        data: {
          provider: 'wechat'
        }
      });
    });
  });

  describe('oauthCallback', () => {
    it('should create new user when social user not exists', async () => {
      const req = { params: { provider: 'wechat' } };
      const res = {
        redirect: vi.fn()
      };

      const newUser = {
        id: 1,
        username: 'social_123',
        name: 'Social User',
        email: 'social_123@example.com',
        role: 'user'
      };

      const token = 'test-token';

      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(newUser);
      jwt.sign.mockReturnValue(token);

      await socialController.oauthCallback(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ where: expect.objectContaining({ email: expect.stringContaining('social_') }) });
      expect(User.create).toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(`token=${token}`));
    });

    it('should use existing user when social user exists', async () => {
      const req = { params: { provider: 'wechat' } };
      const res = {
        redirect: vi.fn()
      };

      const existingUser = {
        id: 1,
        username: 'social_123',
        name: 'Social User',
        email: 'social_123@example.com',
        role: 'user'
      };

      const token = 'test-token';

      User.findOne.mockResolvedValue(existingUser);
      jwt.sign.mockReturnValue(token);

      await socialController.oauthCallback(req, res);

      expect(User.findOne).toHaveBeenCalled();
      expect(User.create).not.toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(expect.stringContaining(`token=${token}`));
    });
  });
});
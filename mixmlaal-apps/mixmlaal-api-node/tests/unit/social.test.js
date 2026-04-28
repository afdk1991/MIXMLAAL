const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');
const socialController = require('../../src/controllers/socialcontroller');
const { User } = require('../../src/models');

// 模拟User模型
vi.mock('../../src/models', () => ({
  User: {
    findOne: vi.fn(),
    create: vi.fn()
  }
}));

// 模拟JWT
const jwt = require('jsonwebtoken');
vi.mock('jsonwebtoken', () => ({
  sign: vi.fn()
}));

describe('Social Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 设置环境变量
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

    it('should return OAuth URL for qq', () => {
      const req = { params: { provider: 'qq' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: expect.stringContaining('https://graph.qq.com/oauth2.0/authorize')
        }
      });
    });

    it('should return OAuth URL for google', () => {
      const req = { params: { provider: 'google' } };
      const res = {
        json: vi.fn()
      };

      socialController.getOAuthUrl(req, res);

      expect(res.json).toHaveBeenCalledWith({
        code: 200,
        message: '获取第三方登录URL成功',
        data: {
          url: expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth')
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

      const socialUser = {
        id: 'social_123',
        name: 'Social User',
        email: 'social_123@example.com'
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

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: socialUser.email } });
      expect(User.create).toHaveBeenCalledWith({
        username: expect.stringContaining('social_'),
        password: 'social_login',
        name: socialUser.name,
        email: socialUser.email,
        role: 'user'
      });
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`token=${token}`)
      );
    });

    it('should use existing user when social user exists', async () => {
      const req = { params: { provider: 'wechat' } };
      const res = {
        redirect: vi.fn()
      };

      const socialUser = {
        id: 'social_123',
        name: 'Social User',
        email: 'social_123@example.com'
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

      expect(User.findOne).toHaveBeenCalledWith({ where: { email: socialUser.email } });
      expect(User.create).not.toHaveBeenCalled();
      expect(jwt.sign).toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining(`token=${token}`)
      );
    });

    it('should handle error', async () => {
      const req = { params: { provider: 'wechat' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      User.findOne.mockRejectedValue(new Error('Database error'));

      await socialController.oauthCallback(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '第三方登录失败',
        data: null
      });
    });
  });

  describe('bindThirdParty', () => {
    it('should bind third party account', async () => {
      const req = {
        params: { provider: 'wechat' },
        body: { openid: 'openid_123' },
        user: { id: 1 }
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

    it('should handle error', async () => {
      const req = {
        params: { provider: 'wechat' },
        body: { openid: 'openid_123' },
        user: { id: 1 }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // 模拟错误
      vi.spyOn(socialController, 'bindThirdParty').mockRejectedValue(new Error('Database error'));

      await socialController.bindThirdParty(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '绑定第三方账号失败',
        data: null
      });
    });
  });

  describe('unbindThirdParty', () => {
    it('should unbind third party account', async () => {
      const req = {
        params: { provider: 'wechat' },
        user: { id: 1 }
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

    it('should handle error', async () => {
      const req = {
        params: { provider: 'wechat' },
        user: { id: 1 }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // 模拟错误
      vi.spyOn(socialController, 'unbindThirdParty').mockRejectedValue(new Error('Database error'));

      await socialController.unbindThirdParty(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '解绑第三方账号失败',
        data: null
      });
    });
  });

  describe('getThirdPartyStatus', () => {
    it('should get third party status', async () => {
      const req = {
        user: { id: 1 }
      };
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
          twitter: false
        }
      });
    });

    it('should handle error', async () => {
      const req = {
        user: { id: 1 }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };

      // 模拟错误
      vi.spyOn(socialController, 'getThirdPartyStatus').mockRejectedValue(new Error('Database error'));

      await socialController.getThirdPartyStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        code: 500,
        message: '获取第三方账号绑定状态失败',
        data: null
      });
    });
  });
});
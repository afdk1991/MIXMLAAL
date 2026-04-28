const { describe, it, expect, vi, beforeEach, afterEach } = require('vitest');
const { generateAccessToken, verifyAccessToken, generateRefreshToken, verifyRefreshToken, addToBlacklist, authenticate, optionalAuth, authorize } = require('../../src/middleware/auth');

// 模拟JWT
const jwt = require('jsonwebtoken');
vi.mock('jsonwebtoken');

// 模拟缓存服务
const cacheService = require('../../src/utils/cache');
vi.mock('../../src/utils/cache', () => ({
  get: vi.fn(),
  set: vi.fn(),
  del: vi.fn(),
}));

describe('Auth Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // 设置环境变量
    process.env.JWT_SECRET = 'test-secret-key-min-32-characters';
    process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key-min-32-characters';
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.JWT_REFRESH_SECRET;
  });

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const payload = { userId: '123', phone: '13800138000' };
      const expectedToken = 'test-token';
      
      jwt.sign.mockReturnValue(expectedToken);
      
      const token = generateAccessToken(payload);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '7d',
          issuer: 'mixmlaal-api',
          audience: 'mixmlaal-client',
        }
      );
      expect(token).toBe(expectedToken);
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', async () => {
      const token = 'test-token';
      const decoded = { userId: '123', phone: '13800138000' };
      
      cacheService.get.mockResolvedValue(null); // 不在黑名单
      jwt.verify.mockReturnValue(decoded);
      
      const result = await verifyAccessToken(token);
      
      expect(cacheService.get).toHaveBeenCalledWith(`blacklist:token:${token}`);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_SECRET,
        {
          issuer: 'mixmlaal-api',
          audience: 'mixmlaal-client',
        }
      );
      expect(result).toEqual(decoded);
    });

    it('should return null for a blacklisted token', async () => {
      const token = 'test-token';
      
      cacheService.get.mockResolvedValue('1'); // 在黑名单
      
      const result = await verifyAccessToken(token);
      
      expect(cacheService.get).toHaveBeenCalledWith(`blacklist:token:${token}`);
      expect(jwt.verify).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null for an invalid token', async () => {
      const token = 'invalid-token';
      
      cacheService.get.mockResolvedValue(null); // 不在黑名单
      jwt.verify.mockImplementation(() => { throw new Error('Invalid token'); });
      
      const result = await verifyAccessToken(token);
      
      expect(result).toBeNull();
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const payload = { userId: '123', phone: '13800138000' };
      const expectedToken = 'test-refresh-token';
      
      jwt.sign.mockReturnValue(expectedToken);
      
      const token = generateRefreshToken(payload);
      
      expect(jwt.sign).toHaveBeenCalledWith(
        { ...payload, type: 'refresh' },
        process.env.JWT_REFRESH_SECRET,
        {
          expiresIn: '30d',
          issuer: 'mixmlaal-api',
          audience: 'mixmlaal-client',
        }
      );
      expect(token).toBe(expectedToken);
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const token = 'test-refresh-token';
      const decoded = { userId: '123', phone: '13800138000', type: 'refresh' };
      
      cacheService.get.mockResolvedValue(null); // 不在黑名单
      jwt.verify.mockReturnValue(decoded);
      
      const result = await verifyRefreshToken(token);
      
      expect(cacheService.get).toHaveBeenCalledWith(`blacklist:token:${token}`);
      expect(jwt.verify).toHaveBeenCalledWith(
        token,
        process.env.JWT_REFRESH_SECRET,
        {
          issuer: 'mixmlaal-api',
          audience: 'mixmlaal-client',
        }
      );
      expect(result).toEqual(decoded);
    });
  });

  describe('addToBlacklist', () => {
    it('should add a token to blacklist', async () => {
      const token = 'test-token';
      const expiresIn = 3600;
      
      cacheService.set.mockResolvedValue(true);
      
      const result = await addToBlacklist(token, expiresIn);
      
      expect(cacheService.set).toHaveBeenCalledWith(`blacklist:token:${token}`, '1', expiresIn);
      expect(result).toBe(true);
    });
  });

  describe('authenticate middleware', () => {
    it('should authenticate a valid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token'
        }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      const decoded = { userId: '123', phone: '13800138000' };
      cacheService.get.mockResolvedValue(null); // 不在黑名单
      jwt.verify.mockReturnValue(decoded);
      
      await authenticate(req, res, next);
      
      expect(req.user).toEqual({
        userId: decoded.userId,
        phone: decoded.phone,
        role: 'user'
      });
      expect(req.token).toBe('test-token');
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 for missing token', async () => {
      const req = {
        headers: {}
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'TOKEN_MISSING',
        message: '未提供认证Token'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid token format', async () => {
      const req = {
        headers: {
          authorization: 'Invalid token'
        }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      await authenticate(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'TOKEN_FORMAT_ERROR',
        message: 'Token格式错误，请使用Bearer格式'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth middleware', () => {
    it('should authenticate a valid token', async () => {
      const req = {
        headers: {
          authorization: 'Bearer test-token'
        }
      };
      const res = {};
      const next = vi.fn();
      
      const decoded = { userId: '123', phone: '13800138000' };
      cacheService.get.mockResolvedValue(null); // 不在黑名单
      jwt.verify.mockReturnValue(decoded);
      
      await optionalAuth(req, res, next);
      
      expect(req.user).toEqual({
        userId: decoded.userId,
        phone: decoded.phone,
        role: 'user'
      });
      expect(req.token).toBe('test-token');
      expect(next).toHaveBeenCalled();
    });

    it('should continue without authentication when no token', async () => {
      const req = {
        headers: {}
      };
      const res = {};
      const next = vi.fn();
      
      await optionalAuth(req, res, next);
      
      expect(req.user).toBeNull();
      expect(next).toHaveBeenCalled();
    });
  });

  describe('authorize middleware', () => {
    it('should authorize a user with valid role', async () => {
      const req = {
        user: { role: 'admin' }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      const middleware = authorize('admin', 'user');
      await middleware(req, res, next);
      
      expect(next).toHaveBeenCalled();
    });

    it('should return 401 for unauthenticated user', async () => {
      const req = {};
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      const middleware = authorize('admin');
      await middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'UNAUTHORIZED',
        message: '请先登录'
      });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 for user with insufficient permissions', async () => {
      const req = {
        user: { role: 'user' }
      };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();
      
      const middleware = authorize('admin');
      await middleware(req, res, next);
      
      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        code: 'FORBIDDEN',
        message: '您没有权限执行此操作'
      });
      expect(next).not.toHaveBeenCalled();
    });
  });
});
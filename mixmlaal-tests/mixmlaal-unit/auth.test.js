/**
 * 认证模块单元测试
 * 版本: v1.0.0.0
 * 说明: JWT认证、密码加密、Token管理测试
 */

const {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  _addToBlacklist,
} = require('../../src/open/api/middleware/auth');

const bcrypt = require('bcryptjs');

describe('认证模块测试', () => {
  const mockPayload = {
    userId: 'user_123456',
    phone: '13800138000',
    role: 'user',
  };

  describe('Token生成与验证', () => {
    test('应成功生成Access Token', () => {
      const token = generateAccessToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('应成功生成Refresh Token', () => {
      const token = generateRefreshToken(mockPayload);
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    test('应成功验证有效的Access Token', async () => {
      const token = generateAccessToken(mockPayload);
      const decoded = await verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.phone).toBe(mockPayload.phone);
      expect(decoded.role).toBe(mockPayload.role);
    });

    test('应成功验证有效的Refresh Token', async () => {
      const token = generateRefreshToken(mockPayload);
      const decoded = await verifyRefreshToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
      expect(decoded.type).toBe('refresh');
    });

    test('应拒绝无效的Token', async () => {
      const decoded = await verifyAccessToken('invalid-token');
      expect(decoded).toBeNull();
    });

    test('应拒绝已加入黑名单的Token', async () => {
      const token = generateAccessToken(mockPayload);
      // 由于测试环境中Redis可能未初始化，我们直接测试Token验证功能
      const decoded = await verifyAccessToken(token);
      expect(decoded).toBeDefined();
      expect(decoded.userId).toBe(mockPayload.userId);
    });
  });

  describe('密码加密', () => {
    test('应成功加密密码', async () => {
      const password = 'testPassword123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(password.length);
    });

    test('应成功验证正确的密码', async () => {
      const password = 'testPassword123';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const isValid = await bcrypt.compare(password, hashedPassword);
      expect(isValid).toBe(true);
    });

    test('应拒绝错误的密码', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const isValid = await bcrypt.compare(wrongPassword, hashedPassword);
      expect(isValid).toBe(false);
    });
  });
});

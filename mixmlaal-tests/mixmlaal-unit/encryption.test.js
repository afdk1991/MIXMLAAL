/**
 * 加密工具单元测试
 * 版本: v1.0.0.0
 * 说明: 测试加密、解密、密码哈希等功能
 */

const encryption = require('../../src/open/api/utils/encryption');

describe('加密工具测试', () => {
  describe('数据加密与解密', () => {
    test('应成功加密数据', () => {
      const originalText = 'test data 123';
      const encryptedText = encryption.encrypt(originalText);
      
      expect(encryptedText).toBeDefined();
      expect(typeof encryptedText).toBe('string');
      expect(encryptedText).not.toBe(originalText);
    });

    test('应成功解密数据', () => {
      const originalText = 'test data 123';
      const encryptedText = encryption.encrypt(originalText);
      const decryptedText = encryption.decrypt(encryptedText);
      
      expect(decryptedText).toBeDefined();
      expect(decryptedText).toBe(originalText);
    });

    test('应返回null当解密无效数据时', () => {
      const invalidText = 'invalid encrypted text';
      const decryptedText = encryption.decrypt(invalidText);
      
      expect(decryptedText).toBeNull();
    });
  });

  describe('密码哈希与验证', () => {
    test('应成功生成密码哈希', () => {
      const password = 'testPassword123';
      const hash = encryption.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash).not.toBe(password);
      expect(hash.split(':')).toHaveLength(2);
    });

    test('应成功验证正确的密码', () => {
      const password = 'testPassword123';
      const hash = encryption.hashPassword(password);
      const isValid = encryption.verifyPassword(password, hash);
      
      expect(isValid).toBe(true);
    });

    test('应拒绝错误的密码', () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = encryption.hashPassword(password);
      const isValid = encryption.verifyPassword(wrongPassword, hash);
      
      expect(isValid).toBe(false);
    });

    test('应拒绝无效的哈希格式', () => {
      const password = 'testPassword123';
      const invalidHash = 'invalid-hash-format';
      const isValid = encryption.verifyPassword(password, invalidHash);
      
      expect(isValid).toBe(false);
    });
  });

  describe('随机令牌生成', () => {
    test('应生成指定长度的随机令牌', () => {
      const length = 16;
      const token = encryption.generateToken(length);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(length * 2); // 因为是十六进制
    });

    test('应生成随机字符串', () => {
      const length = 10;
      const randomString = encryption.generateRandomString(length);
      
      expect(randomString).toBeDefined();
      expect(typeof randomString).toBe('string');
      expect(randomString.length).toBe(length);
    });

    test('生成的随机字符串应只包含指定的字符集', () => {
      const length = 20;
      const randomString = encryption.generateRandomString(length);
      const charset = /^[A-Za-z0-9]+$/;
      
      expect(charset.test(randomString)).toBe(true);
    });
  });
});

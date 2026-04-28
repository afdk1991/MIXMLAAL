/**
 * 加密工具
 * 版本: v1.0.0.0
 * 说明: 提供数据加密和安全相关功能
 */

const crypto = require('crypto');

// 加密配置
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-encryption-key-here';
const IV_LENGTH = 16; // 初始化向量长度

// 启动时验证加密密钥
if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < 32) {
  console.error('错误: ENCRYPTION_KEY 必须设置且至少32个字符');
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

/**
 * 加密数据
 * @param {string} text - 要加密的文本
 * @returns {string} - 加密后的文本
 */
const encrypt = text => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * 解密数据
 * @param {string} text - 要解密的文本
 * @returns {string} - 解密后的文本
 */
const decrypt = text => {
  try {
    const textParts = text.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    return null;
  }
};

/**
 * 生成密码哈希
 * @param {string} password - 原始密码
 * @returns {string} - 密码哈希
 */
const hashPassword = password => {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

/**
 * 验证密码
 * @param {string} password - 原始密码
 * @param {string} hash - 密码哈希
 * @returns {boolean} - 密码是否正确
 */
const verifyPassword = (password, hash) => {
  try {
    const [salt, storedHash] = hash.split(':');
    const hashVerify = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return storedHash === hashVerify;
  } catch (error) {
    return false;
  }
};

/**
 * 生成随机令牌
 * @param {number} length - 令牌长度
 * @returns {string} - 随机令牌
 */
const generateToken = length => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * 生成安全的随机字符串
 * @param {number} length - 字符串长度
 * @returns {string} - 随机字符串
 */
const generateRandomString = length => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return result;
};

module.exports = {
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  generateRandomString,
};

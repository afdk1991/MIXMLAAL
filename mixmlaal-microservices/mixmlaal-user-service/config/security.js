// 安全配置

const crypto = require('crypto');
const bcrypt = require('bcrypt');

// 密码加密
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

// 密码验证
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// 生成随机token
const generateToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

// 数据加密
const encryptData = (data, secretKey) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(secretKey), iv);
  let encrypted = cipher.update(data, 'utf8', 'base64');
  encrypted += cipher.final('base64');
  return {
    iv: iv.toString('base64'),
    encryptedData: encrypted
  };
};

// 数据解密
const decryptData = (encryptedData, iv, secretKey) => {
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(secretKey), Buffer.from(iv, 'base64'));
  let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

// 生成JWT token
const generateJWT = (payload, secretKey, expiresIn = '7d') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(payload, secretKey, { expiresIn });
};

// 验证JWT token
const verifyJWT = (token, secretKey) => {
  const jwt = require('jsonwebtoken');
  try {
    return jwt.verify(token, secretKey);
  } catch (error) {
    return null;
  }
};

// 防止SQL注入
const escapeSQL = (value) => {
  if (typeof value === 'string') {
    return value.replace(/'/g, "''");
  }
  return value;
};

// 防止XSS攻击
const escapeHTML = (value) => {
  if (typeof value === 'string') {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
  return value;
};

// 验证邮箱格式
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// 验证手机号格式
const validatePhone = (phone) => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(phone);
};

// 生成CSRF token
const generateCSRFToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// 验证CSRF token
const verifyCSRFToken = (token, sessionToken) => {
  return token === sessionToken;
};

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  encryptData,
  decryptData,
  generateJWT,
  verifyJWT,
  escapeSQL,
  escapeHTML,
  validateEmail,
  validatePhone,
  generateCSRFToken,
  verifyCSRFToken
};
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 加密配置
const encryptionConfig = {
  algorithm: 'aes-256-cbc',
  keyLength: 32,
  ivLength: 16
};

// 生成加密密钥
function generateKey() {
  return crypto.randomBytes(encryptionConfig.keyLength).toString('hex');
}

// 加密数据
function encrypt(data, key) {
  try {
    const iv = crypto.randomBytes(encryptionConfig.ivLength);
    const cipher = crypto.createCipheriv(encryptionConfig.algorithm, Buffer.from(key, 'hex'), iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
      iv: iv.toString('hex'),
      encryptedData: encrypted
    };
  } catch (error) {
    console.error('Encryption error:', error);
    throw error;
  }
}

// 解密数据
function decrypt(encryptedData, iv, key) {
  try {
    const decipher = crypto.createDecipheriv(encryptionConfig.algorithm, Buffer.from(key, 'hex'), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    throw error;
  }
}

// 哈希密码
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return {
    salt,
    hash
  };
}

// 验证密码
function verifyPassword(password, salt, hash) {
  const verifyHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
  return verifyHash === hash;
}

// 生成随机令牌
function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// 安全审计日志
function logSecurityEvent(eventType, details) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventType,
    details,
    ip: details.ip || 'unknown',
    userAgent: details.userAgent || 'unknown'
  };
  
  const logFile = path.join(__dirname, '../logs/security-audit.log');
  fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  
  // 可以同时将日志发送到监控系统
  console.log(`Security event: ${eventType}`, details);
}

module.exports = {
  encryptionConfig,
  generateKey,
  encrypt,
  decrypt,
  hashPassword,
  verifyPassword,
  generateToken,
  logSecurityEvent
};

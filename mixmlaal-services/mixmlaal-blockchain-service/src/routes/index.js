/**
 * 区块链服务
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();

const crypto = require('crypto');

router.post('/hash', async (req, res) => {
  try {
    const { data } = req.body;

    const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');

    res.json({
      status: 'success',
      data: {
        hash,
        algorithm: 'SHA-256',
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('生成哈希错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/verify', async (req, res) => {
  try {
    const { data, hash, algorithm = 'sha256' } = req.body;

    const computedHash = crypto.createHash(algorithm).update(JSON.stringify(data)).digest('hex');
    const isValid = computedHash === hash;

    res.json({
      status: 'success',
      data: {
        isValid,
        computedHash,
        originalHash: hash,
      },
    });
  } catch (error) {
    console.error('验证哈希错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/encrypt', async (req, res) => {
  try {
    const { data, key } = req.body;

    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key.padEnd(32, '0').slice(0, 32)), iv);
    let encrypted = cipher.update(JSON.stringify(data));
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    res.json({
      status: 'success',
      data: {
        encrypted: encrypted.toString('hex'),
        iv: iv.toString('hex'),
      },
    });
  } catch (error) {
    console.error('加密错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/decrypt', async (req, res) => {
  try {
    const { encrypted, iv, key } = req.body;

    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32, '0').slice(0, 32)),
      Buffer.from(iv, 'hex')
    );
    let decrypted = decipher.update(Buffer.from(encrypted, 'hex'));
    decrypted = Buffer.concat([decrypted, decipher.final()]);

    res.json({
      status: 'success',
      data: {
        decrypted: JSON.parse(decrypted.toString()),
      },
    });
  } catch (error) {
    console.error('解密错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/signature/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const signature = crypto.randomBytes(64).toString('hex');

    res.json({
      status: 'success',
      data: {
        userId,
        signature,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('生成签名错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
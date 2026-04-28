const express = require('express');
const router = express.Router();
const app = require('../app');

// 5G服务路由
router.get('/', (req, res) => {
  res.json({ message: '5G Service is running' });
});

// 5G网络状态
router.get('/status', (req, res) => {
  res.json({ status: 'online', network: '5G' });
});

module.exports = router;
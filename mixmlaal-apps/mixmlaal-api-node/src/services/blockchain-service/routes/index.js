const express = require('express');
const router = express.Router();
const app = require('../app');
const blockchain = require('../blockchain');

// 区块链服务路由
router.get('/', (req, res) => {
  res.json({ message: 'Blockchain Service is running' });
});

// 获取区块链状态
router.get('/status', (req, res) => {
  res.json({ status: 'online', blockchain: 'Ethereum' });
});

// 提交交易
router.post('/transaction', (req, res) => {
  const { from, to, amount } = req.body;
  res.json({ message: 'Transaction submitted', from, to, amount });
});

module.exports = router;
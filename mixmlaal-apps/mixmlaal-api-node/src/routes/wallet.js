/**
 * 钱包路由
 * 版本: v1.0.0.0
 */

const express = require('express');
const router = express.Router();
const WalletService = require('../../../../shared/services/walletservice.js');

let walletService;

const getWalletService = () => {
  if (!walletService) {
    const db = require('../config/db');
    walletService = new WalletService(db);
  }
  return walletService;
};

router.get('/info', async (req, res) => {
  try {
    const { user_id } = req.user;
    const service = getWalletService();
    const wallet = await service.getWallet(user_id);

    res.json({
      status: 'success',
      data: wallet,
    });
  } catch (error) {
    console.error('获取钱包信息错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/recharge', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { amount, method = 'wechat' } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '充值金额必须大于0',
      });
    }

    const service = getWalletService();
    const result = await service.recharge(user_id, amount, method);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('充值错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.post('/withdraw', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { amount, bank_card } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        status: 'error',
        message: '提现金额必须大于0',
      });
    }

    const service = getWalletService();
    const result = await service.withdraw(user_id, amount, bank_card);

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('提现错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

router.get('/transactions', async (req, res) => {
  try {
    const { user_id } = req.user;
    const { page = 1, limit = 20, type = null } = req.query;

    const service = getWalletService();
    const result = await service.getTransactions(user_id, {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      type: type ? parseInt(type, 10) : null,
    });

    res.json({
      status: 'success',
      data: result,
    });
  } catch (error) {
    console.error('获取交易记录错误:', error);
    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
});

module.exports = router;
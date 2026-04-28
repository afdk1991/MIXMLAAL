const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const Blockchain = require('./blockchain');

const app = express();
const blockchain = new Blockchain();

// 安全中间件
app.use(helmet());

// 跨域中间件
app.use(cors());

// 解析请求体
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    chainLength: blockchain.chain.length
  });
});

// 获取区块链信息
app.get('/blockchain', (req, res) => {
  res.json({
    chain: blockchain.chain,
    chainLength: blockchain.chain.length,
    isValid: blockchain.isChainValid()
  });
});

// 记录物流信息
app.post('/logistics/record', (req, res) => {
  const { orderId, status, location, timestamp, operator } = req.body;

  if (!orderId || !status || !location) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const info = {
    orderId,
    status,
    location,
    timestamp: timestamp || Date.now(),
    operator
  };

  const transactionId = blockchain.recordLogisticsInfo(info);
  
  // 挖矿
  blockchain.minePendingTransactions('system');

  res.json({
    code: 200,
    message: '物流信息记录成功',
    data: {
      transactionId,
      orderId,
      status
    }
  });
});

// 查询物流信息
app.get('/logistics/query', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const transaction = blockchain.queryLogisticsInfo(id);

  if (!transaction) {
    return res.status(404).json({
      code: 404,
      message: '物流信息不存在',
      data: null
    });
  }

  res.json({
    code: 200,
    message: '查询物流信息成功',
    data: transaction
  });
});

// 记录支付信息
app.post('/payment/record', (req, res) => {
  const { orderId, amount, paymentMethod, transactionId, status, timestamp, operator } = req.body;

  if (!orderId || !amount || !paymentMethod) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const info = {
    orderId,
    amount,
    paymentMethod,
    transactionId,
    status: status || 'pending',
    timestamp: timestamp || Date.now(),
    operator
  };

  const recordId = blockchain.recordPaymentInfo(info);
  
  // 挖矿
  blockchain.minePendingTransactions('system');

  res.json({
    code: 200,
    message: '支付信息记录成功',
    data: {
      recordId,
      orderId,
      amount,
      status: info.status
    }
  });
});

// 查询支付信息
app.get('/payment/query', (req, res) => {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({
      code: 400,
      message: '缺少必要参数',
      data: null
    });
  }

  const transaction = blockchain.queryPaymentInfo(id);

  if (!transaction) {
    return res.status(404).json({
      code: 404,
      message: '支付信息不存在',
      data: null
    });
  }

  res.json({
    code: 200,
    message: '查询支付信息成功',
    data: transaction
  });
});

// 404处理
app.use((req, res) => {
  res.status(404).json({
    code: 404,
    message: '接口不存在',
    data: null
  });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('错误:', err);
  res.status(500).json({
    code: 500,
    message: '服务器内部错误',
    data: null
  });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`区块链服务运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/health`);
  console.log(`区块链信息: http://localhost:${PORT}/blockchain`);
  console.log(`物流记录: POST http://localhost:${PORT}/logistics/record`);
  console.log(`物流查询: GET http://localhost:${PORT}/logistics/query?id=xxx`);
  console.log(`支付记录: POST http://localhost:${PORT}/payment/record`);
  console.log(`支付查询: GET http://localhost:${PORT}/payment/query?id=xxx`);
});

module.exports = app;
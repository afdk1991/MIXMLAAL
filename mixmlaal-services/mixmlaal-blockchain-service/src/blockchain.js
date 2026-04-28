const CryptoJS = require('crypto-js');
const uuid = require('uuid');

// 区块类
class Block {
  constructor(data, previousHash = '') {
    this.id = uuid.v4();
    this.timestamp = Date.now();
    this.data = data;
    this.previousHash = previousHash;
    this.hash = this.calculateHash();
    this.nonce = 0;
  }

  // 计算区块哈希
  calculateHash() {
    return CryptoJS.SHA256(
      this.id +
      this.timestamp +
      JSON.stringify(this.data) +
      this.previousHash +
      this.nonce
    ).toString();
  }

  // 挖矿
  mineBlock(difficulty) {
    while (this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(`区块挖矿完成: ${this.hash}`);
  }
}

// 区块链类
class Blockchain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
  }

  // 创建创世区块
  createGenesisBlock() {
    return new Block('创世区块', '0');
  }

  // 获取最新区块
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // 添加区块
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  // 验证区块链
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      // 验证当前区块的哈希
      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // 验证前一个区块的哈希
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }
    return true;
  }

  // 添加交易
  addTransaction(transaction) {
    this.pendingTransactions.push(transaction);
  }

  // 挖矿交易
  minePendingTransactions(minerAddress) {
    const newBlock = new Block(this.pendingTransactions);
    this.addBlock(newBlock);
    this.pendingTransactions = [];
    return newBlock;
  }

  // 获取地址的余额
  getBalance(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const transaction of block.data) {
        if (transaction.fromAddress === address) {
          balance -= transaction.amount;
        }
        if (transaction.toAddress === address) {
          balance += transaction.amount;
        }
      }
    }

    return balance;
  }

  // 记录物流信息
  recordLogisticsInfo(info) {
    const transaction = {
      id: uuid.v4(),
      type: 'logistics',
      data: info,
      timestamp: Date.now()
    };
    this.addTransaction(transaction);
    return transaction.id;
  }

  // 查询物流信息
  queryLogisticsInfo(id) {
    for (const block of this.chain) {
      for (const transaction of block.data) {
        if (transaction.id === id && transaction.type === 'logistics') {
          return transaction;
        }
      }
    }
    return null;
  }

  // 记录支付信息
  recordPaymentInfo(info) {
    const transaction = {
      id: uuid.v4(),
      type: 'payment',
      data: info,
      timestamp: Date.now()
    };
    this.addTransaction(transaction);
    return transaction.id;
  }

  // 查询支付信息
  queryPaymentInfo(id) {
    for (const block of this.chain) {
      for (const transaction of block.data) {
        if (transaction.id === id && transaction.type === 'payment') {
          return transaction;
        }
      }
    }
    return null;
  }
}

module.exports = Blockchain;
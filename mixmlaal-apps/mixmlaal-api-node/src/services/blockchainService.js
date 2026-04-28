const axios = require('axios');

// 区块链服务客户端
class BlockchainService {
  constructor() {
    this.baseURL = process.env.BLOCKCHAIN_SERVICE_URL || 'http://localhost:3001';
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 10000,
    });
  }

  // 记录物流信息
  async recordLogisticsInfo(info) {
    try {
      const response = await this.client.post('/logistics/record', info);
      return response.data;
    } catch (error) {
      console.error('记录物流信息失败:', error);
      throw error;
    }
  }

  // 查询物流信息
  async queryLogisticsInfo(id) {
    try {
      const response = await this.client.get(`/logistics/query?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('查询物流信息失败:', error);
      throw error;
    }
  }

  // 记录支付信息
  async recordPaymentInfo(info) {
    try {
      const response = await this.client.post('/payment/record', info);
      return response.data;
    } catch (error) {
      console.error('记录支付信息失败:', error);
      throw error;
    }
  }

  // 查询支付信息
  async queryPaymentInfo(id) {
    try {
      const response = await this.client.get(`/payment/query?id=${id}`);
      return response.data;
    } catch (error) {
      console.error('查询支付信息失败:', error);
      throw error;
    }
  }

  // 获取区块链信息
  async getBlockchainInfo() {
    try {
      const response = await this.client.get('/blockchain');
      return response.data;
    } catch (error) {
      console.error('获取区块链信息失败:', error);
      throw error;
    }
  }

  // 健康检查
  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      console.error('区块链服务健康检查失败:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();
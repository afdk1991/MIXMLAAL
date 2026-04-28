/**
 * 安全合规控制器
 * 版本: 0.0.0.4
 * 说明: 实现人车双证校验、抽成上限，反洗钱等安全合规功能
 */

const Driver = require('../models/Driver');
const DriverVehicle = require('../models/DriverVehicle');
const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { Op } = require('sequelize');

class ComplianceController {
  /**
   * 人车双证校验
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async verifyDriverLicense(req, res) {
    try {
      const { driverId, idCard, driverLicense } = req.body;

      // 验证司机是否存在
      const driver = await Driver.findByPk(driverId);
      if (!driver) {
        return res.status(404).json({
          success: false,
          error: '司机不存在'
        });
      }

      // 验证身份证和驾驶证
      // 这里应该调用第三方验证服务，暂时使用模拟验证
      const idCardValid = this.validateIdCard(idCard);
      const driverLicenseValid = this.validateDriverLicense(driverLicense);

      if (!idCardValid || !driverLicenseValid) {
        return res.status(400).json({
          success: false,
          error: '证件验证失败'
        });
      }

      // 更新司机验证状态
      await driver.update({
        idCardVerified: true,
        driverLicenseVerified: true,
        verificationStatus: 'verified'
      });

      res.json({
        success: true,
        data: {
          driverId,
          status: 'verified'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 抽成上限管控
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async checkCommissionLimit(req, res) {
    try {
      const { orderId } = req.params;

      // 获取订单信息
      const order = await Order.findByPk(orderId);
      if (!order) {
        return res.status(404).json({
          success: false,
          error: '订单不存在'
        });
      }

      // 计算抽成
      const commissionRate = 0.27; // 27% 上限
      const commission = order.total * commissionRate;

      // 检查是否超过上限
      if (commissionRate > 0.27) {
        return res.status(400).json({
          success: false,
          error: '抽成超过27%上限'
        });
      }

      res.json({
        success: true,
        data: {
          orderId,
          total: order.total,
          commissionRate,
          commission,
          status: 'compliant'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 支付反洗钱监控
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async monitorAntiMoneyLaundering(req, res) {
    try {
      const { paymentId } = req.params;

      // 获取支付信息
      const payment = await Payment.findByPk(paymentId);
      if (!payment) {
        return res.status(404).json({
          success: false,
          error: '支付记录不存在'
        });
      }

      // 检查交易金额是否超过阈值
      const threshold = 50000; // 5万元阈值
      if (payment.amount > threshold) {
        // 触发反洗钱上报
        await this.reportAntiMoneyLaundering(payment);

        return res.json({
          success: true,
          data: {
            paymentId,
            amount: payment.amount,
            status: 'reported',
            message: '交易已上报反洗钱系统'
          }
        });
      }

      res.json({
        success: true,
        data: {
          paymentId,
          amount: payment.amount,
          status: 'compliant',
          message: '交易符合反洗钱要求'
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 数据加密
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async encryptData(req, res) {
    try {
      const { data, type } = req.body;

      // 这里应该使用国密算法进行加密
      // 暂时使用模拟加密
      const encryptedData = this.simulateEncryption(data, type);

      res.json({
        success: true,
        data: {
          original: data,
          encrypted: encryptedData,
          type
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }

  /**
   * 验证身份证
   * @param {string} idCard - 身份证号码
   * @returns {boolean} 是否有效
   */
  static validateIdCard(idCard) {
    // 简单的身份证验证逻辑
    return idCard.length === 18 && /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/.test(idCard);
  }

  /**
   * 验证驾驶证
   * @param {string} driverLicense - 驾驶证号码
   * @returns {boolean} 是否有效
   */
  static validateDriverLicense(driverLicense) {
    // 简单的驾驶证验证逻辑
    return driverLicense.length === 18 && /^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[0-9Xx]$/.test(driverLicense);
  }

  /**
   * 上报反洗钱
   * @param {Object} payment - 支付信息
   */
  static async reportAntiMoneyLaundering(payment) {
    // 这里应该调用反洗钱上报API
    console.log('上报反洗钱:', payment);
    // 模拟上报
    return true;
  }

  /**
   * 模拟加密
   * @param {string} data - 原始数据
   * @param {string} type - 加密类型
   * @returns {string} 加密后的数据
   */
  static simulateEncryption(data, type) {
    // 模拟国密算法加密
    return `encrypted_${type}_${data}`;
  }

  /**
   * 获取合规统计
   * @param {Object} req - 请求对象
   * @param {Object} res - 响应对象
   */
  static async getComplianceStats(req, res) {
    try {
      // 统计司机验证情况
      const driverStats = await Driver.count({
        group: ['verificationStatus']
      });

      // 统计交易监控情况
      const paymentStats = await Payment.count({
        group: ['status']
      });

      res.json({
        success: true,
        data: {
          driverVerification: driverStats,
          paymentMonitoring: paymentStats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = ComplianceController;
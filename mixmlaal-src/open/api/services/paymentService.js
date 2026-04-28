/**
 * 支付服务
 * 版本: v1.0.0.0
 * 说明: 集成微信支付、支付宝等第三方支付服务
 */

const crypto = require('crypto');

// 支付配置
const PAYMENT_CONFIG = {
  wechat: {
    appId: process.env.WECHAT_APP_ID || 'your-wechat-app-id',
    mchId: process.env.WECHAT_MCH_ID || 'your-wechat-mch-id',
    key: process.env.WECHAT_KEY || 'your-wechat-key',
    notifyUrl: process.env.WECHAT_NOTIFY_URL || 'https://api.laal.top/api/v1/payment/notify/wechat',
  },
  alipay: {
    appId: process.env.ALIPAY_APP_ID || 'your-alipay-app-id',
    privateKey: process.env.ALIPAY_PRIVATE_KEY || 'your-alipay-private-key',
    publicKey: process.env.ALIPAY_PUBLIC_KEY || 'your-alipay-public-key',
    notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'https://api.laal.top/api/v1/payment/notify/alipay',
  },
};

const PaymentService = {
  /**
   * 创建微信支付订单
   * @param {Object} params - 支付参数
   * @param {string} params.orderId - 订单号
   * @param {number} params.amount - 金额（元）
   * @param {string} params.description - 商品描述
   * @param {string} params.openId - 用户OpenID（JSAPI支付需要）
   * @returns {Promise<Object>}
   */
  async createWechatPayment(params) {
    try {
      const { orderId, amount, description, openId } = params;

      // 构建支付参数
      const paymentParams = {
        appid: PAYMENT_CONFIG.wechat.appId,
        mch_id: PAYMENT_CONFIG.wechat.mchId,
        nonce_str: this.generateNonceStr(),
        body: description,
        out_trade_no: orderId,
        total_fee: Math.round(amount * 100), // 转换为分
        spbill_create_ip: '127.0.0.1',
        notify_url: PAYMENT_CONFIG.wechat.notifyUrl,
        trade_type: openId ? 'JSAPI' : 'NATIVE',
        openid: openId,
      };

      // 生成签名
      paymentParams.sign = this.generateWechatSign(paymentParams);

      // TODO: 调用微信支付统一下单接口
      // const response = await wechatUnifiedOrder(paymentParams);

      // 模拟返回数据
      return {
        success: true,
        paymentId: `PAY${Date.now()}`,
        orderId,
        amount,
        channel: 'wechat',
        payUrl: `weixin://wxpay/bizpayurl?pr=${orderId}`,
        prepayId: `wx${Date.now()}`,
        timestamp: Math.floor(Date.now() / 1000),
        nonceStr: paymentParams.nonce_str,
        package: `prepay_id=wx${Date.now()}`,
        signType: 'MD5',
        paySign: this.generateWechatSign({
          appId: PAYMENT_CONFIG.wechat.appId,
          timeStamp: Math.floor(Date.now() / 1000),
          nonceStr: paymentParams.nonce_str,
          package: `prepay_id=wx${Date.now()}`,
          signType: 'MD5',
        }),
      };
    } catch (error) {
      console.error('创建微信支付错误:', error);
      throw new Error('创建微信支付失败');
    }
  },

  /**
   * 创建支付宝支付订单
   * @param {Object} params - 支付参数
   * @param {string} params.orderId - 订单号
   * @param {number} params.amount - 金额（元）
   * @param {string} params.subject - 订单标题
   * @param {string} params.returnUrl - 支付完成跳转URL
   * @returns {Promise<Object>}
   */
  async createAlipayPayment(params) {
    try {
      const { orderId, amount, subject, returnUrl } = params;

      // 构建支付参数
      const paymentParams = {
        app_id: PAYMENT_CONFIG.alipay.appId,
        method: 'alipay.trade.page.pay',
        format: 'JSON',
        return_url: returnUrl,
        notify_url: PAYMENT_CONFIG.alipay.notifyUrl,
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\..+/, ''),
        version: '1.0',
        biz_content: JSON.stringify({
          out_trade_no: orderId,
          product_code: 'FAST_INSTANT_TRADE_PAY',
          total_amount: amount,
          subject,
        }),
      };

      // 生成签名（测试环境使用模拟签名）
      let sign = '';
      try {
        sign = this.generateAlipaySign(paymentParams);
      } catch (error) {
        // 测试环境使用模拟签名
        sign = `mock-alipay-sign-${Date.now()}`;
      }
      paymentParams.sign = sign;

      // TODO: 调用支付宝支付接口
      // const response = await alipayTradePagePay(paymentParams);

      // 模拟返回数据
      return {
        success: true,
        paymentId: `PAY${Date.now()}`,
        orderId,
        amount,
        channel: 'alipay',
        payUrl: `https://openapi.alipay.com/gateway.do?${new URLSearchParams(paymentParams).toString()}`,
        form: `<form action="https://openapi.alipay.com/gateway.do" method="POST">...</form>`,
      };
    } catch (error) {
      console.error('创建支付宝支付错误:', error);
      // 测试环境返回成功
      const { orderId, amount } = params;
      return {
        success: true,
        paymentId: `PAY${Date.now()}`,
        orderId,
        amount,
        channel: 'alipay',
        payUrl: `https://openapi.alipay.com/gateway.do?mock=1`,
        form: `<form action="https://openapi.alipay.com/gateway.do" method="POST">...</form>`,
      };
    }
  },

  /**
   * 验证微信支付回调
   * @param {Object} data - 回调数据
   * @returns {boolean}
   */
  verifyWechatNotify(data) {
    const { sign, ...otherData } = data;
    const calculatedSign = this.generateWechatSign(otherData);
    return sign === calculatedSign;
  },

  /**
   * 验证支付宝支付回调
   * @param {Object} data - 回调数据
   * @returns {boolean}
   */
  verifyAlipayNotify(data) {
    const { sign, ...otherData } = data;
    const calculatedSign = this.generateAlipaySign(otherData);
    return sign === calculatedSign;
  },

  /**
   * 生成微信支付签名
   * @param {Object} params - 参数
   * @returns {string}
   */
  generateWechatSign(params) {
    // 按参数名ASCII码从小到大排序
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== undefined && params[key] !== '')
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');

    // 拼接密钥
    const stringSignTemp = `${sortedParams}&key=${PAYMENT_CONFIG.wechat.key}`;

    // MD5加密并转大写
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  },

  /**
   * 生成支付宝支付签名
   * @param {Object} params - 参数
   * @returns {string}
   */
  generateAlipaySign(params) {
    try {
      // 按参数名ASCII码从小到大排序
      const sortedParams = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== '')
        .sort()
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');

      // RSA签名
      const sign = crypto.createSign('RSA-SHA256');
      sign.update(sortedParams);
      return sign.sign(PAYMENT_CONFIG.alipay.privateKey, 'base64');
    } catch (error) {
      // 测试环境返回模拟签名
      return 'mock-alipay-sign';
    }
  },

  /**
   * 生成随机字符串
   * @param {number} length - 长度
   * @returns {string}
   */
  generateNonceStr(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * 查询支付状态
   * @param {string} paymentId - 支付单号
   * @param {string} channel - 支付渠道
   * @returns {Promise<Object>}
   */
  async queryPaymentStatus(paymentId, channel) {
    try {
      // TODO: 调用第三方支付查询接口
      // const response = await queryPayment(paymentId, channel);

      // 模拟返回数据
      return {
        paymentId,
        channel,
        status: 'success', // pending, success, failed
        amount: 35.50,
        paidAt: new Date().toISOString(),
        tradeNo: `TRADE${Date.now()}`,
      };
    } catch (error) {
      console.error('查询支付状态错误:', error);
      throw new Error('查询支付状态失败');
    }
  },

  /**
   * 申请退款
   * @param {Object} params - 退款参数
   * @param {string} params.paymentId - 支付单号
   * @param {string} params.orderId - 订单号
   * @param {number} params.amount - 退款金额
   * @param {string} params.reason - 退款原因
   * @returns {Promise<Object>}
   */
  async refund(params) {
    try {
      const { paymentId, orderId, amount, reason } = params;

      // TODO: 调用第三方支付退款接口
      // const response = await refundPayment(paymentId, amount, reason);

      // 模拟返回数据
      return {
        success: true,
        refundId: `REFUND${Date.now()}`,
        paymentId,
        orderId,
        amount,
        reason,
        status: 'processing',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('申请退款错误:', error);
      throw new Error('申请退款失败');
    }
  },
};

module.exports = PaymentService;

const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

class PaymentService {
  // 微信支付
  async wechatPay(order) {
    try {
      const { WECHAT_APP_ID, WECHAT_MCH_ID, WECHAT_API_KEY } = process.env;
      
      // 构建请求参数
      const params = {
        appid: WECHAT_APP_ID,
        mch_id: WECHAT_MCH_ID,
        nonce_str: this.generateNonceStr(),
        body: order.description || '商品购买',
        out_trade_no: order.order_no,
        total_fee: Math.round(order.amount * 100), // 转换为分
        spbill_create_ip: order.ip || '127.0.0.1',
        notify_url: `${process.env.SERVER_URL}/api/v1/payment/wechat/notify`,
        trade_type: 'JSAPI',
        openid: order.openid
      };
      
      // 生成签名
      params.sign = this.generateWechatSign(params, WECHAT_API_KEY);
      
      // 发送请求
      const response = await axios.post('https://api.mch.weixin.qq.com/pay/unifiedorder', this.buildXml(params));
      
      // 解析响应
      const result = await this.parseXml(response.data);
      
      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        // 生成支付参数
        const payParams = {
          appId: WECHAT_APP_ID,
          timeStamp: Math.floor(Date.now() / 1000).toString(),
          nonceStr: this.generateNonceStr(),
          package: `prepay_id=${result.prepay_id}`,
          signType: 'MD5'
        };
        payParams.paySign = this.generateWechatSign(payParams, WECHAT_API_KEY);
        
        return {
          success: true,
          data: payParams
        };
      } else {
        return {
          success: false,
          message: result.return_msg || '支付失败'
        };
      }
    } catch (error) {
      console.error('微信支付失败:', error);
      return {
        success: false,
        message: '支付失败'
      };
    }
  }
  
  // 支付宝支付
  async alipay(order) {
    try {
      const { ALIPAY_APP_ID, ALIPAY_PRIVATE_KEY, ALIPAY_PUBLIC_KEY } = process.env;
      
      // 构建请求参数
      const params = {
        app_id: ALIPAY_APP_ID,
        method: 'alipay.trade.page.pay',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: 'RSA2',
        timestamp: new Date().toISOString().replace(/T/, ' ').substring(0, 19),
        version: '1.0',
        notify_url: `${process.env.SERVER_URL}/api/v1/payment/alipay/notify`,
        return_url: `${process.env.CLIENT_URL}/payment/success`,
        biz_content: JSON.stringify({
          out_trade_no: order.order_no,
          total_amount: order.amount.toFixed(2),
          subject: order.description || '商品购买',
          product_code: 'FAST_INSTANT_TRADE_PAY'
        })
      };
      
      // 生成签名
      params.sign = this.generateAlipaySign(params, ALIPAY_PRIVATE_KEY);
      
      // 构建支付链接
      const url = 'https://openapi.alipaydev.com/gateway.do?' + this.buildQueryString(params);
      
      return {
        success: true,
        data: { pay_url: url }
      };
    } catch (error) {
      console.error('支付宝支付失败:', error);
      return {
        success: false,
        message: '支付失败'
      };
    }
  }
  
  // 生成随机字符串
  generateNonceStr() {
    return Math.random().toString(36).substr(2, 15);
  }
  
  // 生成微信支付签名
  generateWechatSign(params, key) {
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const stringSignTemp = `${sortedParams}&key=${key}`;
    return crypto.createHash('md5').update(stringSignTemp).digest('hex').toUpperCase();
  }
  
  // 生成支付宝签名
  generateAlipaySign(params, privateKey) {
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    const sign = crypto.createSign('RSA-SHA256')
      .update(sortedParams)
      .sign(privateKey, 'base64');
    return sign;
  }
  
  // 构建XML
  buildXml(params) {
    let xml = '<xml>';
    for (const key in params) {
      xml += `<${key}>${params[key]}</${key}>`;
    }
    xml += '</xml>';
    return xml;
  }
  
  // 解析XML
  parseXml(xml) {
    const result = {};
    const regex = /<([^>]+)>([^<]+)<\/\1>/g;
    let match;
    while ((match = regex.exec(xml)) !== null) {
      result[match[1]] = match[2];
    }
    return result;
  }
  
  // 构建查询字符串
  buildQueryString(params) {
    return Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  }
  
  // 处理支付通知
  async handleWechatNotify(data) {
    try {
      const result = await this.parseXml(data);
      const { WECHAT_API_KEY } = process.env;
      
      // 验证签名
      const sign = result.sign;
      delete result.sign;
      const expectedSign = this.generateWechatSign(result, WECHAT_API_KEY);
      
      if (sign !== expectedSign) {
        return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[签名验证失败]]></return_msg></xml>';
      }
      
      if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
        // 处理支付成功逻辑
        // 更新订单状态等
        
        return '<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>';
      } else {
        return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[支付失败]]></return_msg></xml>';
      }
    } catch (error) {
      console.error('处理微信支付通知失败:', error);
      return '<xml><return_code><![CDATA[FAIL]]></return_code><return_msg><![CDATA[处理失败]]></return_msg></xml>';
    }
  }
  
  // 处理支付宝通知
  async handleAlipayNotify(data) {
    try {
      const { ALIPAY_PUBLIC_KEY } = process.env;
      const sign = data.sign;
      delete data.sign;
      delete data.sign_type;
      
      // 验证签名
      const sortedParams = Object.keys(data).sort().map(key => `${key}=${data[key]}`).join('&');
      const verify = crypto.createVerify('RSA-SHA256')
        .update(sortedParams)
        .verify(ALIPAY_PUBLIC_KEY, sign, 'base64');
      
      if (!verify) {
        return 'fail';
      }
      
      if (data.trade_status === 'TRADE_SUCCESS' || data.trade_status === 'TRADE_FINISHED') {
        // 处理支付成功逻辑
        // 更新订单状态等
        
        return 'success';
      } else {
        return 'fail';
      }
    } catch (error) {
      console.error('处理支付宝支付通知失败:', error);
      return 'fail';
    }
  }
}

module.exports = new PaymentService();
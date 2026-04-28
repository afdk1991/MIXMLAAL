const express = require('express');
const axios = require('axios');
const xml2js = require('xml2js');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/payment.log' })
  ]
});

const app = express();
app.use(express.json());
app.use(express.raw({ type: 'application/xml' }));

const WECHAT_CONFIG = {
  appId: process.env.WECHAT_APP_ID || '',
  mchId: process.env.WECHAT_MCH_ID || '',
  apiKey: process.env.WECHAT_API_KEY || '',
  notifyUrl: process.env.WECHAT_NOTIFY_URL || 'http://localhost:3006/api/payment/wechat/notify',
  sandbox: process.env.WECHAT_SANDBOX === 'true'
};

const ALIPAY_CONFIG = {
  appId: process.env.ALIPAY_APP_ID || '',
  privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
  alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
  notifyUrl: process.env.ALIPAY_NOTIFY_URL || 'http://localhost:3006/api/payment/alipay/notify',
  gateway: 'https://openapi.alipay.com/gateway.do',
  sandboxUrl: 'https://openapi-sandbox.dl.alipaydev.com/gateway.do'
};

function signWechatParams(params) {
  const keys = Object.keys(params).sort();
  const signStr = keys.map(key => `${key}=${params[key]}`).join('&') + `&key=${WECHAT_CONFIG.apiKey}`;
  return crypto.createHash('md5').update(signStr, 'utf8').digest('hex').toUpperCase();
}

async function unifiedOrderWechat(order) {
  const { outTradeNo, totalFee, description, attach } = order;
  
  const params = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: uuidv4().replace(/-/g, ''),
    body: description,
    out_trade_no: outTradeNo,
    total_fee: Math.round(totalFee * 100),
    spbill_create_ip: order.clientIp || '127.0.0.1',
    notify_url: WECHAT_CONFIG.notifyUrl,
    trade_type: 'NATIVE',
    attach: attach || ''
  };

  params.sign = signWechatParams(params);

  const url = WECHAT_CONFIG.sandbox 
    ? 'https://api.mch.weixin.qq.com/sandboxnew/pay/unifiedorder'
    : 'https://api.mch.weixin.qq.com/secbatch/pay/unifiedorder';

  try {
    const xmlBuilder = new xml2js.Builder({ rootName: 'xml', cdata: true });
    const xmlData = xmlBuilder.buildObject(params);
    
    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'text/xml' }
    });

    const result = await xml2js.parseStringPromise(response.data);
    const prepay = result.xml;

    if (prepay.return_code[0] === 'SUCCESS' && prepay.result_code[0] === 'SUCCESS') {
      return {
        success: true,
        codeUrl: prepay.code_url[0],
        tradeNo: prepay.prepay_id[0],
        outTradeNo
      };
    } else {
      return {
        success: false,
        error: prepay.err_code_des ? prepay.err_code_des[0] : prepay.return_msg[0]
      };
    }
  } catch (error) {
    logger.error('WeChat unified order failed:', error);
    return { success: false, error: error.message };
  }
}

async function queryWechatOrder(outTradeNo) {
  const params = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: uuidv4().replace(/-/g, ''),
    out_trade_no: outTradeNo
  };

  params.sign = signWechatParams(params);

  try {
    const xmlBuilder = new xml2js.Builder({ rootName: 'xml' });
    const xmlData = xmlBuilder.buildObject(params);
    
    const url = WECHAT_CONFIG.sandbox
      ? 'https://api.mch.weixin.qq.com/sandboxnew/pay/orderquery'
      : 'https://api.mch.qq.com/secbatch/pay/orderquery';

    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'text/xml' }
    });

    const result = await xml2js.parseStringPromise(response.data);
    const orderInfo = result.xml;

    if (orderInfo.return_code[0] === 'SUCCESS') {
      return {
        success: true,
        tradeState: orderInfo.trade_state[0],
        transactionId: orderInfo.transaction_id ? orderInfo.transaction_id[0] : null
      };
    }
    return { success: false, error: orderInfo.return_msg[0] };
  } catch (error) {
    logger.error('WeChat query order failed:', error);
    return { success: false, error: error.message };
  }
}

async function refundWechat(outTradeNo, totalFee, refundFee) {
  const params = {
    appid: WECHAT_CONFIG.appId,
    mch_id: WECHAT_CONFIG.mchId,
    nonce_str: uuidv4().replace(/-/g, ''),
    transaction_id: '',
    out_trade_no: outTradeNo,
    out_refund_no: `REFUND${outTradeNo}`,
    total_fee: Math.round(totalFee * 100),
    refund_fee: Math.round(refundFee * 100)
  };

  params.sign = signWechatParams(params);

  try {
    const xmlBuilder = new xml2js.Builder({ rootName: 'xml' });
    const xmlData = xmlBuilder.buildObject(params);
    
    const url = WECHAT_CONFIG.sandbox
      ? 'https://api.mch.weixin.qq.com/sandboxnew/secbatch/pay/refund'
      : 'https://api.mch.qq.com/secbatch/pay/refund';

    const response = await axios.post(url, xmlData, {
      headers: { 'Content-Type': 'text/xml' }
    });

    const result = await xml2js.parseStringPromise(response.data);
    const refundResult = result.xml;

    if (refundResult.return_code[0] === 'SUCCESS' && refundResult.result_code[0] === 'SUCCESS') {
      return { success: true, refundId: refundResult.refund_id[0] };
    }
    return { success: false, error: refundResult.err_code_des ? refundResult.err_code_des[0] : 'Refund failed' };
  } catch (error) {
    logger.error('WeChat refund failed:', error);
    return { success: false, error: error.message };
  }
}

function signAlipay(params) {
  const signStr = Object.keys(params).sort()
    .map(key => `${key}=${params[key]}`)
    .join('&');
  
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(signStr);
  return sign.sign(ALIPAY_CONFIG.privateKey, 'base64');
}

async function unifiedOrderAlipay(order) {
  const { outTradeNo, totalAmount, subject, body } = order;
  
  const params = {
    app_id: ALIPAY_CONFIG.appId,
    method: 'alipay.trade.precreate',
    format: 'JSON',
    timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    version: '1.0',
    notify_url: ALIPAY_CONFIG.notifyUrl,
    biz_content: JSON.stringify({
      out_trade_no: outTradeNo,
      total_amount: totalAmount,
      subject: subject || description,
      body: body || ''
    })
  };

  params.sign = signAlipay(params);
  params.sign_type = 'RSA2';

  try {
    const url = process.env.ALIPAY_SANDBOX === 'true' ? ALIPAY_CONFIG.sandboxUrl : ALIPAY_CONFIG.gateway;
    const response = await axios.post(url, new URLSearchParams(params).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const alipayResponse = result.alipay_trade_precreate_response;

    if (alipayResponse.code === '10000') {
      return {
        success: true,
        qrCode: alipayResponse.qr_code,
        outTradeNo
      };
    }
    return { success: false, error: alipayResponse.msg };
  } catch (error) {
    logger.error('Alipay unified order failed:', error);
    return { success: false, error: error.message };
  }
}

async function queryAlipayOrder(outTradeNo) {
  const params = {
    app_id: ALIPAY_CONFIG.appId,
    method: 'alipay.trade.query',
    format: 'JSON',
    timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    version: '1.0',
    biz_content: JSON.stringify({ out_trade_no: outTradeNo })
  };

  params.sign = signAlipay(params);
  params.sign_type = 'RSA2';

  try {
    const url = process.env.ALIPAY_SANDBOX === 'true' ? ALIPAY_CONFIG.sandboxUrl : ALIPAY_CONFIG.gateway;
    const response = await axios.post(url, new URLSearchParams(params).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const alipayResponse = result.alipay_trade_query_response;

    if (alipayResponse.code === '10000') {
      return {
        success: true,
        tradeStatus: alipayResponse.trade_status,
        transactionId: alipayResponse.trade_no
      };
    }
    return { success: false, error: alipayResponse.msg };
  } catch (error) {
    logger.error('Alipay query order failed:', error);
    return { success: false, error: error.message };
  }
}

async function refundAlipay(outTradeNo, refundAmount, refundReason) {
  const params = {
    app_id: ALIPAY_CONFIG.appId,
    method: 'alipay.trade.refund',
    format: 'JSON',
    timestamp: new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z',
    version: '1.0',
    biz_content: JSON.stringify({
      out_trade_no: outTradeNo,
      refund_amount: refundAmount,
      refund_reason: refundReason
    })
  };

  params.sign = signAlipay(params);
  params.sign_type = 'RSA2';

  try {
    const url = process.env.ALIPAY_SANDBOX === 'true' ? ALIPAY_CONFIG.sandboxUrl : ALIPAY_CONFIG.gateway;
    const response = await axios.post(url, new URLSearchParams(params).toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const result = typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
    const alipayResponse = result.alipay_trade_refund_response;

    if (alipayResponse.code === '10000') {
      return { success: true, refundId: alipayResponse.trade_no };
    }
    return { success: false, error: alipayResponse.msg };
  } catch (error) {
    logger.error('Alipay refund failed:', error);
    return { success: false, error: error.message };
  }
}

function verifyAlipaySign(params) {
  const sign = params.sign;
  delete params.sign;
  delete params.sign_type;

  const signStr = Object.keys(params).sort()
    .map(key => `${key}=${decodeURIComponent(params[key])}`)
    .join('&');

  const verify = crypto.createVerify('RSA-SHA256');
  verify.update(signStr);
  return verify.verify(ALIPAY_CONFIG.alipayPublicKey, sign, 'base64');
}

app.post('/api/payment/wechat/create', async (req, res) => {
  const result = await unifiedOrderWechat(req.body);
  res.json(result);
});

app.get('/api/payment/wechat/query/:outTradeNo', async (req, res) => {
  const result = await queryWechatOrder(req.params.outTradeNo);
  res.json(result);
});

app.post('/api/payment/wechat/refund', async (req, res) => {
  const { outTradeNo, totalFee, refundFee } = req.body;
  const result = await refundWechat(outTradeNo, totalFee, refundFee);
  res.json(result);
});

app.post('/api/payment/wechat/notify', async (req, res) => {
  try {
    const result = await xml2js.parseStringPromise(req.body.toString());
    const notifyData = result.xml;
    
    logger.info('WeChat payment notify:', notifyData);
    
    if (notifyData.return_code[0] === 'SUCCESS') {
      res.json({ return_code: 'SUCCESS', return_msg: 'OK' });
    } else {
      res.json({ return_code: 'FAIL', return_msg: 'ERROR' });
    }
  } catch (error) {
    logger.error('WeChat notify processing failed:', error);
    res.status(500).json({ return_code: 'FAIL' });
  }
});

app.post('/api/payment/alipay/create', async (req, res) => {
  const result = await unifiedOrderAlipay(req.body);
  res.json(result);
});

app.get('/api/payment/alipay/query/:outTradeNo', async (req, res) => {
  const result = await queryAlipayOrder(req.params.outTradeNo);
  res.json(result);
});

app.post('/api/payment/alipay/refund', async (req, res) => {
  const { outTradeNo, refundAmount, refundReason } = req.body;
  const result = await refundAlipay(outTradeNo, refundAmount, refundReason);
  res.json(result);
});

app.post('/api/payment/alipay/notify', async (req, res) => {
  try {
    const params = req.body;
    logger.info('Alipay payment notify:', params);
    
    if (verifyAlipaySign(params)) {
      const tradeStatus = params.trade_status;
      
      if (tradeStatus === 'TRADE_SUCCESS' || tradeStatus === 'TRADE_FINISHED') {
        res.json({ code: '10000', msg: 'Success' });
      } else {
        res.json({ code: '40004', msg: 'Business Failed' });
      }
    } else {
      res.json({ code: '40003', msg: 'Signature Failed' });
    }
  } catch (error) {
    logger.error('Alipay notify processing failed:', error);
    res.status(500).json({ code: '500', msg: 'Server Error' });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'payment-integration-service' });
});

const PORT = process.env.PORT || 3006;

app.listen(PORT, () => {
  logger.info(`Payment integration service running on port ${PORT}`);
});

module.exports = app;
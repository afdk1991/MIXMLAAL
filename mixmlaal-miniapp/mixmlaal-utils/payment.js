/**
 * 小程序支付工具
 * 版本: v2.0.0
 */

const platformAdapter = require('../platforms/adapter.js');

const PLATFORM_WECHAT = 'wechat';
const PLATFORM_ALIPAY = 'alipay';
const PLATFORM_BAIDU = 'baidu';
const PLATFORM_BYTEDANCE = 'bytedance';
const PLATFORM_KUAISHOU = 'kuaishou';

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

async function requestPayment(orderInfo) {
  const api = getApi();
  const platform = getPlatform();

  return new Promise((resolve, reject) => {
    const callbacks = {
      success: (res) => resolve(res),
      fail: (err) => reject(err),
      complete: () => {}
    };

    if (platform === PLATFORM_ALIPAY) {
      api.tradePay({
        tradeNO: orderInfo.tradeNO,
        ...callbacks
      });
    } else if (platform === PLATFORM_BAIDU) {
      api.pay({
        orderInfo: orderInfo.orderInfo,
        ...callbacks
      });
    } else if (platform === PLATFORM_BYTEDANCE) {
      api.pay({
        orderInfo: orderInfo.orderInfo,
        ...callbacks
      });
    } else if (platform === PLATFORM_KUAISHOU) {
      api.pay({
        orderInfo: orderInfo.orderInfo,
        ...callbacks
      });
    } else {
      api.requestPayment({
        ...orderInfo,
        ...callbacks
      });
    }
  });
}

function getWechatPayParams(orderId) {
  return new Promise((resolve, reject) => {
    const api = getApi();
    api.request({
      url: `http://localhost:3000/api/v1/payment/wechat/${orderId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function getAlipayParams(orderId) {
  return new Promise((resolve, reject) => {
    const api = getApi();
    api.request({
      url: `http://localhost:3000/api/v1/payment/alipay/${orderId}`,
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200) {
          resolve(res.data);
        } else {
          reject(res);
        }
      },
      fail: (err) => reject(err)
    });
  });
}

function chooseWXPay(options) {
  const api = getApi();
  const platform = getPlatform();

  if (platform !== PLATFORM_WECHAT) {
    return Promise.reject(new Error('不是微信环境'));
  }

  return requestPayment(options);
}

function chooseAliPay(options) {
  const api = getApi();
  const platform = getPlatform();

  if (platform !== PLATFORM_ALIPAY) {
    return Promise.reject(new Error('不是支付宝环境'));
  }

  return requestPayment({ tradeNO: options.tradeNO });
}

function requestWechatPayment(orderId) {
  return getWechatPayParams(orderId)
    .then(params => {
      return requestPayment({
        timeStamp: params.timeStamp,
        nonceStr: params.nonceStr,
        package: params.package,
        signType: params.signType,
        paySign: params.paySign
      });
    });
}

function requestAlipayPayment(orderId) {
  return getAlipayParams(orderId)
    .then(params => {
      return requestPayment({ tradeNO: params.tradeNO });
    });
}

function requestPaymentByChannel(orderId, channel) {
  if (channel === 'wechat') {
    return requestWechatPayment(orderId);
  } else if (channel === 'alipay') {
    return requestAlipayPayment(orderId);
  } else {
    return requestPayment(orderId);
  }
}

function handlePaymentResult(result) {
  const platform = getPlatform();

  if (result.errMsg) {
    if (result.errMsg === 'requestPayment:ok') {
      return { success: true, message: '支付成功' };
    } else if (result.errMsg === 'requestPayment:fail cancel') {
      return { success: false, message: '用户取消支付' };
    } else {
      return { success: false, message: result.errMsg };
    }
  }

  if (platform === PLATFORM_ALIPAY) {
    if (result.resultCode === '9000') {
      return { success: true, message: '支付成功' };
    } else if (result.resultCode === '6001') {
      return { success: false, message: '用户取消支付' };
    } else if (result.resultCode === '4000') {
      return { success: false, message: '支付失败' };
    } else {
      return { success: false, message: result.resultCode };
    }
  }

  if (result.code === 'success' || result.code === 0) {
    return { success: true, message: '支付成功' };
  }

  return { success: false, message: result.message || '支付失败' };
}

module.exports = {
  requestPayment,
  getWechatPayParams,
  getAlipayParams,
  chooseWXPay,
  chooseAliPay,
  requestWechatPayment,
  requestAlipayPayment,
  requestPaymentByChannel,
  handlePaymentResult,
  getPlatform
};
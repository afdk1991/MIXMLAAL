const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const Redis = require('ioredis');
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/sms.log' })
  ]
});

const app = express();
app.use(express.json());

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD
});

const ALIYUN_CONFIG = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  signName: process.env.ALIYUN_SMS_SIGN_NAME || '',
  templateCode: process.env.ALIYUN_SMS_TEMPLATE_CODE || '',
  endpoint: 'https://dysmsapi.aliyuncs.com'
};

const TENCENT_CONFIG = {
  secretId: process.env.TENCENT_SECRET_ID || '',
  secretKey: process.env.TENCENT_SECRET_KEY || '',
  sdkAppId: process.env.TENCENT_SMS_SDK_APP_ID || '',
  signName: process.env.TENCENT_SMS_SIGN_NAME || '',
  templateId: process.env.TENCENT_SMS_TEMPLATE_ID || '',
  endpoint: 'https://sms.tencentcloudapi.com'
};

const SMS_TYPES = {
  VERIFY_CODE: 'verify_code',
  LOGIN: 'login',
  REGISTER: 'register',
  PASSWORD_RESET: 'password_reset',
  ORDER_NOTIFY: 'order_notify',
  PAYMENT_SUCCESS: 'payment_success'
};

const VERIFY_CODE_LENGTH = 6;
const VERIFY_CODE_EXPIRE = 300;
const SEND_INTERVAL_EXPIRE = 60;
const MAX_DAILY_SENDS = 10;

function generateVerifyCode() {
  return crypto.randomInt(0, Math.pow(10, VERIFY_CODE_LENGTH)).toString().padStart(VERIFY_CODE_LENGTH, '0');
}

async function checkSendFrequency(phone) {
  const lastSendKey = `sms:last_send:${phone}`;
  const lastSend = await redis.get(lastSendKey);
  
  if (lastSend) {
    return { allowed: false, waitSeconds: SEND_INTERVAL_EXPIRE - Math.floor((Date.now() - parseInt(lastSend)) / 1000) };
  }
  return { allowed: true };
}

async function checkDailyLimit(phone) {
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `sms:daily:${phone}:${today}`;
  const count = await redis.get(dailyKey);
  
  if (count && parseInt(count) >= MAX_DAILY_SENDS) {
    return { allowed: false, count: parseInt(count) };
  }
  return { allowed: true, count: parseInt(count) || 0 };
}

async function sendAliyunSms(phone, templateParams, templateCode = ALIYUN_CONFIG.templateCode) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  
  const params = {
    AccessKeyId: ALIYUN_CONFIG.accessKeyId,
    Action: 'SendSms',
    Format: 'JSON',
    PhoneNumbers: phone,
    SignName: ALIYUN_CONFIG.signName,
    TemplateCode: templateCode,
    TemplateParam: JSON.stringify(templateParams),
    Version: '2017-05-25',
    Timestamp: timestamp,
    SignatureMethod: 'HMAC-SHA1',
    SignatureVersion: '1.0',
    SignatureNonce: crypto.randomBytes(16).toString('hex')
  };

  const sortedParams = Object.keys(params).sort();
  const signStr = sortedParams.map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const signature = crypto.createHmac('sha1', `${ALIYUN_CONFIG.accessKeySecret}&`)
    .update(signStr).digest('base64');

  params.Signature = signature;

  try {
    const response = await axios.post(ALIYUN_CONFIG.endpoint, null, {
      params
    });

    const result = response.data;
    
    if (result.Code === 'OK') {
      return { success: true, bizId: result.BizId };
    }
    return { success: false, error: result.Message || result.Code };
  } catch (error) {
    logger.error('Aliyun SMS send failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendTencentSms(phone, params) {
  const timestamp = Math.floor(Date.now() / 1000);
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const body = {
    SdkAppId: TENCENT_CONFIG.sdkAppId,
    Sign: TENCENT_CONFIG.signName,
    TemplateId: TENCENT_CONFIG.templateId,
    PhoneNumberSet: [`+86${phone}`],
    TemplateParamSet: Object.values(params),
    TimeStamp: timestamp,
    Nonce: nonce
  };

  const auth = crypto.createHmac('sha256', TENCENT_CONFIG.secretKey)
    .update(`${TENCENT_CONFIG.secretId}${timestamp}${nonce}`).digest('base64');

  try {
    const response = await axios.post(TENCENT_CONFIG.endpoint, body, {
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      params: {
        Action: 'SendSms',
        Region: 'ap-guangzhou',
        Version: '2021-01-11'
      }
    });

    const result = response.data;
    
    if (result.Response && result.Response.SendStatusSet) {
      const sendStatus = result.Response.SendStatusSet[0];
      if (sendStatus.Code === 'Ok') {
        return { success: true, bizId: sendStatus.SessionContext };
      }
      return { success: false, error: sendStatus.Message };
    }
    return { success: false, error: 'SMS send failed' };
  } catch (error) {
    logger.error('Tencent SMS send failed:', error);
    return { success: false, error: error.message };
  }
}

async function sendVerifyCode(phone, type = SMS_TYPES.VERIFY_CODE) {
  const frequencyCheck = await checkSendFrequency(phone);
  if (!frequencyCheck.allowed) {
    return { success: false, error: `Please wait ${frequencyCheck.waitSeconds} seconds before resending` };
  }

  const limitCheck = await checkDailyLimit(phone);
  if (!limitCheck.allowed) {
    return { success: false, error: 'Daily SMS limit reached. Please try again tomorrow.' };
  }

  const code = generateVerifyCode();
  const verifyCodeKey = `sms:verify:${phone}`;
  const lastSendKey = `sms:last_send:${phone}`;
  const today = new Date().toISOString().split('T')[0];
  const dailyKey = `sms:daily:${phone}:${today}`;

  await redis.set(verifyCodeKey, code, 'EX', VERIFY_CODE_EXPIRE);
  await redis.set(lastSendKey, Date.now().toString(), 'EX', SEND_INTERVAL_EXPIRE);
  await redis.incr(dailyKey);
  await redis.expire(dailyKey, 86400);

  const templateParams = { code };
  
  let result;
  if (process.env.SMS_PROVIDER === 'aliyun') {
    result = await sendAliyunSms(phone, templateParams);
  } else if (process.env.SMS_PROVIDER === 'tencent') {
    result = await sendTencentSms(phone, templateParams);
  } else {
    result = { success: true, code, mock: true };
    logger.info(`Mock SMS sent to ${phone}: code=${code}`);
  }

  if (result.success) {
    logger.info(`SMS verify code sent to ${phone}, code=${code}`);
  }

  return result;
}

async function verifyCode(phone, code) {
  const verifyCodeKey = `sms:verify:${phone}`;
  const storedCode = await redis.get(verifyCodeKey);
  
  if (!storedCode) {
    return { valid: false, error: 'Verification code expired or not found' };
  }

  if (storedCode !== code) {
    return { valid: false, error: 'Invalid verification code' };
  }

  await redis.del(verifyCodeKey);
  return { valid: true };
}

async function sendNotification(phone, type, params) {
  const templateMap = {
    [SMS_TYPES.ORDER_NOTIFY]: { code: 'SMS_123456789', params: ['order_no', 'status'] },
    [SMS_TYPES.PAYMENT_SUCCESS]: { code: 'SMS_123456790', params: ['amount', 'order_no'] }
  };

  const template = templateMap[type];
  if (!template) {
    return { success: false, error: 'Unknown notification type' };
  }

  const templateParams = {};
  template.params.forEach((key, index) => {
    templateParams[index + 1] = params[key] || '';
  });

  if (process.env.SMS_PROVIDER === 'aliyun') {
    return sendAliyunSms(phone, templateParams, template.code);
  } else if (process.env.SMS_PROVIDER === 'tencent') {
    return sendTencentSms(phone, templateParams);
  } else {
    logger.info(`Mock notification SMS sent to ${phone}: type=${type}`);
    return { success: true, mock: true };
  }
}

app.post('/api/sms/send', async (req, res) => {
  const { phone, type } = req.body;
  
  if (!phone || !/^1[3-9]\d{9}$/.test(phone)) {
    return res.status(400).json({ success: false, error: 'Invalid phone number' });
  }

  const result = await sendVerifyCode(phone, type || SMS_TYPES.VERIFY_CODE);
  res.json(result);
});

app.post('/api/sms/verify', async (req, res) => {
  const { phone, code } = req.body;
  
  if (!phone || !code) {
    return res.status(400).json({ valid: false, error: 'Phone and code are required' });
  }

  const result = await verifyCode(phone, code);
  res.json(result);
});

app.post('/api/sms/notify', async (req, res) => {
  const { phone, type, params } = req.body;
  
  if (!phone || !type) {
    return res.status(400).json({ success: false, error: 'Phone and type are required' });
  }

  const result = await sendNotification(phone, type, params || {});
  res.json(result);
});

app.post('/api/sms/resend', async (req, res) => {
  const { phone } = req.body;
  
  if (!phone) {
    return res.status(400).json({ success: false, error: 'Phone is required' });
  }

  const result = await sendVerifyCode(phone, SMS_TYPES.VERIFY_CODE);
  res.json(result);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'sms-service' });
});

const PORT = process.env.PORT || 3007;

app.listen(PORT, () => {
  logger.info(`SMS service running on port ${PORT}`);
});

module.exports = app;
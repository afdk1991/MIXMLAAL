/**
 * 支付服务单元测试
 * 版本: v1.0.0.0
 */

const PaymentService = require('../../src/open/api/services/paymentService');

describe('PaymentService', () => {
  describe('generateNonceStr', () => {
    it('应该生成指定长度的随机字符串', () => {
      const str16 = PaymentService.generateNonceStr(16);
      expect(str16.length).toBe(16);
      expect(typeof str16).toBe('string');

      const str32 = PaymentService.generateNonceStr(32);
      expect(str32.length).toBe(32);
    });

    it('默认应该生成32位字符串', () => {
      const str = PaymentService.generateNonceStr();
      expect(str.length).toBe(32);
    });
  });

  describe('generateWechatSign', () => {
    it('应该生成有效的微信支付签名', () => {
      const params = {
        appid: 'test_appid',
        mch_id: 'test_mch_id',
        nonce_str: 'test_nonce',
        body: '测试商品',
      };
      const sign = PaymentService.generateWechatSign(params);
      expect(typeof sign).toBe('string');
      expect(sign.length).toBe(32);
      expect(sign).toMatch(/^[A-F0-9]{32}$/);
    });
  });

  describe('createWechatPayment', () => {
    it('应该创建微信支付订单', async () => {
      const result = await PaymentService.createWechatPayment({
        orderId: 'TEST123',
        amount: 35.50,
        description: '测试订单',
      });
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('prepayId');
      expect(result.channel).toBe('wechat');
      expect(result.amount).toBe(35.50);
    });
  });

  describe('createAlipayPayment', () => {
    it('应该创建支付宝支付订单', async () => {
      const result = await PaymentService.createAlipayPayment({
        orderId: 'TEST123',
        amount: 35.50,
        subject: '测试订单',
        returnUrl: 'https://mixm.top/success',
      });
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('paymentId');
      expect(result.channel).toBe('alipay');
      expect(result).toHaveProperty('payUrl');
    });
  });

  describe('queryPaymentStatus', () => {
    it('应该返回支付状态', async () => {
      const result = await PaymentService.queryPaymentStatus('PAY123', 'wechat');
      expect(result).toHaveProperty('paymentId');
      expect(result).toHaveProperty('status');
      expect(['pending', 'success', 'failed']).toContain(result.status);
      expect(result).toHaveProperty('amount');
    });
  });

  describe('refund', () => {
    it('应该创建退款申请', async () => {
      const result = await PaymentService.refund({
        paymentId: 'PAY123',
        orderId: 'ORDER123',
        amount: 35.50,
        reason: '测试退款',
      });
      expect(result.success).toBe(true);
      expect(result).toHaveProperty('refundId');
      expect(result.status).toBe('processing');
      expect(result.amount).toBe(35.50);
    });
  });
});

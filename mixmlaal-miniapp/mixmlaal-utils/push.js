/**
 * 小程序消息推送服务
 * 版本: 0.0.0.4
 * 说明: 实现小程序消息推送功能，支持订阅消息和模板消息
 */

const { getPlatform, getApi } = require('../platforms/adapter.js');

class PushService {
  constructor() {
    this.platform = getPlatform();
    this.api = getApi();
    this.subscriptionMap = {
      alipay: 'my.subscribe',
      wechat: 'wx.requestSubscribeMessage',
      baidu: 'swan.requestSubscribeMessage',
      qq: 'qq.requestSubscribeMessage',
      bytedance: 'tt.requestSubscribeMessage'
    };
  }

  /**
   * 请求订阅消息权限
   * @param {string|Array<string>} templateIds - 模板消息ID或ID数组
   * @returns {Promise} 返回订阅结果
   */
  async requestSubscribe(templateIds) {
    const templateIdList = Array.isArray(templateIds) ? templateIds : [templateIds];
    const subscribeMethod = this.subscriptionMap[this.platform] || this.subscriptionMap.wechat;

    try {
      if (this.platform === 'alipay') {
        return await this.alipaySubscribe(templateIdList);
      } else if (this.platform === 'wechat') {
        return await this.wechatSubscribe(templateIdList);
      } else if (this.platform === 'baidu') {
        return await this.baiduSubscribe(templateIdList);
      } else if (this.platform === 'qq') {
        return await this.qqSubscribe(templateIdList);
      } else if (this.platform === 'bytedance') {
        return await this.bytedanceSubscribe(templateIdList);
      } else {
        throw new Error(`不支持的平台: ${this.platform}`);
      }
    } catch (error) {
      console.error('订阅消息失败:', error);
      throw error;
    }
  }

  /**
   * 支付宝订阅消息
   * @param {Array<string>} templateIds - 模板ID列表
   */
  async alipaySubscribe(templateIds) {
    const results = [];
    for (const templateId of templateIds) {
      try {
        const result = await this.api.subscribe({
          template: templateId
        });
        results.push({ templateId, result, success: true });
      } catch (error) {
        results.push({ templateId, error: error.message, success: false });
      }
    }
    return results;
  }

  /**
   * 微信订阅消息
   * @param {Array<string>} templateIds - 模板ID列表
   */
  async wechatSubscribe(templateIds) {
    const result = await this.api.requestSubscribeMessage({
      tmplIds: templateIds
    });
    return result;
  }

  /**
   * 百度订阅消息
   * @param {Array<string>} templateIds - 模板ID列表
   */
  async baiduSubscribe(templateIds) {
    const result = await this.api.requestSubscribeMessage({
      templateIds: templateIds
    });
    return result;
  }

  /**
   * QQ订阅消息
   * @param {Array<string>} templateIds - 模板ID列表
   */
  async qqSubscribe(templateIds) {
    const result = await this.api.requestSubscribeMessage({
      templateIds: templateIds
    });
    return result;
  }

  /**
   * 字节跳动订阅消息
   * @param {Array<string>} templateIds - 模板ID列表
   */
  async bytedanceSubscribe(templateIds) {
    const result = await this.api.requestSubscribeMessage({
      msgTypes: templateIds
    });
    return result;
  }

  /**
   * 发送订阅消息（需要后端支持）
   * @param {Object} params - 消息参数
   * @returns {Promise} 返回发送结果
   */
  async sendSubscribeMessage(params) {
    const { get } = require('./request.js');
    const token = await this.getAccessToken();
    const url = this.getMessageSendUrl(token);

    return await post(url, {
      touser: params.openId,
      template_id: params.templateId,
      page: params.page || 'index',
      data: params.data
    });
  }

  /**
   * 获取access_token
   */
  async getAccessToken() {
    const { get } = require('./request.js');
    const appId = this.getAppId();
    const secret = this.getSecret();

    const result = await get('https://api.weixin.qq.com/cgi-bin/token', {
      grant_type: 'client_credential',
      appid: appId,
      secret: secret
    });

    return result.access_token;
  }

  /**
   * 获取消息发送URL
   * @param {string} accessToken - 访问令牌
   */
  getMessageSendUrl(accessToken) {
    const baseUrls = {
      wechat: 'https://api.weixin.qq.com/cgi-bin/message/subscribe/send',
      alipay: 'https://openapi.alipay.com/gateway.do',
      baidu: 'https://openapi.baidu.com/rest/2.0/smartapp/message/subscribe/send',
      qq: 'https://api.q.qq.com/api/_getUnionid',
      bytedance: 'https://openapi.toutiao.com/api/message/subscribe/send'
    };

    return `${baseUrls[this.platform]}?access_token=${accessToken}`;
  }

  /**
   * 获取AppId
   */
  getAppId() {
    const platformConfig = {
      wechat: 'wx_app_id',
      alipay: 'alipay_app_id',
      baidu: 'bd_app_id',
      qq: 'qq_app_id',
      bytedance: 'tt_app_id'
    };

    return this.api.getStorageSync(platformConfig[this.platform]) ||
           this.api.getApp().globalData[platformConfig[this.platform]];
  }

  /**
   * 获取Secret
   */
  getSecret() {
    const secretKeys = {
      wechat: 'wx_app_secret',
      alipay: 'alipay_app_secret',
      baidu: 'bd_app_secret',
      qq: 'qq_app_secret',
      bytedance: 'tt_app_secret'
    };

    return this.api.getStorageSync(secretKeys[this.platform]) ||
           this.api.getApp().globalData[secretKeys[this.platform]];
  }

  /**
   * 检查消息推送权限
   * @returns {Promise<boolean>} 是否有权限
   */
  async checkPermission() {
    try {
      const setting = await this.api.getSetting();
      if (this.platform === 'wechat') {
        return setting.authSetting['scope.notify'] === true;
      } else if (this.platform === 'alipay') {
        return setting.authSetting.alipay === true;
      }
      return true;
    } catch (error) {
      console.error('检查权限失败:', error);
      return false;
    }
  }

  /**
   * 打开设置页面
   * @returns {Promise} 设置结果
   */
  async openSettings() {
    return await this.api.openSetting();
  }
}

module.exports = new PushService();

const express = require('express');
const router = express.Router();
const authService = require('../../authservice');
const authMiddleware = require('../middleware/auth');

const OAUTH_CONFIG = {
  wechat: {
    appId: process.env.WECHAT_APP_ID || 'wx_your_wechat_app_id',
    appSecret: process.env.WECHAT_APP_SECRET || 'your_wechat_app_secret',
    authUrl: 'https://open.weixin.qq.com/connect/qrconnect',
    tokenUrl: 'https://api.weixin.qq.com/sns/oauth2/access_token',
    userInfoUrl: 'https://api.weixin.qq.com/sns/userinfo'
  },
  qq: {
    appId: process.env.QQ_APP_ID || 'your_qq_app_id',
    appSecret: process.env.QQ_APP_SECRET || 'your_qq_app_secret',
    authUrl: 'https://graph.qq.com/oauth2.0/authorize',
    tokenUrl: 'https://graph.qq.com/oauth2.0/token',
    openIdUrl: 'https://graph.qq.com/oauth2.0/me',
    userInfoUrl: 'https://graph.qq.com/user/get_user_info'
  },
  google: {
    appId: process.env.GOOGLE_CLIENT_ID || 'your_google_client_id',
    appSecret: process.env.GOOGLE_CLIENT_SECRET || 'your_google_client_secret',
    authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenUrl: 'https://oauth2.googleapis.com/token',
    userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo'
  }
};

function generateState() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

router.get('/:provider/url', async (req, res) => {
  try {
    const { provider } = req.params;

    if (!OAUTH_CONFIG[provider]) {
      return res.status(400).json({ error: '不支持的第三方登录提供商' });
    }

    const state = generateState();

    const stateStorage = global.oauthStates = global.oauthStates || {};
    stateStorage[state] = { provider, createdAt: Date.now() };

    setTimeout(() => {
      if (stateStorage[state]) {
        delete stateStorage[state];
      }
    }, 10 * 60 * 1000);

    const redirectUri = `${process.env.API_BASE_URL || 'http://localhost:8085'}/api/auth/oauth/${provider}/callback`;

    let authUrl = '';

    switch (provider) {
      case 'wechat':
        authUrl = `${OAUTH_CONFIG.wechat.authUrl}?appid=${OAUTH_CONFIG.wechat.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=snsapi_login&state=${state}#wechat_redirect`;
        break;
      case 'qq':
        authUrl = `${OAUTH_CONFIG.qq.authUrl}?response_type=code&client_id=${OAUTH_CONFIG.qq.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;
        break;
      case 'google':
        const scopes = encodeURIComponent('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email');
        authUrl = `${OAUTH_CONFIG.google.authUrl}?client_id=${OAUTH_CONFIG.google.appId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scopes}&state=${state}&access_type=offline&prompt=consent`;
        break;
    }

    res.json({ url: authUrl, state });
  } catch (error) {
    console.error('获取OAuth URL错误:', error);
    res.status(500).json({ error: '获取授权URL失败' });
  }
});

router.get('/:provider/callback', async (req, res) => {
  try {
    const { provider } = req.params;
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: '授权码缺失' });
    }

    const stateStorage = global.oauthStates = global.oauthStates || {};
    const storedState = stateStorage[state];

    if (!storedState || storedState.provider !== provider) {
      return res.status(400).json({ error: '状态验证失败' });
    }

    delete stateStorage[state];

    let openid, userInfo = {};

    switch (provider) {
      case 'wechat':
        const wechatTokenResponse = await fetch(`${OAUTH_CONFIG.wechat.tokenUrl}?grant_type=authorization_code&appid=${OAUTH_CONFIG.wechat.appId}&secret=${OAUTH_CONFIG.wechat.appSecret}&code=${code}`);
        const wechatTokenData = await wechatTokenResponse.json();

        if (wechatTokenData.errcode) {
          throw new Error(wechatTokenData.errmsg || '微信access_token获取失败');
        }

        const wechatUserResponse = await fetch(`${OAUTH_CONFIG.wechat.userInfoUrl}?access_token=${wechatTokenData.access_token}&openid=${wechatTokenData.openid}`);
        const wechatUserData = await wechatUserResponse.json();

        openid = wechatTokenData.openid;
        userInfo = {
          name: wechatUserData.nickname,
          avatar: wechatUserData.headimgurl
        };
        break;

      case 'qq':
        const qqTokenResponse = await fetch(`${OAUTH_CONFIG.qq.tokenUrl}?grant_type=authorization_code&client_id=${OAUTH_CONFIG.qq.appId}&client_secret=${OAUTH_CONFIG.qq.appSecret}&code=${code}&redirect_uri=${encodeURIComponent(`${process.env.API_BASE_URL || 'http://localhost:8085'}/api/auth/oauth/qq/callback`)}`);
        const qqTokenData = await qqTokenResponse.text();
        const qqParams = new URLSearchParams(qqTokenData);
        const qqAccessToken = qqParams.get('access_token');

        if (!qqAccessToken) {
          throw new Error('QQ access_token获取失败');
        }

        const qqOpenIdResponse = await fetch(`${OAUTH_CONFIG.qq.openIdUrl}?access_token=${qqAccessToken}`);
        const qqOpenIdData = await qqOpenIdResponse.text();
        const openIdMatch = qqOpenIdData.match(/\"openid\":\"([^\"]+)\"/);
        openid = openIdMatch ? openIdMatch[1] : null;

        if (!openid) {
          throw new Error('QQ openid获取失败');
        }

        const qqUserResponse = await fetch(`${OAUTH_CONFIG.qq.userInfoUrl}?access_token=${qqAccessToken}&oauth_consumer_key=${OAUTH_CONFIG.qq.appId}&openid=${openid}`);
        const qqUserData = await qqUserResponse.json();

        userInfo = {
          name: qqUserData.nickname,
          avatar: qqUserData.figureurl_qq_2 || qqUserData.figureurl_qq_1 || qqUserData.figureurl
        };
        break;

      case 'google':
        const googleTokenResponse = await fetch(OAUTH_CONFIG.google.tokenUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            code,
            client_id: OAUTH_CONFIG.google.appId,
            client_secret: OAUTH_CONFIG.google.appSecret,
            redirect_uri: `${process.env.API_BASE_URL || 'http://localhost:8085'}/api/auth/oauth/google/callback`,
            grant_type: 'authorization_code'
          })
        });
        const googleTokenData = await googleTokenResponse.json();

        if (googleTokenData.error) {
          throw new Error(googleTokenData.error_description || 'Google access_token获取失败');
        }

        const googleUserResponse = await fetch(OAUTH_CONFIG.google.userInfoUrl, {
          headers: {
            Authorization: `Bearer ${googleTokenData.access_token}`
          }
        });
        const googleUserData = await googleUserResponse.json();

        openid = googleUserData.id;
        userInfo = {
          name: googleUserData.name,
          email: googleUserData.email,
          avatar: googleUserData.picture
        };
        break;
    }

    const result = await authService.thirdPartyLogin(provider, openid, userInfo);

    const redirectUrl = new URL('http://localhost:8084/oauth-callback');
    redirectUrl.searchParams.set('provider', provider);
    redirectUrl.searchParams.set('token', result.token);
    redirectUrl.searchParams.set('isNewUser', result.isNewUser ? '1' : '0');

    if (result.user) {
      redirectUrl.searchParams.set('userId', result.user.id);
      redirectUrl.searchParams.set('username', result.user.username || '');
      redirectUrl.searchParams.set('name', result.user.name || '');
    }

    res.redirect(redirectUrl.toString());
  } catch (error) {
    console.error(`${provider}登录回调错误:`, error);
    res.redirect(`http://localhost:8084/login?error=${encodeURIComponent(error.message)}`);
  }
});

router.post('/bind/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params;
    const { openid } = req.body;
    const userId = req.user.id;

    const result = await authService.bindThirdParty(userId, provider, openid);
    res.json(result);
  } catch (error) {
    console.error('绑定第三方账号错误:', error);
    res.status(400).json({ error: error.message });
  }
});

router.post('/unbind/:provider', authMiddleware, async (req, res) => {
  try {
    const { provider } = req.params;
    const userId = req.user.id;

    const result = await authService.unbindThirdParty(userId, provider);
    res.json(result);
  } catch (error) {
    console.error('解绑第三方账号错误:', error);
    res.status(400).json({ error: error.message });
  }
});

router.get('/third-party/status', authMiddleware, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);

    res.json({
      wechat: !!user.wechatOpenid,
      qq: !!user.qqOpenid,
      google: !!user.googleOpenid
    });
  } catch (error) {
    console.error('获取第三方绑定状态错误:', error);
    res.status(500).json({ error: '获取状态失败' });
  }
});

module.exports = router;
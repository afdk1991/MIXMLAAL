/**
 * MIXMLAAL 国际化(i18n)模块
 * 版本: v1.0.0.0
 * 说明: 支持多语言切换，适配全球化部署
 * 支持语言: 简体中文(zh-CN)、繁体中文(zh-TW)、英语(en)、韩语(ko)、日语(ja)、西班牙语(es)
 */

const _I18n = {
  // 当前语言
  currentLang: 'zh-CN',

  // 语言包
  messages: {
    'zh-CN': {
      // 通用
      'common.confirm': '确认',
      'common.cancel': '取消',
      'common.submit': '提交',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.add': '新增',
      'common.search': '搜索',
      'common.loading': '加载中...',
      'common.success': '操作成功',
      'common.error': '操作失败',
      'common.warning': '警告',
      'common.info': '提示',
      'common.more': '更多',
      'common.less': '收起',
      'common.seeAll': '查看全部',
      'common.back': '返回',
      'common.close': '关闭',
      'common.open': '打开',
      'common.yes': '是',
      'common.no': '否',
      'common.ok': '确定',

      // 导航
      'nav.home': '首页',
      'nav.portal': '门户',
      'nav.social': '社交',
      'nav.ecommerce': '电商',
      'nav.ride': '出行',
      'nav.user': '我的',
      'nav.settings': '设置',
      'nav.help': '帮助',

      // 门户
      'portal.title': 'MIXMLAAL门户',
      'portal.news': '资讯',
      'portal.announcement': '公告',
      'portal.activity': '活动',
      'portal.recommend': '推荐',

      // 社交
      'social.title': '社交',
      'social.blog': '博客',
      'social.video': '视频',
      'social.moments': '动态',
      'social.follow': '关注',
      'social.fans': '粉丝',
      'social.like': '点赞',
      'social.comment': '评论',
      'social.share': '分享',
      'social.post': '发布',

      // 电商
      'ecommerce.title': '商城',
      'ecommerce.shop': '店铺',
      'ecommerce.mall': '商城',
      'ecommerce.store': '旗舰店',
      'ecommerce.cart': '购物车',
      'ecommerce.order': '订单',
      'ecommerce.pay': '支付',
      'ecommerce.coupon': '优惠券',
      'ecommerce.points': '积分',
      'ecommerce.price': '价格',
      'ecommerce.buy': '立即购买',
      'ecommerce.addToCart': '加入购物车',

      // 出行
      'ride.title': '出行',
      'ride.ride': '网约车',
      'ride.taxi': '出租车',
      'ride.carpool': '顺风车',
      'ride.driver': '代驾',
      'ride.call': '立即叫车',
      'ride.start': '出发地',
      'ride.end': '目的地',
      'ride.estimatedPrice': '预估价格',
      'ride.estimatedTime': '预计时间',
      'ride.driverArrived': '司机已到达',
      'ride.onTrip': '行程中',
      'ride.completed': '已完成',

      // 用户
      'user.title': '个人中心',
      'user.profile': '个人资料',
      'user.orders': '我的订单',
      'user.wallet': '我的钱包',
      'user.coupons': '我的优惠券',
      'user.points': '我的积分',
      'user.settings': '设置',
      'user.logout': '退出登录',
      'user.login': '登录',
      'user.register': '注册',
      'user.phone': '手机号',
      'user.password': '密码',
      'user.verifyCode': '验证码',

      // 支付
      'pay.title': '支付',
      'pay.confirm': '确认支付',
      'pay.amount': '支付金额',
      'pay.method': '支付方式',
      'pay.wechat': '微信支付',
      'pay.alipay': '支付宝',
      'pay.card': '银行卡',
      'pay.success': '支付成功',
      'pay.fail': '支付失败',

      // 合规
      'compliance.title': '合规中心',
      'compliance.license': '经营许可证',
      'compliance.privacy': '隐私政策',
      'compliance.terms': '用户协议',
      'compliance.safety': '安全保障',
    },

    en: {
      // Common
      'common.confirm': 'Confirm',
      'common.cancel': 'Cancel',
      'common.submit': 'Submit',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.add': 'Add',
      'common.search': 'Search',
      'common.loading': 'Loading...',
      'common.success': 'Success',
      'common.error': 'Error',
      'common.warning': 'Warning',
      'common.info': 'Info',
      'common.more': 'More',
      'common.less': 'Less',
      'common.seeAll': 'See All',
      'common.back': 'Back',
      'common.close': 'Close',
      'common.open': 'Open',
      'common.yes': 'Yes',
      'common.no': 'No',
      'common.ok': 'OK',

      // Navigation
      'nav.home': 'Home',
      'nav.portal': 'Portal',
      'nav.social': 'Social',
      'nav.ecommerce': 'Shop',
      'nav.ride': 'Ride',
      'nav.user': 'Profile',
      'nav.settings': 'Settings',
      'nav.help': 'Help',

      // Portal
      'portal.title': 'MIXMLAAL Portal',
      'portal.news': 'News',
      'portal.announcement': 'Announcement',
      'portal.activity': 'Activity',
      'portal.recommend': 'Recommend',

      // Social
      'social.title': 'Social',
      'social.blog': 'Blog',
      'social.video': 'Video',
      'social.moments': 'Moments',
      'social.follow': 'Follow',
      'social.fans': 'Fans',
      'social.like': 'Like',
      'social.comment': 'Comment',
      'social.share': 'Share',
      'social.post': 'Post',

      // E-commerce
      'ecommerce.title': 'Shop',
      'ecommerce.shop': 'Shop',
      'ecommerce.mall': 'Mall',
      'ecommerce.store': 'Store',
      'ecommerce.cart': 'Cart',
      'ecommerce.order': 'Order',
      'ecommerce.pay': 'Pay',
      'ecommerce.coupon': 'Coupon',
      'ecommerce.points': 'Points',
      'ecommerce.price': 'Price',
      'ecommerce.buy': 'Buy Now',
      'ecommerce.addToCart': 'Add to Cart',

      // Ride
      'ride.title': 'Ride',
      'ride.ride': 'Ride',
      'ride.taxi': 'Taxi',
      'ride.carpool': 'Carpool',
      'ride.driver': 'Driver',
      'ride.call': 'Call Now',
      'ride.start': 'Start',
      'ride.end': 'Destination',
      'ride.estimatedPrice': 'Estimated Price',
      'ride.estimatedTime': 'Estimated Time',
      'ride.driverArrived': 'Driver Arrived',
      'ride.onTrip': 'On Trip',
      'ride.completed': 'Completed',

      // User
      'user.title': 'Profile',
      'user.profile': 'Profile',
      'user.orders': 'My Orders',
      'user.wallet': 'My Wallet',
      'user.coupons': 'My Coupons',
      'user.points': 'My Points',
      'user.settings': 'Settings',
      'user.logout': 'Logout',
      'user.login': 'Login',
      'user.register': 'Register',
      'user.phone': 'Phone',
      'user.password': 'Password',
      'user.verifyCode': 'Verify Code',

      // Payment
      'pay.title': 'Payment',
      'pay.confirm': 'Confirm Payment',
      'pay.amount': 'Amount',
      'pay.method': 'Payment Method',
      'pay.wechat': 'WeChat Pay',
      'pay.alipay': 'Alipay',
      'pay.card': 'Card',
      'pay.success': 'Payment Success',
      'pay.fail': 'Payment Failed',

      // Compliance
      'compliance.title': 'Compliance',
      'compliance.license': 'License',
      'compliance.privacy': 'Privacy Policy',
      'compliance.terms': 'Terms of Service',
      'compliance.safety': 'Safety',
    },

    ko: {
      // 韩语基础翻译
      'common.confirm': '확인',
      'common.cancel': '취소',
      'common.submit': '제출',
      'common.save': '저장',
      'common.delete': '삭제',
      'common.loading': '로딩 중...',
      'common.success': '성공',
      'common.error': '오류',
      'nav.home': '홈',
      'nav.portal': '포털',
      'nav.social': '소셜',
      'nav.ecommerce': '쇼핑',
      'nav.ride': '라이드',
      'nav.user': '내 정보',
      'user.login': '로그인',
      'user.register': '회원가입',
    },

    ja: {
      // 日语基础翻译
      'common.confirm': '確認',
      'common.cancel': 'キャンセル',
      'common.submit': '送信',
      'common.save': '保存',
      'common.delete': '削除',
      'common.loading': '読み込み中...',
      'common.success': '成功',
      'common.error': 'エラー',
      'nav.home': 'ホーム',
      'nav.portal': 'ポータル',
      'nav.social': 'ソーシャル',
      'nav.ecommerce': 'ショップ',
      'nav.ride': 'ライド',
      'nav.user': 'マイページ',
      'user.login': 'ログイン',
      'user.register': '登録',
    },

    es: {
      // 西班牙语基础翻译
      'common.confirm': 'Confirmar',
      'common.cancel': 'Cancelar',
      'common.submit': 'Enviar',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.loading': 'Cargando...',
      'common.success': 'Éxito',
      'common.error': 'Error',
      'nav.home': 'Inicio',
      'nav.portal': 'Portal',
      'nav.social': 'Social',
      'nav.ecommerce': 'Tienda',
      'nav.ride': 'Viaje',
      'nav.user': 'Perfil',
      'user.login': 'Iniciar sesión',
      'user.register': 'Registrarse',
    },
  },

  /**
   * 初始化i18n
   * @param {string} lang - 默认语言
   */
  init(lang = 'zh-CN') {
    this.currentLang = lang;
    // 从本地存储读取语言设置
    const savedLang = localStorage.getItem('mixmlaal-lang');
    if (savedLang && this.messages[savedLang]) {
      this.currentLang = savedLang;
    }
    this.updatePageLanguage();
  },

  /**
   * 切换语言
   * @param {string} lang - 目标语言
   */
  setLanguage(lang) {
    if (this.messages[lang]) {
      this.currentLang = lang;
      localStorage.setItem('mixmlaal-lang', lang);
      this.updatePageLanguage();
      // 触发自定义事件
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    }
  },

  /**
   * 获取翻译
   * @param {string} key - 翻译键
   * @param {Object} params - 插值参数
   * @returns {string}
   */
  t(key, params = {}) {
    const message = this.messages[this.currentLang]?.[key] ||
                   this.messages['zh-CN']?.[key] ||
                   key;

    // 处理插值
    return message.replace(/\{(\w+)\}/g, (match, param) => {
      return params[param] !== undefined ? params[param] : match;
    });
  },

  /**
   * 更新页面语言
   */
  updatePageLanguage() {
    document.documentElement.lang = this.currentLang;
    // 更新所有带有data-i18n属性的元素
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const translation = this.t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = translation;
      } else {
        el.textContent = translation;
      }
    });
  },

  /**
   * 获取当前语言
   * @returns {string}
   */
  getCurrentLanguage() {
    return this.currentLang;
  },

  /**
   * 获取支持的语言列表
   * @returns {Array}
   */
  getSupportedLanguages() {
    return [
      { code: 'zh-CN', name: '简体中文', flag: '🇨🇳' },
      { code: 'zh-TW', name: '繁體中文', flag: '🇹🇼' },
      { code: 'en', name: 'English', flag: '🇺🇸' },
      { code: 'ko', name: '한국어', flag: '🇰🇷' },
      { code: 'ja', name: '日本語', flag: '🇯🇵' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
    ];
  },
};

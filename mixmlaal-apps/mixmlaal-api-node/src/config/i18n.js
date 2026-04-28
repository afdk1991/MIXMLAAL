const i18n = require('i18n');
const path = require('path');

// 配置i18n
i18n.configure({
  locales: ['zh-CN', 'en-US', 'ja-JP', 'ko-KR'], // 支持的语言
  directory: path.join(__dirname, '../locales'), // 翻译文件目录
  defaultLocale: 'zh-CN', // 默认语言
  cookie: 'lang', // 存储语言的cookie名称
  autoReload: true, // 自动重新加载翻译文件
  updateFiles: false, // 不自动更新翻译文件
  syncFiles: false, // 不同步翻译文件
  objectNotation: true, // 支持对象表示法
  register: global // 注册到全局
});

module.exports = i18n;
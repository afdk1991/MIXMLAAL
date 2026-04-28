const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function showShareMenu(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    my.hideShareMenu ? my.hideShareMenu() : null;
    return;
  }

  api.showShareMenu({
    withShareTicket: options.withShareTicket || false,
    success: options.success,
    fail: options.fail
  });
}

function onShareAppMessage(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    return;
  }

  api.onShareAppMessage(() => ({
    title: options.title || 'MIXMLAAL',
    path: options.path || '/pages/index/index',
    imageUrl: options.imageUrl || ''
  }));
}

module.exports = { showShareMenu, onShareAppMessage };

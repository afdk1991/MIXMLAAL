const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function showToast(options) {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    return api.showToast({
      content: options.title || options.content,
      type: options.icon === 'success' ? 'success' : 'fail',
      duration: options.duration || 2000
    });
  }

  return api.showToast({
    title: options.title || options.content,
    icon: options.icon || 'none',
    duration: options.duration || 2000,
    mask: options.mask || false
  });
}

function showLoading(options) {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    return api.showLoading({
      content: options.title || '加载中...'
    });
  }

  return api.showLoading({
    title: options.title || '加载中...',
    mask: options.mask !== false
  });
}

function hideLoading() {
  const api = getApi();
  const platform = getPlatform();

  if (platform === 'alipay') {
    return api.hideLoading();
  }

  return api.hideLoading();
}

module.exports = { showToast, showLoading, hideLoading };

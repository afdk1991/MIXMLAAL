/**
 * 小程序位置服务工具
 * 版本: v2.0.0
 * 说明: 2025最新SDK适配，支持高德/百度/腾讯地图API
 */

const platformAdapter = require('../platforms/adapter.js');

function getPlatform() {
  return platformAdapter.platform;
}

function getApi() {
  return platformAdapter.api;
}

function getLocation(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  const defaultOptions = {
    type: 'gcj02',
    altitude: false,
    success: () => {},
    fail: () => {}
  };

  return new Promise((resolve, reject) => {
    if (platform === 'alipay') {
      api.getLocation({
        ...defaultOptions,
        ...options,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed,
            accuracy: res.accuracy,
            altitude: res.altitude,
            locationType: res.locationType,
            timestamp: Date.now()
          });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === 'baidu') {
      api.getLocation({
        ...defaultOptions,
        type: 'bd09ll',
        ...options,
        success: (res) => {
          resolve({
            latitude: res.latitude,
            longitude: res.longitude,
            speed: res.speed,
            accuracy: res.accuracy,
            altitude: res.altitude,
            locationType: res.locationType,
            timestamp: Date.now()
          });
        },
        fail: (err) => reject(err)
      });
    } else {
      api.getLocation({
        ...defaultOptions,
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err)
      });
    }
  });
}

function watchLocation(options = {}) {
  const api = getApi();
  const defaultOptions = {
    type: 'gcj02',
    altitude: false
  };

  let watchId = null;
  
  if (api.onLocationChange) {
    watchId = api.onLocationChange((location) => {
      if (options.callback) {
        options.callback(location);
      }
    });
  } else {
    watchId = api.startLocationUpdateBackground ? 
      api.startLocationUpdateBackground() : 
      api.startLocationUpdate();
  }
  
  return watchId;
}

function stopWatchLocation(watchId) {
  const api = getApi();
  
  if (api.offLocationChange && typeof watchId === 'function') {
    api.offLocationChange(watchId);
  } else if (api.stopLocationUpdate) {
    api.stopLocationUpdate();
  }
}

function openLocation(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  const defaultOptions = {
    latitude: 0,
    longitude: 0,
    name: '',
    address: '',
    scale: 18
  };

  const mergedOptions = { ...defaultOptions, ...options };

  if (platform === 'alipay') {
    api.openLocation({
      ...mergedOptions,
      latitude: mergedOptions.latitude,
      longitude: mergedOptions.longitude,
      name: mergedOptions.name,
      address: mergedOptions.address
    });
  } else if (platform === 'baidu') {
    api.openLocation({
      ...mergedOptions,
      lat: mergedOptions.latitude,
      lng: mergedOptions.longitude,
      name: mergedOptions.name,
      address: mergedOptions.address
    });
  } else {
    api.openLocation({
      ...mergedOptions,
      latitude: mergedOptions.latitude,
      longitude: mergedOptions.longitude,
      name: mergedOptions.name,
      address: mergedOptions.address
    });
  }
}

function chooseLocation(options = {}) {
  const api = getApi();
  const platform = getPlatform();

  const defaultOptions = {
    latitude: 0,
    longitude: 0,
    success: () => {},
    fail: () => {}
  };

  const mergedOptions = { ...defaultOptions, ...options };

  return new Promise((resolve, reject) => {
    if (platform === 'alipay') {
      api.chooseLocation({
        ...mergedOptions,
        success: (res) => {
          resolve({
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
            timestamp: Date.now()
          });
        },
        fail: (err) => reject(err)
      });
    } else if (platform === 'baidu') {
      api.chooseLocation({
        ...mergedOptions,
        success: (res) => {
          resolve({
            name: res.name,
            address: res.address,
            latitude: res.lat,
            longitude: res.lng,
            timestamp: Date.now()
          });
        },
        fail: (err) => reject(err)
      });
    } else {
      api.chooseLocation({
        ...mergedOptions,
        success: (res) => {
          resolve({
            name: res.name,
            address: res.address,
            latitude: res.latitude,
            longitude: res.longitude,
            timestamp: Date.now()
          });
        },
        fail: (err) => reject(err)
      });
    }
  });
}

function convertToWGS84(lng, lat) {
  if (!lng || !lat) return { lng, lat };
  
  const x = lng - 105.0;
  const y = lat - 35.0;
  
  let dLat = (-100.0 + 2.0 * x + 3.0 * y + 0.2 * y * y + 0.1 * x * y + 0.2 * Math.sqrt(Math.abs(x)));
  dLat += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  dLat += (20.0 * Math.sin(y * Math.PI) + 40.0 * Math.sin(y / 3.0 * Math.PI)) * 2.0 / 3.0;
  dLat += (160.0 * Math.sin(y / 12.0 * Math.PI) + 320.0 * Math.sin(y * Math.PI / 30.0)) * 2.0 / 3.0;
  
  let dLng = 300.0 + x + 2.0 * y + 0.1 * x * x + 0.1 * x * y + 0.1 * Math.sqrt(Math.abs(x));
  dLng += (20.0 * Math.sin(6.0 * x * Math.PI) + 20.0 * Math.sin(2.0 * x * Math.PI)) * 2.0 / 3.0;
  dLng += (20.0 * Math.sin(x * Math.PI) + 40.0 * Math.sin(x / 3.0 * Math.PI)) * 2.0 / 3.0;
  dLng += (150.0 * Math.sin(x / 12.0 * Math.PI) + 300.0 * Math.sin(x / 30.0 * Math.PI)) * 2.0 / 3.0;
  
  const radLat = lat / 180.0 * Math.PI;
  let magic = Math.sin(radLat);
  magic = 1 - 0.0066934016231127 * magic * magic;
  const sqrtMagic = Math.sqrt(magic);
  
  dLat = (dLat * 180.0) / ((6378245.0 * (1 - 0.0066934016231127)) / (magic * sqrtMagic) * Math.PI);
  dLng = (dLng * 180.0) / (6378245.0 / sqrtMagic * Math.cos(radLat) * Math.PI);
  
  return {
    lng: lng - dLng,
    lat: lat - dLat
  };
}

function convertToGCJ02(lng, lat) {
  if (!lng || !lat) return { lng, lat };
  
  const wgs84 = convertToWGS84(lng, lat);
  
  return {
    lng: lng * 2 - wgs84.lng,
    lat: lat * 2 - wgs84.lat
  };
}

function getDistance(point1, point2) {
  const R = 6371; // 地球半径（公里）
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLng = (point2.longitude - point1.longitude) * Math.PI / 180;
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // 公里
  
  return distance * 1000; // 转换为米
}

module.exports = {
  getLocation,
  watchLocation,
  stopWatchLocation,
  openLocation,
  chooseLocation,
  convertToWGS84,
  convertToGCJ02,
  getDistance
};


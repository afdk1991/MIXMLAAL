// 原生插件封装

import { Capacitor } from '@capacitor/core';
import { Geolocation } from '@capacitor/geolocation';
import { Camera } from '@capacitor/camera';
import { PushNotifications } from '@capacitor/push-notifications';
import { Device } from '@capacitor/device';
import { Storage } from '@capacitor/storage';
import { Network } from '@capacitor/network';

// 位置服务
const LocationService = {
  // 获取当前位置
  async getCurrentPosition() {
    try {
      if (Capacitor.isNativePlatform()) {
        const position = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
        return {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        };
      } else {
        // Web端使用浏览器API
        return new Promise((resolve, reject) => {
          if ('geolocation' in navigator) {
            navigator.geolocation.getCurrentPosition(
              (position) => {
                resolve({
                  latitude: position.coords.latitude,
                  longitude: position.coords.longitude,
                  accuracy: position.coords.accuracy
                });
              },
              (error) => {
                reject(error);
              },
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
              }
            );
          } else {
            reject(new Error('浏览器不支持地理位置'));
          }
        });
      }
    } catch (error) {
      console.error('获取位置失败:', error);
      throw error;
    }
  },

  // 监听位置变化
  async watchPosition(callback, options = {}) {
    try {
      if (Capacitor.isNativePlatform()) {
        const id = await Geolocation.watchPosition(options, (position, error) => {
          if (error) {
            console.error('位置更新失败:', error);
            return;
          }
          callback({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        });
        return id;
      } else {
        // Web端使用浏览器API
        if ('geolocation' in navigator) {
          const id = navigator.geolocation.watchPosition(
            (position) => {
              callback({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy
              });
            },
            (error) => {
              console.error('位置更新失败:', error);
            },
            options
          );
          return id;
        } else {
          throw new Error('浏览器不支持地理位置');
        }
      }
    } catch (error) {
      console.error('监听位置失败:', error);
      throw error;
    }
  },

  // 清除位置监听
  async clearWatch(id) {
    try {
      if (Capacitor.isNativePlatform()) {
        await Geolocation.clearWatch({ id });
      } else {
        if ('geolocation' in navigator) {
          navigator.geolocation.clearWatch(id);
        }
      }
    } catch (error) {
      console.error('清除位置监听失败:', error);
      throw error;
    }
  }
};

// 相机服务
const CameraService = {
  // 拍照
  async takePhoto(options = {}) {
    try {
      if (Capacitor.isNativePlatform()) {
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing || false,
          resultType: options.resultType || CameraResultType.Uri
        });
        return {
          uri: image.webPath,
          format: image.format,
          width: image.width,
          height: image.height
        };
      } else {
        // Web端使用文件输入
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.capture = 'camera';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve({
                  uri: event.target.result,
                  format: file.type,
                  width: 0,
                  height: 0
                });
              };
              reader.readAsDataURL(file);
            } else {
              reject(new Error('未选择图片'));
            }
          };
          input.click();
        });
      }
    } catch (error) {
      console.error('拍照失败:', error);
      throw error;
    }
  },

  // 从相册选择
  async pickFromGallery(options = {}) {
    try {
      if (Capacitor.isNativePlatform()) {
        const image = await Camera.getPhoto({
          quality: options.quality || 90,
          allowEditing: options.allowEditing || false,
          source: CameraSource.Photos,
          resultType: options.resultType || CameraResultType.Uri
        });
        return {
          uri: image.webPath,
          format: image.format,
          width: image.width,
          height: image.height
        };
      } else {
        // Web端使用文件输入
        return new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = 'image/*';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                resolve({
                  uri: event.target.result,
                  format: file.type,
                  width: 0,
                  height: 0
                });
              };
              reader.readAsDataURL(file);
            } else {
              reject(new Error('未选择图片'));
            }
          };
          input.click();
        });
      }
    } catch (error) {
      console.error('选择图片失败:', error);
      throw error;
    }
  }
};

// 推送服务
const PushService = {
  // 初始化推送
  async initialize() {
    try {
      if (Capacitor.isNativePlatform()) {
        // 请求推送权限
        const { granted } = await PushNotifications.requestPermissions();
        if (granted) {
          // 注册推送
          await PushNotifications.register();
          
          // 监听推送事件
          PushNotifications.addListener('registration', (token) => {
            console.log('推送注册成功:', token.value);
            // 将token发送到服务器
          });
          
          PushNotifications.addListener('registrationError', (error) => {
            console.error('推送注册失败:', error);
          });
          
          PushNotifications.addListener('pushNotificationReceived', (notification) => {
            console.log('收到推送:', notification);
            // 处理推送通知
          });
          
          PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
            console.log('推送点击:', action);
            // 处理推送点击
          });
        }
      }
    } catch (error) {
      console.error('初始化推送失败:', error);
    }
  },

  // 获取推送token
  async getToken() {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await PushNotifications.getDeliveredNotifications();
        return result;
      }
      return [];
    } catch (error) {
      console.error('获取推送token失败:', error);
      return [];
    }
  }
};

// 设备服务
const DeviceService = {
  // 获取设备信息
  async getInfo() {
    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getInfo();
        return info;
      } else {
        return {
          platform: 'web',
          version: navigator.appVersion,
          model: navigator.userAgent
        };
      }
    } catch (error) {
      console.error('获取设备信息失败:', error);
      return {};
    }
  },

  // 获取电池信息
  async getBatteryInfo() {
    try {
      if (Capacitor.isNativePlatform()) {
        const info = await Device.getBatteryInfo();
        return info;
      } else {
        return {
          batteryLevel: 1,
          isCharging: true
        };
      }
    } catch (error) {
      console.error('获取电池信息失败:', error);
      return {};
    }
  }
};

// 存储服务
const StorageService = {
  // 存储数据
  async set(key, value) {
    try {
      if (Capacitor.isNativePlatform()) {
        await Storage.set({ key, value: JSON.stringify(value) });
      } else {
        localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.error('存储数据失败:', error);
      throw error;
    }
  },

  // 获取数据
  async get(key) {
    try {
      if (Capacitor.isNativePlatform()) {
        const result = await Storage.get({ key });
        return result.value ? JSON.parse(result.value) : null;
      } else {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      return null;
    }
  },

  // 删除数据
  async remove(key) {
    try {
      if (Capacitor.isNativePlatform()) {
        await Storage.remove({ key });
      } else {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('删除数据失败:', error);
      throw error;
    }
  },

  // 清空所有数据
  async clear() {
    try {
      if (Capacitor.isNativePlatform()) {
        await Storage.clear();
      } else {
        localStorage.clear();
      }
    } catch (error) {
      console.error('清空数据失败:', error);
      throw error;
    }
  }
};

// 网络服务
const NetworkService = {
  // 获取网络状态
  async getStatus() {
    try {
      if (Capacitor.isNativePlatform()) {
        const status = await Network.getStatus();
        return status;
      } else {
        return {
          connected: navigator.onLine,
          connectionType: navigator.onLine ? 'wifi' : 'none'
        };
      }
    } catch (error) {
      console.error('获取网络状态失败:', error);
      return { connected: false, connectionType: 'none' };
    }
  },

  // 监听网络变化
  async addListener(callback) {
    try {
      if (Capacitor.isNativePlatform()) {
        const listener = Network.addListener('networkStatusChange', (status) => {
          callback(status);
        });
        return listener;
      } else {
        window.addEventListener('online', () => {
          callback({ connected: true, connectionType: 'wifi' });
        });
        window.addEventListener('offline', () => {
          callback({ connected: false, connectionType: 'none' });
        });
        return {
          remove: () => {
            window.removeEventListener('online', () => {});
            window.removeEventListener('offline', () => {});
          }
        };
      }
    } catch (error) {
      console.error('添加网络监听失败:', error);
      throw error;
    }
  }
};

export {
  LocationService,
  CameraService,
  PushService,
  DeviceService,
  StorageService,
  NetworkService
};
const app = getApp();
const { showToast, showLoading, hideLoading, showModal, formatPrice, formatDistance } = require('../../utils/util');
const { isLoggedIn } = require('../../utils/storage');
const rideApi = require('../../utils/api').rideApi;

Page({
  data: {
    fromLocation: null,
    toLocation: null,
    rideType: 'economy',
    rideTypes: [
      { id: 'economy', name: '经济型', price: 1.0, icon: '🚗' },
      { id: 'comfort', name: '舒适型', price: 1.3, icon: '🚙' },
      { id: 'premium', name: '豪华型', price: 1.6, icon: '🚘' },
      { id: 'luxury', name: '尊贵型', price: 2.0, icon: '🏎️' },
    ],
    estimate: null,
    nearbyDrivers: 0,
    isLoading: false,
    isEstimating: false,
  },

  onLoad() {
    this.getCurrentLocation();
  },

  onShow() {
    if (this.data.fromLocation && this.data.toLocation) {
      this.estimatePrice();
    }
  },

  async getCurrentLocation() {
    try {
      showLoading('定位中...');

      const location = await this.getLocation();
      const address = await this.reverseGeocode(location);

      this.setData({
        fromLocation: {
          ...location,
          address: address,
        },
      });

      hideLoading();
    } catch (error) {
      hideLoading();
      showToast('获取位置失败，请手动选择');
    }
  },

  getLocation() {
    return new Promise((resolve, reject) => {
      wx.getLocation({
        type: 'gcj02',
        success: res => {
          resolve({ lat: res.latitude, lng: res.longitude });
        },
        fail: reject,
      });
    });
  },

  async reverseGeocode(location) {
    try {
      const res = await rideApi.reverseGeocode(location);
      return res.data.address;
    } catch (error) {
      return '当前位置';
    }
  },

  chooseFromLocation() {
    wx.chooseLocation({
      success: res => {
        this.setData({
          fromLocation: {
            lat: res.latitude,
            lng: res.longitude,
            address: res.address || res.name,
          },
        });

        if (this.data.toLocation) {
          this.estimatePrice();
        }
      },
    });
  },

  chooseToLocation() {
    wx.chooseLocation({
      success: res => {
        this.setData({
          toLocation: {
            lat: res.latitude,
            lng: res.longitude,
            address: res.address || res.name,
          },
        });

        if (this.data.fromLocation) {
          this.estimatePrice();
        }
      },
    });
  },

  swapLocations() {
    const { fromLocation, toLocation } = this.data;
    this.setData({
      fromLocation: toLocation,
      toLocation: fromLocation,
    });

    if (fromLocation && toLocation) {
      this.estimatePrice();
    }
  },

  selectRideType(e) {
    const { id } = e.currentTarget.dataset;
    this.setData({ rideType: id });

    if (this.data.fromLocation && this.data.toLocation) {
      this.estimatePrice();
    }
  },

  async estimatePrice() {
    const { fromLocation, toLocation, rideType, isEstimating } = this.data;

    if (isEstimating) { return; }

    this.setData({ isEstimating: true });

    try {
      const res = await rideApi.estimate({
        fromLat: fromLocation.lat,
        fromLng: fromLocation.lng,
        toLat: toLocation.lat,
        toLng: toLocation.lng,
        type: rideType,
      });

      this.setData({
        estimate: res.data,
        nearbyDrivers: res.data.nearbyDrivers || 0,
      });
    } catch (error) {
      console.error('预估价格失败:', error);
      showToast('预估价格失败');
    } finally {
      this.setData({ isEstimating: false });
    }
  },

  async requestRide() {
    if (!isLoggedIn()) {
      wx.navigateTo({ url: '/pages/login/login' });
      return;
    }

    const { fromLocation, toLocation, rideType, estimate, isLoading } = this.data;

    if (!fromLocation || !toLocation) {
      showToast('请选择出发地和目的地');
      return;
    }

    if (isLoading) { return; }

    const confirmed = await showModal('确认叫车', `预估费用: ¥${formatPrice(estimate.price)}\n距离: ${formatDistance(estimate.distance)}`);

    if (!confirmed) { return; }

    this.setData({ isLoading: true });

    try {
      const res = await rideApi.request({
        fromLat: fromLocation.lat,
        fromLng: fromLocation.lng,
        fromAddress: fromLocation.address,
        toLat: toLocation.lat,
        toLng: toLocation.lng,
        toAddress: toLocation.address,
        type: rideType,
        estimatedPrice: estimate.price,
      });

      showToast('叫车成功');

      setTimeout(() => {
        wx.redirectTo({
          url: `/pages/ride-detail/ride-detail?orderId=${res.data.orderId}`,
        });
      }, 1000);
    } catch (error) {
      console.error('叫车失败:', error);
    } finally {
      this.setData({ isLoading: false });
    }
  },

  goToHistory() {
    wx.navigateTo({ url: '/pages/ride-history/ride-history' });
  },
});

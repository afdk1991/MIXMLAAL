<template>
  <view class="dispatch-result-container">
    <view class="header">
      <text class="title">优化结果</text>
    </view>
    <view class="result-info">
      <view class="info-item">
        <text class="info-label">总距离</text>
        <text class="info-value">{{ optimizedRoute.totalDistance }} 米</text>
      </view>
      <view class="info-item">
        <text class="info-label">预计时间</text>
        <text class="info-value">{{ optimizedRoute.estimatedTime }} 分钟</text>
      </view>
      <view class="info-item">
        <text class="info-label">优化算法</text>
        <text class="info-value">{{ optimizedRoute.algorithm }}</text>
      </view>
    </view>
    <view class="route-list">
      <text class="section-title">优化路径</text>
      <view v-for="(address, index) in optimizedRoute.optimizedAddresses" :key="index" class="route-item">
        <view class="route-index">{{ index + 1 }}</view>
        <view class="route-info">
          <text class="route-name">{{ address.name }}</text>
          <text class="route-address">{{ address.address }}</text>
        </view>
      </view>
    </view>
    <view class="map-container">
      <text class="section-title">地图视图</text>
      <view class="map-placeholder">
        <text>地图将显示优化后的路径</text>
      </view>
    </view>
    <button @click="navigate" class="navigate-btn">开始导航</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      optimizedRoute: {
        totalDistance: 0,
        estimatedTime: 0,
        algorithm: '',
        optimizedAddresses: []
      }
    };
  },
  onLoad(options) {
    if (options.optimizedRoute) {
      this.optimizedRoute = JSON.parse(decodeURIComponent(options.optimizedRoute));
    }
  },
  methods: {
    navigate() {
      // 这里可以集成地图导航API，如高德地图、百度地图等
      uni.showToast({
        title: '导航功能开发中',
        icon: 'none'
      });
    }
  }
};
</script>

<style scoped>
.dispatch-result-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.result-info {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.info-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10rpx;
}

.info-label {
  font-size: 24rpx;
  color: #666666;
}

.info-value {
  font-size: 24rpx;
  color: #333333;
  font-weight: bold;
}

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.route-list {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.route-item {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
  padding: 10rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
}

.route-index {
  width: 40rpx;
  height: 40rpx;
  border-radius: 50%;
  background-color: #007AFF;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20rpx;
  font-weight: bold;
  margin-right: 10rpx;
}

.route-info {
  flex: 1;
}

.route-name {
  font-size: 24rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 5rpx;
  display: block;
}

.route-address {
  font-size: 20rpx;
  color: #666666;
  display: block;
}

.map-container {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.map-placeholder {
  width: 100%;
  height: 400rpx;
  background-color: #f0f0f0;
  border-radius: 5rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999999;
  font-size: 24rpx;
}

.navigate-btn {
  width: 100%;
  height: 80rpx;
  background-color: #4CD964;
  color: #ffffff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
}
</style>
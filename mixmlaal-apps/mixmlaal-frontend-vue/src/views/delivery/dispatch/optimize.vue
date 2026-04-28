<template>
  <view class="dispatch-optimize-container">
    <view class="header">
      <text class="title">路径优化</text>
    </view>
    <view class="address-select">
      <text class="section-title">选择地址</text>
      <view class="address-list">
        <view v-for="address in addresses" :key="address.id" class="address-item">
          <checkbox v-model="selectedAddresses" :value="address.id" class="checkbox" />
          <text class="address-text">{{ address.name }} - {{ address.address }}</text>
        </view>
      </view>
    </view>
    <view class="optimize-options">
      <text class="section-title">优化选项</text>
      <view class="option-item">
        <text class="option-label">优化算法</text>
        <picker
          v-model="optimizeOptions.algorithm"
          :range="algorithmOptions"
          class="picker"
        >
          <view class="picker-text">{{ optimizeOptions.algorithm }}</view>
        </picker>
      </view>
      <view class="option-item">
        <text class="option-label">起点</text>
        <input
          v-model="optimizeOptions.startPoint"
          type="text"
          placeholder="请输入起点地址"
          class="input"
        />
      </view>
      <view class="option-item">
        <text class="option-label">终点</text>
        <input
          v-model="optimizeOptions.endPoint"
          type="text"
          placeholder="请输入终点地址"
          class="input"
        />
      </view>
    </view>
    <button @click="optimizeRoute" class="optimize-btn">优化路径</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addresses: [],
      selectedAddresses: [],
      optimizeOptions: {
        algorithm: 'greedy',
        startPoint: '',
        endPoint: ''
      },
      algorithmOptions: ['greedy', 'genetic', 'cluster']
    };
  },
  onLoad() {
    this.loadAddresses();
  },
  methods: {
    async loadAddresses() {
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: 'http://localhost:3000/api/addresses',
          method: 'GET',
          header: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.code === 200) {
          this.addresses = response.data.data.items;
        } else {
          uni.showToast({
            title: '获取地址失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '获取地址失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    async optimizeRoute() {
      if (this.selectedAddresses.length === 0) {
        uni.showToast({
          title: '请选择至少一个地址',
          icon: 'none'
        });
        return;
      }
      
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: 'http://localhost:3000/api/dispatch/optimize',
          method: 'POST',
          header: {
            Authorization: `Bearer ${token}`
          },
          data: {
            addressIds: this.selectedAddresses,
            algorithm: this.optimizeOptions.algorithm,
            startPoint: this.optimizeOptions.startPoint,
            endPoint: this.optimizeOptions.endPoint
          }
        });
        
        if (response.data.code === 200) {
          uni.navigateTo({
            url: `/pages/dispatch/result?optimizedRoute=${encodeURIComponent(JSON.stringify(response.data.data))}`
          });
        } else {
          uni.showToast({
            title: '路径优化失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '路径优化失败，请稍后重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.dispatch-optimize-container {
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

.section-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.address-select {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.address-item {
  display: flex;
  align-items: center;
  padding: 10rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
}

.checkbox {
  margin-right: 10rpx;
}

.address-text {
  font-size: 24rpx;
  color: #333333;
  flex: 1;
}

.optimize-options {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.option-item {
  margin-bottom: 20rpx;
}

.option-label {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.picker {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
}

.picker-text {
  font-size: 24rpx;
  color: #333333;
}

.optimize-btn {
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
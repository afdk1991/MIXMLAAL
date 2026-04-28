<template>
  <view class="address-import-container">
    <view class="import-guide">
      <text class="guide-title">批量导入地址</text>
      <text class="guide-text">支持Excel、CSV、TXT格式文件</text>
      <text class="guide-text">文件格式要求：</text>
      <text class="guide-text">1. 包含字段：姓名、电话、地址</text>
      <text class="guide-text">2. 可选字段：优先级、配送时间</text>
    </view>
    <view class="file-upload">
      <button @click="chooseFile" class="upload-btn">选择文件</button>
      <text v-if="fileInfo" class="file-info">{{ fileInfo.name }}</text>
    </view>
    <view class="options">
      <view class="option-item">
        <text class="option-label">是否覆盖现有地址</text>
        <switch v-model="options.overwrite" />
      </view>
      <view class="option-item">
        <text class="option-label">是否自动地理编码</text>
        <switch v-model="options.geocode" />
      </view>
    </view>
    <button @click="importAddress" class="import-btn">导入</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      fileInfo: null,
      options: {
        overwrite: false,
        geocode: true
      }
    };
  },
  methods: {
    chooseFile() {
      uni.chooseFile({
        count: 1,
        extension: ['.xlsx', '.xls', '.csv', '.txt'],
        success: (res) => {
          this.fileInfo = res.tempFiles[0];
        }
      });
    },
    async importAddress() {
      if (!this.fileInfo) {
        uni.showToast({
          title: '请选择文件',
          icon: 'none'
        });
        return;
      }
      
      try {
        const token = uni.getStorageSync('token');
        const formData = new FormData();
        formData.append('file', this.fileInfo);
        formData.append('overwrite', this.options.overwrite);
        formData.append('geocode', this.options.geocode);
        
        const response = await uni.request({
          url: 'http://localhost:3000/api/addresses/batch-import',
          method: 'POST',
          header: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          },
          data: formData
        });
        
        if (response.data.code === 200) {
          uni.showToast({
            title: '导入成功',
            icon: 'success'
          });
          uni.navigateBack();
        } else {
          uni.showToast({
            title: '导入失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '导入失败，请稍后重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.address-import-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.import-guide {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.guide-title {
  font-size: 28rpx;
  font-weight: bold;
  color: #333333;
  margin-bottom: 10rpx;
  display: block;
}

.guide-text {
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
  display: block;
}

.file-upload {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.upload-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-bottom: 10rpx;
}

.file-info {
  font-size: 24rpx;
  color: #666666;
  display: block;
  text-align: center;
}

.options {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.option-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.option-label {
  font-size: 24rpx;
  color: #333333;
}

.import-btn {
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
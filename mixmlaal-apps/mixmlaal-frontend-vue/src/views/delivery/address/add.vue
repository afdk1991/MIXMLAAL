<template>
  <view class="address-add-container">
    <view class="form-item">
      <text class="label">收货人</text>
      <input
        v-model="form.name"
        type="text"
        placeholder="请输入收货人姓名"
        class="input"
      />
    </view>
    <view class="form-item">
      <text class="label">联系电话</text>
      <input
        v-model="form.phone"
        type="number"
        placeholder="请输入联系电话"
        class="input"
      />
    </view>
    <view class="form-item">
      <text class="label">详细地址</text>
      <textarea
        v-model="form.address"
        placeholder="请输入详细地址"
        class="textarea"
      ></textarea>
    </view>
    <view class="form-item">
      <text class="label">优先级</text>
      <picker
        v-model="form.priority"
        :range="priorityOptions"
        class="picker"
      >
        <view class="picker-text">{{ form.priority }}</view>
      </picker>
    </view>
    <view class="form-item">
      <text class="label">配送时间</text>
      <input
        v-model="form.deliveryTime"
        type="text"
        placeholder="请输入配送时间，如 9:00-11:00"
        class="input"
      />
    </view>
    <view class="form-item">
      <view class="checkbox-container">
        <checkbox v-model="form.isDefault" class="checkbox" />
        <text class="checkbox-label">设为默认地址</text>
      </view>
    </view>
    <button @click="saveAddress" class="save-btn">保存</button>
  </view>
</template>

<script>
export default {
  data() {
    return {
      form: {
        name: '',
        phone: '',
        address: '',
        priority: 'medium',
        deliveryTime: '',
        isDefault: false
      },
      priorityOptions: ['high', 'medium', 'low'],
      addressId: null
    };
  },
  onLoad(options) {
    if (options.id) {
      this.addressId = options.id;
      this.loadAddress(options.id);
    }
  },
  methods: {
    async loadAddress(id) {
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: `http://localhost:3000/api/addresses/${id}`,
          method: 'GET',
          header: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.code === 200) {
          this.form = response.data.data;
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
    async saveAddress() {
      if (!this.form.name || !this.form.phone || !this.form.address) {
        uni.showToast({
          title: '请填写完整信息',
          icon: 'none'
        });
        return;
      }
      
      try {
        const token = uni.getStorageSync('token');
        let response;
        
        if (this.addressId) {
          // 编辑地址
          response = await uni.request({
            url: `http://localhost:3000/api/addresses/${this.addressId}`,
            method: 'PUT',
            header: {
              Authorization: `Bearer ${token}`
            },
            data: this.form
          });
        } else {
          // 添加地址
          response = await uni.request({
            url: 'http://localhost:3000/api/addresses',
            method: 'POST',
            header: {
              Authorization: `Bearer ${token}`
            },
            data: this.form
          });
        }
        
        if (response.data.code === 200) {
          uni.showToast({
            title: this.addressId ? '更新成功' : '添加成功',
            icon: 'success'
          });
          uni.navigateBack();
        } else {
          uni.showToast({
            title: this.addressId ? '更新失败' : '添加失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '保存失败，请稍后重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.address-add-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.form-item {
  background-color: #ffffff;
  padding: 20rpx;
  margin-bottom: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.label {
  display: block;
  font-size: 24rpx;
  color: #333333;
  margin-bottom: 10rpx;
  font-weight: bold;
}

.input {
  width: 100%;
  height: 80rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 0 20rpx;
  font-size: 24rpx;
}

.textarea {
  width: 100%;
  height: 120rpx;
  border: 1rpx solid #e5e5e5;
  border-radius: 5rpx;
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  resize: none;
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

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox {
  margin-right: 10rpx;
}

.checkbox-label {
  font-size: 24rpx;
  color: #333333;
}

.save-btn {
  width: 100%;
  height: 80rpx;
  background-color: #007AFF;
  color: #ffffff;
  border: none;
  border-radius: 10rpx;
  font-size: 28rpx;
  font-weight: bold;
  margin-top: 20rpx;
}
</style>
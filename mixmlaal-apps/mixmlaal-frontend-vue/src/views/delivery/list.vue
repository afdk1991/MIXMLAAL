<template>
  <view class="address-list-container">
    <view class="header">
      <text class="title">地址管理</text>
      <view class="header-right">
        <button @click="goToAdd" class="add-btn">添加</button>
        <button @click="goToImport" class="import-btn">批量导入</button>
      </view>
    </view>
    <view class="address-list">
      <view v-for="address in addresses" :key="address.id" class="address-item">
        <view class="address-info">
          <view class="address-header">
            <text class="name">{{ address.name }}</text>
            <text class="phone">{{ address.phone }}</text>
            <text v-if="address.isDefault" class="default-tag">默认</text>
          </view>
          <text class="address-detail">{{ address.address }}</text>
          <text v-if="address.deliveryTime" class="delivery-time">配送时间: {{ address.deliveryTime }}</text>
        </view>
        <view class="address-actions">
          <button @click="editAddress(address)" class="edit-btn">编辑</button>
          <button @click="deleteAddress(address.id)" class="delete-btn">删除</button>
          <button v-if="!address.isDefault" @click="setDefault(address.id)" class="default-btn">设为默认</button>
        </view>
      </view>
      <view v-if="addresses.length === 0" class="empty">
        <text>暂无地址，请添加地址</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      addresses: []
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
    goToAdd() {
      uni.navigateTo({
        url: '/pages/address/add'
      });
    },
    goToImport() {
      uni.navigateTo({
        url: '/pages/address/import'
      });
    },
    editAddress(address) {
      uni.navigateTo({
        url: `/pages/address/add?id=${address.id}`
      });
    },
    async deleteAddress(id) {
      uni.showModal({
        title: '删除地址',
        content: '确定要删除这个地址吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync('token');
              const response = await uni.request({
                url: `http://localhost:3000/api/addresses/${id}`,
                method: 'DELETE',
                header: {
                  Authorization: `Bearer ${token}`
                }
              });
              
              if (response.data.code === 200) {
                uni.showToast({
                  title: '删除成功',
                  icon: 'success'
                });
                this.loadAddresses();
              } else {
                uni.showToast({
                  title: '删除失败',
                  icon: 'none'
                });
              }
            } catch (error) {
              uni.showToast({
                title: '删除失败，请稍后重试',
                icon: 'none'
              });
            }
          }
        }
      });
    },
    async setDefault(id) {
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: `http://localhost:3000/api/addresses/${id}`,
          method: 'PUT',
          header: {
            Authorization: `Bearer ${token}`
          },
          data: {
            isDefault: true
          }
        });
        
        if (response.data.code === 200) {
          uni.showToast({
            title: '设置默认地址成功',
            icon: 'success'
          });
          this.loadAddresses();
        } else {
          uni.showToast({
            title: '设置默认地址失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '设置默认地址失败，请稍后重试',
          icon: 'none'
        });
      }
    }
  }
};
</script>

<style scoped>
.address-list-container {
  padding: 20rpx;
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20rpx;
}

.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #333333;
}

.header-right {
  display: flex;
  gap: 10rpx;
}

.add-btn, .import-btn {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  border-radius: 5rpx;
}

.add-btn {
  background-color: #007AFF;
  color: #ffffff;
}

.import-btn {
  background-color: #4CD964;
  color: #ffffff;
}

.address-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.address-item {
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.address-info {
  margin-bottom: 20rpx;
}

.address-header {
  display: flex;
  align-items: center;
  margin-bottom: 10rpx;
}

.name {
  font-size: 28rpx;
  font-weight: bold;
  margin-right: 20rpx;
}

.phone {
  font-size: 24rpx;
  color: #666666;
  margin-right: 20rpx;
}

.default-tag {
  font-size: 20rpx;
  color: #007AFF;
  border: 1rpx solid #007AFF;
  border-radius: 5rpx;
  padding: 2rpx 10rpx;
}

.address-detail {
  font-size: 24rpx;
  color: #333333;
  margin-bottom: 10rpx;
  line-height: 1.5;
}

.delivery-time {
  font-size: 20rpx;
  color: #999999;
}

.address-actions {
  display: flex;
  gap: 10rpx;
}

.edit-btn, .delete-btn, .default-btn {
  flex: 1;
  padding: 10rpx;
  font-size: 24rpx;
  border-radius: 5rpx;
}

.edit-btn {
  background-color: #f0f0f0;
  color: #333333;
}

.delete-btn {
  background-color: #FF3B30;
  color: #ffffff;
}

.default-btn {
  background-color: #4CD964;
  color: #ffffff;
}

.empty {
  background-color: #ffffff;
  padding: 40rpx;
  border-radius: 10rpx;
  text-align: center;
  color: #999999;
  font-size: 24rpx;
}
</style>
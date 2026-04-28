<template>
  <view class="order-list-container">
    <view class="header">
      <text class="title">订单管理</text>
      <button @click="createOrder" class="create-btn">创建订单</button>
    </view>
    <view class="order-list">
      <view v-for="order in orders" :key="order.id" class="order-item">
        <view class="order-header">
          <text class="order-id">订单号: {{ order.orderId }}</text>
          <text :class="['order-status', order.status]" v-if="order.status">{{ getStatusText(order.status) }}</text>
        </view>
        <view class="order-info">
          <text class="info-item">收货人: {{ order.recipientName }}</text>
          <text class="info-item">联系电话: {{ order.recipientPhone }}</text>
          <text class="info-item">收货地址: {{ order.recipientAddress }}</text>
          <text class="info-item">配送时间: {{ order.deliveryTime }}</text>
          <text class="info-item">订单金额: ¥{{ order.amount }}</text>
        </view>
        <view class="order-actions">
          <button @click="viewOrder(order.id)" class="view-btn">查看</button>
          <button @click="updateOrder(order)" class="update-btn">更新</button>
          <button @click="deleteOrder(order.id)" class="delete-btn">删除</button>
        </view>
      </view>
      <view v-if="orders.length === 0" class="empty">
        <text>暂无订单，请创建订单</text>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      orders: []
    };
  },
  onLoad() {
    this.loadOrders();
  },
  methods: {
    async loadOrders() {
      try {
        const token = uni.getStorageSync('token');
        const response = await uni.request({
          url: 'http://localhost:3000/api/orders',
          method: 'GET',
          header: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.code === 200) {
          this.orders = response.data.data.items;
        } else {
          uni.showToast({
            title: '获取订单失败',
            icon: 'none'
          });
        }
      } catch (error) {
        uni.showToast({
          title: '获取订单失败，请稍后重试',
          icon: 'none'
        });
      }
    },
    createOrder() {
      uni.navigateTo({
        url: '/pages/order/detail'
      });
    },
    viewOrder(id) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${id}`
      });
    },
    updateOrder(order) {
      uni.navigateTo({
        url: `/pages/order/detail?id=${order.id}`
      });
    },
    async deleteOrder(id) {
      uni.showModal({
        title: '删除订单',
        content: '确定要删除这个订单吗？',
        success: async (res) => {
          if (res.confirm) {
            try {
              const token = uni.getStorageSync('token');
              const response = await uni.request({
                url: `http://localhost:3000/api/orders/${id}`,
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
                this.loadOrders();
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
    getStatusText(status) {
      const statusMap = {
        'pending': '待处理',
        'processing': '处理中',
        'delivering': '配送中',
        'completed': '已完成',
        'cancelled': '已取消'
      };
      return statusMap[status] || status;
    }
  }
};
</script>

<style scoped>
.order-list-container {
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

.create-btn {
  padding: 10rpx 20rpx;
  font-size: 24rpx;
  background-color: #007AFF;
  color: #ffffff;
  border-radius: 5rpx;
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.order-item {
  background-color: #ffffff;
  padding: 20rpx;
  border-radius: 10rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10rpx;
  padding-bottom: 10rpx;
  border-bottom: 1rpx solid #e5e5e5;
}

.order-id {
  font-size: 24rpx;
  color: #333333;
  font-weight: bold;
}

.order-status {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 5rpx;
}

.order-status.pending {
  background-color: #f0f0f0;
  color: #666666;
}

.order-status.processing {
  background-color: #fff3e0;
  color: #ff9800;
}

.order-status.delivering {
  background-color: #e3f2fd;
  color: #2196f3;
}

.order-status.completed {
  background-color: #e8f5e8;
  color: #4caf50;
}

.order-status.cancelled {
  background-color: #ffebee;
  color: #f44336;
}

.order-info {
  margin-bottom: 20rpx;
}

.info-item {
  display: block;
  font-size: 24rpx;
  color: #666666;
  margin-bottom: 10rpx;
}

.order-actions {
  display: flex;
  gap: 10rpx;
}

.view-btn, .update-btn, .delete-btn {
  flex: 1;
  padding: 10rpx;
  font-size: 24rpx;
  border-radius: 5rpx;
}

.view-btn {
  background-color: #f0f0f0;
  color: #333333;
}

.update-btn {
  background-color: #007AFF;
  color: #ffffff;
}

.delete-btn {
  background-color: #FF3B30;
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
<template>
  <div class="order-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('order.title') }}</h1>
      </header>

      <div class="tabs">
        <button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: activeTab === tab.value }"
          @click="activeTab = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>

      <div class="order-list" v-if="orders.length > 0">
        <div v-for="order in filteredOrders" :key="order.id" class="order-card" @click="goToDetail(order.id)">
          <div class="order-header">
            <span class="order-id">订单号: {{ order.orderId }}</span>
            <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
          </div>
          <div class="order-items">
            <div v-for="item in order.items" :key="item.id" class="order-item">
              <img :src="item.image" :alt="item.name" />
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p>×{{ item.quantity }}</p>
              </div>
              <span class="item-price">¥{{ item.price }}</span>
            </div>
          </div>
          <div class="order-footer">
            <span class="total">合计: ¥{{ order.total }}</span>
            <div class="actions">
              <button v-if="order.status === 'pending'" class="btn-pay" @click.stop="payOrder(order.id)">
                {{ $t('order.pay') }}
              </button>
              <button v-if="order.status === 'delivered'" class="btn-confirm" @click.stop="confirmOrder(order.id)">
                {{ $t('order.confirmReceive') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <div class="empty-icon">📦</div>
        <p>{{ $t('order.empty') }}</p>
        <button @click="goShopping">{{ $t('order.goShopping') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Order',
  data() {
    return {
      activeTab: 'all',
      tabs: [
        { label: '全部', value: 'all' },
        { label: '待支付', value: 'pending' },
        { label: '待发货', value: 'paid' },
        { label: '待收货', value: 'shipped' },
        { label: '已完成', value: 'completed' },
      ],
      orders: [],
    };
  },
  computed: {
    filteredOrders() {
      if (this.activeTab === 'all') return this.orders;
      return this.orders.filter(o => o.status === this.activeTab);
    },
  },
  methods: {
    getStatusText(status) {
      const map = {
        pending: '待支付',
        paid: '已支付',
        shipped: '待收货',
        completed: '已完成',
        cancelled: '已取消',
      };
      return map[status] || status;
    },
    goToDetail(id) {
      this.$router.push(`/order/${id}`);
    },
    payOrder(id) {
      console.log('Pay order:', id);
    },
    confirmOrder(id) {
      console.log('Confirm order:', id);
    },
    goShopping() {
      this.$router.push('/mall');
    },
  },
};
</script>

<style scoped>
.order-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  padding: 30px 20px;
  background: white;
}

.page-header h1 {
  font-size: 24px;
  color: #333;
}

.tabs {
  display: flex;
  background: white;
  margin-bottom: 15px;
  overflow-x: auto;
}

.tabs button {
  flex: 1;
  padding: 15px 10px;
  background: none;
  border: none;
  font-size: 14px;
  color: #666;
  position: relative;
}

.tabs button.active {
  color: #667eea;
  font-weight: 600;
}

.tabs button.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 3px;
  background: #667eea;
  border-radius: 2px;
}

.order-list {
  padding: 0 15px;
}

.order-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
  cursor: pointer;
}

.order-header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
  border-bottom: 1px solid #f0f0f0;
}

.order-id {
  font-size: 14px;
  color: #999;
}

.order-status {
  font-size: 14px;
  color: #667eea;
}

.order-status.completed {
  color: #4caf50;
}

.order-items {
  padding: 15px;
}

.order-item {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.order-item img {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
}

.item-info p {
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #333;
}

.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px;
  border-top: 1px solid #f0f0f0;
}

.total {
  font-size: 16px;
  color: #ff6b6b;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 10px;
}

.actions button {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.btn-pay {
  background: #667eea;
  color: white;
  border: none;
}

.btn-confirm {
  background: #fff;
  color: #667eea;
  border: 1px solid #667eea;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #999;
  margin-bottom: 30px;
}

.empty-state button {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
}
</style>
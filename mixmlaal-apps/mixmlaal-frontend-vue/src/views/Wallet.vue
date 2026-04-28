<template>
  <div class="wallet-page">
    <div class="container">
      <header class="wallet-header">
        <div class="balance-section">
          <span class="label">{{ $t('wallet.balance') }}</span>
          <span class="amount">¥{{ balance }}</span>
        </div>
        <div class="actions">
          <button class="btn-recharge" @click="showRecharge = true">{{ $t('wallet.recharge') }}</button>
          <button class="btn-withdraw" @click="showWithdraw = true">{{ $t('wallet.withdraw') }}</button>
        </div>
      </header>

      <div class="quick-actions">
        <div class="action-item" @click="$router.push('/wallet/transactions')">
          <span class="icon">📜</span>
          <span>{{ $t('wallet.transactions') }}</span>
        </div>
        <div class="action-item" @click="$router.push('/wallet/coupons')">
          <span class="icon">🎫</span>
          <span>{{ $t('wallet.coupons') }}</span>
        </div>
        <div class="action-item" @click="$router.push('/wallet/cards')">
          <span class="icon">💳</span>
          <span>{{ $t('wallet.cards') }}</span>
        </div>
      </div>

      <section class="transactions-section">
        <h2>{{ $t('wallet.recentTransactions') }}</h2>
        <div class="transaction-list">
          <div v-for="item in transactions" :key="item.id" class="transaction-item">
            <div class="transaction-icon" :class="item.type">
              {{ item.type === 'income' ? '↑' : '↓' }}
            </div>
            <div class="transaction-info">
              <h4>{{ item.title }}</h4>
              <p>{{ item.time }}</p>
            </div>
            <div class="transaction-amount" :class="item.type">
              {{ item.type === 'income' ? '+' : '-' }}¥{{ item.amount }}
            </div>
          </div>
        </div>
        <button class="view-more" @click="$router.push('/wallet/transactions')">
          {{ $t('wallet.viewMore') }}
        </button>
      </section>

      <div v-if="showRecharge" class="modal">
        <div class="modal-content">
          <h3>{{ $t('wallet.recharge') }}</h3>
          <div class="amount-options">
            <button
              v-for="amt in [10, 50, 100, 200, 500]"
              :key="amt"
              :class="{ active: rechargeAmount === amt }"
              @click="rechargeAmount = amt"
            >
              ¥{{ amt }}
            </button>
          </div>
          <button class="btn-confirm" @click="handleRecharge">{{ $t('wallet.confirm') }}</button>
          <button class="btn-close" @click="showRecharge = false">×</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Wallet',
  data() {
    return {
      balance: '0.00',
      transactions: [],
      showRecharge: false,
      showWithdraw: false,
      rechargeAmount: 10,
    };
  },
  mounted() {
    this.loadWalletData();
  },
  methods: {
    async loadWalletData() {
      this.balance = '0.00';
      this.transactions = [];
    },
    async handleRecharge() {
      this.showRecharge = false;
    },
  },
};
</script>

<style scoped>
.wallet-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.wallet-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  color: white;
}

.balance-section {
  text-align: center;
  margin-bottom: 30px;
}

.balance-section .label {
  font-size: 14px;
  opacity: 0.9;
}

.balance-section .amount {
  font-size: 48px;
  font-weight: 700;
}

.actions {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.actions button {
  padding: 12px 30px;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  border: none;
}

.btn-recharge {
  background: white;
  color: #667eea;
}

.btn-withdraw {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.quick-actions {
  display: flex;
  background: white;
  padding: 20px;
  margin-top: -20px;
  border-radius: 20px 20px 0 0;
}

.action-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.action-item .icon {
  font-size: 28px;
}

.action-item span:last-child {
  font-size: 14px;
  color: #333;
}

.transactions-section {
  background: white;
  padding: 30px;
  margin-top: 20px;
  border-radius: 20px;
}

.transactions-section h2 {
  font-size: 18px;
  color: #333;
  margin-bottom: 20px;
}

.transaction-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.transaction-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.transaction-icon.income {
  background: #e8f5e9;
  color: #4caf50;
}

.transaction-icon.expense {
  background: #ffebee;
  color: #f44336;
}

.transaction-info {
  flex: 1;
}

.transaction-info h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 4px;
}

.transaction-info p {
  font-size: 12px;
  color: #999;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount.income {
  color: #4caf50;
}

.transaction-amount.expense {
  color: #333;
}

.view-more {
  width: 100%;
  padding: 12px;
  background: #f5f7fa;
  border: none;
  border-radius: 8px;
  margin-top: 20px;
  cursor: pointer;
  color: #667eea;
  font-size: 14px;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 30px;
  border-radius: 20px;
  width: 90%;
  max-width: 400px;
  position: relative;
}

.modal-content h3 {
  text-align: center;
  margin-bottom: 20px;
}

.amount-options {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
}

.amount-options button {
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  cursor: pointer;
}

.amount-options button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.btn-confirm {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}

.btn-close {
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
}
</style>
<template>
  <div class="finance-container">
    <div class="header">
      <van-icon name="arrow-left" class="back-icon" @click="goBack" />
      <h2>财务管理</h2>
    </div>

    <div class="balance-card">
      <div class="balance-info">
        <div class="balance-label">账户余额</div>
        <div class="balance-value">¥{{ balance }}</div>
      </div>
      <van-button type="primary" @click="goToWithdraw" class="withdraw-btn">
        提现
      </van-button>
    </div>

    <div class="stats-card">
      <div class="stat-item">
        <span class="stat-value">¥{{ todayIncome }}</span>
        <span class="stat-label">今日收入</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">¥{{ monthIncome }}</span>
        <span class="stat-label">本月收入</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">¥{{ totalIncome }}</span>
        <span class="stat-label">总收入</span>
      </div>
    </div>

    <div class="record-section">
      <div class="section-header">
        <span>收支记录</span>
        <van-icon name="arrow-right" />
      </div>
      <div class="record-list">
        <div class="record-item" v-for="record in records" :key="record.id">
          <div class="record-info">
            <span class="record-type">{{ record.type }}</span>
            <span class="record-time">{{ record.time }}</span>
          </div>
          <span class="record-amount" :class="record.amount > 0 ? 'income' : 'expense'">
            {{ record.amount > 0 ? '+' : '' }}¥{{ Math.abs(record.amount) }}
          </span>
        </div>
        <van-empty v-if="!records.length" description="暂无记录" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../api'

const router = useRouter()

const balance = ref(1280.50)
const todayIncome = ref(280.50)
const monthIncome = ref(8500.00)
const totalIncome = ref(125000.00)

const records = ref([
  { id: 1, type: '出行订单收入', time: '2024-01-01 10:30', amount: 88.00 },
  { id: 2, type: '配送订单收入', time: '2024-01-01 09:15', amount: 15.00 },
  { id: 3, type: '提现', time: '2023-12-31 18:00', amount: -1000.00 }
])

onMounted(() => {
  getFinanceData()
})

const getFinanceData = async () => {
  try {
    // 模拟数据
  } catch (error) {
    console.error('获取财务数据失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const goToWithdraw = () => {
  router.push('/finance/withdraw')
}
</script>

<style scoped>
.finance-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 60px;
}

.header {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 15px;
  color: #fff;
}

.back-icon {
  font-size: 20px;
}

.header h2 {
  font-size: 18px;
  font-weight: normal;
}

.balance-card {
  background: #fff;
  margin: 15px;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  flex: 1;
}

.balance-label {
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
}

.balance-value {
  font-size: 28px;
  font-weight: bold;
  color: #333;
}

.withdraw-btn {
  border-radius: 20px;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border: none;
  padding: 8px 20px;
}

.stats-card {
  background: #fff;
  margin: 0 15px 15px;
  padding: 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-around;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.stat-value {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.stat-label {
  font-size: 12px;
  color: #999;
}

.record-section {
  background: #fff;
  margin: 0 15px 15px;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  padding: 15px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f5f5f5;
}

.section-header span {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.record-list {
  padding: 15px;
}

.record-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #f5f5f5;
}

.record-item:last-child {
  border-bottom: none;
}

.record-info {
  flex: 1;
}

.record-type {
  font-size: 14px;
  color: #333;
  margin-bottom: 5px;
  display: block;
}

.record-time {
  font-size: 12px;
  color: #999;
}

.record-amount {
  font-size: 16px;
  font-weight: bold;
}

.record-amount.income {
  color: #52c41a;
}

.record-amount.expense {
  color: #f5576c;
}
</style>
<template>
  <div class="withdraw">
    <van-nav-bar title="提现" left-text="返回" left-arrow @click-left="goBack" />
    
    <div class="balance-info">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>账户余额</span>
          </div>
        </template>
        <div class="balance-value">¥{{ balance.available.toFixed(2) }}</div>
        <div class="balance-detail">
          <span>冻结金额: ¥{{ balance.frozen.toFixed(2) }}</span>
        </div>
      </van-card>
    </div>
    
    <div class="withdraw-form">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>提现申请</span>
          </div>
        </template>
        <van-form @submit="submitWithdraw">
          <van-field
            v-model="withdrawForm.amount"
            name="amount"
            label="提现金额"
            placeholder="请输入提现金额"
            type="number"
            :rules="[{ required: true, message: '请输入提现金额' }, { type: 'number', min: 0.01, message: '提现金额必须大于0' }]"
          >
            <template #input>
              <div class="amount-input">
                <span class="currency">¥</span>
                <input
                  v-model="withdrawForm.amount"
                  type="number"
                  placeholder="请输入提现金额"
                  step="0.01"
                  min="0.01"
                />
              </div>
            </template>
          </van-field>
          <van-field
            v-model="withdrawForm.method"
            name="method"
            label="提现方式"
            placeholder="选择提现方式"
            :rules="[{ required: true, message: '请选择提现方式' }]"
          >
            <template #input>
              <van-picker
                v-model="withdrawForm.method"
                :columns="methodColumns"
                @confirm="onMethodConfirm"
                @cancel="onMethodCancel"
              />
            </template>
          </van-field>
          <van-field
            v-model="withdrawForm.account"
            name="account"
            label="收款账户"
            placeholder="请输入收款账户"
            :rules="[{ required: true, message: '请输入收款账户' }]"
          />
          <van-field
            v-model="withdrawForm.accountName"
            name="accountName"
            label="账户名称"
            placeholder="请输入账户名称"
            :rules="[{ required: true, message: '请输入账户名称' }]"
          />
          <div class="form-tip">
            <p>提现规则：</p>
            <p>1. 最低提现金额为10元</p>
            <p>2. 提现到账时间为1-3个工作日</p>
            <p>3. 每笔提现收取1元手续费</p>
          </div>
          <div class="submit-button">
            <van-button type="primary" block native-type="submit">提交提现</van-button>
          </div>
        </van-form>
      </van-card>
    </div>
    
    <div class="withdraw-history">
      <van-card>
        <template #header>
          <div class="card-header">
            <span>提现记录</span>
          </div>
        </template>
        <van-list
          v-model:loading="loading"
          :finished="finished"
          finished-text="没有更多了"
          @load="onLoad"
        >
          <van-cell v-for="(item, index) in withdrawHistory" :key="index" :title="`提现 ¥${item.amount.toFixed(2)}`" :value="item.status">
            <template #extra>
              <div class="history-item">
                <div class="history-time">{{ item.createdAt }}</div>
                <van-tag :color="getStatusColor(item.status)">{{ item.status }}</van-tag>
              </div>
            </template>
          </van-cell>
        </van-list>
      </van-card>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Withdraw',
  setup() {
    const router = useRouter()
    
    const balance = ref({
      available: 5280.50,
      frozen: 800.00
    })
    
    const withdrawForm = ref({
      amount: '',
      method: 'alipay',
      account: '',
      accountName: ''
    })
    
    const methodColumns = [
      { text: '支付宝', value: 'alipay' },
      { text: '微信', value: 'wechat' },
      { text: '银行卡', value: 'bank' }
    ]
    
    const withdrawHistory = ref([
      {
        id: 1,
        amount: 1000.00,
        method: 'alipay',
        status: '已完成',
        createdAt: '2026-04-20 10:00:00'
      },
      {
        id: 2,
        amount: 500.00,
        method: 'wechat',
        status: '已完成',
        createdAt: '2026-04-15 14:30:00'
      },
      {
        id: 3,
        amount: 800.00,
        method: 'alipay',
        status: '处理中',
        createdAt: '2026-04-23 09:00:00'
      }
    ])
    
    const loading = ref(false)
    const finished = ref(false)
    
    const goBack = () => {
      router.back()
    }
    
    const onMethodConfirm = (value) => {
      withdrawForm.value.method = value
    }
    
    const onMethodCancel = () => {
      // 取消选择
    }
    
    const getStatusColor = (status) => {
      if (status === '已完成') {
        return '#4caf50'
      } else if (status === '处理中') {
        return '#ff9800'
      } else if (status === '失败') {
        return '#f44336'
      }
      return '#9e9e9e'
    }
    
    const submitWithdraw = () => {
      // 实际项目中这里应该调用API提交提现申请
      console.log('提交提现申请:', withdrawForm.value)
      // 模拟提交成功
      alert('提现申请提交成功')
      withdrawForm.value = {
        amount: '',
        method: 'alipay',
        account: '',
        accountName: ''
      }
    }
    
    const onLoad = () => {
      // 模拟加载更多数据
      setTimeout(() => {
        loading.value = false
        finished.value = true
      }, 1000)
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取余额和提现记录
    })
    
    return {
      balance,
      withdrawForm,
      methodColumns,
      withdrawHistory,
      loading,
      finished,
      goBack,
      onMethodConfirm,
      onMethodCancel,
      getStatusColor,
      submitWithdraw,
      onLoad
    }
  }
}
</script>

<style scoped>
.withdraw {
  padding-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  margin-bottom: 10px;
}

.balance-value {
  font-size: 36px;
  font-weight: bold;
  color: #409eff;
  text-align: center;
  margin-top: 10px;
}

.balance-detail {
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.withdraw-form {
  margin-bottom: 10px;
}

.amount-input {
  display: flex;
  align-items: center;
}

.currency {
  margin-right: 10px;
  font-size: 16px;
  color: #333;
}

.form-tip {
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
  color: #666;
}

.form-tip p {
  margin: 5px 0;
}

.submit-button {
  margin-top: 20px;
}

.withdraw-history {
  margin-top: 10px;
}

.history-item {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.history-time {
  font-size: 12px;
  color: #999;
  margin-bottom: 5px;
}
</style>
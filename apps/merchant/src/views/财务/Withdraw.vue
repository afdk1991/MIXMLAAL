<template>
  <div class="finance-withdraw">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>提现管理</span>
        </div>
      </template>
      
      <div class="balance-info">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>账户余额</span>
            </div>
          </template>
          <div class="balance-value">¥{{ balance.available.toFixed(2) }}</div>
          <div class="balance-detail">
            <span>冻结金额: ¥{{ balance.frozen.toFixed(2) }}</span>
            <span>总金额: ¥{{ (balance.available + balance.frozen).toFixed(2) }}</span>
          </div>
        </el-card>
      </div>
      
      <div class="withdraw-form">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>申请提现</span>
            </div>
          </template>
          <el-form :model="withdrawForm" :rules="withdrawRules" ref="withdrawFormRef" label-width="120px">
            <el-form-item label="提现金额" prop="amount">
              <el-input v-model="withdrawForm.amount" type="number" placeholder="请输入提现金额">
                <template #append>¥</template>
              </el-input>
              <div class="form-tip">可用余额: ¥{{ balance.available.toFixed(2) }}</div>
            </el-form-item>
            <el-form-item label="提现方式" prop="method">
              <el-select v-model="withdrawForm.method" placeholder="选择提现方式">
                <el-option label="支付宝" value="alipay"></el-option>
                <el-option label="微信" value="wechat"></el-option>
                <el-option label="银行转账" value="bank"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="收款账户" prop="account">
              <el-input v-model="withdrawForm.account" placeholder="请输入收款账户"></el-input>
            </el-form-item>
            <el-form-item label="账户名称" prop="accountName">
              <el-input v-model="withdrawForm.accountName" placeholder="请输入账户名称"></el-input>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="submitWithdraw">提交提现</el-button>
              <el-button @click="resetForm">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </div>
      
      <div class="withdraw-history">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>提现记录</span>
            </div>
          </template>
          <el-table :data="withdrawHistory" style="width: 100%">
            <el-table-column prop="id" label="提现编号" width="180"></el-table-column>
            <el-table-column prop="amount" label="提现金额" width="120" align="right">
              <template #default="scope">
                ¥{{ scope.row.amount.toFixed(2) }}
              </template>
            </el-table-column>
            <el-table-column prop="method" label="提现方式" width="120">
              <template #default="scope">
                {{ getMethodText(scope.row.method) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="提现状态" width="120">
              <template #default="scope">
                <el-tag :type="getStatusType(scope.row.status)">
                  {{ getStatusText(scope.row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="createdAt" label="申请时间" width="180"></el-table-column>
            <el-table-column prop="processedAt" label="处理时间" width="180"></el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button size="small" @click="viewWithdrawDetail(scope.row.id)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'FinanceWithdraw',
  setup() {
    const withdrawFormRef = ref(null)
    const withdrawForm = ref({
      amount: '',
      method: '',
      account: '',
      accountName: ''
    })
    
    const withdrawRules = {
      amount: [
        { required: true, message: '请输入提现金额', trigger: 'blur' },
        { type: 'number', min: 0.01, message: '提现金额必须大于0', trigger: 'blur' }
      ],
      method: [
        { required: true, message: '请选择提现方式', trigger: 'change' }
      ],
      account: [
        { required: true, message: '请输入收款账户', trigger: 'blur' }
      ],
      accountName: [
        { required: true, message: '请输入账户名称', trigger: 'blur' }
      ]
    }
    
    const balance = ref({
      available: 12500.88,
      frozen: 2500.00
    })
    
    const withdrawHistory = ref([
      {
        id: 'W202604230001',
        amount: 5000.00,
        method: 'alipay',
        status: 'completed',
        createdAt: '2026-04-20 10:00:00',
        processedAt: '2026-04-20 11:30:00'
      },
      {
        id: 'W202604230002',
        amount: 3000.00,
        method: 'wechat',
        status: 'completed',
        createdAt: '2026-04-15 14:20:00',
        processedAt: '2026-04-15 15:00:00'
      },
      {
        id: 'W202604230003',
        amount: 2000.00,
        method: 'bank',
        status: 'pending',
        createdAt: '2026-04-23 09:15:00',
        processedAt: null
      }
    ])
    
    const getMethodText = (method) => {
      const methodMap = {
        alipay: '支付宝',
        wechat: '微信',
        bank: '银行转账'
      }
      return methodMap[method] || method
    }
    
    const getStatusText = (status) => {
      const statusMap = {
        pending: '处理中',
        completed: '已完成',
        failed: '失败'
      }
      return statusMap[status] || status
    }
    
    const getStatusType = (status) => {
      const typeMap = {
        pending: 'warning',
        completed: 'success',
        failed: 'danger'
      }
      return typeMap[status] || 'default'
    }
    
    const submitWithdraw = () => {
      withdrawFormRef.value.validate((valid) => {
        if (valid) {
          if (withdrawForm.value.amount > balance.value.available) {
            ElMessage.error('提现金额超过可用余额')
            return
          }
          // 实际项目中这里应该调用API提交提现申请
          ElMessage.success('提现申请提交成功')
          resetForm()
        } else {
          return false
        }
      })
    }
    
    const resetForm = () => {
      withdrawFormRef.value.resetFields()
    }
    
    const viewWithdrawDetail = (id) => {
      // 查看提现详情
      console.log('查看提现详情:', id)
    }
    
    onMounted(() => {
      // 实际项目中这里应该调用API获取余额和提现记录
    })
    
    return {
      withdrawFormRef,
      withdrawForm,
      withdrawRules,
      balance,
      withdrawHistory,
      getMethodText,
      getStatusText,
      getStatusType,
      submitWithdraw,
      resetForm,
      viewWithdrawDetail
    }
  }
}
</script>

<style scoped>
.finance-withdraw {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.balance-info {
  margin-bottom: 20px;
}

.balance-value {
  font-size: 36px;
  font-weight: bold;
  color: #409EFF;
  text-align: center;
  margin-top: 10px;
}

.balance-detail {
  display: flex;
  justify-content: space-around;
  margin-top: 10px;
  font-size: 14px;
  color: #606266;
}

.withdraw-form {
  margin-bottom: 20px;
}

.form-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.withdraw-history {
  margin-top: 20px;
}
</style>
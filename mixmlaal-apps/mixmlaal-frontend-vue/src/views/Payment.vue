<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">支付</h1>
    <div class="bg-white rounded-xl shadow-card p-6 max-w-md mx-auto">
      <div class="mb-6">
        <h2 class="text-xl font-semibold mb-2">订单金额</h2>
        <p class="text-3xl font-bold text-primary">¥99.00</p>
      </div>
      <div class="space-y-4">
        <div class="border rounded-lg p-4 flex justify-between items-center">
          <div class="flex items-center">
            <i class="fa fa-credit-card text-primary text-xl mr-3"></i>
            <span>微信支付</span>
          </div>
          <input type="radio" name="payment" checked>
        </div>
        <div class="border rounded-lg p-4 flex justify-between items-center">
          <div class="flex items-center">
            <i class="fa fa-credit-card text-primary text-xl mr-3"></i>
            <span>支付宝</span>
          </div>
          <input type="radio" name="payment">
        </div>
        <div class="border rounded-lg p-4 flex justify-between items-center">
          <div class="flex items-center">
            <i class="fa fa-credit-card text-primary text-xl mr-3"></i>
            <span>银行卡</span>
          </div>
          <input type="radio" name="payment">
        </div>
        <button class="w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition-all">
          确认支付
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Payment'
}
</script>

<style scoped>
/* 组件特定样式 */
</style>
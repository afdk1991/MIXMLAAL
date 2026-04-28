<template>
  <div class="help-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('help.title') }}</h1>
      </header>

      <div class="search-box">
        <input
          type="text"
          v-model="searchQuery"
          :placeholder="$t('help.searchPlaceholder')"
          @input="searchHelp"
        />
      </div>

      <div class="help-categories">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-card"
          @click="toggleCategory(category.id)"
        >
          <div class="category-header">
            <span class="icon">{{ category.icon }}</span>
            <h3>{{ category.name }}</h3>
            <span class="arrow">{{ expandedCategory === category.id ? '▲' : '▼' }}</span>
          </div>
          <div v-if="expandedCategory === category.id" class="category-content">
            <div
              v-for="item in category.items"
              :key="item.id"
              class="help-item"
              @click.stop="showAnswer(item)"
            >
              <span>{{ item.question }}</span>
              <span class="arrow">›</span>
            </div>
          </div>
        </div>
      </div>

      <div class="contact-section">
        <h2>{{ $t('help.stillNeedHelp') }}</h2>
        <p>{{ $t('help.contactDesc') }}</p>
        <button @click="contactSupport">{{ $t('help.contactSupport') }}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Help',
  data() {
    return {
      searchQuery: '',
      expandedCategory: null,
      categories: [
        {
          id: 1,
          name: '账户问题',
          icon: '👤',
          items: [
            { id: 1, question: '如何注册账号？', answer: '点击注册按钮，填写手机号和验证码即可注册。' },
            { id: 2, question: '如何修改密码？', answer: '在个人中心-安全设置中可以修改密码。' },
          ],
        },
        {
          id: 2,
          name: '订单问题',
          icon: '📦',
          items: [
            { id: 3, question: '如何查看订单？', answer: '在个人中心-我的订单中可以查看所有订单。' },
            { id: 4, question: '如何申请退款？', answer: '在订单详情页点击申请退款按钮。' },
          ],
        },
        {
          id: 3,
          name: '支付问题',
          icon: '💳',
          items: [
            { id: 5, question: '支持哪些支付方式？', answer: '支持微信、支付宝、银行卡支付。' },
          ],
        },
        {
          id: 4,
          name: '其他问题',
          icon: '❓',
          items: [
            { id: 6, question: '如何联系客服？', answer: '可以拨打客服热线400-888-8888。' },
          ],
        },
      ],
    };
  },
  methods: {
    toggleCategory(id) {
      this.expandedCategory = this.expandedCategory === id ? null : id;
    },
    showAnswer(item) {
      alert(`Q: ${item.question}\n\nA: ${item.answer}`);
    },
    searchHelp() {
      console.log('Searching:', this.searchQuery);
    },
    contactSupport() {
      this.$router.push('/contact');
    },
  },
};
</script>

<style scoped>
.help-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 32px;
  color: #333;
}

.search-box {
  margin-bottom: 30px;
}

.search-box input {
  width: 100%;
  padding: 15px 20px;
  border: 1px solid #ddd;
  border-radius: 30px;
  font-size: 16px;
  background: white;
}

.category-card {
  background: white;
  border-radius: 12px;
  margin-bottom: 15px;
  overflow: hidden;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 15px;
  padding: 20px;
  cursor: pointer;
}

.category-header .icon {
  font-size: 28px;
}

.category-header h3 {
  flex: 1;
  font-size: 18px;
  color: #333;
}

.category-header .arrow {
  color: #999;
}

.category-content {
  border-top: 1px solid #eee;
}

.help-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f5f5f5;
  cursor: pointer;
}

.help-item:last-child {
  border-bottom: none;
}

.help-item:hover {
  background: #f9f9f9;
}

.help-item .arrow {
  color: #999;
  font-size: 20px;
}

.contact-section {
  text-align: center;
  margin-top: 50px;
  padding: 40px;
  background: white;
  border-radius: 12px;
}

.contact-section h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.contact-section p {
  color: #666;
  margin-bottom: 20px;
}

.contact-section button {
  padding: 12px 30px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  cursor: pointer;
}
</style>
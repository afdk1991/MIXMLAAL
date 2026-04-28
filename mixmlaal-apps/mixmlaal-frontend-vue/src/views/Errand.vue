<template>
  <div class="errand-page">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1>跑腿服务</h1>
      </div>
    </header>

    <!-- 服务类型选择 -->
    <section class="service-section">
      <h2 class="section-title">服务类型</h2>
      <div class="service-grid">
        <div
          v-for="type in errandTypes"
          :key="type.id"
          @click="selectType(type.id)"
          :class="['service-card', selectedType === type.id ? 'selected' : '']"
        >
          <div class="service-card-content">
            <span class="service-icon">{{ type.icon }}</span>
            <div class="service-info">
              <span class="service-name">{{ type.name }}</span>
              <span class="service-desc">{{ type.description }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 订单表单 -->
    <section class="form-section">
      <h2 class="section-title">填写订单信息</h2>
      <div class="form-card">
        <!-- 起点和终点 -->
        <div class="address-group">
          <div class="form-group">
            <label class="form-label">起点</label>
            <input
              type="text"
              v-model="fromAddress"
              placeholder="请输入起点地址"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label class="form-label">终点</label>
            <input
              type="text"
              v-model="toAddress"
              placeholder="请输入终点地址"
              class="form-input"
            >
          </div>
        </div>

        <!-- 物品信息 -->
        <div class="form-group">
          <label class="form-label">物品描述</label>
          <textarea
            v-model="description"
            placeholder="请描述物品信息"
            class="form-input form-textarea"
            rows="3"
          ></textarea>
        </div>

        <!-- 重量和尺寸 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">重量 (kg)</label>
            <input
              type="number"
              v-model.number="weight"
              min="0.1"
              step="0.1"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label class="form-label">尺寸</label>
            <select v-model="size" class="form-input">
              <option value="small">小</option>
              <option value="medium">中</option>
              <option value="large">大</option>
            </select>
          </div>
        </div>

        <!-- 联系人信息 -->
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">联系人姓名</label>
            <input
              type="text"
              v-model="contactName"
              placeholder="请输入联系人姓名"
              class="form-input"
            >
          </div>
          <div class="form-group">
            <label class="form-label">联系电话</label>
            <input
              type="tel"
              v-model="contactPhone"
              placeholder="请输入联系电话"
              class="form-input"
            >
          </div>
        </div>

        <!-- 预估价格 -->
        <div class="price-card">
          <div class="price-row">
            <span class="price-label">预估价格</span>
            <span class="price-value">¥{{ estimatedPrice.min }} - ¥{{ estimatedPrice.max }}</span>
          </div>
          <div class="duration-row">
            <span class="duration-label">预估时长</span>
            <span class="duration-value">{{ estimatedDuration }} 分钟</span>
          </div>
        </div>

        <!-- 提交按钮 -->
        <button @click="createOrder" class="submit-btn">
          立即下单
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const selectedType = ref('express');
const fromAddress = ref('');
const toAddress = ref('');
const description = ref('');
const weight = ref(1);
const size = ref('small');
const contactName = ref('');
const contactPhone = ref('');
const estimatedPrice = ref({ min: 15, max: 25 });
const estimatedDuration = ref(30);

const errandTypes = [
  { id: 'express', name: '快速跑腿', description: '紧急物品配送', icon: '🚀' },
  { id: 'shopping', name: '帮我买', description: '代买商品服务', icon: '🛒' },
  { id: 'delivery', name: '帮我送', description: '文件证件配送', icon: '📦' },
  { id: 'other', name: '其他服务', description: '个性化服务', icon: '📋' },
];

function goBack() {
  router.back();
}

function selectType(typeId) {
  selectedType.value = typeId;
  updateEstimatedPrice();
}

function updateEstimatedPrice() {
  const basePrice = 10;
  const distance = 3;
  const weightPrice = weight.value > 5 ? (weight.value - 5) * 2 : 0;
  const sizePrice = {
    small: 0,
    medium: 5,
    large: 10,
  }[size.value] || 0;

  const totalPrice = basePrice + (distance * 2) + weightPrice + sizePrice;
  estimatedPrice.value = {
    min: Math.floor(totalPrice * 0.9),
    max: Math.ceil(totalPrice * 1.1),
  };
  estimatedDuration.value = Math.ceil(distance * 10);
}

function createOrder() {
  if (!fromAddress.value || !toAddress.value || !contactName.value || !contactPhone.value) {
    alert('请填写必要信息');
    return;
  }

  const orderData = {
    from: fromAddress.value,
    to: toAddress.value,
    type: selectedType.value,
    estimatedPrice: estimatedPrice.value,
    description: description.value,
    contactName: contactName.value,
    contactPhone: contactPhone.value,
    weight: weight.value,
    size: size.value,
  };

  console.log('创建跑腿订单:', orderData);
  alert('订单创建成功！');
}

watch(weight, () => {
  updateEstimatedPrice();
});

watch(size, () => {
  updateEstimatedPrice();
});

onMounted(() => {
  console.log('跑腿服务页面加载');
});
</script>

<style scoped>
.errand-page {
  min-height: 100vh;
  background-color: #f3f4f6;
}

.page-header {
  background: white;
  padding: 1rem 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-content h1 {
  flex: 1;
  text-align: center;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-right: 3rem;
}

.back-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #6b7280;
  padding: 0.5rem;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #3b82f6;
}

.service-section {
  background: white;
  padding: 1.5rem;
  margin-bottom: 0.75rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.service-card {
  padding: 1rem;
  border-radius: 0.5rem;
  border: 2px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s;
  background: white;
}

.service-card:hover {
  border-color: #93c5fd;
  background-color: #f0f9ff;
}

.service-card.selected {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.service-card-content {
  display: flex;
  align-items: center;
}

.service-icon {
  font-size: 1.75rem;
  margin-right: 0.75rem;
}

.service-info {
  display: flex;
  flex-direction: column;
}

.service-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.service-desc {
  font-size: 0.75rem;
  color: #6b7280;
}

.form-section {
  padding: 0 1rem 1.5rem;
}

.form-card {
  background: white;
  border-radius: 0.75rem;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-input {
  width: 100%;
  padding: 0.625rem 0.875rem;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: none;
  min-height: 80px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
}

.address-group {
  margin-bottom: 0.5rem;
}

.price-card {
  background: #f9fafb;
  padding: 1rem;
  border-radius: 0.5rem;
  margin-bottom: 1.25rem;
}

.price-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price-label {
  font-size: 0.875rem;
  color: #4b5563;
}

.price-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #3b82f6;
}

.duration-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid #e5e7eb;
}

.duration-label {
  font-size: 0.875rem;
  color: #6b7280;
}

.duration-value {
  font-size: 0.875rem;
  color: #6b7280;
}

.submit-btn {
  width: 100%;
  padding: 0.875rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.submit-btn:hover {
  background: linear-gradient(135deg, #2563eb, #7c3aed);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.submit-btn:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .service-grid {
    grid-template-columns: 1fr;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-section {
    padding: 0 0.75rem 1rem;
  }

  .form-card {
    padding: 1rem;
  }
}
</style>
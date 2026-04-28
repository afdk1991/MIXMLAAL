<template>
  <div class="coupon-container">
    <!-- 顶部导航栏 -->
    <header class="page-header">
      <div class="header-content">
        <button @click="goBack" class="back-btn">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <h1>我的优惠券</h1>
      </div>
    </header>

    <!-- 优惠券筛选 -->
    <div class="filter-section">
      <div class="filter-tabs">
        <button 
          v-for="tab in filterTabs" 
          :key="tab.value"
          @click="selectedFilter = tab.value"
          :class="['filter-tab', selectedFilter === tab.value ? 'active' : '']"
        >
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- 优惠券列表 -->
    <div class="coupon-section">
      <div v-if="loading" class="loading">
        <div class="loading-spinner"></div>
        <div>加载中...</div>
      </div>

      <div v-else-if="coupons.length > 0" class="coupon-list">
        <div 
          v-for="coupon in filteredCoupons" 
          :key="coupon.id"
          class="coupon-card"
          :class="{ 'expired': coupon.status === 'expired' }"
        >
          <div class="coupon-left">
            <div class="coupon-amount">¥{{ coupon.amount }}</div>
            <div class="coupon-condition">满{{ coupon.minSpend }}元可用</div>
          </div>
          <div class="coupon-right">
            <div class="coupon-title">{{ coupon.name }}</div>
            <div class="coupon-validity">有效期至: {{ formatDate(coupon.expiryDate) }}</div>
            <div class="coupon-status" v-if="coupon.status === 'expired'">已过期</div>
            <div class="coupon-status" v-else-if="coupon.status === 'used'">已使用</div>
          </div>
        </div>
      </div>

      <div v-else class="empty-coupons">
        <div class="empty-icon">🎫</div>
        <h2>暂无优惠券</h2>
        <p>快去领取更多优惠券吧</p>
        <button class="get-btn" @click="getCoupons">
          去领取
        </button>
      </div>
    </div>

    <!-- 领取优惠券区域 -->
    <div class="get-coupons-section">
      <h2 class="section-title">可领取优惠券</h2>
      <div class="available-coupons">
        <div 
          v-for="availableCoupon in availableCoupons" 
          :key="availableCoupon.id"
          class="available-coupon-card"
        >
          <div class="available-coupon-left">
            <div class="available-coupon-amount">¥{{ availableCoupon.amount }}</div>
            <div class="available-coupon-condition">满{{ availableCoupon.minSpend }}元可用</div>
          </div>
          <div class="available-coupon-right">
            <div class="available-coupon-title">{{ availableCoupon.name }}</div>
            <div class="available-coupon-validity">有效期: {{ formatDate(availableCoupon.startDate) }} 至 {{ formatDate(availableCoupon.expiryDate) }}</div>
            <button 
              class="claim-btn"
              @click="claimCoupon(availableCoupon.id)"
              :disabled="availableCoupon.claimed"
            >
              {{ availableCoupon.claimed ? '已领取' : '立即领取' }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const router = useRouter();

// 响应式数据
const loading = ref(true);
const selectedFilter = ref('available');
const coupons = ref([]);
const availableCoupons = ref([]);

// 筛选标签
const filterTabs = [
  { value: 'available', label: '可使用' },
  { value: 'used', label: '已使用' },
  { value: 'expired', label: '已过期' }
];

// 计算过滤后的优惠券
const filteredCoupons = computed(() => {
  return coupons.value.filter(coupon => {
    if (selectedFilter.value === 'available') {
      return coupon.status === 'available';
    }
    return coupon.status === selectedFilter.value;
  });
});

// 格式化日期
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// 获取优惠券列表
const fetchCoupons = async () => {
  loading.value = true;
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    const response = await axios.get('/api/coupons', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    coupons.value = response.data.data;
    fetchAvailableCoupons();
  } catch (error) {
    console.error('获取优惠券失败:', error);
    // 使用模拟数据
    useMockData();
  } finally {
    loading.value = false;
  }
};

// 获取可领取的优惠券
const fetchAvailableCoupons = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    const response = await axios.get('/api/coupons/available', {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    availableCoupons.value = response.data.data;
  } catch (error) {
    console.error('获取可领取优惠券失败:', error);
    // 使用模拟数据
    useMockAvailableCoupons();
  }
};

// 领取优惠券
const claimCoupon = async (couponId) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    await axios.post(`/api/coupons/${couponId}/claim`, {}, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    
    // 更新优惠券状态
    const coupon = availableCoupons.value.find(c => c.id === couponId);
    if (coupon) {
      coupon.claimed = true;
    }
    
    // 重新获取优惠券列表
    fetchCoupons();
  } catch (error) {
    console.error('领取优惠券失败:', error);
    alert('领取优惠券失败');
  }
};

// 去领取优惠券
const getCoupons = () => {
  // 这里应该跳转到优惠券领取页面
  alert('跳转到优惠券领取页面');
};

// 返回
const goBack = () => {
  router.back();
};

// 使用模拟数据
const useMockData = () => {
  coupons.value = [
    {
      id: '1',
      name: '新人专享券',
      amount: 20,
      minSpend: 100,
      status: 'available',
      expiryDate: '2026-12-31'
    },
    {
      id: '2',
      name: '外卖满减券',
      amount: 10,
      minSpend: 50,
      status: 'used',
      expiryDate: '2026-12-31'
    },
    {
      id: '3',
      name: '打车优惠券',
      amount: 15,
      minSpend: 30,
      status: 'expired',
      expiryDate: '2026-01-31'
    }
  ];
};

// 使用模拟可领取优惠券数据
const useMockAvailableCoupons = () => {
  availableCoupons.value = [
    {
      id: '4',
      name: '商城满减券',
      amount: 30,
      minSpend: 150,
      startDate: '2026-04-01',
      expiryDate: '2026-12-31',
      claimed: false
    },
    {
      id: '5',
      name: '跑腿优惠券',
      amount: 5,
      minSpend: 20,
      startDate: '2026-04-01',
      expiryDate: '2026-12-31',
      claimed: false
    }
  ];
};

// 初始化
onMounted(() => {
  fetchCoupons();
});
</script>

<style scoped>
.coupon-container {
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

.filter-section {
  background: white;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.filter-tabs {
  display: flex;
  gap: 1rem;
}

.filter-tab {
  padding: 0.5rem 1.25rem;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  background-color: #f3f4f6;
  color: #6b7280;
}

.filter-tab.active {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
}

.coupon-section {
  padding: 1rem 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 0;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.coupon-card {
  display: flex;
  background: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.coupon-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.coupon-card.expired {
  opacity: 0.6;
}

.coupon-left {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  padding: 2rem 1.5rem;
  text-align: center;
  min-width: 120px;
}

.coupon-amount {
  font-size: 1.75rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.coupon-condition {
  font-size: 0.75rem;
  opacity: 0.9;
}

.coupon-right {
  flex: 1;
  padding: 1.5rem;
  position: relative;
}

.coupon-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.coupon-validity {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 0.5rem;
}

.coupon-status {
  position: absolute;
  top: 1rem;
  right: 1rem;
  padding: 0.25rem 0.75rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  border-radius: 9999px;
}

.empty-coupons {
  text-align: center;
  padding: 4rem 0;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.empty-coupons h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-coupons p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.get-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.get-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.get-coupons-section {
  padding: 2rem 1.5rem;
  background: white;
  margin-top: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1.5rem;
}

.available-coupons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.available-coupon-card {
  display: flex;
  border: 1px solid #e5e7eb;
  border-radius: 0.75rem;
  overflow: hidden;
  transition: all 0.2s;
}

.available-coupon-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.available-coupon-left {
  background: linear-gradient(135deg, #10b981, #34d399);
  color: white;
  padding: 1.5rem;
  text-align: center;
  min-width: 100px;
}

.available-coupon-amount {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.available-coupon-condition {
  font-size: 0.75rem;
  opacity: 0.9;
}

.available-coupon-right {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.available-coupon-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
}

.available-coupon-validity {
  font-size: 0.75rem;
  color: #6b7280;
  margin-bottom: 1rem;
}

.claim-btn {
  align-self: flex-start;
  padding: 0.5rem 1.5rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.claim-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(59, 130, 246, 0.3);
}

.claim-btn:disabled {
  background-color: #d1d5db;
  color: #6b7280;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .page-header,
  .filter-section,
  .coupon-section,
  .get-coupons-section {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .coupon-left,
  .available-coupon-left {
    min-width: 100px;
    padding: 1.5rem 1rem;
  }

  .coupon-amount {
    font-size: 1.5rem;
  }
}
</style>
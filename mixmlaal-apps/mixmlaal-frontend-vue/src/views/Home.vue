<template>
  <div class="home-container">
    <!-- 顶部导航栏 -->
    <header class="header">
      <div class="header-content">
        <div class="logo" @click="goHome">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 32 32">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="100%" stop-color="#8b5cf6"/>
              </linearGradient>
              <linearGradient id="logoTextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#ffffff"/>
                <stop offset="100%" stop-color="#e0f2fe"/>
              </linearGradient>
            </defs>
            <circle cx="16" cy="16" r="15" fill="url(#logoGradient)"/>
            <circle cx="8" cy="8" r="2" fill="white" opacity="0.7"/>
            <circle cx="24" cy="8" r="1.5" fill="white" opacity="0.5"/>
            <circle cx="16" cy="24" r="1" fill="white" opacity="0.6"/>
            <path d="M10,20 L14,12 L18,20 L22,12" stroke="url(#logoTextGradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            <path d="M10,12 L22,12" stroke="url(#logoTextGradient)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M14,12 L14,8" stroke="url(#logoTextGradient)" stroke-width="3" stroke-linecap="round" fill="none"/>
            <path d="M18,12 L18,8" stroke="url(#logoTextGradient)" stroke-width="3" stroke-linecap="round" fill="none"/>
          </svg>
          <span class="logo-text">MIXMLAAL</span>
        </div>
        <nav class="nav-menu">
          <router-link to="/" class="nav-item active">首页</router-link>
          <router-link to="/ride" class="nav-item">打车</router-link>
          <router-link to="/food" class="nav-item">外卖</router-link>
          <router-link to="/mall" class="nav-item">商城</router-link>
          <router-link to="/errand" class="nav-item">跑腿</router-link>
        </nav>
        <div class="header-actions">
          <template v-if="isLoggedIn" v-memo="[isLoggedIn, unreadCount, user]">
            <router-link to="/notifications" class="notification-btn">
              <i class="fa fa-bell"></i>
              <span v-if="unreadCount > 0" class="badge">{{ unreadCount > 99 ? '99+' : unreadCount }}</span>
            </router-link>
            <div class="user-menu" @click="toggleUserMenu">
              <img :src="user?.avatar || defaultAvatar" alt="用户头像" class="avatar" loading="lazy">
              <span class="username">{{ user?.nickname || '用户' }}</span>
              <i class="fa fa-chevron-down"></i>
              <div v-if="userMenuVisible" class="dropdown-menu">
                <router-link to="/profile" class="dropdown-item">
                  <i class="fa fa-user"></i> 个人中心
                </router-link>
                <router-link to="/order" class="dropdown-item">
                  <i class="fa fa-history"></i> 我的订单
                </router-link>
                <router-link to="/wallet" class="dropdown-item">
                  <i class="fa fa-wallet"></i> 我的钱包
                </router-link>
                <router-link to="/settings" class="dropdown-item">
                  <i class="fa fa-cog"></i> 设置
                </router-link>
                <div class="dropdown-divider"></div>
                <div class="dropdown-item text-red-500" @click="handleLogout">
                  <i class="fa fa-sign-out"></i> 退出登录
                </div>
              </div>
            </div>
          </template>
          <template v-else v-memo="[isLoggedIn]">
            <router-link to="/login" class="btn btn-text">登录</router-link>
            <router-link to="/register" class="btn btn-primary">注册</router-link>
          </template>
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="main-content">
      <!-- 英雄区域 -->
      <section class="hero-section">
        <div class="hero-content">
          <h1 class="hero-title">让本地生活更简单</h1>
          <p class="hero-subtitle">一个APP满足所有日常需求 - 出行、外卖、商城、跑腿</p>
          <div class="hero-search">
            <div class="search-input-wrapper">
              <i class="fa fa-search"></i>
              <input 
                type="text" 
                v-model="searchKeyword" 
                placeholder="搜索商家、商品或服务"
                @keyup.enter="handleSearch"
              >
            </div>
            <button class="search-btn" @click="handleSearch">搜索</button>
          </div>
          <div class="quick-actions">
            <div class="quick-action" @click="quickAction('ride')">
              <div class="quick-icon bg-blue-500">
                <i class="fa fa-car"></i>
              </div>
              <span>打车</span>
            </div>
            <div class="quick-action" @click="quickAction('food')">
              <div class="quick-icon bg-orange-500">
                <i class="fa fa-utensils"></i>
              </div>
              <span>外卖</span>
            </div>
            <div class="quick-action" @click="quickAction('mall')">
              <div class="quick-icon bg-green-500">
                <i class="fa fa-shopping-bag"></i>
              </div>
              <span>商城</span>
            </div>
            <div class="quick-action" @click="quickAction('errand')">
              <div class="quick-icon bg-purple-500">
                <i class="fa fa-running"></i>
              </div>
              <span>跑腿</span>
            </div>
          </div>
        </div>
        <div class="hero-visual">
          <div class="visual-circle circle-1"></div>
          <div class="visual-circle circle-2"></div>
          <div class="visual-circle circle-3"></div>
          <div class="service-icons">
            <div class="service-icon ride" @click="goToService('ride')">
              <i class="fa fa-car"></i>
              <span>打车</span>
            </div>
            <div class="service-icon food" @click="goToService('food')">
              <i class="fa fa-utensils"></i>
              <span>外卖</span>
            </div>
            <div class="service-icon mall" @click="goToService('mall')">
              <i class="fa fa-shopping-bag"></i>
              <span>商城</span>
            </div>
            <div class="service-icon errand" @click="goToService('errand')">
              <i class="fa fa-box"></i>
              <span>跑腿</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 服务分类区 -->
      <section class="services-section">
        <div class="section-header">
          <h2 class="section-title">核心服务</h2>
          <p class="section-desc">一站式满足您的所有生活需求</p>
        </div>
        <div class="services-grid">
          <div class="service-card" @click="goToService('ride')">
            <div class="service-icon-wrapper bg-gradient-blue">
              <i class="fa fa-car"></i>
            </div>
            <h3>打车出行</h3>
            <p>即时叫车、预约出行、多种车型选择</p>
            <div class="service-tags">
              <span class="tag">快车</span>
              <span class="tag">专车</span>
              <span class="tag">顺风车</span>
            </div>
          </div>
          <div class="service-card" @click="goToService('food')">
            <div class="service-icon-wrapper bg-gradient-orange">
              <i class="fa fa-utensils"></i>
            </div>
            <h3>美食外卖</h3>
            <p>精选餐厅、实时配送、优惠多多</p>
            <div class="service-tags">
              <span class="tag">中餐</span>
              <span class="tag">西餐</span>
              <span class="tag">快餐</span>
            </div>
          </div>
          <div class="service-card" @click="goToService('mall')">
            <div class="service-icon-wrapper bg-gradient-green">
              <i class="fa fa-shopping-bag"></i>
            </div>
            <h3>本地商城</h3>
            <p>品质好物、极速配送、售后无忧</p>
            <div class="service-tags">
              <span class="tag">生鲜</span>
              <span class="tag">数码</span>
              <span class="tag">日用</span>
            </div>
          </div>
          <div class="service-card" @click="goToService('errand')">
            <div class="service-icon-wrapper bg-gradient-purple">
              <i class="fa fa-box"></i>
            </div>
            <h3>即时跑腿</h3>
            <p>代买代送、帮我取、帮我办</p>
            <div class="service-tags">
              <span class="tag">代买</span>
              <span class="tag">代送</span>
              <span class="tag">代办</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 热门推荐区 -->
      <section class="recommendations-section">
        <div class="section-header">
          <h2 class="section-title">热门推荐</h2>
          <div class="section-tabs">
            <button 
              v-for="tab in recommendationTabs" 
              :key="tab.value"
              :class="['tab', { active: activeTab === tab.value }]"
              @click="activeTab = tab.value"
            >
              {{ tab.label }}
            </button>
          </div>
        </div>
        <div v-if="isLoading" class="recommendations-grid">
          <div v-for="i in 8" :key="i" class="recommendation-card">
            <div class="card-image">
              <Skeleton type="image" width="100%" height="160px" />
            </div>
            <div class="card-content">
              <Skeleton type="text" width="80%" height="16px" />
              <Skeleton type="text" width="100%" height="14px" style="margin-top: 8px;" />
              <div class="card-meta">
                <Skeleton type="text" width="40px" height="16px" />
                <Skeleton type="text" width="60px" height="12px" />
              </div>
            </div>
          </div>
        </div>
        <div v-else class="recommendations-grid">
          <div 
            v-for="item in recommendations" 
            :key="item.id" 
            class="recommendation-card" 
            @click="viewDetail(item)"
            v-memo="[item.id, item.title, item.price, item.sales]"
          >
            <div class="card-image">
              <LazyImage 
                :src="item.image" 
                :alt="item.title" 
                width="100%" 
                height="160px"
                :placeholder="'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxNjAiIGhlaWdodD0iMTYwIiB2aWV3Qm94PSIwIDAgMTYwIDE2MCI+PHJlY3Qgd2lkdGg9IjE2MCIgaGVpZ2h0PSIxNjAiIGZpbGw9IiNmN2Y3ZjciLz48cGF0aCBkPSJNODAgMjBjLTMyLjQgMC02MCAyNy42LTYwIDYwczI3LjYgNjAgNjAgNjAgNjAtMjcuNiA2MC02MC0yNy42LTYwLTYwLTYweiIvPjwvc3ZnPg=='"
              />
              <span v-if="item.discount" class="discount-tag"> {{ item.discount }} </span>
            </div>
            <div class="card-content">
              <h4 class="card-title">{{ item.title }}</h4>
              <p class="card-desc">{{ item.description }}</p>
              <div class="card-meta">
                <span class="price">¥{{ item.price }}</span>
                <span class="sales">{{ item.sales }}人购买</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 数据统计区 -->
      <section class="stats-section">
        <div class="stats-container">
          <div class="stat-item">
            <div class="stat-value">{{ stats.users }}+</div>
            <div class="stat-label">活跃用户</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.orders }}+</div>
            <div class="stat-label">日均订单</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.merchants }}+</div>
            <div class="stat-label">合作商家</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ stats.cities }}+</div>
            <div class="stat-label">覆盖城市</div>
          </div>
        </div>
      </section>

      <!-- 底部信息区 -->
      <section class="features-section">
        <div class="section-header">
          <h2 class="section-title">为什么选择MIXMLAAL</h2>
        </div>
        <div class="features-grid">
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fa fa-bolt"></i>
            </div>
            <h3>快速响应</h3>
            <p>智能调度系统，缩短等待时间</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fa fa-shield-alt"></i>
            </div>
            <h3>安全保障</h3>
            <p>全程录音追踪，紧急求助功能</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fa fa-tags"></i>
            </div>
            <h3>优惠多多</h3>
            <p>新人礼包、限时折扣、积分抵扣</p>
          </div>
          <div class="feature-card">
            <div class="feature-icon">
              <i class="fa fa-headset"></i>
            </div>
            <h3>贴心客服</h3>
            <p>7x24小时在线，解决问题更高效</p>
          </div>
        </div>
      </section>
    </main>

    <!-- 底部导航栏（移动端） -->
    <nav class="mobile-nav">
      <router-link to="/" class="nav-item active">
        <i class="fa fa-home"></i>
        <span>首页</span>
      </router-link>
      <router-link to="/ride" class="nav-item">
        <i class="fa fa-car"></i>
        <span>打车</span>
      </router-link>
      <router-link to="/food" class="nav-item">
        <i class="fa fa-utensils"></i>
        <span>外卖</span>
      </router-link>
      <router-link to="/mall" class="nav-item">
        <i class="fa fa-shopping-bag"></i>
        <span>商城</span>
      </router-link>
      <router-link to="/profile" class="nav-item">
        <i class="fa fa-user"></i>
        <span>我的</span>
      </router-link>
    </nav>

    <!-- 页脚 -->
    <footer class="footer">
      <div class="footer-content">
        <div class="footer-section">
          <h4>关于MIXMLAAL</h4>
          <ul>
            <li><a href="#">关于我们</a></li>
            <li><a href="#">加入我们</a></li>
            <li><a href="#">联系我们</a></li>
            <li><a href="#">新闻资讯</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>服务支持</h4>
          <ul>
            <li><a href="#">帮助中心</a></li>
            <li><a href="#">用户指南</a></li>
            <li><a href="#">商家入驻</a></li>
            <li><a href="#">司机加盟</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>法律声明</h4>
          <ul>
            <li><a href="#">服务条款</a></li>
            <li><a href="#">隐私政策</a></li>
            <li><a href="#">退款政策</a></li>
          </ul>
        </div>
        <div class="footer-section">
          <h4>关注我们</h4>
          <div class="social-links">
            <a href="#" class="social-link"><i class="fab fa-weixin"></i></a>
            <a href="#" class="social-link"><i class="fab fa-weibo"></i></a>
            <a href="#" class="social-link"><i class="fab fa-qq"></i></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom">
        <p>© 2026 MIXMLAAL. 保留所有权利。</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../store/auth';
import LazyImage from '../components/base/LazyImage.vue';
import Skeleton from '../components/base/Skeleton.vue';
import { preloadImages, optimizeScroll, batchDOMOperations } from '../utils/performance';

// 优化响应式数据
const searchKeyword = ref('');
const activeTab = ref('all');
const userMenuVisible = ref(false);
const unreadCount = ref(0);
const isLoading = ref(true);

// 避免不必要的计算
const isLoggedIn = computed(() => !!localStorage.getItem('access_token'));
const user = computed(() => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
});

// 静态数据
const stats = ref({
  users: '500万',
  orders: '10万',
  merchants: '1万',
  cities: '50+'
});

const recommendationTabs = [
  { label: '全部', value: 'all' },
  { label: '美食', value: 'food' },
  { label: '好物', value: 'goods' },
  { label: '服务', value: 'services' }
];

// 预加载图片
const recommendations = ref([
  {
    id: 1,
    title: '正宗川味麻辣香锅',
    description: '精选食材，麻辣鲜香',
    price: 45.9,
    sales: 2580,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=spicy%20chinese%20food%20mala%20xiangguo&image_size=landscape_4_3',
    discount: '8折'
  },
  {
    id: 2,
    title: 'iPhone 15 Pro Max',
    description: '全新A17芯片，极致性能',
    price: 9999,
    sales: 1560,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=iPhone%2015%20Pro%20Max%20smartphone&image_size=landscape_4_3',
    discount: null
  },
  {
    id: 3,
    title: '同城急送-1小时达',
    description: '文件、包裹全程配送',
    price: 15,
    sales: 8650,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=delivery%20package%20courier%20service&image_size=landscape_4_3',
    discount: '首单减5元'
  },
  {
    id: 4,
    title: '新鲜有机水果礼盒',
    description: '时令鲜果，精美包装',
    price: 128,
    sales: 3260,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20organic%20fruits%20gift%20box&image_size=landscape_4_3',
    discount: null
  },
  {
    id: 5,
    title: '豪华专车-舒适出行',
    description: '商务接待首选，品质出行',
    price: 88,
    sales: 1890,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=luxury%20car%20business%20transportation&image_size=landscape_4_3',
    discount: '新用户5折'
  },
  {
    id: 6,
    title: '日式寿司拼盘',
    description: '新鲜刺身，精致美味',
    price: 168,
    sales: 2150,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japanese%20sushi%20platter&image_size=landscape_4_3',
    discount: null
  },
  {
    id: 7,
    title: '智能扫地机器人',
    description: '自动规划，静音清洁',
    price: 1299,
    sales: 980,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20robot%20vacuum%20cleaner&image_size=landscape_4_3',
    discount: '直降200'
  },
  {
    id: 8,
    title: '代买服务-超市代购',
    description: '足不出户搞定购物',
    price: 5,
    sales: 5620,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=supermarket%20shopping%20service&image_size=landscape_4_3',
    discount: null
  }
]);

// 预加载图片
const preloadImageUrls = recommendations.value.map(item => item.image);

const router = useRouter();
const authStore = useAuthStore();

const defaultAvatar = 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=user%20avatar%20portrait&image_size=square';

function goHome() {
  router.push('/');
}

function handleSearch() {
  if (searchKeyword.value.trim()) {
    console.log('搜索:', searchKeyword.value);
  }
}

function quickAction(service) {
  router.push(`/${service}`);
}

function goToService(service) {
  router.push(`/${service}`);
}

function viewDetail(item) {
  console.log('查看详情:', item);
}

function toggleUserMenu() {
  userMenuVisible.value = !userMenuVisible.value;
}

function handleLogout() {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user');
  localStorage.removeItem('user_role');
  authStore.logout();
  router.push('/');
}

// 优化滚动性能
const handleScroll = optimizeScroll(() => {
  // 滚动相关的逻辑
  console.log('滚动优化');
});

onMounted(() => {
  // 标题由路由守卫统一设置
  
  // 模拟数据加载
  setTimeout(() => {
    isLoading.value = false;
  }, 1500);
  
  // 预加载图片
  preloadImages(preloadImageUrls);
  
  // 添加滚动事件监听
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  // 清理滚动事件监听
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background-color: #f8fafc;
}

/* 头部样式 */
.header {
  background-color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  will-change: transform;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  contain: layout style;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 0;
  position: relative;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.active {
  color: #3b82f6;
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #3b82f6;
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.nav-item.active::after {
  transform: scaleX(1);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.notification-btn {
  position: relative;
  color: #6b7280;
  font-size: 1.25rem;
  text-decoration: none;
  transition: color 0.3s;
}

.notification-btn:hover {
  color: #3b82f6;
}

.notification-btn .badge {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #ef4444;
  color: white;
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  border-radius: 9999px;
  min-width: 1.25rem;
  text-align: center;
  animation: pulse 2s infinite;
}

.user-menu {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 9999px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
}

.username {
  font-weight: 500;
  color: #374151;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.5rem;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  min-width: 12rem;
  padding: 0.5rem;
  z-index: 50;
  transform: translateY(-10px);
  opacity: 0;
  visibility: hidden;
  transition: all 0.3s ease;
  will-change: transform, opacity;
}

.user-menu:hover .dropdown-menu,
.dropdown-menu.show {
  transform: translateY(0);
  opacity: 1;
  visibility: visible;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.625rem 0.75rem;
  color: #4b5563;
  text-decoration: none;
  border-radius: 0.375rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
}

.dropdown-divider {
  height: 1px;
  background-color: #e5e7eb;
  margin: 0.5rem 0;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
  will-change: transform, box-shadow;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.btn-text {
  color: #6b7280;
}

.btn-text:hover {
  color: #3b82f6;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* 英雄区域 */
.hero-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4rem 0;
  gap: 4rem;
  position: relative;
  overflow: hidden;
}

.hero-content {
  flex: 1;
  position: relative;
  z-index: 1;
}

.hero-title {
  font-size: 3rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 1rem;
  line-height: 1.2;
  animation: fadeIn 0.8s ease-out;
}

.hero-subtitle {
  font-size: 1.25rem;
  color: #6b7280;
  margin-bottom: 2rem;
  animation: fadeIn 0.8s ease-out 0.2s both;
}

.hero-search {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  animation: fadeIn 0.8s ease-out 0.4s both;
}

.search-input-wrapper {
  flex: 1;
  position: relative;
}

.search-input-wrapper i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
}

.search-input-wrapper input {
  width: 100%;
  padding: 0.875rem 1rem 0.875rem 2.75rem;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  font-size: 1rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.search-input-wrapper input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.search-btn {
  padding: 0.875rem 2rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  color: white;
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  will-change: transform, box-shadow;
}

.search-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.quick-actions {
  display: flex;
  gap: 1.5rem;
  animation: fadeIn 0.8s ease-out 0.6s both;
}

.quick-action {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: transform 0.3s ease;
  will-change: transform;
}

.quick-action:hover {
  transform: translateY(-4px);
}

.quick-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  will-change: transform, box-shadow;
}

.quick-icon:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}

.quick-action span {
  font-size: 0.875rem;
  color: #6b7280;
}

/* 服务卡片区域 */
.services-section,
.recommendations-section,
.features-section {
  padding: 4rem 0;
}

.section-header {
  text-align: center;
  margin-bottom: 2rem;
}

.section-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.section-desc {
  color: #6b7280;
  font-size: 1rem;
}

.section-tabs {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.tab {
  padding: 0.5rem 1.25rem;
  border: none;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 9999px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  will-change: background-color, color;
}

.tab.active,
.tab:hover {
  background-color: #3b82f6;
  color: white;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background-color: white;
  border-radius: 1rem;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  will-change: transform, box-shadow;
  contain: layout style;
}

.service-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.service-icon-wrapper {
  width: 4rem;
  height: 4rem;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  will-change: transform;
}

.service-card:hover .service-icon-wrapper {
  transform: scale(1.1);
}

.bg-gradient-blue {
  background: linear-gradient(135deg, #3b82f6, #60a5fa);
}

.bg-gradient-orange {
  background: linear-gradient(135deg, #f97316, #fb923c);
}

.bg-gradient-green {
  background: linear-gradient(135deg, #10b981, #34d399);
}

.bg-gradient-purple {
  background: linear-gradient(135deg, #8b5cf6, #a78bfa);
}

.service-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.service-card p {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.service-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.tag {
  padding: 0.25rem 0.75rem;
  background-color: #f3f4f6;
  color: #6b7280;
  border-radius: 9999px;
  font-size: 0.75rem;
  transition: all 0.2s;
}

.service-card:hover .tag {
  background-color: #e0e7ff;
  color: #3b82f6;
}

/* 推荐区域 */
.recommendations-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
}

.recommendation-card {
  background-color: white;
  border-radius: 0.75rem;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.3s;
  will-change: transform, box-shadow;
  contain: layout style;
}

.recommendation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-image {
  position: relative;
  height: 160px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.recommendation-card:hover .card-image img {
  transform: scale(1.05);
}

.discount-tag {
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  padding: 0.25rem 0.5rem;
  background-color: #ef4444;
  color: white;
  font-size: 0.75rem;
  border-radius: 0.25rem;
  animation: pulse 2s infinite;
}

.card-content {
  padding: 1rem;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-desc {
  font-size: 0.875rem;
  color: #9ca3af;
  margin-bottom: 0.5rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.price {
  color: #ef4444;
  font-weight: 600;
  font-size: 1.125rem;
}

.sales {
  color: #9ca3af;
  font-size: 0.75rem;
}

/* 数据统计区域 */
.stats-section {
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  padding: 3rem 0;
  margin: 2rem 0;
  border-radius: 1rem;
  position: relative;
  overflow: hidden;
}

.stats-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgdmlld0JveD0iMCAwIDYwIDYwIj48cGF0aCBkPSJNMzAgMzBMMCAwdjYwSDYwVjB6IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==') repeat;
  opacity: 0.1;
  z-index: 0;
}

.stats-container {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 2rem;
  text-align: center;
  position: relative;
  z-index: 1;
}

.stat-item {
  color: white;
  opacity: 0;
  transform: translateY(20px);
  animation: fadeInUp 0.8s ease-out forwards;
  will-change: transform, opacity;
}

.stat-item:nth-child(1) { animation-delay: 0.1s; }
.stat-item:nth-child(2) { animation-delay: 0.2s; }
.stat-item:nth-child(3) { animation-delay: 0.3s; }
.stat-item:nth-child(4) { animation-delay: 0.4s; }

.stat-value {
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  transition: transform 0.3s ease;
  will-change: transform;
}

.stat-item:hover .stat-value {
  transform: scale(1.1);
}

.stat-label {
  font-size: 1rem;
  opacity: 0.9;
}

/* 特点区域 */
.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  background-color: white;
  border-radius: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
  will-change: transform, box-shadow;
  contain: layout style;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  width: 4rem;
  height: 4rem;
  margin: 0 auto 1rem;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
  will-change: transform;
}

.feature-card:hover .feature-icon {
  transform: scale(1.1) rotate(5deg);
}

.feature-card h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 0.5rem;
}

.feature-card p {
  color: #6b7280;
  font-size: 0.875rem;
}

/* 移动端底部导航 */
.mobile-nav {
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  padding: 0.5rem 0;
  z-index: 100;
  will-change: transform;
  backdrop-filter: blur(8px);
}

.mobile-nav .nav-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  color: #6b7280;
  text-decoration: none;
  font-size: 0.625rem;
  transition: all 0.3s ease;
  padding: 0.5rem 0;
  position: relative;
}

.mobile-nav .nav-item::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 2px;
  background-color: #3b82f6;
  transform: scaleX(0);
  transition: transform 0.3s ease;
  border-radius: 2px;
}

.mobile-nav .nav-item.active {
  color: #3b82f6;
}

.mobile-nav .nav-item.active::after {
  transform: scaleX(1);
}

.mobile-nav .nav-item i {
  font-size: 1.25rem;
  transition: all 0.3s ease;
  will-change: transform;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
}

.mobile-nav .nav-item.active i {
  transform: scale(1.2);
  background-color: rgba(59, 130, 246, 0.1);
}

.mobile-nav .nav-item:active {
  transform: scale(0.95);
}

/* 移动端安全区域适配 */
@supports (padding: max(0px)) {
  .mobile-nav {
    padding-bottom: calc(0.5rem + env(safe-area-inset-bottom));
  }
  
  .main-content {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }
  
  .footer {
    padding-bottom: calc(5rem + env(safe-area-inset-bottom));
  }
}

/* 页脚 */
.footer {
  background-color: #1f2937;
  color: white;
  padding: 3rem 1.5rem 1.5rem;
  margin-top: 4rem;
  position: relative;
  overflow: hidden;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 2rem;
  position: relative;
  z-index: 1;
}

.footer-section h4 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: white;
}

.footer-section ul {
  list-style: none;
  padding: 0;
}

.footer-section li {
  margin-bottom: 0.5rem;
}

.footer-section a {
  color: #9ca3af;
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s;
}

.footer-section a:hover {
  color: white;
}

.social-links {
  display: flex;
  gap: 1rem;
}

.social-link {
  width: 2rem;
  height: 2rem;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  text-decoration: none;
  transition: all 0.3s;
  will-change: transform, background-color;
}

.social-link:hover {
  background-color: #3b82f6;
  transform: translateY(-2px);
}

.footer-bottom {
  max-width: 1200px;
  margin: 2rem auto 0;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
  color: #9ca3af;
  font-size: 0.875rem;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .nav-menu {
    display: none;
  }
  
  .header-actions .btn-text,
  .header-actions .username {
    display: none;
  }
  
  .hero-section {
    flex-direction: column;
    padding: 2rem 0;
    gap: 2rem;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
  }
  
  .quick-actions {
    justify-content: center;
  }
  
  .mobile-nav {
    display: flex;
  }
  
  .main-content {
    padding-bottom: 5rem;
  }
  
  .stats-container {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .footer {
    padding-bottom: 5rem;
  }
}

@media (max-width: 480px) {
  .hero-search {
    flex-direction: column;
  }
  
  .quick-actions {
    flex-wrap: wrap;
  }
  
  .services-grid,
  .recommendations-grid,
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <div class="profile-page">
    <div class="container">
      <header class="profile-header">
        <div class="avatar-section">
          <div class="avatar" @click="changeAvatar">
            <img :src="user.avatar || defaultAvatar" alt="avatar" />
            <span class="camera-icon">📷</span>
          </div>
          <h2>{{ user.nickname || user.name }}</h2>
          <p>{{ user.phone }}</p>
        </div>
        <button class="edit-btn" @click="$router.push('/edit-profile')">编辑资料</button>
      </header>

      <div class="stats-section">
        <div class="stat-item">
          <span class="value">{{ user.followers || 0 }}</span>
          <span class="label">关注</span>
        </div>
        <div class="stat-item">
          <span class="value">{{ user.following || 0 }}</span>
          <span class="label">粉丝</span>
        </div>
        <div class="stat-item">
          <span class="value">{{ user.likes || 0 }}</span>
          <span class="label">获赞</span>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-item" @click="$router.push('/orders')">
          <span class="icon">📦</span>
          <span>我的订单</span>
          <span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="$router.push('/collection')">
          <span class="icon">❤️</span>
          <span>我的收藏</span>
          <span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="$router.push('/coupons')">
          <span class="icon">🎫</span>
          <span>优惠券</span>
          <span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="$router.push('/wallet')">
          <span class="icon">💰</span>
          <span>我的钱包</span>
          <span class="arrow">›</span>
        </div>
      </div>

      <div class="menu-section">
        <div class="menu-item" @click="$router.push('/settings')">
          <span class="icon">⚙️</span>
          <span>设置</span>
          <span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="$router.push('/security')">
          <span class="icon">🔒</span>
          <span>安全设置</span>
          <span class="arrow">›</span>
        </div>
        <div class="menu-item" @click="$router.push('/help')">
          <span class="icon">❓</span>
          <span>帮助与反馈</span>
          <span class="arrow">›</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Profile',
  data() {
    return {
      defaultAvatar: 'https://via.placeholder.com/100',
      user: {
        name: '用户',
        nickname: '',
        phone: '138****8888',
        avatar: null,
        followers: 0,
        following: 0,
        likes: 0,
      },
    };
  },
  mounted() {
    this.loadProfile();
  },
  methods: {
    async loadProfile() {},
    changeAvatar() {
      console.log('Change avatar');
    },
  },
};
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: #f5f7fa;
}

.profile-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 30px;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  overflow: hidden;
  position: relative;
  cursor: pointer;
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.camera-icon {
  position: absolute;
  bottom: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5);
  padding: 5px;
  border-radius: 50%;
  font-size: 12px;
}

.avatar-section h2 {
  font-size: 20px;
}

.avatar-section p {
  font-size: 14px;
  opacity: 0.9;
}

.edit-btn {
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.2);
  border: 1px solid white;
  border-radius: 20px;
  color: white;
  font-size: 14px;
  cursor: pointer;
}

.stats-section {
  display: flex;
  background: white;
  margin-top: -20px;
  margin-left: 20px;
  margin-right: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
}

.stat-item .value {
  font-size: 20px;
  font-weight: 700;
  color: #333;
}

.stat-item .label {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

.menu-section {
  background: white;
  margin: 20px;
  border-radius: 12px;
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item .icon {
  font-size: 24px;
  margin-right: 15px;
}

.menu-item span:nth-child(2) {
  flex: 1;
  font-size: 16px;
  color: #333;
}

.menu-item .arrow {
  color: #ccc;
  font-size: 20px;
}
</style>
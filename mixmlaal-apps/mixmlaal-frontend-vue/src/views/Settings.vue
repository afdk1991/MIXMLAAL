<template>
  <div class="settings-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('settings.title') }}</h1>
      </header>

      <div class="settings-list">
        <div class="settings-group">
          <h3>{{ $t('settings.general') }}</h3>
          <div class="setting-item" @click="$router.push('/settings/language')">
            <span class="icon">🌐</span>
            <div class="item-content">
              <h4>{{ $t('settings.language') }}</h4>
              <p>{{ currentLanguage }}</p>
            </div>
            <span class="arrow">›</span>
          </div>
          <div class="setting-item" @click="$router.push('/settings/theme')">
            <span class="icon">🎨</span>
            <div class="item-content">
              <h4>{{ $t('settings.theme') }}</h4>
              <p>{{ currentTheme }}</p>
            </div>
            <span class="arrow">›</span>
          </div>
        </div>

        <div class="settings-group">
          <h3>{{ $t('settings.notifications') }}</h3>
          <div class="setting-item">
            <span class="icon">🔔</span>
            <div class="item-content">
              <h4>{{ $t('settings.pushNotifications') }}</h4>
              <p>{{ $t('settings.pushNotificationsDesc') }}</p>
            </div>
            <switch :checked="pushEnabled" @change="togglePush" />
          </div>
          <div class="setting-item">
            <span class="icon">✉️</span>
            <div class="item-content">
              <h4>{{ $t('settings.emailNotifications') }}</h4>
              <p>{{ $t('settings.emailNotificationsDesc') }}</p>
            </div>
            <switch :checked="emailEnabled" @change="toggleEmail" />
          </div>
          <div class="setting-item">
            <span class="icon">💬</span>
            <div class="item-content">
              <h4>{{ $t('settings.smsNotifications') }}</h4>
              <p>{{ $t('settings.smsNotificationsDesc') }}</p>
            </div>
            <switch :checked="smsEnabled" @change="toggleSms" />
          </div>
        </div>

        <div class="settings-group">
          <h3>{{ $t('settings.privacy') }}</h3>
          <div class="setting-item">
            <span class="icon">📍</span>
            <div class="item-content">
              <h4>{{ $t('settings.locationServices') }}</h4>
              <p>{{ $t('settings.locationServicesDesc') }}</p>
            </div>
            <switch :checked="locationEnabled" @change="toggleLocation" />
          </div>
          <div class="setting-item">
            <span class="icon">👁️</span>
            <div class="item-content">
              <h4>{{ $t('settings.activityStatus') }}</h4>
              <p>{{ $t('settings.activityStatusDesc') }}</p>
            </div>
            <switch :checked="activityEnabled" @change="toggleActivity" />
          </div>
        </div>

        <div class="settings-group">
          <h3>{{ $t('settings.about') }}</h3>
          <div class="setting-item" @click="$router.push('/about')">
            <span class="icon">ℹ️</span>
            <div class="item-content">
              <h4>{{ $t('settings.aboutUs') }}</h4>
            </div>
            <span class="arrow">›</span>
          </div>
          <div class="setting-item" @click="checkUpdate">
            <span class="icon">🔄</span>
            <div class="item-content">
              <h4>{{ $t('settings.checkUpdates') }}</h4>
              <p>v1.0.0.0</p>
            </div>
            <span class="arrow">›</span>
          </div>
        </div>

        <div class="logout-section">
          <button class="btn-logout" @click="logout">{{ $t('settings.logout') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Settings',
  data() {
    return {
      currentLanguage: '简体中文',
      currentTheme: '浅色模式',
      pushEnabled: true,
      emailEnabled: false,
      smsEnabled: true,
      locationEnabled: true,
      activityEnabled: false,
    };
  },
  methods: {
    togglePush() {
      console.log('Push notifications:', this.pushEnabled);
    },
    toggleEmail() {
      console.log('Email notifications:', this.emailEnabled);
    },
    toggleSms() {
      console.log('SMS notifications:', this.smsEnabled);
    },
    toggleLocation() {
      console.log('Location services:', this.locationEnabled);
    },
    toggleActivity() {
      console.log('Activity status:', this.activityEnabled);
    },
    checkUpdate() {
      alert('当前已是最新版本');
    },
    logout() {
      if (confirm('确定要退出登录吗？')) {
        this.$router.push('/login');
      }
    },
  },
};
</script>

<style scoped>
.settings-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.page-header h1 {
  font-size: 28px;
  color: #333;
  margin-bottom: 30px;
}

.settings-list {
  background: white;
  border-radius: 16px;
  overflow: hidden;
}

.settings-group {
  padding: 20px;
  border-bottom: 1px solid #f0f0f0;
}

.settings-group:last-of-type {
  border-bottom: none;
}

.settings-group h3 {
  font-size: 14px;
  color: #999;
  margin-bottom: 15px;
  text-transform: uppercase;
}

.setting-item {
  display: flex;
  align-items: center;
  padding: 12px 0;
  cursor: pointer;
}

.setting-item .icon {
  font-size: 24px;
  margin-right: 15px;
}

.item-content {
  flex: 1;
}

.item-content h4 {
  font-size: 16px;
  color: #333;
  margin-bottom: 2px;
}

.item-content p {
  font-size: 12px;
  color: #999;
}

.arrow {
  color: #ccc;
  font-size: 20px;
}

switch {
  width: 50px;
  height: 26px;
  background: #ccc;
  border-radius: 13px;
  position: relative;
  cursor: pointer;
}

switch[checked] {
  background: #667eea;
}

.logout-section {
  padding: 30px 20px;
}

.btn-logout {
  width: 100%;
  padding: 14px;
  background: #fff1f1;
  color: #ff6b6b;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
}
</style>
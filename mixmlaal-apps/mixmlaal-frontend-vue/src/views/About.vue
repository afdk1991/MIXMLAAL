<template>
  <div class="about-page">
    <div class="container">
      <div class="about-header">
        <h1>{{ $t('about.title') }}</h1>
        <p class="subtitle">MIXMLAAL - 全球卓越的一站式多元化出行+本地生活生态平台</p>
      </div>

      <div class="about-content">
        <section class="section">
          <h2>{{ $t('about.mission') }}</h2>
          <p>{{ $t('about.missionText') }}</p>
        </section>

        <section class="section">
          <h2>{{ $t('about.services') }}</h2>
          <div class="services-grid">
            <div class="service-card">
              <div class="service-icon">🚗</div>
              <h3>{{ $t('about.ride') }}</h3>
              <p>{{ $t('about.rideDesc') }}</p>
            </div>
            <div class="service-card">
              <div class="service-icon">🍔</div>
              <h3>{{ $t('about.food') }}</h3>
              <p>{{ $t('about.foodDesc') }}</p>
            </div>
            <div class="service-card">
              <div class="service-icon">🛒</div>
              <h3>{{ $t('about.mall') }}</h3>
              <p>{{ $t('about.mallDesc') }}</p>
            </div>
            <div class="service-card">
              <div class="service-icon">📦</div>
              <h3>{{ $t('about.errand') }}</h3>
              <p>{{ $t('about.errandDesc') }}</p>
            </div>
          </div>
        </section>

        <section class="section">
          <h2>{{ $t('about.contact') }}</h2>
          <div class="contact-info">
            <p><strong>{{ $t('about.email') }}:</strong> support@laal.top</p>
            <p><strong>{{ $t('about.phone') }}:</strong> 400-888-8888</p>
            <p><strong>{{ $t('about.address') }}:</strong> {{ $t('about.addressText') }}</p>
          </div>
        </section>

        <section class="section">
          <h2>{{ $t('about.legal') }}</h2>
          <div class="links">
            <router-link to="/privacy">{{ $t('about.privacy') }}</router-link>
            <router-link to="/terms">{{ $t('about.terms') }}</router-link>
            <router-link to="/licenses">{{ $t('about.licenses') }}</router-link>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'About',
  metaInfo() {
    return {
      title: '关于我们 - MIXMLAAL',
    };
  },
};
</script>

<style scoped>
.about-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.about-header {
  text-align: center;
  color: white;
  margin-bottom: 60px;
}

.about-header h1 {
  font-size: 48px;
  margin-bottom: 20px;
}

.subtitle {
  font-size: 20px;
  opacity: 0.9;
}

.about-content {
  background: white;
  border-radius: 20px;
  padding: 60px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.section {
  margin-bottom: 50px;
}

.section h2 {
  font-size: 28px;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #667eea;
}

.section p {
  color: #666;
  line-height: 1.8;
  font-size: 16px;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 30px;
  margin-top: 30px;
}

.service-card {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  transition: transform 0.3s;
}

.service-card:hover {
  transform: translateY(-5px);
}

.service-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.service-card h3 {
  font-size: 20px;
  color: #333;
  margin-bottom: 10px;
}

.service-card p {
  font-size: 14px;
}

.contact-info p {
  margin: 10px 0;
}

.links {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.links a {
  color: #667eea;
  text-decoration: none;
  font-weight: 500;
}

.links a:hover {
  text-decoration: underline;
}
</style>
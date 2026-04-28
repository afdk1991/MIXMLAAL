<template>
  <div class="contact-page">
    <div class="container">
      <header class="page-header">
        <h1>{{ $t('contact.title') }}</h1>
        <p>{{ $t('contact.subtitle') }}</p>
      </header>

      <div class="contact-content">
        <div class="contact-form">
          <h2>{{ $t('contact.sendMessage') }}</h2>
          <form @submit.prevent="submitForm">
            <div class="form-group">
              <label>{{ $t('contact.name') }}</label>
              <input v-model="form.name" type="text" required />
            </div>
            <div class="form-group">
              <label>{{ $t('contact.email') }}</label>
              <input v-model="form.email" type="email" required />
            </div>
            <div class="form-group">
              <label>{{ $t('contact.phone') }}</label>
              <input v-model="form.phone" type="tel" />
            </div>
            <div class="form-group">
              <label>{{ $t('contact.subject') }}</label>
              <select v-model="form.subject">
                <option value="general">{{ $t('contact.general') }}</option>
                <option value="support">{{ $t('contact.techSupport') }}</option>
                <option value="business">{{ $t('contact.business') }}</option>
                <option value="feedback">{{ $t('contact.feedback') }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>{{ $t('contact.message') }}</label>
              <textarea v-model="form.message" rows="5" required></textarea>
            </div>
            <button type="submit" :disabled="submitting">
              {{ submitting ? $t('contact.submitting') : $t('contact.submit') }}
            </button>
          </form>
        </div>

        <div class="contact-info">
          <h2>{{ $t('contact.info') }}</h2>

          <div class="info-item">
            <div class="icon">📍</div>
            <div>
              <h3>{{ $t('contact.address') }}</h3>
              <p>{{ $t('contact.addressText') }}</p>
            </div>
          </div>

          <div class="info-item">
            <div class="icon">📞</div>
            <div>
              <h3>{{ $t('contact.hotline') }}</h3>
              <p>400-888-8888</p>
              <p class="hint">{{ $t('contact.hotlineHint') }}</p>
            </div>
          </div>

          <div class="info-item">
            <div class="icon">✉️</div>
            <div>
              <h3>{{ $t('contact.email') }}</h3>
              <p>support@laal.top</p>
            </div>
          </div>

          <div class="info-item">
            <div class="icon">⏰</div>
            <div>
              <h3>{{ $t('contact.hours') }}</h3>
              <p>{{ $t('contact.hoursText') }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Contact',
  data() {
    return {
      form: {
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      },
      submitting: false,
    };
  },
  methods: {
    async submitForm() {
      this.submitting = true;
      await new Promise(resolve => setTimeout(resolve, 1500));
      this.submitting = false;
      alert('提交成功！我们会尽快与您联系。');
      this.form = {
        name: '',
        email: '',
        phone: '',
        subject: 'general',
        message: '',
      };
    },
  },
};
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f5f7fa;
  padding: 40px 20px;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  text-align: center;
  margin-bottom: 50px;
}

.page-header h1 {
  font-size: 36px;
  color: #333;
  margin-bottom: 10px;
}

.page-header p {
  color: #666;
  font-size: 16px;
}

.contact-content {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 50px;
}

.contact-form {
  background: white;
  padding: 40px;
  border-radius: 16px;
}

.contact-form h2,
.contact-info h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #667eea;
}

.form-group textarea {
  resize: vertical;
}

button[type="submit"] {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s;
}

button[type="submit"]:hover:not(:disabled) {
  transform: translateY(-2px);
}

button[type="submit"]:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.contact-info {
  background: white;
  padding: 40px;
  border-radius: 16px;
  height: fit-content;
}

.info-item {
  display: flex;
  gap: 20px;
  margin-bottom: 30px;
}

.info-item .icon {
  font-size: 32px;
}

.info-item h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 5px;
}

.info-item p {
  color: #666;
  font-size: 14px;
}

.info-item .hint {
  font-size: 12px;
  color: #999;
  margin-top: 5px;
}

@media (max-width: 768px) {
  .contact-content {
    grid-template-columns: 1fr;
  }
}
</style>
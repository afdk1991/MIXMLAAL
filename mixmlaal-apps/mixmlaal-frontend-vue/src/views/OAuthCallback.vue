<template>
  <div class="oauth-callback-page">
    <div class="container">
      <div class="loading-content">
        <div class="spinner"></div>
        <h2>{{ $t('oauth.processing') }}</h2>
        <p>{{ $t('oauth.wait') }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OAuthCallback',
  mounted() {
    this.handleCallback();
  },
  methods: {
    async handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      const state = params.get('state');
      const error = params.get('error');

      if (error) {
        this.$router.push({
          path: '/login',
          query: { error: error },
        });
        return;
      }

      if (code) {
        try {
          const response = await fetch('/api/v1/auth/oauth/callback', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, state }),
          });

          const data = await response.json();

          if (data.status === 'success') {
            localStorage.setItem('access_token', data.data.token);
            localStorage.setItem('refresh_token', data.data.refreshToken);
            this.$router.push('/profile');
          } else {
            this.$router.push({
              path: '/login',
              query: { error: 'auth_failed' },
            });
          }
        } catch (err) {
          console.error('OAuth callback error:', err);
          this.$router.push({
            path: '/login',
            query: { error: 'network_error' },
          });
        }
      }
    },
  },
};
</script>

<style scoped>
.oauth-callback-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.container {
  text-align: center;
}

.loading-content {
  background: white;
  padding: 60px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.spinner {
  width: 60px;
  height: 60px;
  margin: 0 auto 30px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-content h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 10px;
}

.loading-content p {
  color: #666;
  font-size: 14px;
}
</style>
const express = require('express');
const authController = require('./controllers/auth');
const authMiddleware = require('./middleware/auth');
const securityAudit = require('./middleware/securityAudit');
const cacheManager = require('../../config/cache');

const app = express();

// 中间件
app.use(express.json());
app.use(securityAudit);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'Auth service is healthy' });
});

// 认证路由
app.post('/api/auth/login', authController.login);
app.post('/api/auth/register', authController.register);
app.post('/api/auth/logout', authMiddleware, authController.logout);
app.post('/api/auth/refresh', authController.refreshToken);
app.get('/api/auth/me', authMiddleware, authController.getMe);

// 第三方登录
app.get('/api/auth/oauth/:provider', authController.oauthRedirect);
app.get('/api/auth/oauth/:provider/callback', authController.oauthCallback);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Auth service error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.AUTH_PORT || 3001;
app.listen(PORT, () => {
  console.log(`Auth service is running on port ${PORT}`);
});

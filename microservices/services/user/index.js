const express = require('express');
const userController = require('./controllers/user');
const authMiddleware = require('./middleware/auth');
const securityAudit = require('./middleware/securityAudit');

const app = express();

// 中间件
app.use(express.json());
app.use(securityAudit);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'User service is healthy' });
});

// 用户路由
app.get('/api/users', authMiddleware, userController.getUsers);
app.get('/api/users/:id', authMiddleware, userController.getUserById);
app.put('/api/users/:id', authMiddleware, userController.updateUser);
app.delete('/api/users/:id', authMiddleware, userController.deleteUser);

// 用户地址管理
app.get('/api/users/:id/addresses', authMiddleware, userController.getUserAddresses);
app.post('/api/users/:id/addresses', authMiddleware, userController.addUserAddress);
app.put('/api/users/:id/addresses/:addressId', authMiddleware, userController.updateUserAddress);
app.delete('/api/users/:id/addresses/:addressId', authMiddleware, userController.deleteUserAddress);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('User service error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.USER_PORT || 3003;
app.listen(PORT, () => {
  console.log(`User service is running on port ${PORT}`);
});

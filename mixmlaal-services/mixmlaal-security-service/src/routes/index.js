const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const securityController = require('../controllers/security');

// 认证相关
router.post('/auth/login', securityController.login);
router.post('/auth/register', securityController.register);
router.post('/auth/refresh', securityController.refreshToken);
router.post('/auth/logout', authMiddleware, securityController.logout);

// 授权相关
router.get('/auth/me', authMiddleware, securityController.getCurrentUser);
router.post('/auth/change-password', authMiddleware, securityController.changePassword);

// 加密相关
router.post('/encrypt', authMiddleware, securityController.encrypt);
router.post('/decrypt', authMiddleware, securityController.decrypt);

// 安全审计
router.get('/audit/logs', authMiddleware, securityController.getAuditLogs);
router.post('/audit/log', authMiddleware, securityController.addAuditLog);

// 权限管理
router.get('/permissions', authMiddleware, securityController.getPermissions);
router.post('/permissions', authMiddleware, securityController.addPermission);
router.put('/permissions/:id', authMiddleware, securityController.updatePermission);
router.delete('/permissions/:id', authMiddleware, securityController.deletePermission);

// 角色管理
router.get('/roles', authMiddleware, securityController.getRoles);
router.post('/roles', authMiddleware, securityController.addRole);
router.put('/roles/:id', authMiddleware, securityController.updateRole);
router.delete('/roles/:id', authMiddleware, securityController.deleteRole);

module.exports = router;
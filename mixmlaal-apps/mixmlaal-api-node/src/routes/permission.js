const express = require('express');
const router = express.Router();
const permissionController = require('../controllers/permissionController');
const { authMiddleware } = require('../middleware/auth');

// 获取权限列表
router.get('/', authMiddleware, permissionController.getPermissions);

// 获取单个权限
router.get('/:id', authMiddleware, permissionController.getPermission);

// 创建权限
router.post('/', authMiddleware, permissionController.createPermission);

// 更新权限
router.put('/:id', authMiddleware, permissionController.updatePermission);

// 删除权限
router.delete('/:id', authMiddleware, permissionController.deletePermission);

// 获取权限树
router.get('/tree', authMiddleware, permissionController.getPermissionTree);

module.exports = router;
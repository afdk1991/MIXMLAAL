const express = require('express');
const router = express.Router();
const roleController = require('../controllers/roleController');
const { authMiddleware } = require('../middleware/auth');

// 获取角色列表
router.get('/', authMiddleware, roleController.getRoles);

// 获取单个角色
router.get('/:id', authMiddleware, roleController.getRole);

// 创建角色
router.post('/', authMiddleware, roleController.createRole);

// 更新角色
router.put('/:id', authMiddleware, roleController.updateRole);

// 删除角色
router.delete('/:id', authMiddleware, roleController.deleteRole);

// 分配权限给角色
router.post('/:id/permissions', authMiddleware, roleController.assignPermissions);

// 获取角色的权限
router.get('/:id/permissions', authMiddleware, roleController.getRolePermissions);

module.exports = router;
const express = require('express')
const router = express.Router()
const menuController = require('../controllers/menu')
const { authMiddleware, permissionMiddleware } = require('../middleware/auth')

// 获取菜单列表
router.get('/menus', authMiddleware, permissionMiddleware('menu:list'), menuController.getMenuList)

// 获取菜单树
router.get('/menus/tree', authMiddleware, permissionMiddleware('menu:list'), menuController.getMenuTree)

// 获取单个菜单
router.get('/menus/:id', authMiddleware, permissionMiddleware('menu:view'), menuController.getMenuById)

// 创建菜单
router.post('/menus', authMiddleware, permissionMiddleware('menu:create'), menuController.createMenu)

// 更新菜单
router.put('/menus/:id', authMiddleware, permissionMiddleware('menu:update'), menuController.updateMenu)

// 删除菜单
router.delete('/menus/:id', authMiddleware, permissionMiddleware('menu:delete'), menuController.deleteMenu)

module.exports = router
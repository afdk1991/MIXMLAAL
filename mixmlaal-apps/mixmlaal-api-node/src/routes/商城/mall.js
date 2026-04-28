const express = require('express')
const router = express.Router()
const mallController = require('../../controllers/商城/mall')
const { authMiddleware } = require('../../middleware/auth')

// 获取店铺列表
router.get('/mall/shops', authMiddleware, mallController.getShopList)

// 获取店铺详情
router.get('/mall/shops/:id', authMiddleware, mallController.getShopDetail)

// 获取商品列表
router.get('/mall/products', authMiddleware, mallController.getProductList)

// 获取商品详情
router.get('/mall/products/:id', authMiddleware, mallController.getProductDetail)

// 添加商品到购物车
router.post('/mall/cart', authMiddleware, mallController.addToCart)

// 获取购物车列表
router.get('/mall/cart', authMiddleware, mallController.getCartList)

// 更新购物车商品数量
router.put('/mall/cart/:id', authMiddleware, mallController.updateCartQuantity)

// 删除购物车商品
router.delete('/mall/cart/:id', authMiddleware, mallController.deleteCartItem)

// 创建商城订单
router.post('/mall/orders', authMiddleware, mallController.createOrder)

// 获取订单列表
router.get('/mall/orders', authMiddleware, mallController.getOrderList)

// 获取订单详情
router.get('/mall/orders/:id', authMiddleware, mallController.getOrderDetail)

module.exports = router
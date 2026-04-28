const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authMiddleware } = require('../middleware/auth');

// 商品相关路由
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProductById);
router.post('/products', authMiddleware, productController.createProduct);
router.put('/products/:id', authMiddleware, productController.updateProduct);
router.delete('/products/:id', authMiddleware, productController.deleteProduct);

// 分类相关路由
router.get('/categories', productController.getCategories);
router.post('/categories', authMiddleware, productController.createCategory);

module.exports = router;
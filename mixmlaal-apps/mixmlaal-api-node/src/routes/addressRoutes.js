const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');
const { authMiddleware } = require('../middleware/auth');
const fileService = require('../services/fileService');

// 获取地址列表
router.get('/', authMiddleware, addressController.getAddresses);

// 获取地址详情
router.get('/:id', authMiddleware, addressController.getAddressById);

// 创建地址
router.post('/', authMiddleware, addressController.createAddress);

// 更新地址
router.put('/:id', authMiddleware, addressController.updateAddress);

// 删除地址
router.delete('/:id', authMiddleware, addressController.deleteAddress);

// 批量导入地址
router.post('/import', authMiddleware, fileService.upload.single('file'), addressController.importAddresses);

// 下载地址模板
router.get('/template/download', authMiddleware, addressController.downloadTemplate);

module.exports = router;
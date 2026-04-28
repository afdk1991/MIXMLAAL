const express = require('express')
const router = express.Router()
const articleController = require('../../controllers/内容/article')
const { authMiddleware, permissionMiddleware } = require('../../middleware/auth')

// 创建文章
router.post('/articles', authMiddleware, permissionMiddleware('article:create'), articleController.createArticle)

// 获取文章列表
router.get('/articles', articleController.getArticleList)

// 获取文章详情
router.get('/articles/:id', articleController.getArticleDetail)

// 更新文章
router.put('/articles/:id', authMiddleware, permissionMiddleware('article:update'), articleController.updateArticle)

// 删除文章
router.delete('/articles/:id', authMiddleware, permissionMiddleware('article:delete'), articleController.deleteArticle)

// 点赞文章
router.post('/articles/:id/like', authMiddleware, articleController.likeArticle)

// 分享文章
router.post('/articles/:id/share', authMiddleware, articleController.shareArticle)

module.exports = router
const express = require('express')
const router = express.Router()
const postController = require('../../controllers/社交/post')
const { authMiddleware, permissionMiddleware } = require('../../middleware/auth')

// 创建动态
router.post('/posts', authMiddleware, postController.createPost)

// 获取动态列表
router.get('/posts', postController.getPostList)

// 获取动态详情
router.get('/posts/:id', postController.getPostDetail)

// 更新动态
router.put('/posts/:id', authMiddleware, postController.updatePost)

// 删除动态
router.delete('/posts/:id', authMiddleware, postController.deletePost)

// 点赞动态
router.post('/posts/:id/like', authMiddleware, postController.likePost)

// 分享动态
router.post('/posts/:id/share', authMiddleware, postController.sharePost)

// 收藏动态
router.post('/posts/:id/collect', authMiddleware, postController.collectPost)

module.exports = router
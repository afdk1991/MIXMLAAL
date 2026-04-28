const express = require('express')
const router = express.Router()
const videoController = require('../../controllers/视频/video')
const { authMiddleware, permissionMiddleware } = require('../../middleware/auth')

// 创建视频
router.post('/videos', authMiddleware, permissionMiddleware('video:create'), videoController.createVideo)

// 获取视频列表
router.get('/videos', videoController.getVideoList)

// 获取视频详情
router.get('/videos/:id', videoController.getVideoDetail)

// 更新视频
router.put('/videos/:id', authMiddleware, permissionMiddleware('video:update'), videoController.updateVideo)

// 删除视频
router.delete('/videos/:id', authMiddleware, permissionMiddleware('video:delete'), videoController.deleteVideo)

// 点赞视频
router.post('/videos/:id/like', authMiddleware, videoController.likeVideo)

// 分享视频
router.post('/videos/:id/share', authMiddleware, videoController.shareVideo)

// 收藏视频
router.post('/videos/:id/collect', authMiddleware, videoController.collectVideo)

module.exports = router
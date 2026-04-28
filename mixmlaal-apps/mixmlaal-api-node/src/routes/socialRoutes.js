const express = require('express');
const router = express.Router();
const socialController = require('../controllers/socialController');
const { authMiddleware } = require('../middleware/auth');

// 第三方登录相关
router.get('/oauth/:provider/url', socialController.getOAuthUrl);
router.get('/oauth/:provider/callback', socialController.oauthCallback);
router.post('/oauth/bind/:provider', authMiddleware, socialController.bindThirdParty);
router.post('/oauth/unbind/:provider', authMiddleware, socialController.unbindThirdParty);
router.get('/oauth/third-party/status', authMiddleware, socialController.getThirdPartyStatus);

// 动态相关
router.post('/posts', authMiddleware, socialController.createPost);
router.get('/posts', socialController.getPosts);
router.get('/posts/:postId', socialController.getPostDetail);
router.delete('/posts/:postId', authMiddleware, socialController.deletePost);

// 点赞相关
router.post('/posts/:postId/like', authMiddleware, socialController.likePost);

// 评论相关
router.post('/posts/:postId/comments', authMiddleware, socialController.addComment);
router.get('/posts/:postId/comments', socialController.getComments);

// 个人社交
router.get('/liked-posts', authMiddleware, socialController.getLikedPosts);

// 搜索
router.get('/search', socialController.searchPosts);

module.exports = router;

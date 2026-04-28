const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const authMiddleware = require('../middleware/auth');
const oauthRoutes = require('./oauth');

router.post('/login', authController.login);

router.post('/register', authController.register);

router.post('/logout', authMiddleware, authController.logout);

router.post('/refresh', authController.refreshToken);

router.get('/me', authMiddleware, authController.getMe);

router.use('/oauth', oauthRoutes);

module.exports = router;
const express = require('express');
const router = express.Router();
const growthTaskController = require('../controllers/growthTaskController');
const { authMiddleware } = require('../middleware/auth');

router.get('/', authMiddleware, growthTaskController.getTasks);
router.post('/claim', authMiddleware, growthTaskController.claimReward);
router.post('/progress', authMiddleware, growthTaskController.updateProgress);
router.get('/progress', authMiddleware, growthTaskController.getProgress);

module.exports = router;
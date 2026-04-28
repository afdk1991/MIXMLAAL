const express = require('express');
const router = express.Router();
const contentSyncService = require('../services/contentSyncService');
const auth = require('../middleware/auth');

router.post('/register-target', auth, async (req, res) => {
  try {
    const { targetId, callbackUrl } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: '目标ID不能为空'
      });
    }

    const handler = async (syncResult) => {
      try {
        if (callbackUrl) {
          await fetch(callbackUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(syncResult)
          });
        }
      } catch (error) {
        console.error(`Sync callback failed for ${targetId}:`, error);
      }
    };

    contentSyncService.registerTarget(targetId, handler);

    res.json({
      success: true,
      message: '同步目标注册成功',
      data: { targetId }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '注册同步目标失败'
    });
  }
});

router.post('/unregister-target', auth, async (req, res) => {
  try {
    const { targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: '目标ID不能为空'
      });
    }

    contentSyncService.clearSyncInterval(targetId);
    contentSyncService.unregisterTarget(targetId);

    res.json({
      success: true,
      message: '同步目标注销成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '注销同步目标失败'
    });
  }
});

router.post('/sync', auth, async (req, res) => {
  try {
    const { targetId, since, forceFullSync, contentTypes, status } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: '目标ID不能为空'
      });
    }

    const result = await contentSyncService.syncContent(targetId, {
      since,
      forceFullSync,
      contentTypes,
      status
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '同步内容失败'
    });
  }
});

router.post('/broadcast', auth, async (req, res) => {
  try {
    const { contentId, eventType } = req.body;

    if (!contentId) {
      return res.status(400).json({
        success: false,
        error: '内容ID不能为空'
      });
    }

    const results = await contentSyncService.broadcastUpdate(contentId, eventType);

    res.json({
      success: true,
      data: { results }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '广播更新失败'
    });
  }
});

router.get('/status', auth, async (req, res) => {
  try {
    const { targetId } = req.query;
    const status = contentSyncService.getSyncStatus(targetId);

    res.json({
      success: true,
      data: status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取同步状态失败'
    });
  }
});

router.post('/set-interval', auth, async (req, res) => {
  try {
    const { targetId, intervalMs } = req.body;

    if (!targetId || !intervalMs) {
      return res.status(400).json({
        success: false,
        error: '目标ID和间隔时间不能为空'
      });
    }

    const interval = contentSyncService.setSyncInterval(targetId, intervalMs);

    res.json({
      success: true,
      message: '同步间隔设置成功',
      data: { targetId, intervalMs }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '设置同步间隔失败'
    });
  }
});

router.post('/clear-interval', auth, async (req, res) => {
  try {
    const { targetId } = req.body;

    if (!targetId) {
      return res.status(400).json({
        success: false,
        error: '目标ID不能为空'
      });
    }

    contentSyncService.clearSyncInterval(targetId);

    res.json({
      success: true,
      message: '同步间隔清除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '清除同步间隔失败'
    });
  }
});

module.exports = router;

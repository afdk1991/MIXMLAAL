const { Content } = require('../models');
const { Op } = require('sequelize');

class ContentSyncService {
  constructor() {
    this.syncTargets = new Map();
    this.lastSyncTime = new Map();
    this.syncIntervals = new Map();
  }

  registerTarget(targetId, handler) {
    this.syncTargets.set(targetId, {
      handler,
      registeredAt: Date.now(),
      lastSync: null,
      status: 'active'
    });
  }

  unregisterTarget(targetId) {
    this.syncTargets.delete(targetId);
  }

  async syncContent(targetId, options = {}) {
    const target = this.syncTargets.get(targetId);
    if (!target) {
      throw new Error(`Sync target ${targetId} not registered`);
    }

    const {
      since = null,
      forceFullSync = false,
      contentTypes = null,
      status = 'published'
    } = options;

    try {
      const where = { status };

      if (contentTypes) {
        where.type = Array.isArray(contentTypes) ? contentTypes : [contentTypes];
      }

      if (since && !forceFullSync) {
        where.updatedAt = { [Op.gt]: new Date(since) };
      }

      const contents = await Content.findAll({
        where,
        order: [['updatedAt', 'DESC']],
        include: ['author']
      });

      const syncResult = {
        targetId,
        syncedAt: Date.now(),
        contentCount: contents.length,
        contents: contents.map(c => this.formatContent(c)),
        success: true
      };

      await target.handler(syncResult);

      target.lastSync = Date.now();
      this.lastSyncTime.set(targetId, Date.now());

      return syncResult;
    } catch (error) {
      console.error(`Content sync failed for target ${targetId}:`, error);
      throw error;
    }
  }

  formatContent(content) {
    return {
      id: content.id,
      title: content.title,
      content: content.content,
      type: content.type,
      status: content.status,
      tags: content.tags,
      metadata: content.metadata,
      authorId: content.authorId,
      authorName: content.author ? content.author.name : null,
      createdAt: content.createdAt,
      updatedAt: content.updatedAt
    };
  }

  async broadcastUpdate(contentId, eventType = 'update') {
    const content = await Content.findByPk(contentId, {
      include: ['author']
    });

    if (!content) {
      throw new Error(`Content ${contentId} not found`);
    }

    const formattedContent = this.formatContent(content);
    const broadcastPayload = {
      eventType,
      content: formattedContent,
      timestamp: Date.now()
    };

    const results = [];
    for (const [targetId, target] of this.syncTargets) {
      try {
        await target.handler(broadcastPayload);
        results.push({ targetId, success: true });
      } catch (error) {
        results.push({ targetId, success: false, error: error.message });
      }
    }

    return results;
  }

  async getSyncStatus(targetId = null) {
    if (targetId) {
      const target = this.syncTargets.get(targetId);
      if (!target) {
        return null;
      }
      return {
        targetId,
        status: target.status,
        lastSync: target.lastSync,
        registeredAt: target.registeredAt
      };
    }

    const status = {};
    for (const [id, target] of this.syncTargets) {
      status[id] = {
        status: target.status,
        lastSync: target.lastSync,
        registeredAt: target.registeredAt
      };
    }
    return status;
  }

  setSyncInterval(targetId, intervalMs) {
    const target = this.syncTargets.get(targetId);
    if (!target) {
      throw new Error(`Sync target ${targetId} not registered`);
    }

    if (this.syncIntervals.has(targetId)) {
      clearInterval(this.syncIntervals.get(targetId));
    }

    const interval = setInterval(async () => {
      try {
        await this.syncContent(targetId, {
          since: target.lastSync
        });
      } catch (error) {
        console.error(`Interval sync failed for ${targetId}:`, error);
      }
    }, intervalMs);

    this.syncIntervals.set(targetId, interval);
    return interval;
  }

  clearSyncInterval(targetId) {
    if (this.syncIntervals.has(targetId)) {
      clearInterval(this.syncIntervals.get(targetId));
      this.syncIntervals.delete(targetId);
    }
  }

  async cleanup() {
    for (const [targetId, interval] of this.syncIntervals) {
      clearInterval(interval);
    }
    this.syncIntervals.clear();
    this.syncTargets.clear();
    this.lastSyncTime.clear();
  }
}

module.exports = new ContentSyncService();

// 内容管理路由
const express = require('express');
const router = express.Router();
const { Op } = require('sequelize');
const { authMiddleware } = require('../middleware/auth');
const { Content } = require('../models');

// 获取内容列表
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { page = 1, limit = 10, type, status, search } = req.query;
    
    const where = {};
    if (type) where.type = type;
    if (status) where.status = status;
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { content: { [Op.like]: `%${search}%` } }
      ];
    }
    
    const offset = (page - 1) * limit;
    const contents = await Content.findAndCountAll({
      where,
      offset,
      limit: parseInt(limit),
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      success: true,
      data: {
        contents: contents.rows,
        total: contents.count,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(contents.count / limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取内容列表失败'
    });
  }
});

// 获取单个内容
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findByPk(id);
    
    if (!content) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '获取内容失败'
    });
  }
});

// 创建内容
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content, type, status, tags, metadata } = req.body;
    
    if (!title || !content || !type) {
      return res.status(400).json({
        success: false,
        error: '标题、内容和类型不能为空'
      });
    }
    
    const newContent = await Content.create({
      title,
      content,
      type,
      status: status || 'draft',
      authorId: req.user.id,
      tags,
      metadata
    });
    
    res.json({
      success: true,
      data: newContent
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '创建内容失败'
    });
  }
});

// 更新内容
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, type, status, tags, metadata } = req.body;
    
    const contentToUpdate = await Content.findByPk(id);
    
    if (!contentToUpdate) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    // 检查权限
    if (contentToUpdate.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '没有权限更新此内容'
      });
    }
    
    await contentToUpdate.update({
      title: title || contentToUpdate.title,
      content: content || contentToUpdate.content,
      type: type || contentToUpdate.type,
      status: status || contentToUpdate.status,
      tags: tags !== undefined ? tags : contentToUpdate.tags,
      metadata: metadata !== undefined ? metadata : contentToUpdate.metadata
    });
    
    res.json({
      success: true,
      data: contentToUpdate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '更新内容失败'
    });
  }
});

// 删除内容
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const contentToDelete = await Content.findByPk(id);
    
    if (!contentToDelete) {
      return res.status(404).json({
        success: false,
        error: '内容不存在'
      });
    }
    
    // 检查权限
    if (contentToDelete.authorId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: '没有权限删除此内容'
      });
    }
    
    await contentToDelete.destroy();
    
    res.json({
      success: true,
      message: '内容删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: '删除内容失败'
    });
  }
});

module.exports = router;

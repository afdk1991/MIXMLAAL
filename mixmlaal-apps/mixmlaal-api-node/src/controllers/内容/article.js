const { Op } = require('sequelize')
const Article = require('../../models/内容/Article')

// 创建文章
const createArticle = async (req, res) => {
  try {
    const {
      title,
      content,
      category_id,
      tags,
      cover_image,
      article_type,
      source_url
    } = req.body

    const article_no = `AR${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const article = await Article.create({
      article_no,
      user_id: req.user.id,
      title,
      content,
      category_id,
      tags,
      cover_image,
      article_type,
      source_url,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      data: article,
      message: '创建文章成功'
    })
  } catch (error) {
    console.error('创建文章失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '创建文章失败'
    })
  }
}

// 获取文章列表
const getArticleList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, category_id, keyword, status, is_recommend, is_hot, is_top } = req.query
    
    const where = {}
    if (category_id) {
      where.category_id = category_id
    }
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    if (status) {
      where.status = status
    } else {
      where.status = 'published'
    }
    if (is_recommend !== undefined) {
      where.is_recommend = is_recommend === 'true'
    }
    if (is_hot !== undefined) {
      where.is_hot = is_hot === 'true'
    }
    if (is_top !== undefined) {
      where.is_top = is_top === 'true'
    }

    const articles = await Article.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [
        ['is_top', 'DESC'],
        ['is_recommend', 'DESC'],
        ['is_hot', 'DESC'],
        ['publish_time', 'DESC'],
        ['created_at', 'DESC']
      ]
    })

    res.status(200).json({
      success: true,
      data: {
        list: articles.rows,
        total: articles.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取文章列表成功'
    })
  } catch (error) {
    console.error('获取文章列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取文章列表失败'
    })
  }
}

// 获取文章详情
const getArticleDetail = async (req, res) => {
  try {
    const { id } = req.params

    const article = await Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '文章不存在'
      })
    }

    // 增加阅读数
    await article.increment('read_count')

    res.status(200).json({
      success: true,
      data: article,
      message: '获取文章详情成功'
    })
  } catch (error) {
    console.error('获取文章详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取文章详情失败'
    })
  }
}

// 更新文章
const updateArticle = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      content,
      category_id,
      tags,
      cover_image,
      status
    } = req.body

    const article = await Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '文章不存在'
      })
    }

    const updateData = {
      title,
      content,
      category_id,
      tags,
      cover_image,
      status
    }

    if (status === 'published' && !article.publish_time) {
      updateData.publish_time = new Date()
    }

    await article.update(updateData)

    res.status(200).json({
      success: true,
      data: article,
      message: '更新文章成功'
    })
  } catch (error) {
    console.error('更新文章失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新文章失败'
    })
  }
}

// 删除文章
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params

    const article = await Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '文章不存在'
      })
    }

    await article.destroy()

    res.status(200).json({
      success: true,
      data: null,
      message: '删除文章成功'
    })
  } catch (error) {
    console.error('删除文章失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '删除文章失败'
    })
  }
}

// 点赞文章
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params

    const article = await Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '文章不存在'
      })
    }

    await article.increment('like_count')

    res.status(200).json({
      success: true,
      data: article,
      message: '点赞成功'
    })
  } catch (error) {
    console.error('点赞失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '点赞失败'
    })
  }
}

// 分享文章
const shareArticle = async (req, res) => {
  try {
    const { id } = req.params

    const article = await Article.findByPk(id)

    if (!article) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '文章不存在'
      })
    }

    await article.increment('share_count')

    res.status(200).json({
      success: true,
      data: article,
      message: '分享成功'
    })
  } catch (error) {
    console.error('分享失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '分享失败'
    })
  }
}

module.exports = {
  createArticle,
  getArticleList,
  getArticleDetail,
  updateArticle,
  deleteArticle,
  likeArticle,
  shareArticle
}
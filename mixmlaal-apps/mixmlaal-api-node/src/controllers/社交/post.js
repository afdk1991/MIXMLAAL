const { Op } = require('sequelize')
const Post = require('../../models/社交/Post')

// 创建动态
const createPost = async (req, res) => {
  try {
    const {
      content,
      images,
      video_url,
      post_type,
      location,
      topic_id,
      topic_name,
      at_users
    } = req.body

    const post_no = `PT${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const post = await Post.create({
      post_no,
      user_id: req.user.id,
      content,
      images,
      video_url,
      post_type,
      location,
      topic_id,
      topic_name,
      at_users,
      status: 'published'
    })

    res.status(201).json({
      success: true,
      data: post,
      message: '发布动态成功'
    })
  } catch (error) {
    console.error('发布动态失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '发布动态失败'
    })
  }
}

// 获取动态列表
const getPostList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, user_id, post_type, is_top, is_essence, topic_id } = req.query
    
    const where = {}
    if (user_id) {
      where.user_id = user_id
    }
    if (post_type) {
      where.post_type = post_type
    }
    if (is_top !== undefined) {
      where.is_top = is_top === 'true'
    }
    if (is_essence !== undefined) {
      where.is_essence = is_essence === 'true'
    }
    if (topic_id) {
      where.topic_id = topic_id
    }
    where.status = 'published'

    const posts = await Post.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [
        ['is_top', 'DESC'],
        ['is_essence', 'DESC'],
        ['created_at', 'DESC']
      ]
    })

    res.status(200).json({
      success: true,
      data: {
        list: posts.rows,
        total: posts.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取动态列表成功'
    })
  } catch (error) {
    console.error('获取动态列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取动态列表失败'
    })
  }
}

// 获取动态详情
const getPostDetail = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    // 增加浏览数
    await post.increment('view_count')

    res.status(200).json({
      success: true,
      data: post,
      message: '获取动态详情成功'
    })
  } catch (error) {
    console.error('获取动态详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取动态详情失败'
    })
  }
}

// 更新动态
const updatePost = async (req, res) => {
  try {
    const { id } = req.params
    const {
      content,
      images,
      video_url,
      location,
      topic_id,
      topic_name
    } = req.body

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: '无权修改此动态'
      })
    }

    await post.update({
      content,
      images,
      video_url,
      location,
      topic_id,
      topic_name
    })

    res.status(200).json({
      success: true,
      data: post,
      message: '更新动态成功'
    })
  } catch (error) {
    console.error('更新动态失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新动态失败'
    })
  }
}

// 删除动态
const deletePost = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    if (post.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        data: null,
        message: '无权删除此动态'
      })
    }

    await post.update({ status: 'deleted' })

    res.status(200).json({
      success: true,
      data: null,
      message: '删除动态成功'
    })
  } catch (error) {
    console.error('删除动态失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '删除动态失败'
    })
  }
}

// 点赞动态
const likePost = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    await post.increment('like_count')

    res.status(200).json({
      success: true,
      data: post,
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

// 分享动态
const sharePost = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    await post.increment('share_count')

    res.status(200).json({
      success: true,
      data: post,
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

// 收藏动态
const collectPost = async (req, res) => {
  try {
    const { id } = req.params

    const post = await Post.findByPk(id)

    if (!post) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '动态不存在'
      })
    }

    await post.increment('collect_count')

    res.status(200).json({
      success: true,
      data: post,
      message: '收藏成功'
    })
  } catch (error) {
    console.error('收藏失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '收藏失败'
    })
  }
}

module.exports = {
  createPost,
  getPostList,
  getPostDetail,
  updatePost,
  deletePost,
  likePost,
  sharePost,
  collectPost
}
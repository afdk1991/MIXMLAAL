const { Op } = require('sequelize')
const Video = require('../../models/视频/Video')

// 创建视频
const createVideo = async (req, res) => {
  try {
    const {
      title,
      video_url,
      cover_url,
      category_id,
      tags,
      description,
      video_type
    } = req.body

    const video_no = `VD${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    const video = await Video.create({
      video_no,
      user_id: req.user.id,
      title,
      video_url,
      cover_url,
      category_id,
      tags,
      description,
      video_type,
      status: 'pending'
    })

    res.status(201).json({
      success: true,
      data: video,
      message: '创建视频成功'
    })
  } catch (error) {
    console.error('创建视频失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '创建视频失败'
    })
  }
}

// 获取视频列表
const getVideoList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, category_id, keyword, video_type, is_recommend, is_hot, is_top } = req.query
    
    const where = {}
    if (category_id) {
      where.category_id = category_id
    }
    if (keyword) {
      where.title = { [Op.like]: `%${keyword}%` }
    }
    if (video_type) {
      where.video_type = video_type
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
    where.status = 'published'

    const videos = await Video.findAndCountAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [
        ['is_top', 'DESC'],
        ['is_recommend', 'DESC'],
        ['is_hot', 'DESC'],
        ['view_count', 'DESC'],
        ['created_at', 'DESC']
      ]
    })

    res.status(200).json({
      success: true,
      data: {
        list: videos.rows,
        total: videos.count,
        page: parseInt(page),
        page_size: parseInt(page_size)
      },
      message: '获取视频列表成功'
    })
  } catch (error) {
    console.error('获取视频列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取视频列表失败'
    })
  }
}

// 获取视频详情
const getVideoDetail = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    // 增加观看数
    await video.increment('view_count')

    res.status(200).json({
      success: true,
      data: video,
      message: '获取视频详情成功'
    })
  } catch (error) {
    console.error('获取视频详情失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取视频详情失败'
    })
  }
}

// 更新视频
const updateVideo = async (req, res) => {
  try {
    const { id } = req.params
    const {
      title,
      cover_url,
      category_id,
      tags,
      description,
      status
    } = req.body

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    const updateData = {
      title,
      cover_url,
      category_id,
      tags,
      description,
      status
    }

    if (status === 'published' && !video.publish_time) {
      updateData.publish_time = new Date()
    }

    await video.update(updateData)

    res.status(200).json({
      success: true,
      data: video,
      message: '更新视频成功'
    })
  } catch (error) {
    console.error('更新视频失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新视频失败'
    })
  }
}

// 删除视频
const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    await video.destroy()

    res.status(200).json({
      success: true,
      data: null,
      message: '删除视频成功'
    })
  } catch (error) {
    console.error('删除视频失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '删除视频失败'
    })
  }
}

// 点赞视频
const likeVideo = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    await video.increment('like_count')

    res.status(200).json({
      success: true,
      data: video,
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

// 分享视频
const shareVideo = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    await video.increment('share_count')

    res.status(200).json({
      success: true,
      data: video,
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

// 收藏视频
const collectVideo = async (req, res) => {
  try {
    const { id } = req.params

    const video = await Video.findByPk(id)

    if (!video) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '视频不存在'
      })
    }

    await video.increment('collect_count')

    res.status(200).json({
      success: true,
      data: video,
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
  createVideo,
  getVideoList,
  getVideoDetail,
  updateVideo,
  deleteVideo,
  likeVideo,
  shareVideo,
  collectVideo
}
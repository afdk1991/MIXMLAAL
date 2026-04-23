const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Article = sequelize.define('Article', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  article_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '文章编号'
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '分类ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '作者ID'
  },
  article_type: {
    type: DataTypes.ENUM('original', 'reprint', 'translation'),
    defaultValue: 'original',
    comment: '文章类型 original原创 reprint转载 translation翻译'
  },
  source_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '来源URL'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  summary: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '摘要'
  },
  cover_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '封面图'
  },
  cover_images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '封面图列表'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '内容'
  },
  content_type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'audio', 'mixed'),
    defaultValue: 'text',
    comment: '内容类型'
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '视频URL'
  },
  audio_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '音频URL'
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '标签'
  },
  keywords: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '关键词'
  },
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  is_recommend: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否推荐'
  },
  is_hot: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否热门'
  },
  is_slide: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否幻灯片'
  },
  is_original: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否原创'
  },
  read_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '阅读数'
  },
  like_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '点赞数'
  },
  comment_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '评论数'
  },
  share_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '分享数'
  },
  collect_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '收藏数'
  },
  reward_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '打赏数'
  },
  reward_amount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0,
    comment: '打赏金额'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '发布位置'
  },
  latitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    comment: '纬度'
  },
  longitude: {
    type: DataTypes.DECIMAL(10, 6),
    allowNull: true,
    comment: '经度'
  },
  city: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '城市'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP地址'
  },
  user_agent: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '用户代理'
  },
  source: {
    type: DataTypes.ENUM('h5', 'app', 'miniapp', 'pc', 'admin'),
    defaultValue: 'h5',
    comment: '来源'
  },
  status: {
    type: DataTypes.ENUM('draft', 'pending', 'published', 'rejected', 'deleted'),
    defaultValue: 'draft',
    comment: '状态 draft草稿 pending待审核 published已发布 rejected已拒绝 deleted已删除'
  },
  publish_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发布时间'
  },
  reject_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '拒绝原因'
  },
  reject_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '拒绝时间'
  },
  sort: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序'
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'articles',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['article_no'] },
    { fields: ['user_id'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['is_top'] },
    { fields: ['is_recommend'] },
    { fields: ['is_hot'] },
    { fields: ['publish_time'] },
    { fields: ['created_at'] }
  ]
})

module.exports = Article
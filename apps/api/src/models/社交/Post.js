const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  post_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '动态编号'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  group_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '社群ID'
  },
  post_type: {
    type: DataTypes.ENUM('text', 'image', 'video', 'link', 'activity', 'vote'),
    defaultValue: 'text',
    comment: '动态类型 text文字 image图文 video视频 link链接 activity活动 vote投票'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '内容'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '图片列表'
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '视频URL'
  },
  video_cover: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '视频封面'
  },
  link_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '链接URL'
  },
  link_title: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '链接标题'
  },
  link_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '链接图片'
  },
  link_desc: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '链接描述'
  },
  location: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '位置'
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
  activity_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '活动的时间'
  },
  activity_address: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '活动地址'
  },
  activity_limit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '活动人数限制'
  },
  activity_signup_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '报名人数'
  },
  vote_options: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '投票选项 [{option, count}]'
  },
  vote_deadline: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '投票截止时间'
  },
  vote_multiple: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否允许多选'
  },
  vote_max: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    comment: '最多可选数'
  },
  vote_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '投票数'
  },
  at_users: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '@的用户ID列表'
  },
  topic_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '话题ID'
  },
  topic_name: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '话题名称'
  },
  related_product_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联商品ID'
  },
  related_shop_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联店铺ID'
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '浏览数'
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
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  is_essence: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否精华'
  },
  is_follow_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否关注置顶'
  },
  allow_comment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否允许评论'
  },
  allow_share: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否允许分享'
  },
  status: {
    type: DataTypes.ENUM('pending', 'published', 'hidden', 'deleted'),
    defaultValue: 'published',
    comment: '状态 pending待审核 published已发布 hidden已隐藏 deleted已删除'
  },
  publish_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '发布时间'
  },
  ip_address: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'IP地址'
  },
  source: {
    type: DataTypes.ENUM('h5', 'app', 'miniapp', 'pc'),
    defaultValue: 'app',
    comment: '来源'
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
  tableName: 'posts',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['post_no'] },
    { fields: ['user_id'] },
    { fields: ['group_id'] },
    { fields: ['topic_id'] },
    { fields: ['status'] },
    { fields: ['is_top'] },
    { fields: ['is_essence'] },
    { fields: ['publish_time'] },
    { fields: ['created_at'] }
  ]
})

module.exports = Post
const { DataTypes } = require('sequelize')
const { sequelize } = require('../../config/database')

const Video = sequelize.define('Video', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  video_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '视频编号'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  video_type: {
    type: DataTypes.ENUM('short', 'live'),
    allowNull: false,
    comment: '视频类型 short短视频 live直播'
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '标题'
  },
  cover_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '封面URL'
  },
  video_url: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '视频URL'
  },
  duration: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '时长(秒)'
  },
  width: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '宽度'
  },
  height: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '高度'
  },
  file_size: {
    type: DataTypes.BIGINT,
    defaultValue: 0,
    comment: '文件大小(字节)'
  },
  category_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '分类ID'
  },
  tags: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '标签'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '描述'
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
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '观看数'
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
  download_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '下载数'
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
  is_top: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否置顶'
  },
  allow_comment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否允许评论'
  },
  allow_download: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否允许下载'
  },
  allow_share: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否允许分享'
  },
  watermark: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否水印'
  },
  status: {
    type: DataTypes.ENUM('uploading', 'processing', 'published', 'rejected', 'deleted'),
    defaultValue: 'uploading',
    comment: '状态 uploading上传中 processing处理中 published已发布 rejected已拒绝 deleted已删除'
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
  music_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '背景音乐ID'
  },
  music_title: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '音乐标题'
  },
  music_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: '音乐URL'
  },
  music_duration: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '音乐时长'
  },
  product_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '关联商品ID'
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
  tableName: 'videos',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['video_no'] },
    { fields: ['user_id'] },
    { fields: ['video_type'] },
    { fields: ['category_id'] },
    { fields: ['status'] },
    { fields: ['is_recommend'] },
    { fields: ['is_hot'] },
    { fields: ['publish_time'] },
    { fields: ['created_at'] }
  ]
})

module.exports = Video
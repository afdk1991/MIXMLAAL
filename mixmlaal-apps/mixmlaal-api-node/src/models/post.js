const db = require('../config/db');

class Post {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.images = data.images;
    this.video = data.video;
    this.likes = data.likes;
    this.comments = data.comments;
    this.status = data.status;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  // 根据ID查找动态
  static async findById(id) {
    const sql = 'SELECT * FROM posts WHERE id = ?';
    const post = await db.queryOne(sql, [id]);
    return post ? new Post(post) : null;
  }

  // 查找所有动态
  static async findAll(offset = 0, limit = 10) {
    const sql = 'SELECT * FROM posts WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const posts = await db.query(sql, ['active', limit, offset]);
    return posts.map(post => new Post(post));
  }

  // 根据用户ID查找动态
  static async findByUserId(userId, offset = 0, limit = 10) {
    const sql = 'SELECT * FROM posts WHERE user_id = ? AND status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const posts = await db.query(sql, [userId, 'active', limit, offset]);
    return posts.map(post => new Post(post));
  }

  // 创建动态
  static async create(data) {
    const sql = `
      INSERT INTO posts 
      (user_id, content, images, video, likes, comments, status, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `;
    const result = await db.insert(sql, [
      data.user_id,
      data.content,
      JSON.stringify(data.images || []),
      data.video || null,
      0,
      0,
      data.status || 'active'
    ]);
    return result;
  }

  // 更新动态
  async update(data) {
    const sql = `
      UPDATE posts 
      SET 
        content = ?, 
        images = ?, 
        video = ?, 
        likes = ?, 
        comments = ?, 
        status = ?, 
        updated_at = NOW() 
      WHERE id = ?
    `;
    const result = await db.update(sql, [
      data.content || this.content,
      JSON.stringify(data.images || this.images),
      data.video || this.video,
      data.likes || this.likes,
      data.comments || this.comments,
      data.status || this.status,
      this.id
    ]);
    return result;
  }

  // 删除动态
  async delete() {
    const sql = 'DELETE FROM posts WHERE id = ?';
    const result = await db.remove(sql, [this.id]);
    return result;
  }

  // 增加点赞数
  async incrementLikes() {
    const sql = 'UPDATE posts SET likes = likes + 1, updated_at = NOW() WHERE id = ?';
    const result = await db.update(sql, [this.id]);
    return result;
  }

  // 减少点赞数
  async decrementLikes() {
    const sql = 'UPDATE posts SET likes = GREATEST(0, likes - 1), updated_at = NOW() WHERE id = ?';
    const result = await db.update(sql, [this.id]);
    return result;
  }

  // 增加评论数
  async incrementComments() {
    const sql = 'UPDATE posts SET comments = comments + 1, updated_at = NOW() WHERE id = ?';
    const result = await db.update(sql, [this.id]);
    return result;
  }

  // 减少评论数
  async decrementComments() {
    const sql = 'UPDATE posts SET comments = GREATEST(0, comments - 1), updated_at = NOW() WHERE id = ?';
    const result = await db.update(sql, [this.id]);
    return result;
  }

  // 获取动态数量
  static async count() {
    const sql = 'SELECT COUNT(*) as count FROM posts WHERE status = ?';
    const result = await db.queryOne(sql, ['active']);
    return result ? result.count : 0;
  }

  // 根据用户ID获取动态数量
  static async countByUserId(userId) {
    const sql = 'SELECT COUNT(*) as count FROM posts WHERE user_id = ? AND status = ?';
    const result = await db.queryOne(sql, [userId, 'active']);
    return result ? result.count : 0;
  }
}

module.exports = Post;
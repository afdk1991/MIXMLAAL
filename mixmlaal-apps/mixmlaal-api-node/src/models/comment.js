const db = require('../config/db');

class Comment {
  constructor(data) {
    this.id = data.id;
    this.post_id = data.post_id;
    this.user_id = data.user_id;
    this.content = data.content;
    this.status = data.status;
    this.created_at = data.created_at;
  }

  // 根据ID查找评论
  static async findById(id) {
    const sql = 'SELECT * FROM comments WHERE id = ?';
    const comment = await db.queryOne(sql, [id]);
    return comment ? new Comment(comment) : null;
  }

  // 根据帖子ID查找评论
  static async findByPostId(postId, offset = 0, limit = 10) {
    const sql = 'SELECT * FROM comments WHERE post_id = ? AND status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const comments = await db.query(sql, [postId, 'active', limit, offset]);
    return comments.map(comment => new Comment(comment));
  }

  // 创建评论
  static async create(data) {
    const sql = `
      INSERT INTO comments 
      (post_id, user_id, content, status, created_at) 
      VALUES (?, ?, ?, ?, NOW())
    `;
    const result = await db.insert(sql, [
      data.post_id,
      data.user_id,
      data.content,
      data.status || 'active'
    ]);
    return result;
  }

  // 更新评论
  async update(data) {
    const sql = `
      UPDATE comments 
      SET 
        content = ?, 
        status = ?, 
        created_at = NOW() 
      WHERE id = ?
    `;
    const result = await db.update(sql, [
      data.content || this.content,
      data.status || this.status,
      this.id
    ]);
    return result;
  }

  // 删除评论
  async delete() {
    const sql = 'DELETE FROM comments WHERE id = ?';
    const result = await db.remove(sql, [this.id]);
    return result;
  }

  // 根据帖子ID删除评论
  static async deleteByPostId(postId) {
    const sql = 'DELETE FROM comments WHERE post_id = ?';
    const result = await db.remove(sql, [postId]);
    return result;
  }

  // 查找所有评论
  static async findAll(offset = 0, limit = 10) {
    const sql = 'SELECT * FROM comments WHERE status = ? ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const comments = await db.query(sql, ['active', limit, offset]);
    return comments.map(comment => new Comment(comment));
  }

  // 获取评论数量
  static async countByPostId(postId) {
    const sql = 'SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND status = ?';
    const result = await db.queryOne(sql, [postId, 'active']);
    return result ? result.count : 0;
  }
}

module.exports = Comment;
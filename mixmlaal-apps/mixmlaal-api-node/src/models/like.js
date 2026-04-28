const db = require('../config/db');

class Like {
  constructor(data) {
    this.id = data.id;
    this.post_id = data.post_id;
    this.user_id = data.user_id;
    this.created_at = data.created_at;
  }

  // 根据ID查找点赞
  static async findById(id) {
    const sql = 'SELECT * FROM likes WHERE id = ?';
    const like = await db.queryOne(sql, [id]);
    return like ? new Like(like) : null;
  }

  // 查找用户对帖子的点赞
  static async findByUserAndPost(userId, postId) {
    const sql = 'SELECT * FROM likes WHERE user_id = ? AND post_id = ?';
    const like = await db.queryOne(sql, [userId, postId]);
    return like ? new Like(like) : null;
  }

  // 查找帖子的所有点赞
  static async findByPostId(postId, offset = 0, limit = 10) {
    const sql = 'SELECT * FROM likes WHERE post_id = ? LIMIT ? OFFSET ?';
    const likes = await db.query(sql, [postId, limit, offset]);
    return likes.map(like => new Like(like));
  }

  // 创建点赞
  static async create(data) {
    const sql = `
      INSERT INTO likes 
      (post_id, user_id, created_at) 
      VALUES (?, ?, NOW())
    `;
    const result = await db.insert(sql, [
      data.post_id,
      data.user_id
    ]);
    return result;
  }

  // 删除点赞
  async delete() {
    const sql = 'DELETE FROM likes WHERE id = ?';
    const result = await db.remove(sql, [this.id]);
    return result;
  }

  // 根据用户和帖子删除点赞
  static async deleteByUserAndPost(userId, postId) {
    const sql = 'DELETE FROM likes WHERE user_id = ? AND post_id = ?';
    const result = await db.remove(sql, [userId, postId]);
    return result;
  }

  // 获取帖子的点赞数量
  static async countByPostId(postId) {
    const sql = 'SELECT COUNT(*) as count FROM likes WHERE post_id = ?';
    const result = await db.queryOne(sql, [postId]);
    return result ? result.count : 0;
  }

  // 检查用户是否已点赞
  static async hasLiked(userId, postId) {
    const sql = 'SELECT COUNT(*) as count FROM likes WHERE user_id = ? AND post_id = ?';
    const result = await db.queryOne(sql, [userId, postId]);
    return result && result.count > 0;
  }
}

module.exports = Like;
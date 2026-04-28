const db = require('../config/db');

class Message {
  constructor(data) {
    this.id = data.id;
    this.sender_id = data.sender_id;
    this.receiver_id = data.receiver_id;
    this.content = data.content;
    this.type = data.type;
    this.status = data.status;
    this.created_at = data.created_at;
  }

  // 根据ID查找消息
  static async findById(id) {
    const sql = 'SELECT * FROM messages WHERE id = ?';
    const message = await db.queryOne(sql, [id]);
    return message ? new Message(message) : null;
  }

  // 查找两个用户之间的消息
  static async findBetweenUsers(senderId, receiverId, offset = 0, limit = 10) {
    const sql = `
      SELECT * FROM messages 
      WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) 
      ORDER BY created_at ASC 
      LIMIT ? OFFSET ?
    `;
    const messages = await db.query(sql, [senderId, receiverId, receiverId, senderId, limit, offset]);
    return messages.map(message => new Message(message));
  }

  // 查找用户的所有消息
  static async findByUserId(userId, offset = 0, limit = 10) {
    const sql = `
      SELECT * FROM messages 
      WHERE sender_id = ? OR receiver_id = ? 
      ORDER BY created_at DESC 
      LIMIT ? OFFSET ?
    `;
    const messages = await db.query(sql, [userId, userId, limit, offset]);
    return messages.map(message => new Message(message));
  }

  // 创建消息
  static async create(data) {
    const sql = `
      INSERT INTO messages 
      (sender_id, receiver_id, content, type, status, created_at) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;
    const result = await db.insert(sql, [
      data.sender_id,
      data.receiver_id,
      data.content,
      data.type || 'text',
      data.status || 'sent'
    ]);
    return result;
  }

  // 更新消息状态
  async updateStatus(status) {
    const sql = 'UPDATE messages SET status = ? WHERE id = ?';
    const result = await db.update(sql, [status, this.id]);
    return result;
  }

  // 标记消息为已读
  async markAsRead() {
    return this.updateStatus('read');
  }

  // 标记消息为已送达
  async markAsDelivered() {
    return this.updateStatus('delivered');
  }

  // 删除消息
  async delete() {
    const sql = 'DELETE FROM messages WHERE id = ?';
    const result = await db.remove(sql, [this.id]);
    return result;
  }

  // 获取未读消息数量
  static async countUnread(receiverId) {
    const sql = 'SELECT COUNT(*) as count FROM messages WHERE receiver_id = ? AND status != ?';
    const result = await db.queryOne(sql, [receiverId, 'read']);
    return result ? result.count : 0;
  }

  // 查找所有消息
  static async findAll(offset = 0, limit = 10) {
    const sql = 'SELECT * FROM messages ORDER BY created_at DESC LIMIT ? OFFSET ?';
    const messages = await db.query(sql, [limit, offset]);
    return messages.map(message => new Message(message));
  }
}

module.exports = Message;
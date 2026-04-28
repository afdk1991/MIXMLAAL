/**
 * 数据库配置与连接模块
 * 版本: v1.0.0.0
 * 说明: MySQL连接池配置
 */

const mysql = require('mysql2/promise');

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  database: process.env.DB_NAME || 'mixmlaal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
  // 连接池配置
  waitForConnections: true,
  queueLimit: 0,
  // 连接超时
  connectTimeout: 10000,
  acquireTimeout: 10000,
  timeout: 60000,
  // 字符集
  charset: 'utf8mb4_unicode_ci',
  // 启用预处理语句
  namedPlaceholders: true,
};

// 创建连接池
const pool = mysql.createPool(dbConfig);

// 连接池事件监听
pool.on('connection', () => {
  console.log('数据库新连接已建立');
});

pool.on('acquire', () => {
  console.log('数据库连接已获取');
});

pool.on('enqueue', () => {
  console.log('数据库连接等待中...');
});

pool.on('release', () => {
  console.log('数据库连接已释放');
});

/**
 * 执行SQL查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise<Array>}
 */
async function query(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.execute(sql, params);
    return rows;
  } finally {
    connection.release();
  }
}

/**
 * 执行单条查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise<Object|null>}
 */
async function queryOne(sql, params = []) {
  const rows = await query(sql, params);
  return rows.length > 0 ? rows[0] : null;
}

/**
 * 执行插入操作
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise<Object>}
 */
async function insert(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return {
      insertId: result.insertId,
      affectedRows: result.affectedRows,
    };
  } finally {
    connection.release();
  }
}

/**
 * 执行更新操作
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise<Object>}
 */
async function update(sql, params = []) {
  const connection = await pool.getConnection();
  try {
    const [result] = await connection.execute(sql, params);
    return {
      affectedRows: result.affectedRows,
      changedRows: result.changedRows,
    };
  } finally {
    connection.release();
  }
}

/**
 * 执行删除操作
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @returns {Promise<Object>}
 */
async function remove(sql, params = []) {
  return update(sql, params);
}

/**
 * 事务执行
 * @param {Function} callback - 事务回调函数
 * @returns {Promise<any>}
 */
async function transaction(callback) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

/**
 * 测试数据库连接
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('数据库连接测试成功');
    return true;
  } catch (error) {
    console.error('数据库连接测试失败:', error.message);
    return false;
  }
}

/**
 * 关闭连接池
 * @returns {Promise<void>}
 */
async function close() {
  await pool.end();
  console.log('数据库连接池已关闭');
}

module.exports = {
  pool,
  query,
  queryOne,
  insert,
  update,
  remove,
  transaction,
  testConnection,
  close,
};

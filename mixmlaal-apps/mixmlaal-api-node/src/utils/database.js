/**
 * 数据库连接池管理
 * 版本: v1.0.0.0
 * 说明: MySQL连接池配置、读写分离、性能优化
 */

const mysql = require('mysql2/promise');
const { logger } = require('./logger');

// 主库连接池（写操作）
let writePool = null;

// 从库连接池（读操作）
let readPool = null;

/**
 * 数据库配置
 */
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 3306,
  database: process.env.DB_NAME || 'mixmlaal',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  charset: 'utf8mb4',
  timezone: '+08:00',
};

/**
 * 连接池配置
 */
const poolConfig = {
  // 连接池大小
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 20,
  // 队列限制
  queueLimit: 0,
  // 连接超时时间
  connectTimeout: 30000,
  // 启用连接保持
  enableKeepAlive: true,
  keepAliveInitialDelay: 10000,
  // 启用压缩
  compress: true,
  // 启用查询超时
  queryTimeout: 30000,
};

/**
 * 初始化数据库连接池
 */
const initPools = async () => {
  try {
    // 创建主库连接池（写操作）
    writePool = mysql.createPool({
      ...dbConfig,
      ...poolConfig,
    });

    // 创建从库连接池（读操作）
    // 如果没有配置从库，则使用主库
    const readDbConfig = process.env.DB_READ_HOST
      ? {
        ...dbConfig,
        host: process.env.DB_READ_HOST,
        port: parseInt(process.env.DB_READ_PORT, 10) || 3306,
      }
      : dbConfig;

    readPool = mysql.createPool({
      ...readDbConfig,
      ...poolConfig,
    });

    // 测试连接
    const writeConn = await writePool.getConnection();
    await writeConn.ping();
    writeConn.release();

    const readConn = await readPool.getConnection();
    await readConn.ping();
    readConn.release();

    logger.info('数据库连接池初始化成功', {
      host: dbConfig.host,
      database: dbConfig.database,
      connectionLimit: poolConfig.connectionLimit,
    });

    return { writePool, readPool };
  } catch (error) {
    logger.error('数据库连接池初始化失败', { error: error.message });
    throw error;
  }
};

/**
 * 获取写连接（主库）
 */
const getWriteConnection = async () => {
  if (!writePool) {
    throw new Error('写连接池未初始化');
  }
  return await writePool.getConnection();
};

/**
 * 获取读连接（从库）
 */
const getReadConnection = async () => {
  if (!readPool) {
    throw new Error('读连接池未初始化');
  }
  return await readPool.getConnection();
};

/**
 * 执行写操作
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 */
const executeWrite = async (sql, params = []) => {
  const connection = await getWriteConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

/**
 * 执行读操作
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 */
const executeRead = async (sql, params = []) => {
  const connection = await getReadConnection();
  try {
    const [results] = await connection.execute(sql, params);
    return results;
  } finally {
    connection.release();
  }
};

/**
 * 事务执行
 * @param {Function} callback - 事务回调函数
 */
const transaction = async callback => {
  const connection = await getWriteConnection();
  await connection.beginTransaction();

  try {
    const result = await callback(connection);
    await connection.commit();
    return result;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};

/**
 * 批量插入
 * @param {string} table - 表名
 * @param {Array} data - 数据数组
 * @param {Object} options - 配置选项
 */
const batchInsert = async (table, data, options = {}) => {
  if (!data || data.length === 0) {
    return { affectedRows: 0 };
  }

  const { chunkSize = 1000, onDuplicate = '' } = options;
  const results = { affectedRows: 0 };

  // 分批处理
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    const columns = Object.keys(chunk[0]);
    const placeholders = chunk.map(() => `(${columns.map(() => '?').join(', ')})`).join(', ');
    const values = chunk.flatMap(row => columns.map(col => row[col]));

    const sql = `INSERT INTO ${table} (${columns.join(', ')}) VALUES ${placeholders} ${onDuplicate}`;
    const result = await executeWrite(sql, values);
    results.affectedRows += result.affectedRows;
  }

  return results;
};

/**
 * 分页查询
 * @param {string} sql - 基础SQL语句
 * @param {Array} params - 参数
 * @param {Object} pagination - 分页配置
 */
const paginate = async (sql, params = [], pagination = {}) => {
  const { page = 1, pageSize = 20 } = pagination;
  const offset = (page - 1) * pageSize;

  // 查询总数
  const countSql = `SELECT COUNT(*) as total FROM (${sql}) as t`;
  const [countResult] = await executeRead(countSql, params);
  const total = countResult.total;

  // 查询数据
  const paginatedSql = `${sql} LIMIT ${pageSize} OFFSET ${offset}`;
  const data = await executeRead(paginatedSql, params);

  return {
    data,
    pagination: {
      page: parseInt(page, 10),
      pageSize: parseInt(pageSize, 10),
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  };
};

/**
 * 获取连接池状态
 */
const getPoolStatus = () => {
  return {
    write: writePool
      ? {
        totalConnections: writePool._connectionQueue?.length || 0,
        freeConnections: writePool._freeConnections?.length || 0,
        acquiringConnections: writePool._acquiringConnections?.length || 0,
      }
      : null,
    read: readPool
      ? {
        totalConnections: readPool._connectionQueue?.length || 0,
        freeConnections: readPool._freeConnections?.length || 0,
        acquiringConnections: readPool._acquiringConnections?.length || 0,
      }
      : null,
  };
};

/**
 * 关闭连接池
 */
const closePools = async () => {
  try {
    if (writePool) {
      await writePool.end();
      writePool = null;
    }
    if (readPool) {
      await readPool.end();
      readPool = null;
    }
    logger.info('数据库连接池已关闭');
  } catch (error) {
    logger.error('关闭数据库连接池失败', { error: error.message });
    throw error;
  }
};

/**
 * 数据库健康检查
 */
const healthCheck = async () => {
  try {
    if (!writePool || !readPool) {
      return {
        status: 'unavailable',
        message: '数据库连接池未初始化',
      };
    }

    const writeConn = await getWriteConnection();
    await writeConn.ping();
    writeConn.release();

    const readConn = await getReadConnection();
    await readConn.ping();
    readConn.release();

    return {
      status: 'healthy',
      write: 'connected',
      read: 'connected',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

module.exports = {
  initPools,
  getWriteConnection,
  getReadConnection,
  executeWrite,
  executeRead,
  transaction,
  batchInsert,
  paginate,
  getPoolStatus,
  closePools,
  healthCheck,
};

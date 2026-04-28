/**
 * 数据库模块单元测试
 * 版本: v1.0.0.0
 * 说明: 数据库连接池、读写操作测试
 */

const { 
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
  healthCheck 
} = require('../../src/open/api/utils/database');

// 模拟mysql2/promise
jest.mock('mysql2/promise', () => {
  const mockConnection = {
    ping: jest.fn().mockResolvedValue(undefined),
    execute: jest.fn(),
    beginTransaction: jest.fn().mockResolvedValue(undefined),
    commit: jest.fn().mockResolvedValue(undefined),
    rollback: jest.fn().mockResolvedValue(undefined),
    release: jest.fn().mockResolvedValue(undefined),
  };

  const mockPool = {
    getConnection: jest.fn().mockResolvedValue(mockConnection),
    end: jest.fn().mockResolvedValue(undefined),
    _connectionQueue: [],
    _freeConnections: [],
    _acquiringConnections: [],
  };

  return {
    createPool: jest.fn(() => mockPool),
  };
});

describe('数据库模块测试', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    // 关闭连接池
    await closePools();
  });

  describe('连接池初始化', () => {
    test('应成功初始化数据库连接池', async () => {
      const result = await initPools();
      expect(result).toHaveProperty('writePool');
      expect(result).toHaveProperty('readPool');
    });
  });

  describe('连接获取', () => {
    test('应成功获取写连接', async () => {
      await initPools();
      const connection = await getWriteConnection();
      expect(connection).toBeDefined();
    });

    test('应成功获取读连接', async () => {
      await initPools();
      const connection = await getReadConnection();
      expect(connection).toBeDefined();
    });
  });

  describe('数据库操作', () => {
    beforeEach(async () => {
      await initPools();
    });

    test('应成功执行写操作', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await executeWrite('INSERT INTO users (name) VALUES (?)', ['test']);
      expect(result).toEqual({ affectedRows: 1 });
    });

    test('应成功执行读操作', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockResolvedValueOnce([[{ id: 1, name: 'test' }]]);

      const result = await executeRead('SELECT * FROM users WHERE id = ?', [1]);
      expect(result).toEqual([{ id: 1, name: 'test' }]);
    });

    test('应成功执行事务', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);

      const result = await transaction(async (conn) => {
        await conn.execute('INSERT INTO users (name) VALUES (?)', ['test']);
        return { success: true };
      });

      expect(result).toEqual({ success: true });
    });

    test('事务应在出错时回滚', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockRejectedValueOnce(new Error('Transaction error'));

      await expect(transaction(async (conn) => {
        await conn.execute('INSERT INTO users (name) VALUES (?)', ['test']);
        throw new Error('Transaction error');
      })).rejects.toThrow('Transaction error');
    });

    test('应成功执行批量插入', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockResolvedValueOnce({ affectedRows: 2 });

      const data = [
        { name: 'user1' },
        { name: 'user2' }
      ];

      const result = await batchInsert('users', data);
      expect(result).toEqual({ affectedRows: 2 });
    });

    test('应成功执行分页查询', async () => {
      const mysql = require('mysql2/promise');
      const mockPool = mysql.createPool();
      const mockConnection = mockPool.getConnection();
      mockConnection.execute.mockResolvedValueOnce([{ total: 100 }]);
      mockConnection.execute.mockResolvedValueOnce([[{ id: 1, name: 'test' }]]);

      const result = await paginate('SELECT * FROM users', [], { page: 1, pageSize: 10 });
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('pagination');
      expect(result.pagination.total).toBe(100);
    });
  });

  describe('连接池状态', () => {
    test('应获取连接池状态', async () => {
      await initPools();
      const status = getPoolStatus();
      expect(status).toHaveProperty('write');
      expect(status).toHaveProperty('read');
    });
  });

  describe('健康检查', () => {
    test('应返回数据库健康状态', async () => {
      await initPools();
      const health = await healthCheck();
      expect(health).toHaveProperty('status');
    });
  });
});

/**
 * 缓存模块单元测试
 * 版本: v1.0.0.0
 * 说明: Redis缓存、缓存防护策略测试
 */

const cache = require('../../src/open/api/utils/cache');

// 模拟Redis客户端
jest.mock('redis', () => ({
  createClient: jest.fn(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    on: jest.fn(),
    get: jest.fn(),
    setEx: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
    exists: jest.fn().mockResolvedValue(0),
    expire: jest.fn().mockResolvedValue(1),
    ttl: jest.fn().mockResolvedValue(3600),
    keys: jest.fn().mockResolvedValue(['key1', 'key2']),
    setBit: jest.fn().mockResolvedValue(0),
    getBit: jest.fn().mockResolvedValue(0),
    set: jest.fn().mockResolvedValue('OK'),
    eval: jest.fn().mockResolvedValue(1),
    quit: jest.fn().mockResolvedValue(undefined),
  })),
}));

describe('缓存模块测试', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    // 初始化Redis客户端
    await cache.initRedis();
  });

  afterEach(async () => {
    // 关闭Redis连接
    await cache.close();
  });

  describe('基础缓存操作', () => {
    test('应成功设置缓存', async () => {
      const result = await cache.set('test-key', { data: 'value' }, 3600);
      expect(result).toBe(true);
    });

    test('应成功获取缓存', async () => {
      const mockData = { data: 'value' };
      const client = cache.getClient();
      client.get.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await cache.get('test-key');
      expect(result).toEqual(mockData);
    });

    test('应成功删除缓存', async () => {
      const result = await cache.del('test-key');
      expect(result).toBe(true);
    });

    test('应成功检查缓存是否存在', async () => {
      const client = cache.getClient();
      client.exists.mockResolvedValueOnce(1);

      const result = await cache.exists('test-key');
      expect(result).toBe(true);
    });
  });

  describe('布隆过滤器', () => {
    test('应成功添加元素到布隆过滤器', async () => {
      const result = await cache.bloomFilter.add('test-filter', 'element1');
      expect(result).toBe(true);
    });

    test('应成功检查元素是否在布隆过滤器中', async () => {
      const client = cache.getClient();
      client.getBit.mockResolvedValueOnce(1);

      const result = await cache.bloomFilter.contains('test-filter', 'element1');
      expect(result).toBe(true);
    });

    test('哈希函数应返回一致的值', () => {
      const hash1 = cache.bloomFilter.hash('test-string');
      const hash2 = cache.bloomFilter.hash('test-string');
      expect(hash1).toBe(hash2);
    });
  });

  describe('缓存雪崩防护', () => {
    test('应设置随机过期时间', async () => {
      const baseTtl = 3600;
      const randomRange = 300;

      await cache.setWithRandomExpire('test-key', { data: 'value' }, baseTtl, randomRange);

      const client = cache.getClient();
      const setExCalls = client.setEx.mock.calls;
      expect(setExCalls.length).toBeGreaterThan(0);

      const actualTtl = setExCalls[0][1];
      expect(actualTtl).toBeGreaterThanOrEqual(baseTtl);
      expect(actualTtl).toBeLessThanOrEqual(baseTtl + randomRange);
    });
  });

  describe('缓存击穿防护', () => {
    test('应使用互斥锁获取数据', async () => {
      const mockData = { id: 1, name: 'test' };
      const fetchData = jest.fn().mockResolvedValue(mockData);

      const client = cache.getClient();
      client.get.mockResolvedValueOnce(null);
      client.set.mockResolvedValueOnce('OK');

      const result = await cache.getWithMutex('test-key', fetchData);

      expect(fetchData).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('应返回缓存数据而不查询数据库', async () => {
      const mockData = { id: 1, name: 'test' };
      const fetchData = jest.fn();

      const client = cache.getClient();
      client.get.mockResolvedValueOnce(JSON.stringify(mockData));

      const result = await cache.getWithMutex('test-key', fetchData);

      expect(fetchData).not.toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });
  });

  describe('综合缓存策略', () => {
    test('应使用综合策略获取数据', async () => {
      const mockData = { id: 1, name: 'test' };
      const fetchData = jest.fn().mockResolvedValue(mockData);

      const client = cache.getClient();
      client.get.mockResolvedValueOnce(null);

      const result = await cache.getWithProtection('test-key', fetchData);

      expect(fetchData).toHaveBeenCalled();
      expect(result).toEqual(mockData);
    });

    test('应使用布隆过滤器过滤不存在的数据', async () => {
      const fetchData = jest.fn();

      const client = cache.getClient();
      client.getBit.mockResolvedValueOnce(0);

      const result = await cache.getWithProtection('test-key', fetchData, { useBloom: true });

      expect(fetchData).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('缓存预热', () => {
    test('应成功预热缓存', async () => {
      const warmupData = {
        'key1': { data: 'value1' },
        'key2': { data: 'value2' }
      };

      const result = await cache.warmup(warmupData);
      expect(result).toBe(true);
    });
  });

  describe('批量操作', () => {
    test('应成功批量获取缓存', async () => {
      const client = cache.getClient();
      client.mget.mockResolvedValueOnce([JSON.stringify({ data: 'value1' }), JSON.stringify({ data: 'value2' })]);

      const result = await cache.mget(['key1', 'key2']);
      expect(result).toEqual({
        'key1': { data: 'value1' },
        'key2': { data: 'value2' }
      });
    });

    test('应成功批量设置缓存', async () => {
      const batchData = {
        'key1': { data: 'value1' },
        'key2': { data: 'value2' }
      };

      const result = await cache.mset(batchData);
      expect(result).toBe(true);
    });
  });
});

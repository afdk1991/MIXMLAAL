/**
 * 工具函数模块单元测试
 * 版本: v1.0.0.0
 * 说明: 测试共享工具函数的功能
 */

const Utils = require('../../shared/utils/index.js');

describe('工具函数模块测试', () => {
  describe('debounce函数', () => {
    test('应正确执行防抖', done => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const debouncedFn = Utils.debounce(mockFn, 100);

      // 连续调用多次
      debouncedFn('test');
      debouncedFn('test');
      debouncedFn('test');

      // 验证函数未被调用
      expect(mockFn).not.toHaveBeenCalled();

      // 快进时间
      jest.advanceTimersByTime(100);

      // 验证函数被调用一次
      expect(mockFn).toHaveBeenCalledTimes(1);
      expect(mockFn).toHaveBeenCalledWith('test');

      jest.useRealTimers();
      done();
    });
  });

  describe('throttle函数', () => {
    test('应正确执行节流', done => {
      jest.useFakeTimers();
      const mockFn = jest.fn();
      const throttledFn = Utils.throttle(mockFn, 100);

      // 连续调用多次
      throttledFn('test');
      throttledFn('test');
      throttledFn('test');

      // 验证函数被调用一次
      expect(mockFn).toHaveBeenCalledTimes(1);

      // 快进时间
      jest.advanceTimersByTime(100);

      // 再次调用
      throttledFn('test');
      expect(mockFn).toHaveBeenCalledTimes(2);

      jest.useRealTimers();
      done();
    });
  });

  describe('deepClone函数', () => {
    test('应正确深拷贝对象', () => {
      const original = {
        name: 'test',
        age: 25,
        address: {
          street: '123 Main St',
          city: 'Test City',
        },
        hobbies: ['reading', 'coding'],
      };

      const cloned = Utils.deepClone(original);

      // 验证对象被正确拷贝
      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.address).not.toBe(original.address);
      expect(cloned.hobbies).not.toBe(original.hobbies);

      // 验证修改拷贝不会影响原对象
      cloned.name = 'modified';
      cloned.address.street = '456 Other St';
      cloned.hobbies.push('gaming');

      expect(original.name).toBe('test');
      expect(original.address.street).toBe('123 Main St');
      expect(original.hobbies).toHaveLength(2);
    });
  });

  describe('formatDate函数', () => {
    test('应正确格式化日期', () => {
      const date = new Date('2026-03-27T12:34:56');
      const formatted = Utils.formatDate(date, 'YYYY-MM-DD HH:mm:ss');
      expect(formatted).toBe('2026-03-27 12:34:56');
    });
  });

  describe('generateId函数', () => {
    test('应生成唯一ID', () => {
      const id1 = Utils.generateId('test');
      const id2 = Utils.generateId('test');
      expect(id1).toBeDefined();
      expect(typeof id1).toBe('string');
      expect(id1).toContain('test_');
      expect(id1).not.toBe(id2);
    });
  });

  describe('validator函数', () => {
    test('应正确验证手机号', () => {
      expect(Utils.validator.isPhone('13800138000')).toBe(true);
      expect(Utils.validator.isPhone('12345678901')).toBe(false);
    });

    test('应正确验证邮箱', () => {
      expect(Utils.validator.isEmail('test@example.com')).toBe(true);
      expect(Utils.validator.isEmail('invalid-email')).toBe(false);
    });
  });

  describe('formatMoney函数', () => {
    test('应正确格式化金额', () => {
      expect(Utils.formatMoney(1234.56)).toBe('¥1,234.56');
      expect(Utils.formatMoney(1000000)).toBe('¥1,000,000.00');
    });
  });

  describe('formatDistance函数', () => {
    test('应正确格式化距离', () => {
      expect(Utils.formatDistance(500)).toBe('500m');
      expect(Utils.formatDistance(1500)).toBe('1.5km');
    });
  });

  describe('formatRelativeTime函数', () => {
    test('应正确格式化相对时间', () => {
      const now = Date.now();
      const oneMinuteAgo = now - 60 * 1000;
      const oneHourAgo = now - 60 * 60 * 1000;
      const oneDayAgo = now - 24 * 60 * 60 * 1000;

      expect(Utils.formatRelativeTime(oneMinuteAgo)).toBe('1分钟前');
      expect(Utils.formatRelativeTime(oneHourAgo)).toBe('1小时前');
      expect(Utils.formatRelativeTime(oneDayAgo)).toBe('1天前');
    });
  });

  describe('random函数', () => {
    test('应生成指定范围内的随机数', () => {
      const min = 1;
      const max = 10;
      const result = Utils.random(min, max);
      expect(result).toBeGreaterThanOrEqual(min);
      expect(result).toBeLessThanOrEqual(max);
    });
  });

  describe('shuffle函数', () => {
    test('应正确打乱数组', () => {
      const original = [1, 2, 3, 4, 5];
      const shuffled = Utils.shuffle(original);
      expect(shuffled).toHaveLength(original.length);
      expect(shuffled).not.toEqual(original);
      expect(shuffled.sort()).toEqual(original.sort());
    });
  });

  describe('formatFileSize函数', () => {
    test('应正确格式化文件大小', () => {
      expect(Utils.formatFileSize(1024)).toBe('1 KB');
      expect(Utils.formatFileSize(1048576)).toBe('1 MB');
      expect(Utils.formatFileSize(0)).toBe('0 B');
    });
  });
});

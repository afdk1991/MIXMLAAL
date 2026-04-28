/**
 * 地图服务单元测试
 * 版本: v1.0.0.0
 */

const MapService = require('../../src/open/api/services/mapService');

describe('MapService', () => {
  describe('geocode', () => {
    it('应该返回有效的经纬度坐标', async () => {
      const result = await MapService.geocode('北京市朝阳区');
      expect(result).toHaveProperty('lng');
      expect(result).toHaveProperty('lat');
      expect(typeof result.lng).toBe('number');
      expect(typeof result.lat).toBe('number');
      expect(result.lng).toBeGreaterThan(70);
      expect(result.lng).toBeLessThan(140);
      expect(result.lat).toBeGreaterThan(0);
      expect(result.lat).toBeLessThan(60);
    });
  });

  describe('reverseGeocode', () => {
    it('应该返回有效的地址字符串', async () => {
      const result = await MapService.reverseGeocode(116.4074, 39.9042);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('drivingRoute', () => {
    it('应该返回路径规划结果', async () => {
      const result = await MapService.drivingRoute('116.4074,39.9042', '116.3974,39.9042');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(typeof result.distance).toBe('number');
      expect(typeof result.duration).toBe('number');
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('calculateDistance', () => {
    it('应该正确计算两点之间的距离', () => {
      const distance = MapService.calculateDistance(
        116.4074, 39.9042,
        116.3974, 39.9042,
      );
      expect(typeof distance).toBe('number');
      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(10000);
    });

    it('相同点距离应为0', () => {
      const distance = MapService.calculateDistance(
        116.4074, 39.9042,
        116.4074, 39.9042,
      );
      expect(distance).toBe(0);
    });
  });

  describe('searchPOI', () => {
    it('应该返回POI列表', async () => {
      const result = await MapService.searchPOI('餐厅', '116.4074,39.9042', 5000);
      expect(Array.isArray(result)).toBe(true);
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('address');
      }
    });
  });
});

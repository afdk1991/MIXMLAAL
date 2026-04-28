/**
 * 地图服务抽象层单元测试
 * 版本: v1.0.0.0
 */

const { getMapService, selectBestProvider, switchProvider, getAvailableProviders, getWebSDKConfigs, _currentProvider } = require('../../src/open/api/services/mapServiceMulti');

describe('MapServiceMulti', () => {
  describe('getMapService', () => {
    it('应该返回有效的地图服务实例', () => {
      const service = getMapService('gaode');
      expect(service).toBeDefined();
      expect(service.provider).toBe('gaode');
      expect(typeof service.geocode).toBe('function');
      expect(typeof service.reverseGeocode).toBe('function');
      expect(typeof service.drivingRoute).toBe('function');
      expect(typeof service.searchPOI).toBe('function');
    });

    it('默认应该返回高德地图服务', () => {
      const service = getMapService();
      expect(service.provider).toBe('gaode');
    });
  });

  describe('selectBestProvider', () => {
    it('应该返回最佳地图服务商', () => {
      const provider = selectBestProvider();
      expect(typeof provider).toBe('string');
      expect(['gaode', 'baidu', 'tencent']).toContain(provider);
    });
  });

  describe('switchProvider', () => {
    it('应该能够切换到有效的地图服务商', () => {
      const success = switchProvider('baidu');
      expect(success).toBe(true);
    });

    it('切换到无效服务商应该返回false', () => {
      const success = switchProvider('invalid');
      expect(success).toBe(false);
    });
  });

  describe('getAvailableProviders', () => {
    it('应该返回可用的地图服务商列表', () => {
      const providers = getAvailableProviders();
      expect(Array.isArray(providers)).toBe(true);
      expect(providers.length).toBeGreaterThan(0);
      providers.forEach(provider => {
        expect(provider).toHaveProperty('provider');
        expect(provider).toHaveProperty('name');
        expect(provider).toHaveProperty('priority');
      });
    });
  });

  describe('getWebSDKConfigs', () => {
    it('应该返回前端SDK配置列表', () => {
      const configs = getWebSDKConfigs();
      expect(Array.isArray(configs)).toBe(true);
      expect(configs.length).toBeGreaterThan(0);
      configs.forEach(config => {
        expect(config).toHaveProperty('provider');
        expect(config).toHaveProperty('name');
        expect(config).toHaveProperty('sdkUrl');
      });
    });
  });

  describe('geocode', () => {
    it('应该返回有效的经纬度坐标', async () => {
      const service = getMapService('gaode');
      const result = await service.geocode('北京市朝阳区');
      expect(result).toHaveProperty('lng');
      expect(result).toHaveProperty('lat');
      expect(typeof result.lng).toBe('number');
      expect(typeof result.lat).toBe('number');
      expect(result.lng).toBeGreaterThan(70);
      expect(result.lng).toBeLessThan(140);
      expect(result.lat).toBeGreaterThan(0);
      expect(result.lat).toBeLessThan(60);
    });

    it('缓存应该正常工作', async () => {
      const service = getMapService('gaode');
      const address = '上海市浦东新区';

      // 第一次调用
      const result1 = await service.geocode(address);

      // 第二次调用（应该从缓存获取）
      const result2 = await service.geocode(address);

      expect(result1).toEqual(result2);
    });
  });

  describe('reverseGeocode', () => {
    it('应该返回有效的地址字符串', async () => {
      const service = getMapService('gaode');
      const result = await service.reverseGeocode(116.4074, 39.9042);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('drivingRoute', () => {
    it('应该返回路径规划结果', async () => {
      const service = getMapService('gaode');
      const result = await service.drivingRoute('116.4074,39.9042', '116.3974,39.9042');
      expect(result).toHaveProperty('distance');
      expect(result).toHaveProperty('duration');
      expect(typeof result.distance).toBe('number');
      expect(typeof result.duration).toBe('number');
      expect(result.distance).toBeGreaterThan(0);
      expect(result.duration).toBeGreaterThan(0);
    });
  });

  describe('searchPOI', () => {
    it('应该返回POI列表', async () => {
      const service = getMapService('gaode');
      const result = await service.searchPOI('餐厅', '116.4074,39.9042', 5000);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

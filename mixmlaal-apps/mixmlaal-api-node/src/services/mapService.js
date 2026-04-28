const axios = require('axios');
const mapConfig = require('../config/map');
const cache = require('../config/redis');

// 地图服务 - 2025最新版
class MapService {
  constructor() {
    this.amapKey = mapConfig.amap.key;
    this.baiduKey = mapConfig.baidu.key;
    this.tencentKey = mapConfig.tencent.key;
    this.googleKey = mapConfig.google.key;
    this.cacheExpiration = mapConfig.cache;
    this.currentProvider = mapConfig.fallback.primaryProvider;
    this.circuitBreaker = {
      failures: 0,
      lastFailure: null,
      isOpen: false
    };
  }

  /**
   * 地理编码（地址转经纬度）
   */
  async geocode(address, options = {}) {
    const cacheKey = `geocode:${address}:${options.provider || this.currentProvider}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && !options.skipCache) {
      return cachedData;
    }

    const provider = options.provider || this.currentProvider;
    let result = null;

    try {
      if (provider === 'amap') {
        result = await this.geocodeAmap(address);
      } else if (provider === 'baidu') {
        result = await this.geocodeBaidu(address);
      } else if (provider === 'tencent') {
        result = await this.geocodeTencent(address);
      } else if (provider === 'google') {
        result = await this.geocodeGoogle(address);
      }

      if (result) {
        await cache.set(cacheKey, result, this.cacheExpiration.geocodeExpiration);
        this.resetCircuitBreaker();
      }

      return result;
    } catch (error) {
      console.error(`地理编码失败 (${provider}):`, error);
      this.recordFailure();
      
      if (options.tryFallback && this.shouldTryFallback()) {
        return this.geocode(address, { ...options, provider: this.getNextFallbackProvider(), tryFallback: false });
      }
      
      return null;
    }
  }

  /**
   * 高德地理编码
   */
  async geocodeAmap(address) {
    const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.geocode}`, {
      params: {
        key: this.amapKey,
        address: address,
        output: 'json'
      }
    });

    if (response.data.status === '1' && response.data.geocodes.length > 0) {
      const geocode = response.data.geocodes[0];
      const location = geocode.location.split(',');
      return {
        latitude: parseFloat(location[1]),
        longitude: parseFloat(location[0]),
        formattedAddress: geocode.formatted_address,
        province: geocode.province,
        city: geocode.city,
        district: geocode.district,
        adcode: geocode.adcode,
        level: geocode.level,
        provider: 'amap'
      };
    }
    return null;
  }

  /**
   * 百度地理编码
   */
  async geocodeBaidu(address) {
    const response = await axios.get(`${mapConfig.baidu.baseUrl}${mapConfig.baidu.geocode}`, {
      params: {
        ak: this.baiduKey,
        address: address,
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result) {
      const result = response.data.result;
      return {
        latitude: result.location.lat,
        longitude: result.location.lng,
        formattedAddress: result.formatted_address,
        province: result.addressComponent.province,
        city: result.addressComponent.city,
        district: result.addressComponent.district,
        level: result.level,
        provider: 'baidu'
      };
    }
    return null;
  }

  /**
   * 腾讯地理编码
   */
  async geocodeTencent(address) {
    const response = await axios.get(`${mapConfig.tencent.baseUrl}${mapConfig.tencent.geocode}`, {
      params: {
        key: this.tencentKey,
        address: address,
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result) {
      const result = response.data.result;
      return {
        latitude: result.location.lat,
        longitude: result.location.lng,
        formattedAddress: result.address,
        province: result.address_component.province,
        city: result.address_component.city,
        district: result.address_component.district,
        provider: 'tencent'
      };
    }
    return null;
  }

  /**
   * Google地理编码
   */
  async geocodeGoogle(address) {
    const response = await axios.get(`${mapConfig.google.baseUrl}${mapConfig.google.geocode}`, {
      params: {
        key: this.googleKey,
        address: address
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const location = result.geometry.location;
      const components = result.address_components;
      
      return {
        latitude: location.lat,
        longitude: location.lng,
        formattedAddress: result.formatted_address,
        province: this.getComponent(components, 'administrative_area_level_1'),
        city: this.getComponent(components, 'locality'),
        district: this.getComponent(components, 'administrative_area_level_2'),
        provider: 'google'
      };
    }
    return null;
  }

  /**
   * 逆地理编码（经纬度转地址）
   */
  async regeocode(latitude, longitude, options = {}) {
    const cacheKey = `regeocode:${latitude}:${longitude}:${options.provider || this.currentProvider}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && !options.skipCache) {
      return cachedData;
    }

    const provider = options.provider || this.currentProvider;
    let result = null;

    try {
      if (provider === 'amap') {
        result = await this.regeocodeAmap(latitude, longitude, options);
      } else if (provider === 'baidu') {
        result = await this.regeocodeBaidu(latitude, longitude, options);
      } else if (provider === 'tencent') {
        result = await this.regeocodeTencent(latitude, longitude, options);
      } else if (provider === 'google') {
        result = await this.regeocodeGoogle(latitude, longitude, options);
      }

      if (result) {
        await cache.set(cacheKey, result, this.cacheExpiration.geocodeExpiration);
        this.resetCircuitBreaker();
      }

      return result;
    } catch (error) {
      console.error(`逆地理编码失败 (${provider}):`, error);
      this.recordFailure();
      
      if (options.tryFallback && this.shouldTryFallback()) {
        return this.regeocode(latitude, longitude, { ...options, provider: this.getNextFallbackProvider(), tryFallback: false });
      }
      
      return null;
    }
  }

  /**
   * 高德逆地理编码
   */
  async regeocodeAmap(latitude, longitude, options = {}) {
    const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.regeocode}`, {
      params: {
        key: this.amapKey,
        location: `${longitude},${latitude}`,
        extensions: options.extensions || 'base',
        output: 'json'
      }
    });

    if (response.data.status === '1') {
      const regeocode = response.data.regeocode;
      const addressComponent = regeocode.addressComponent;
      
      return {
        formattedAddress: regeocode.formatted_address,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
        township: addressComponent.township,
        street: addressComponent.streetNumber?.street,
        number: addressComponent.streetNumber?.number,
        neighborhood: addressComponent.neighborhood,
        building: addressComponent.building,
        adcode: addressComponent.adcode,
        poiList: regeocode.pois,
        provider: 'amap'
      };
    }
    return null;
  }

  /**
   * 百度逆地理编码
   */
  async regeocodeBaidu(latitude, longitude, options = {}) {
    const response = await axios.get(`${mapConfig.baidu.baseUrl}${mapConfig.baidu.regeocode}`, {
      params: {
        ak: this.baiduKey,
        location: `${latitude},${longitude}`,
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result) {
      const result = response.data.result;
      const addressComponent = result.addressComponent;
      
      return {
        formattedAddress: result.formatted_address,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
        street: addressComponent.street,
        number: addressComponent.street_number,
        business: result.business,
        sematicDescription: result.sematic_description,
        provider: 'baidu'
      };
    }
    return null;
  }

  /**
   * 腾讯逆地理编码
   */
  async regeocodeTencent(latitude, longitude, options = {}) {
    const response = await axios.get(`${mapConfig.tencent.baseUrl}${mapConfig.tencent.regeocode}`, {
      params: {
        key: this.tencentKey,
        location: `${latitude},${longitude}`,
        get_poi: options.getPoi ? 1 : 0,
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result) {
      const result = response.data.result;
      const addressComponent = result.address_component;
      
      return {
        formattedAddress: result.address,
        province: addressComponent.province,
        city: addressComponent.city,
        district: addressComponent.district,
        street: addressComponent.street,
        streetNumber: addressComponent.street_number,
        poiList: result.pois,
        provider: 'tencent'
      };
    }
    return null;
  }

  /**
   * Google逆地理编码
   */
  async regeocodeGoogle(latitude, longitude, options = {}) {
    const response = await axios.get(`${mapConfig.google.baseUrl}${mapConfig.google.geocode}`, {
      params: {
        key: this.googleKey,
        latlng: `${latitude},${longitude}`,
        language: options.language || 'zh-CN'
      }
    });

    if (response.data.status === 'OK' && response.data.results.length > 0) {
      const result = response.data.results[0];
      const components = result.address_components;
      
      return {
        formattedAddress: result.formatted_address,
        province: this.getComponent(components, 'administrative_area_level_1'),
        city: this.getComponent(components, 'locality'),
        district: this.getComponent(components, 'administrative_area_level_2'),
        provider: 'google'
      };
    }
    return null;
  }

  /**
   * 路径规划
   */
  async direction(origin, destination, options = {}) {
    const cacheKey = `direction:${origin.latitude}:${origin.longitude}:${destination.latitude}:${destination.longitude}:${JSON.stringify(options)}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && !options.skipCache) {
      return cachedData;
    }

    const provider = options.provider || this.currentProvider;
    let result = null;

    try {
      if (provider === 'amap') {
        result = await this.directionAmap(origin, destination, options);
      } else if (provider === 'baidu') {
        result = await this.directionBaidu(origin, destination, options);
      } else if (provider === 'tencent') {
        result = await this.directionTencent(origin, destination, options);
      } else if (provider === 'google') {
        result = await this.directionGoogle(origin, destination, options);
      }

      if (result) {
        await cache.set(cacheKey, result, this.cacheExpiration.routeExpiration);
        this.resetCircuitBreaker();
      }

      return result;
    } catch (error) {
      console.error(`路径规划失败 (${provider}):`, error);
      this.recordFailure();
      
      if (options.tryFallback && this.shouldTryFallback()) {
        return this.direction(origin, destination, { ...options, provider: this.getNextFallbackProvider(), tryFallback: false });
      }
      
      return null;
    }
  }

  /**
   * 高德路径规划
   */
  async directionAmap(origin, destination, options = {}) {
    const params = {
      key: this.amapKey,
      origin: `${origin.longitude},${origin.latitude}`,
      destination: `${destination.longitude},${destination.latitude}`,
      output: 'json',
      ...options
    };

    const endpoint = options.futureTime ? 
      mapConfig.amap.etdDirection : 
      mapConfig.amap.direction;

    if (options.futureTime) {
      params.time = options.futureTime;
    }

    const response = await axios.get(`${mapConfig.amap.baseUrl}${endpoint}`, { params });

    if (response.data.status === '1' && response.data.route && response.data.route.paths.length > 0) {
      const path = response.data.route.paths[0];
      const steps = path.steps?.map(step => ({
        instruction: step.instruction,
        orientation: step.orientation,
        road: step.road,
        distance: step.distance,
        duration: step.duration,
        polyline: step.polyline
      })) || [];

      return {
        distance: path.distance,
        duration: path.duration,
        taxiCost: path.taxi_cost,
        steps: steps,
        bounds: response.data.route.bounds,
        provider: 'amap',
        isEtd: !!options.futureTime,
        futureTime: options.futureTime
      };
    }
    return null;
  }

  /**
   * 未来出行规划 (ETD) - 高德专有
   */
  async etdDirection(origin, destination, futureTime, options = {}) {
    return this.direction(origin, destination, {
      ...options,
      futureTime: futureTime,
      extensions: 'all'
    });
  }

  /**
   * 百度路径规划
   */
  async directionBaidu(origin, destination, options = {}) {
    const response = await axios.get(`${mapConfig.baidu.baseUrl}${mapConfig.baidu.direction}`, {
      params: {
        ak: this.baiduKey,
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        coord_type: 'bd09ll',
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result && response.data.result.routes.length > 0) {
      const route = response.data.result.routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        steps: route.steps,
        provider: 'baidu'
      };
    }
    return null;
  }

  /**
   * 腾讯路径规划
   */
  async directionTencent(origin, destination, options = {}) {
    const response = await axios.get(`${mapConfig.tencent.baseUrl}${mapConfig.tencent.direction}`, {
      params: {
        key: this.tencentKey,
        from: `${origin.latitude},${origin.longitude}`,
        to: `${destination.latitude},${destination.longitude}`,
        output: 'json'
      }
    });

    if (response.data.status === 0 && response.data.result) {
      const routes = response.data.result.routes;
      const route = routes[0];
      return {
        distance: route.distance,
        duration: route.duration,
        steps: route.steps,
        provider: 'tencent'
      };
    }
    return null;
  }

  /**
   * Google路径规划
   */
  async directionGoogle(origin, destination, options = {}) {
    const response = await axios.get(`${mapConfig.google.baseUrl}${mapConfig.google.direction}`, {
      params: {
        key: this.googleKey,
        origin: `${origin.latitude},${origin.longitude}`,
        destination: `${destination.latitude},${destination.longitude}`,
        mode: 'driving',
        alternatives: true,
        language: options.language || 'zh-CN'
      }
    });

    if (response.data.status === 'OK' && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      const leg = route.legs[0];
      
      return {
        distance: leg.distance.value,
        duration: leg.duration.value,
        steps: leg.steps,
        bounds: route.bounds,
        provider: 'google'
      };
    }
    return null;
  }

  /**
   * 距离计算
   */
  async distance(origins, destinations, options = {}) {
    const cacheKey = `distance:${JSON.stringify(origins)}:${JSON.stringify(destinations)}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && !options.skipCache) {
      return cachedData;
    }

    const provider = options.provider || this.currentProvider;
    let result = null;

    try {
      if (provider === 'amap') {
        result = await this.distanceAmap(origins, destinations);
      } else if (provider === 'google') {
        result = await this.distanceMatrixGoogle(origins, destinations, options);
      } else {
        result = await this.distanceAmap(origins, destinations); // 默认用高德
      }

      if (result) {
        await cache.set(cacheKey, result, this.cacheExpiration.distanceMatrixExpiration);
        this.resetCircuitBreaker();
      }

      return result;
    } catch (error) {
      console.error(`距离计算失败 (${provider}):`, error);
      this.recordFailure();
      return null;
    }
  }

  /**
   * 高德距离计算
   */
  async distanceAmap(origins, destinations) {
    const originParam = origins.map(o => `${o.longitude},${o.latitude}`).join('|');
    const destParam = destinations.map(d => `${d.longitude},${d.latitude}`).join('|');

    const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.distance}`, {
      params: {
        key: this.amapKey,
        origins: originParam,
        destinations: destParam,
        type: 1, // 0: 直线距离, 1: 驾车距离
        output: 'json'
      }
    });

    if (response.data.status === '1' && response.data.results) {
      return response.data.results.map((result, index) => ({
        origin: origins[index],
        destination: destinations[index],
        distance: result.distance,
        duration: result.duration
      }));
    }
    return null;
  }

  /**
   * Google距离矩阵
   */
  async distanceMatrixGoogle(origins, destinations, options = {}) {
    const originParam = origins.map(o => `${o.latitude},${o.longitude}`).join('|');
    const destParam = destinations.map(d => `${d.latitude},${d.longitude}`).join('|');

    const response = await axios.get(`${mapConfig.google.baseUrl}${mapConfig.google.distanceMatrix}`, {
      params: {
        key: this.googleKey,
        origins: originParam,
        destinations: destParam,
        language: options.language || 'zh-CN'
      }
    });

    if (response.data.status === 'OK') {
      const results = [];
      response.data.rows.forEach((row, rowIndex) => {
        row.elements.forEach((element, colIndex) => {
          if (element.status === 'OK') {
            results.push({
              origin: origins[rowIndex],
              destination: destinations[colIndex],
              distance: element.distance.value,
              duration: element.duration.value
            });
          }
        });
      });
      return results;
    }
    return null;
  }

  /**
   * 实时路况
   */
  async traffic(location, options = {}) {
    const cacheKey = `traffic:${location.latitude}:${location.longitude}`;
    const cachedData = await cache.get(cacheKey);
    if (cachedData && !options.skipCache) {
      return cachedData;
    }

    try {
      const response = await axios.get(`${mapConfig.amap.baseUrl}${mapConfig.amap.traffic}`, {
        params: {
          key: this.amapKey,
          location: `${location.longitude},${location.latitude}`,
          extensions: options.extensions || 'all',
          output: 'json'
        }
      });

      if (response.data.status === '1' && response.data.trafficinfo?.roads) {
        const result = {
          location: location,
          roads: response.data.trafficinfo.roads.map(road => ({
            name: road.name,
            status: road.status,
            direction: road.direction,
            speed: road.speed,
            congestion: road.congestion_distance
          })),
          timestamp: Date.now()
        };

        await cache.set(cacheKey, result, this.cacheExpiration.trafficExpiration);
        return result;
      }
      return null;
    } catch (error) {
      console.error('实时路况获取失败:', error);
      return null;
    }
  }

  /**
   * 空间智能分析
   */
  async spatialAnalysis(query, options = {}) {
    try {
      const response = await axios.post(`${mapConfig.amap.baseUrl}${mapConfig.amap.spatialAnalysis}`, {
        key: this.amapKey,
        query: query,
        ...options
      });

      if (response.data.status === '1') {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('空间智能分析失败:', error);
      return null;
    }
  }

  /**
   * 助手函数: 获取地址组件
   */
  getComponent(components, type) {
    const component = components.find(c => c.types.includes(type));
    return component ? component.long_name : '';
  }

  /**
   * 熔断器相关
   */
  recordFailure() {
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailure = Date.now();
    
    if (this.circuitBreaker.failures >= mapConfig.fallback.circuitBreakerThreshold) {
      this.circuitBreaker.isOpen = true;
      
      // 自动重置
      setTimeout(() => {
        this.circuitBreaker.isOpen = false;
        this.circuitBreaker.failures = 0;
      }, mapConfig.fallback.circuitBreakerReset);
    }
  }

  resetCircuitBreaker() {
    this.circuitBreaker.failures = 0;
    this.circuitBreaker.isOpen = false;
  }

  shouldTryFallback() {
    return !this.circuitBreaker.isOpen;
  }

  getNextFallbackProvider() {
    const providers = mapConfig.fallback.fallbackProviders;
    const currentIndex = providers.indexOf(this.currentProvider);
    if (currentIndex === -1 || currentIndex === providers.length - 1) {
      return providers[0];
    }
    return providers[currentIndex + 1];
  }
}

module.exports = new MapService();


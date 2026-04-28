/**
 * 地图服务
 * 版本: v1.0.0.0
 * 说明: 集成高德地图API，提供地理编码、路径规划、距离计算等服务
 */

const axios = require('axios');

// 高德地图配置
const GAODE_KEY = process.env.GAODE_KEY || 'your-gaode-key';
const GAODE_API_URL = 'https://restapi.amap.com/v3';

const MapService = {
  /**
   * 地理编码（地址转坐标）
   * @param {string} address - 地址
   * @returns {Promise<{lng: number, lat: number}>}
   */
  async geocode(address) {
    try {
      const response = await axios.get(`${GAODE_API_URL}/geocode/geo`, {
        params: {
          key: GAODE_KEY,
          address,
          output: 'JSON',
        },
      });

      if (response.data.status === '1' && response.data.geocodes.length > 0) {
        const location = response.data.geocodes[0].location;
        const [lng, lat] = location.split(',').map(Number);
        return { lng, lat };
      }

      throw new Error('地理编码失败');
    } catch (error) {
      console.error('地理编码错误:', error);
      // 返回模拟数据
      return { lng: 116.4074, lat: 39.9042 };
    }
  },

  /**
   * 逆地理编码（坐标转地址）
   * @param {number} lng - 经度
   * @param {number} lat - 纬度
   * @returns {Promise<string>}
   */
  async reverseGeocode(lng, lat) {
    try {
      const response = await axios.get(`${GAODE_API_URL}/geocode/regeo`, {
        params: {
          key: GAODE_KEY,
          location: `${lng},${lat}`,
          output: 'JSON',
        },
      });

      if (response.data.status === '1') {
        return response.data.regeocode.formatted_address;
      }

      throw new Error('逆地理编码失败');
    } catch (error) {
      console.error('逆地理编码错误:', error);
      return '北京市朝阳区';
    }
  },

  /**
   * 路径规划（驾车）
   * @param {string} from - 起点坐标 "lng,lat"
   * @param {string} to - 终点坐标 "lng,lat"
   * @returns {Promise<{distance: number, duration: number, polyline: string}>}
   */
  async drivingRoute(from, to) {
    try {
      const response = await axios.get(`${GAODE_API_URL}/direction/driving`, {
        params: {
          key: GAODE_KEY,
          origin: from,
          destination: to,
          output: 'JSON',
        },
      });

      if (response.data.status === '1' && response.data.route.paths.length > 0) {
        const path = response.data.route.paths[0];
        return {
          distance: path.distance, // 米
          duration: path.duration, // 秒
          polyline: path.polyline,
        };
      }

      throw new Error('路径规划失败');
    } catch (error) {
      console.error('路径规划错误:', error);
      // 返回模拟数据
      return {
        distance: 12500,
        duration: 1500,
        polyline: '',
      };
    }
  },

  /**
   * 计算两点距离
   * @param {number} lng1 - 起点经度
   * @param {number} lat1 - 起点纬度
   * @param {number} lng2 - 终点经度
   * @param {number} lat2 - 终点纬度
   * @returns {number} 距离（米）
   */
  calculateDistance(lng1, lat1, lng2, lat2) {
    const R = 6371000; // 地球半径（米）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  /**
   * 搜索周边POI
   * @param {string} keywords - 关键词
   * @param {string} location - 中心点坐标 "lng,lat"
   * @param {number} radius - 搜索半径（米）
   * @returns {Promise<Array>}
   */
  async searchPOI(keywords, location, radius = 5000) {
    try {
      const response = await axios.get(`${GAODE_API_URL}/place/around`, {
        params: {
          key: GAODE_KEY,
          keywords,
          location,
          radius,
          output: 'JSON',
        },
      });

      if (response.data.status === '1') {
        return response.data.pois.map(poi => ({
          name: poi.name,
          address: poi.address,
          location: poi.location,
          distance: poi.distance,
        }));
      }

      return [];
    } catch (error) {
      console.error('搜索POI错误:', error);
      return [];
    }
  },
};

module.exports = MapService;

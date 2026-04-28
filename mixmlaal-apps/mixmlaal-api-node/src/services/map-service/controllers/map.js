const axios = require('axios');

// 高德地图API配置
const AMAP_KEY = process.env.AMAP_KEY || 'your-amap-key';
const AMAP_BASE_URL = 'https://restapi.amap.com/v3';

const mapController = {
  // 地理编码
  geocode: async (req, res) => {
    const { address } = req.query;
    
    if (!address) {
      return res.json({
        code: 400,
        message: '缺少地址参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/geocode/geo`, {
        params: {
          key: AMAP_KEY,
          address: address
        }
      });
      
      if (response.data.status === '1' && response.data.geocodes.length > 0) {
        const geocode = response.data.geocodes[0];
        return res.json({
          code: 200,
          message: '地理编码成功',
          data: {
            location: geocode.location, // 经纬度，格式："经度,纬度"
            formatted_address: geocode.formatted_address,
            province: geocode.province,
            city: geocode.city,
            district: geocode.district
          }
        });
      } else {
        return res.json({
          code: 400,
          message: '地理编码失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '地理编码请求失败',
        data: null
      });
    }
  },

  // 逆地理编码
  reverseGeocode: async (req, res) => {
    const { location } = req.query;
    
    if (!location) {
      return res.json({
        code: 400,
        message: '缺少经纬度参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/geocode/regeo`, {
        params: {
          key: AMAP_KEY,
          location: location
        }
      });
      
      if (response.data.status === '1') {
        const regeocode = response.data.regeocode;
        return res.json({
          code: 200,
          message: '逆地理编码成功',
          data: {
            formatted_address: regeocode.formatted_address,
            addressComponent: regeocode.addressComponent
          }
        });
      } else {
        return res.json({
          code: 400,
          message: '逆地理编码失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '逆地理编码请求失败',
        data: null
      });
    }
  },

  // 货车路径规划
  truckRoute: async (req, res) => {
    const { origin, destination, ...options } = req.query;
    
    if (!origin || !destination) {
      return res.json({
        code: 400,
        message: '缺少起点或终点参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/direction/truck`, {
        params: {
          key: AMAP_KEY,
          origin: origin,
          destination: destination,
          size: options.size || 1, // 返回路线数量
          strategy: options.strategy || 0, // 0: 最快路线
          truck_height: options.truck_height || 2, // 车辆高度，单位：米
          truck_width: options.truck_width || 2.5, // 车辆宽度，单位：米
          truck_weight: options.truck_weight || 5, // 车辆重量，单位：吨
          truck_length: options.truck_length || 6, // 车辆长度，单位：米
          truck_axle_count: options.truck_axle_count || 2, // 车辆轴数
          avoidpolygons: options.avoidpolygons || '', // 避让区域
          avoidroads: options.avoidroads || '' // 避让道路
        }
      });
      
      if (response.data.status === '1' && response.data.route && response.data.route.paths.length > 0) {
        return res.json({
          code: 200,
          message: '路径规划成功',
          data: response.data.route
        });
      } else {
        return res.json({
          code: 400,
          message: '路径规划失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '路径规划请求失败',
        data: null
      });
    }
  },

  // 限行查询
  trafficRestriction: async (req, res) => {
    const { city, license_plate } = req.query;
    
    if (!city || !license_plate) {
      return res.json({
        code: 400,
        message: '缺少城市或车牌号参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/config/district`, {
        params: {
          key: AMAP_KEY,
          keywords: city,
          subdistrict: 0
        }
      });
      
      if (response.data.status === '1' && response.data.districts.length > 0) {
        const adcode = response.data.districts[0].adcode;
        
        // 调用限行API
        const limitResponse = await axios.get(`${AMAP_BASE_URL}/traffic/roadrestriction`, {
          params: {
            key: AMAP_KEY,
            city: adcode,
            license_plate: license_plate
          }
        });
        
        if (limitResponse.data.status === '1') {
          return res.json({
            code: 200,
            message: '限行查询成功',
            data: limitResponse.data
          });
        } else {
          return res.json({
            code: 400,
            message: '限行查询失败',
            data: null
          });
        }
      } else {
        return res.json({
          code: 400,
          message: '城市编码获取失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '限行查询请求失败',
        data: null
      });
    }
  },

  // 实时路况查询
  trafficStatus: async (req, res) => {
    const { origin, destination } = req.query;
    
    if (!origin || !destination) {
      return res.json({
        code: 400,
        message: '缺少起点或终点参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/direction/driving`, {
        params: {
          key: AMAP_KEY,
          origin: origin,
          destination: destination,
          extensions: 'all', // 返回详细信息
          strategy: 0 // 最快路线
        }
      });
      
      if (response.data.status === '1' && response.data.route && response.data.route.paths.length > 0) {
        return res.json({
          code: 200,
          message: '路况查询成功',
          data: response.data.route
        });
      } else {
        return res.json({
          code: 400,
          message: '路况查询失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '路况查询请求失败',
        data: null
      });
    }
  },

  // 周边搜索
  aroundSearch: async (req, res) => {
    const { location, keywords, ...options } = req.query;
    
    if (!location || !keywords) {
      return res.json({
        code: 400,
        message: '缺少位置或关键词参数',
        data: null
      });
    }
    
    try {
      const response = await axios.get(`${AMAP_BASE_URL}/place/around`, {
        params: {
          key: AMAP_KEY,
          location: location,
          keywords: keywords,
          radius: options.radius || 1000, // 搜索半径，单位：米
          types: options.types || '', // 兴趣点类型
          offset: options.offset || 20, // 返回结果数量
          page: options.page || 1 // 页码
        }
      });
      
      if (response.data.status === '1') {
        return res.json({
          code: 200,
          message: '周边搜索成功',
          data: response.data.pois
        });
      } else {
        return res.json({
          code: 400,
          message: '周边搜索失败',
          data: null
        });
      }
    } catch (error) {
      res.status(500).json({
        code: 500,
        message: '周边搜索请求失败',
        data: null
      });
    }
  }
};

module.exports = mapController;
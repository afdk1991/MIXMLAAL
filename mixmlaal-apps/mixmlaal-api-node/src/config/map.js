require('dotenv').config();

// 地图服务配置 - 2025最新版
const mapConfig = {
  // 高德地图API配置 (v2.0 GL+)
  amap: {
    key: process.env.AMAP_KEY || '',
    baseUrl: 'https://restapi.amap.com/v3',
    // 地理编码接口
    geocode: '/geocode/geo',
    // 逆地理编码接口
    regeocode: '/geocode/regeo',
    // 路径规划接口
    direction: '/direction/driving',
    // 未来出行规划 (ETD)
    etdDirection: '/v5/direction/driving',
    // 批量算路接口
    batchDirection: '/direction/driving/batch',
    // 距离计算接口
    distance: '/distance',
    // 实时路况接口
    traffic: '/traffic/status',
    // 空间智能API
    spatialAnalysis: '/spatial/analysis',
    // MCP Server接口
    mcpServer: '/v5/mcp',
    // 未来出行规划 (ETD)
    etd: '/v5/direction/etd'
  },
  // 百度地图API配置 (v3.0 WebGL)
  baidu: {
    key: process.env.BAIDU_MAP_KEY || '',
    baseUrl: 'https://api.map.baidu.com',
    // 地理编码接口
    geocode: '/geocoding/v3',
    // 逆地理编码接口
    regeocode: '/reverse_geocoding/v3',
    // 路径规划接口
    direction: '/direction/v2/driving',
    // 距离计算接口
    distance: '/routematrix/v2/driving',
    // 二三维一体化API
    threeJS: '/threejs/v1',
    // 地图AI开放平台
    aiPlatform: '/ai/v1'
  },
  // 腾讯地图API配置 (GL v1.8.0)
  tencent: {
    key: process.env.TENCENT_MAP_KEY || '',
    baseUrl: 'https://apis.map.qq.com',
    // 地理编码接口
    geocode: '/ws/geocoder/v1',
    // 逆地理编码接口
    regeocode: '/ws/geocoder/v1/reverse',
    // 路径规划接口
    direction: '/ws/direction/v1/driving',
    // 距离计算接口
    distance: '/ws/distance/v1'
  },
  // Google Maps API配置 (v3.61)
  google: {
    key: process.env.GOOGLE_MAPS_KEY || '',
    baseUrl: 'https://maps.googleapis.com/maps/api',
    // 地理编码接口
    geocode: '/geocode/json',
    // 路径规划接口
    direction: '/directions/json',
    // 距离矩阵接口
    distanceMatrix: '/distancematrix/json',
    // 街景接口
    streetView: '/streetview/json'
  },
  // 地图缓存配置
  cache: {
    geocodeExpiration: 86400, // 地理编码缓存1天
    distanceMatrixExpiration: 3600, // 距离矩阵缓存1小时
    trafficExpiration: 300, // 实时路况缓存5分钟
    routeExpiration: 1800, // 路径规划缓存30分钟
    maxCacheSize: 10000 // 最大缓存条目数
  },
  // 服务降级配置
  fallback: {
    primaryProvider: 'amap',
    fallbackProviders: ['baidu', 'tencent'],
    retryAttempts: 3,
    retryDelay: 1000,
    circuitBreakerThreshold: 10,
    circuitBreakerReset: 60000
  }
};

module.exports = mapConfig;


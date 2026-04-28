/**
 * 地图服务路由
 * 版本: v1.0.0.0
 * 说明: 提供多地图服务商支持的API接口
 */

const express = require('express');
const router = express.Router();
const {
  getMapService,
  switchProvider,
  getAvailableProviders,
  getWebSDKConfigs,
  currentProvider,
} = require('../services/mapServiceMulti');

/**
 * @route   GET /api/v1/map/providers
 * @desc    获取所有可用的地图服务商
 * @access  Public
 */
router.get('/providers', (req, res) => {
  try {
    const providers = getAvailableProviders();
    res.json({
      status: 'success',
      data: {
        current: currentProvider,
        providers,
      },
    });
  } catch (error) {
    console.error('获取地图服务商错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取地图服务商失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/switch
 * @desc    切换地图服务商
 * @access  Public
 */
router.post('/switch', (req, res) => {
  try {
    const { provider } = req.body;

    if (!provider) {
      return res.status(400).json({
        status: 'error',
        message: '请指定地图服务商',
      });
    }

    const success = switchProvider(provider);

    if (success) {
      res.json({
        status: 'success',
        message: `已切换到${provider}地图`,
        data: {
          current: provider,
        },
      });
    } else {
      res.status(400).json({
        status: 'error',
        message: '不支持的地图服务商',
      });
    }
  } catch (error) {
    console.error('切换地图服务商错误:', error);
    res.status(500).json({
      status: 'error',
      message: '切换地图服务商失败',
    });
  }
});

/**
 * @route   GET /api/v1/map/sdk-config
 * @desc    获取前端SDK配置
 * @access  Public
 */
router.get('/sdk-config', (req, res) => {
  try {
    const configs = getWebSDKConfigs();
    res.json({
      status: 'success',
      data: configs,
    });
  } catch (error) {
    console.error('获取SDK配置错误:', error);
    res.status(500).json({
      status: 'error',
      message: '获取SDK配置失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/geocode
 * @desc    地理编码（地址转坐标）
 * @access  Public
 */
router.post('/geocode', async (req, res) => {
  try {
    const { address, provider } = req.body;

    if (!address) {
      return res.status(400).json({
        status: 'error',
        message: '请输入地址',
      });
    }

    const mapService = getMapService(provider);
    const result = await mapService.geocode(address);

    res.json({
      status: 'success',
      data: {
        address,
        location: result,
        provider: mapService.provider,
      },
    });
  } catch (error) {
    console.error('地理编码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '地理编码失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/reverse-geocode
 * @desc    逆地理编码（坐标转地址）
 * @access  Public
 */
router.post('/reverse-geocode', async (req, res) => {
  try {
    const { lng, lat, provider } = req.body;

    if (lng === undefined || lat === undefined) {
      return res.status(400).json({
        status: 'error',
        message: '请提供经纬度坐标',
      });
    }

    const mapService = getMapService(provider);
    const address = await mapService.reverseGeocode(lng, lat);

    res.json({
      status: 'success',
      data: {
        location: { lng, lat },
        address,
        provider: mapService.provider,
      },
    });
  } catch (error) {
    console.error('逆地理编码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '逆地理编码失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/direction
 * @desc    路径规划（驾车）
 * @access  Public
 */
router.post('/direction', async (req, res) => {
  try {
    const { from, to, provider } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        status: 'error',
        message: '请提供起点和终点坐标',
      });
    }

    const mapService = getMapService(provider);
    const result = await mapService.drivingRoute(from, to);

    res.json({
      status: 'success',
      data: {
        from,
        to,
        distance: result.distance,
        duration: result.duration,
        polyline: result.polyline,
        provider: mapService.provider,
      },
    });
  } catch (error) {
    console.error('路径规划错误:', error);
    res.status(500).json({
      status: 'error',
      message: '路径规划失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/search-poi
 * @desc    搜索周边POI
 * @access  Public
 */
router.post('/search-poi', async (req, res) => {
  try {
    const { keywords, location, radius, provider } = req.body;

    if (!keywords || !location) {
      return res.status(400).json({
        status: 'error',
        message: '请提供关键词和中心点坐标',
      });
    }

    const mapService = getMapService(provider);
    const pois = await mapService.searchPOI(keywords, location, radius || 5000);

    res.json({
      status: 'success',
      data: {
        keywords,
        location,
        radius: radius || 5000,
        pois,
        provider: mapService.provider,
      },
    });
  } catch (error) {
    console.error('搜索POI错误:', error);
    res.status(500).json({
      status: 'error',
      message: '搜索POI失败',
    });
  }
});

/**
 * @route   POST /api/v1/map/batch-geocode
 * @desc    批量地理编码
 * @access  Public
 */
router.post('/batch-geocode', async (req, res) => {
  try {
    const { addresses, provider } = req.body;

    if (!addresses || !Array.isArray(addresses) || addresses.length === 0) {
      return res.status(400).json({
        status: 'error',
        message: '请提供地址列表',
      });
    }

    const mapService = getMapService(provider);
    const results = await Promise.all(
      addresses.map(async address => {
        try {
          const location = await mapService.geocode(address);
          return { address, location, success: true };
        } catch (error) {
          return { address, location: null, success: false };
        }
      }),
    );

    res.json({
      status: 'success',
      data: {
        results,
        provider: mapService.provider,
      },
    });
  } catch (error) {
    console.error('批量地理编码错误:', error);
    res.status(500).json({
      status: 'error',
      message: '批量地理编码失败',
    });
  }
});

module.exports = router;

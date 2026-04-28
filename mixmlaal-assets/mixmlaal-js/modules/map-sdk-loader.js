/**
 * 地图SDK加载器
 * 版本: v2.0.0
 * 说明: 支持多地图服务商SDK动态加载和切换，2025最新版
 */

const MapSDKLoader = {
  loadedSDKs: {},
  currentProvider: 'gaode',

  // 地图SDK配置
  sdkConfigs: {
    gaode: {
      name: '高德地图',
      version: '2.0',
      sdkUrl: 'https://webapi.amap.com/maps?v=2.0&key=',
      key: window.GAODE_KEY || '',
      checkLoaded: () => typeof window.AMap !== 'undefined',
      onLoad: callback => {
        if (window.AMap) {
          callback();
        } else {
          window.initAMap = callback;
        }
      },
      capabilities: ['3D', 'routePlanning', 'geocoding', 'traffic', 'AIAnalytics', 'ETD', 'MCP']
    },
    baidu: {
      name: '百度地图',
      version: '3.0',
      sdkUrl: 'https://api.map.baidu.com/api?v=3.0&ak=',
      key: window.BAIDU_MAP_KEY || '',
      checkLoaded: () => typeof window.BMapGL !== 'undefined' || typeof window.BMap !== 'undefined',
      onLoad: callback => {
        if (window.BMapGL || window.BMap) {
          callback();
        } else {
          window.initBMap = callback;
        }
      },
      capabilities: ['3D', 'ThreeJS', 'routePlanning', 'geocoding', 'traffic', 'ARNavigation']
    },
    tencent: {
      name: '腾讯地图',
      version: '1.8.0',
      sdkUrl: 'https://map.qq.com/api/gljs?v=1.exp&key=',
      key: window.TENCENT_MAP_KEY || '',
      checkLoaded: () => typeof window.TMap !== 'undefined',
      onLoad: callback => {
        if (window.TMap) {
          callback();
        } else {
          window.initTMap = callback;
        }
      },
      capabilities: ['3D', 'routePlanning', 'geocoding', 'traffic', 'WeChatMiniProgram']
    },
    google: {
      name: 'Google Maps',
      version: '3.61',
      sdkUrl: 'https://maps.googleapis.com/maps/api/js?key=',
      key: window.GOOGLE_MAPS_KEY || '',
      libraries: '&libraries=places,geometry,drawing',
      checkLoaded: () => typeof window.google !== 'undefined' && window.google.maps,
      onLoad: callback => {
        if (window.google && window.google.maps) {
          callback();
        }
      },
      capabilities: ['3D', 'routePlanning', 'geocoding', 'traffic', 'ARNavigation', 'StreetView']
    }
  },

  /**
   * 加载地图SDK
   * @param {string} provider - 服务商名称
   * @param {string} key - API密钥
   * @returns {Promise}
   */
  loadSDK(provider, key) {
    return new Promise((resolve, reject) => {
      const config = this.sdkConfigs[provider];

      if (!config) {
        reject(new Error(`不支持的地图服务商: ${provider}`));
        return;
      }

      // 如果已加载，直接返回
      if (this.loadedSDKs[provider] || config.checkLoaded()) {
        this.loadedSDKs[provider] = true;
        this.currentProvider = provider;
        console.log(`${config.name} SDK (v${config.version})已加载`);
        resolve();
        return;
      }

      // 动态加载SDK
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.defer = true;

      const apiKey = key || config.key;
      let sdkUrl = config.sdkUrl + apiKey;

      // Google Maps需要额外的库
      if (provider === 'google' && config.libraries) {
        sdkUrl += config.libraries;
      }

      // 高德地图和百度地图需要callback参数
      if (provider === 'gaode') {
        sdkUrl += '&callback=initAMap';
      } else if (provider === 'baidu') {
        sdkUrl += '&callback=initBMap';
      } else if (provider === 'tencent') {
        sdkUrl += '&callback=initTMap';
      }

      console.log(`正在加载${config.name} SDK v${config.version}，URL: ${sdkUrl.substring(0, 100)}...`);

      script.src = sdkUrl;

      // 设置加载超时
      const timeoutId = setTimeout(() => {
        console.error(`${config.name} SDK加载超时`);
        script.onerror();
      }, 15000); // 15秒超时

      script.onload = () => {
        clearTimeout(timeoutId);
        this.loadedSDKs[provider] = true;
        this.currentProvider = provider;
        console.log(`${config.name} SDK v${config.version}加载成功，支持能力: ${config.capabilities.join(', ')}`);
        resolve();
      };

      script.onerror = () => {
        clearTimeout(timeoutId);
        console.error(`${config.name} SDK加载失败`);
        // 尝试切换到备用服务商
        this.switchToBackupProvider().then(resolve).catch(reject);
      };

      document.head.appendChild(script);
    });
  },

  /**
   * 切换到备用地图服务商
   * @returns {Promise}
   */
  async switchToBackupProvider() {
    const providers = ['baidu', 'tencent', 'gaode'];

    for (const provider of providers) {
      if (provider !== this.currentProvider && this.sdkConfigs[provider]) {
        try {
          console.log(`尝试切换到备用地图服务商: ${this.sdkConfigs[provider].name} (v${this.sdkConfigs[provider].version})`);
          await this.loadSDK(provider);
          return;
        } catch (error) {
          console.error(`备用服务商 ${this.sdkConfigs[provider].name} 加载失败:`, error);
          continue;
        }
      }
    }

    throw new Error('所有地图服务商加载失败');
  },

  /**
   * 从服务器获取SDK配置
   * @returns {Promise<Array>}
   */
  async loadSDKConfigsFromServer() {
    try {
      const response = await fetch('/api/v1/map/sdk-config');
      const result = await response.json();

      if (result.status === 'success' && result.data) {
        result.data.forEach(config => {
          if (this.sdkConfigs[config.provider]) {
            this.sdkConfigs[config.provider].key = config.key;
            if (config.sdkUrl) {
              this.sdkConfigs[config.provider].sdkUrl = config.sdkUrl;
            }
            console.log(`已更新${config.name}的SDK配置，API Key: ${config.key.substring(0, 8)}...`);
          }
        });
      }

      return result.data || [];
    } catch (error) {
      console.error('获取SDK配置失败:', error);
      return [];
    }
  },

  /**
   * 初始化地图
   * @param {string} containerId - 容器ID
   * @param {Object} options - 地图选项
   * @returns {Object}
   */
  initMap(containerId, options = {}) {
    const provider = this.currentProvider;

    switch (provider) {
      case 'gaode':
        return this.initGaodeMap(containerId, options);
      case 'baidu':
        return this.initBaiduMap(containerId, options);
      case 'tencent':
        return this.initTencentMap(containerId, options);
      case 'google':
        return this.initGoogleMap(containerId, options);
      default:
        return this.initGaodeMap(containerId, options);
    }
  },

  /**
   * 初始化高德地图 (v2.0 GL+)
   */
  initGaodeMap(containerId, options) {
    const defaultOptions = {
      zoom: 11,
      center: [116.397428, 39.90923],
      resizeEnable: true,
      showLabel: true,
      pitch: 0,
      rotation: 0,
      viewMode: '3D',
      mapStyle: 'amap://styles/normal'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const map = new AMap.Map(containerId, mergedOptions);

    // 添加控件
    map.addControl(new AMap.Scale());
    map.addControl(new AMap.ToolBar());
    map.addControl(new AMap.ControlBar({
      showZoomBar: true,
      showControlButton: true
    }));

    return {
      provider: 'gaode',
      version: '2.0',
      capabilities: this.sdkConfigs.gaode.capabilities,
      map,
      setCenter: (lng, lat) => map.setCenter([lng, lat]),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      setPitch: pitch => map.setPitch(pitch),
      setRotation: rotation => map.setRotation(rotation),
      addMarker: (lng, lat, markerOptions = {}) => {
        const marker = new AMap.Marker({
          position: [lng, lat],
          ...markerOptions
        });
        map.add(marker);
        return marker;
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => map.clearMap(),
      planRoute: (origin, destination, options = {}) => {
        return new Promise((resolve, reject) => {
          const driving = new AMap.Driving({
            map: map,
            showTraffic: true,
            ...options
          });
          
          driving.search(origin, destination, (status, result) => {
            if (status === 'complete') {
              resolve(result);
            } else {
              reject(result);
            }
          });
        });
      },
      planRouteWithETD: (origin, destination, futureTime, options = {}) => {
        // 未来出行规划 (ETD)
        return new Promise((resolve, reject) => {
          const driving = new AMap.Driving({
            map: map,
            showTraffic: true,
            ...options
          });
          
          const searchParams = {
            origin,
            destination,
            time: futureTime
          };
          
          driving.search(searchParams, (status, result) => {
            if (status === 'complete') {
              resolve(result);
            } else {
              reject(result);
            }
          });
        });
      },
      getTraffic: (bounds) => {
        return new Promise((resolve, reject) => {
          const trafficLayer = new AMap.Traffic();
          trafficLayer.setMap(map);
          resolve(trafficLayer);
        });
      }
    };
  },

  /**
   * 初始化百度地图 (v3.0 / WebGL)
   */
  initBaiduMap(containerId, options) {
    const defaultOptions = {
      zoom: 11,
      center: { lng: 116.404, lat: 39.915 },
      tilt: 0,
      heading: 0,
      mapStyle: 'normal'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const map = new BMapGL.Map(containerId);
    const point = new BMapGL.Point(mergedOptions.center.lng, mergedOptions.center.lat);
    
    map.centerAndZoom(point, mergedOptions.zoom);
    map.setTilt(mergedOptions.tilt);
    map.setHeading(mergedOptions.heading);

    // 添加控件
    map.addControl(new BMapGL.ScaleControl());
    map.addControl(new BMapGL.NavigationControl3D());
    map.addControl(new BMapGL.MapTypeControl());

    return {
      provider: 'baidu',
      version: '3.0',
      capabilities: this.sdkConfigs.baidu.capabilities,
      map,
      setCenter: (lng, lat) => map.setCenter(new BMapGL.Point(lng, lat)),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      setTilt: tilt => map.setTilt(tilt),
      setHeading: heading => map.setHeading(heading),
      addMarker: (lng, lat, markerOptions = {}) => {
        const point = new BMapGL.Point(lng, lat);
        const marker = new BMapGL.Marker(point, markerOptions);
        map.addOverlay(marker);
        return marker;
      },
      removeMarker: marker => map.removeOverlay(marker),
      clearMap: () => map.clearOverlays(),
      planRoute: (origin, destination, options = {}) => {
        return new Promise((resolve, reject) => {
          const driving = new BMapGL.DrivingRoute(map, {
            renderOptions: { map: map, autoViewport: true },
            ...options
          });
          
          driving.search(new BMapGL.Point(origin[0], origin[1]), new BMapGL.Point(destination[0], destination[1]));
          driving.setSearchCompleteCallback((results) => {
            resolve(results);
          });
        });
      },
      enableThreeJS: () => {
        // 二三维一体化支持
        return window.BMapGLThree;
      }
    };
  },

  /**
   * 初始化腾讯地图 (GL v1.8.0)
   */
  initTencentMap(containerId, options) {
    const defaultOptions = {
      center: new TMap.LatLng(39.90923, 116.397428),
      zoom: 11,
      mapStyleId: 'style1',
      viewMode: '3D'
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const map = new TMap.Map(containerId, mergedOptions);

    // 添加控件
    map.addControl(new TMap.Scale());
    map.addControl(new TMap.Zoom());
    map.addControl(new TMap.Rotate());

    return {
      provider: 'tencent',
      version: '1.8.0',
      capabilities: this.sdkConfigs.tencent.capabilities,
      map,
      setCenter: (lng, lat) => map.setCenter(new TMap.LatLng(lat, lng)),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng, lat: center.lat };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, markerOptions = {}) => {
        const marker = new TMap.Marker({
          position: new TMap.LatLng(lat, lng),
          map: map,
          ...markerOptions
        });
        return marker;
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => {
        map.setFitBounds(map.getBounds());
      },
      planRoute: (origin, destination, options = {}) => {
        return new Promise((resolve, reject) => {
          const driving = new TMap.Driving({
            map: map,
            ...options
          });
          
          driving.search(new TMap.LatLng(origin[1], origin[0]), new TMap.LatLng(destination[1], destination[0]));
          driving.on('complete', (result) => resolve(result));
        });
      }
    };
  },

  /**
   * 初始化Google Maps (v3.61)
   */
  initGoogleMap(containerId, options) {
    const defaultOptions = {
      center: { lat: 39.90923, lng: 116.397428 },
      zoom: 11,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: []
    };
    
    const mergedOptions = { ...defaultOptions, ...options };
    const map = new google.maps.Map(document.getElementById(containerId), mergedOptions);

    // 添加控件
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();
    directionsRenderer.setMap(map);

    return {
      provider: 'google',
      version: '3.61',
      capabilities: this.sdkConfigs.google.capabilities,
      map,
      setCenter: (lng, lat) => map.setCenter({ lat, lng }),
      getCenter: () => {
        const center = map.getCenter();
        return { lng: center.lng(), lat: center.lat() };
      },
      setZoom: zoom => map.setZoom(zoom),
      addMarker: (lng, lat, markerOptions = {}) => {
        return new google.maps.Marker({
          position: { lat, lng },
          map: map,
          ...markerOptions
        });
      },
      removeMarker: marker => marker.setMap(null),
      clearMap: () => {
        // Google Maps需要手动清除所有标记
      },
      planRoute: (origin, destination, options = {}) => {
        return new Promise((resolve, reject) => {
          const request = {
            origin: new google.maps.LatLng(origin[1], origin[0]),
            destination: new google.maps.LatLng(destination[1], destination[0]),
            travelMode: google.maps.TravelMode.DRIVING,
            provideRouteAlternatives: true
          };
          
          directionsService.route(request, (result, status) => {
            if (status === google.maps.DirectionsStatus.OK) {
              directionsRenderer.setDirections(result);
              resolve(result);
            } else {
              reject(status);
            }
          });
        });
      },
      getStreetView: (containerId, options = {}) => {
        const panorama = new google.maps.StreetViewPanorama(document.getElementById(containerId), options);
        return panorama;
      }
    };
  },

  /**
   * 获取当前服务商
   */
  getCurrentProvider() {
    return {
      provider: this.currentProvider,
      name: this.sdkConfigs[this.currentProvider].name,
      version: this.sdkConfigs[this.currentProvider].version,
      capabilities: this.sdkConfigs[this.currentProvider].capabilities
    };
  },

  /**
   * 获取所有可用服务商
   */
  getAvailableProviders() {
    return Object.keys(this.sdkConfigs).map(key => ({
      provider: key,
      name: this.sdkConfigs[key].name,
      version: this.sdkConfigs[key].version,
      capabilities: this.sdkConfigs[key].capabilities
    }));
  }
};

// 导出模块
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MapSDKLoader;
} else {
  window.MapSDKLoader = MapSDKLoader;
}


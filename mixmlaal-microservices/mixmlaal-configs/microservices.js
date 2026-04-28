// 微服务配置
const microservicesConfig = {
  // 服务列表
  services: {
    auth: {
      name: 'auth-service',
      version: '1.0.0',
      endpoints: [
        'http://localhost:3001',
        'http://localhost:3002'
      ],
      healthCheck: '/health'
    },
    user: {
      name: 'user-service',
      version: '1.0.0',
      endpoints: [
        'http://localhost:3003',
        'http://localhost:3004'
      ],
      healthCheck: '/health'
    },
    order: {
      name: 'order-service',
      version: '1.0.0',
      endpoints: [
        'http://localhost:3005',
        'http://localhost:3006'
      ],
      healthCheck: '/health'
    },
    product: {
      name: 'product-service',
      version: '1.0.0',
      endpoints: [
        'http://localhost:3007',
        'http://localhost:3008'
      ],
      healthCheck: '/health'
    },
    payment: {
      name: 'payment-service',
      version: '1.0.0',
      endpoints: [
        'http://localhost:3009',
        'http://localhost:3010'
      ],
      healthCheck: '/health'
    }
  },
  
  // 负载均衡策略
  loadBalancing: {
    strategy: 'round-robin', // round-robin, random, least-connections
    retryAttempts: 3,
    retryDelay: 1000
  },
  
  // 服务发现配置
  serviceDiscovery: {
    enabled: true,
    refreshInterval: 30000 // 30秒刷新一次
  },
  
  // 熔断配置
  circuitBreaker: {
    enabled: true,
    failureThreshold: 50, // 失败率阈值
    resetTimeout: 30000, // 30秒后尝试恢复
    timeout: 5000 // 服务调用超时时间
  }
};

// 负载均衡器类
class LoadBalancer {
  constructor(config) {
    this.config = config;
    this.serviceIndex = {};
    this.serviceHealth = {};
    
    // 初始化服务索引
    Object.keys(config.services).forEach(service => {
      this.serviceIndex[service] = 0;
      this.serviceHealth[service] = {};
      config.services[service].endpoints.forEach(endpoint => {
        this.serviceHealth[service][endpoint] = true;
      });
    });
  }

  // 获取服务实例
  getServiceInstance(serviceName) {
    const service = this.config.services[serviceName];
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }

    // 过滤健康的服务实例
    const healthyEndpoints = service.endpoints.filter(endpoint => 
      this.serviceHealth[serviceName][endpoint]
    );

    if (healthyEndpoints.length === 0) {
      throw new Error(`No healthy instances for service ${serviceName}`);
    }

    // 根据负载均衡策略选择实例
    let selectedEndpoint;
    switch (this.config.loadBalancing.strategy) {
      case 'round-robin':
        selectedEndpoint = this.roundRobinSelection(serviceName, healthyEndpoints);
        break;
      case 'random':
        selectedEndpoint = this.randomSelection(healthyEndpoints);
        break;
      case 'least-connections':
        // 这里简化处理，实际需要跟踪连接数
        selectedEndpoint = this.randomSelection(healthyEndpoints);
        break;
      default:
        selectedEndpoint = this.roundRobinSelection(serviceName, healthyEndpoints);
    }

    return selectedEndpoint;
  }

  // 轮询选择
  roundRobinSelection(serviceName, endpoints) {
    const index = this.serviceIndex[serviceName] % endpoints.length;
    this.serviceIndex[serviceName]++;
    return endpoints[index];
  }

  // 随机选择
  randomSelection(endpoints) {
    const index = Math.floor(Math.random() * endpoints.length);
    return endpoints[index];
  }

  // 更新服务健康状态
  updateServiceHealth(serviceName, endpoint, isHealthy) {
    if (this.serviceHealth[serviceName]) {
      this.serviceHealth[serviceName][endpoint] = isHealthy;
    }
  }

  // 检查服务健康状态
  async checkServiceHealth() {
    for (const serviceName in this.config.services) {
      const service = this.config.services[serviceName];
      for (const endpoint of service.endpoints) {
        try {
          const response = await fetch(`${endpoint}${service.healthCheck}`);
          const isHealthy = response.ok;
          this.updateServiceHealth(serviceName, endpoint, isHealthy);
        } catch (error) {
          this.updateServiceHealth(serviceName, endpoint, false);
        }
      }
    }
  }
}

module.exports = {
  microservicesConfig,
  LoadBalancer
};

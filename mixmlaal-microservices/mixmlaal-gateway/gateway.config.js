module.exports = {
  gateway: {
    port: process.env.GATEWAY_PORT || 3000,
    timeout: 30000,
    retryAttempts: 3
  },

  services: {
    'user-service': {
      url: process.env.USER_SERVICE_URL || 'http://user-service:3001',
      timeout: 10000,
      retry: 2
    },
    'ride-service': {
      url: process.env.RIDE_SERVICE_URL || 'http://ride-service:3002',
      timeout: 15000,
      retry: 2
    },
    'ecommerce-service': {
      url: process.env.ECOMMERCE_SERVICE_URL || 'http://ecommerce-service:3003',
      timeout: 10000,
      retry: 2
    },
    'payment-service': {
      url: process.env.PAYMENT_SERVICE_URL || 'http://payment-service:3004',
      timeout: 20000,
      retry: 3
    },
    'order-service': {
      url: process.env.ORDER_SERVICE_URL || 'http://order-service:3005',
      timeout: 15000,
      retry: 2
    },
    'social-service': {
      url: process.env.SOCIAL_SERVICE_URL || 'http://social-service:3006',
      timeout: 10000,
      retry: 2
    },
    'food-service': {
      url: process.env.FOOD_SERVICE_URL || 'http://food-service:3009',
      timeout: 15000,
      retry: 2
    },
    'errand-service': {
      url: process.env.ERRAND_SERVICE_URL || 'http://errand-service:3010',
      timeout: 15000,
      retry: 2
    },
    'search-service': {
      url: process.env.SEARCH_SERVICE_URL || 'http://search-service:3029',
      timeout: 10000,
      retry: 2
    },
    'payment-integration-service': {
      url: process.env.PAYMENT_INTEGRATION_SERVICE_URL || 'http://payment-integration-service:3030',
      timeout: 30000,
      retry: 3
    },
    'sms-service': {
      url: process.env.SMS_SERVICE_URL || 'http://sms-service:3031',
      timeout: 15000,
      retry: 2
    },
    'kafka-consumer-service': {
      url: process.env.KAFKA_CONSUMER_SERVICE_URL || 'http://kafka-consumer-service:3027',
      timeout: 10000,
      retry: 1
    },
    'kafka-producer-service': {
      url: process.env.KAFKA_PRODUCER_SERVICE_URL || 'http://kafka-producer-service:3028',
      timeout: 10000,
      retry: 1
    }
  },

  routes: [
    {
      path: '/api/auth/:action',
      service: 'user-service',
      methods: ['POST']
    },
    {
      path: '/api/users/:action',
      service: 'user-service',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      path: '/api/ride/:action',
      service: 'ride-service',
      methods: ['GET', 'POST', 'PUT']
    },
    {
      path: '/api/ecommerce/:action',
      service: 'ecommerce-service',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      path: '/api/payment/create',
      service: 'payment-integration-service',
      methods: ['POST']
    },
    {
      path: '/api/payment/wechat/:action',
      service: 'payment-integration-service',
      methods: ['POST', 'GET']
    },
    {
      path: '/api/payment/alipay/:action',
      service: 'payment-integration-service',
      methods: ['POST', 'GET']
    },
    {
      path: '/api/payment/query/:tradeNo',
      service: 'payment-integration-service',
      methods: ['GET']
    },
    {
      path: '/api/orders/:action',
      service: 'order-service',
      methods: ['GET', 'POST', 'PUT']
    },
    {
      path: '/api/social/:action',
      service: 'social-service',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    },
    {
      path: '/api/food/:action',
      service: 'food-service',
      methods: ['GET', 'POST', 'PUT']
    },
    {
      path: '/api/errand/:action',
      service: 'errand-service',
      methods: ['GET', 'POST', 'PUT']
    },
    {
      path: '/api/search/:type',
      service: 'search-service',
      methods: ['GET', 'POST']
    },
    {
      path: '/api/search/:type',
      service: 'search-service',
      methods: ['GET']
    },
    {
      path: '/api/recommendations/:userId',
      service: 'search-service',
      methods: ['GET']
    },
    {
      path: '/api/sms/send',
      service: 'sms-service',
      methods: ['POST']
    },
    {
      path: '/api/sms/verify',
      service: 'sms-service',
      methods: ['POST']
    },
    {
      path: '/api/sms/notify',
      service: 'sms-service',
      methods: ['POST']
    },
    {
      path: '/api/kafka/publish',
      service: 'kafka-producer-service',
      methods: ['POST']
    },
    {
      path: '/health',
      service: null,
      methods: ['GET'],
      handler: (req, res) => {
        res.json({
          status: 'ok',
          service: 'api-gateway',
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
          routes: require('./routes').routes.length
        });
      }
    }
  ],

  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: 'Too many requests'
  },

  circuitBreaker: {
    timeout: 10000,
    errorThresholdPercentage: 50,
    resetTimeout: 30000
  },

  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },

  monitoring: {
    prometheusEnabled: true,
    prometheusPath: '/metrics',
    healthCheckInterval: 30000
  }
};
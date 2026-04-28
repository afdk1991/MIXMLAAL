const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { microservicesConfig, LoadBalancer } = require('../config/microservices');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const app = express();
const loadBalancer = new LoadBalancer(microservicesConfig);

// 安全中间件
app.use(helmet());

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP限制100个请求
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// 服务健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'success', message: 'API Gateway is healthy' });
});

// 代理到认证服务
app.use('/api/auth', (req, res, next) => {
  try {
    const authService = loadBalancer.getServiceInstance('auth');
    const proxy = createProxyMiddleware({
      target: authService,
      changeOrigin: true,
      pathRewrite: {
        '^/api/auth': '/api/auth'
      },
      onError: (err, req, res) => {
        console.error('Auth service error:', err);
        res.status(503).json({ status: 'error', message: 'Auth service unavailable' });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Load balancer error:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// 代理到用户服务
app.use('/api/users', (req, res, next) => {
  try {
    const userService = loadBalancer.getServiceInstance('user');
    const proxy = createProxyMiddleware({
      target: userService,
      changeOrigin: true,
      pathRewrite: {
        '^/api/users': '/api/users'
      },
      onError: (err, req, res) => {
        console.error('User service error:', err);
        res.status(503).json({ status: 'error', message: 'User service unavailable' });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Load balancer error:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// 代理到订单服务
app.use('/api/orders', (req, res, next) => {
  try {
    const orderService = loadBalancer.getServiceInstance('order');
    const proxy = createProxyMiddleware({
      target: orderService,
      changeOrigin: true,
      pathRewrite: {
        '^/api/orders': '/api/orders'
      },
      onError: (err, req, res) => {
        console.error('Order service error:', err);
        res.status(503).json({ status: 'error', message: 'Order service unavailable' });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Load balancer error:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// 代理到商品服务
app.use('/api/products', (req, res, next) => {
  try {
    const productService = loadBalancer.getServiceInstance('product');
    const proxy = createProxyMiddleware({
      target: productService,
      changeOrigin: true,
      pathRewrite: {
        '^/api/products': '/api/products'
      },
      onError: (err, req, res) => {
        console.error('Product service error:', err);
        res.status(503).json({ status: 'error', message: 'Product service unavailable' });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Load balancer error:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// 代理到支付服务
app.use('/api/payment', (req, res, next) => {
  try {
    const paymentService = loadBalancer.getServiceInstance('payment');
    const proxy = createProxyMiddleware({
      target: paymentService,
      changeOrigin: true,
      pathRewrite: {
        '^/api/payment': '/api/payment'
      },
      onError: (err, req, res) => {
        console.error('Payment service error:', err);
        res.status(503).json({ status: 'error', message: 'Payment service unavailable' });
      }
    });
    proxy(req, res, next);
  } catch (error) {
    console.error('Load balancer error:', error);
    res.status(503).json({ status: 'error', message: 'Service unavailable' });
  }
});

// 启动服务健康检查
setInterval(() => {
  loadBalancer.checkServiceHealth();
}, microservicesConfig.serviceDiscovery.refreshInterval);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' });
});

// 错误处理
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ status: 'error', message: 'Internal server error' });
});

const PORT = process.env.GATEWAY_PORT || 8080;
app.listen(PORT, () => {
  console.log(`API Gateway is running on port ${PORT}`);
  // 初始化服务健康检查
  loadBalancer.checkServiceHealth();
});

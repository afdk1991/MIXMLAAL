const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const authService = require('./services/authservice');
const userService = require('./services/userservice');
const oauthRoutes = require('./services/auth-service/routes/oauth');

// 模拟数据
const mockFoodMerchants = [
  {
    merchantId: 'M001',
    name: '麦当劳',
    rating: 4.5,
    sales: 1234,
    deliveryFee: 5,
    minOrder: 20,
    deliveryTime: '30-40分钟',
    category: '快餐',
    address: '北京市朝阳区建国路88号',
    location: { lng: 116.404, lat: 39.915 },
    distance: 800,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=McDonald%27s%20fast%20food%20restaurant&image_size=landscape_4_3',
  },
  {
    merchantId: 'M002',
    name: '肯德基',
    rating: 4.3,
    sales: 987,
    deliveryFee: 6,
    minOrder: 25,
    deliveryTime: '25-35分钟',
    category: '快餐',
    address: '北京市朝阳区建国路99号',
    location: { lng: 116.402, lat: 39.916 },
    distance: 1200,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=KFC%20fast%20food%20restaurant&image_size=landscape_4_3',
  },
  {
    merchantId: 'M003',
    name: '必胜客',
    rating: 4.6,
    sales: 765,
    deliveryFee: 7,
    minOrder: 30,
    deliveryTime: '35-45分钟',
    category: '西餐',
    address: '北京市朝阳区建国路100号',
    location: { lng: 116.405, lat: 39.913 },
    distance: 1500,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=Pizza%20Hut%20restaurant&image_size=landscape_4_3',
  },
];

const mockShopProducts = [
  {
    productId: 'P001',
    name: '新鲜水果篮',
    price: 99.00,
    description: '精选时令水果',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fresh%20fruits%20in%20a%20basket&image_size=square',
    category: '食品',
    stock: 100,
  },
  {
    productId: 'P002',
    name: '有机蔬菜',
    price: 29.90,
    description: '绿色健康',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=organic%20vegetables&image_size=square',
    category: '食品',
    stock: 200,
  },
  {
    productId: 'P003',
    name: '智能手机',
    price: 3999.00,
    description: '最新款',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smartphone%20device&image_size=square',
    category: '电子产品',
    stock: 50,
  },
  {
    productId: 'P004',
    name: '清洁用品套装',
    price: 59.90,
    description: '家庭必备',
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=home%20cleaning%20products&image_size=square',
    category: '日用品',
    stock: 150,
  },
];

const mockRideDrivers = [
  {
    driverId: 'D001',
    name: '张师傅',
    rating: 4.9,
    carModel: '丰田卡罗拉',
    carNumber: '京A12345',
    distance: 1.2,
    estimatedTime: 5,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20driver%20avatar&image_size=square',
  },
  {
    driverId: 'D002',
    name: '李师傅',
    rating: 4.8,
    carModel: '大众朗逸',
    carNumber: '京B67890',
    distance: 2.5,
    estimatedTime: 8,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20driver%20avatar&image_size=square',
  },
  {
    driverId: 'D003',
    name: '王师傅',
    rating: 4.7,
    carModel: '本田思域',
    carNumber: '京C24680',
    distance: 3.1,
    estimatedTime: 10,
    avatar: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=male%20driver%20avatar&image_size=square',
  },
];

const mockOrders = [
  {
    orderId: 'O001',
    type: 'food',
    status: 'completed',
    totalAmount: 58.5,
    createdAt: '2026-04-15T12:00:00Z',
    merchantName: '麦当劳',
  },
  {
    orderId: 'O002',
    type: 'ride',
    status: 'completed',
    totalAmount: 35.0,
    createdAt: '2026-04-16T09:30:00Z',
    driverName: '张师傅',
  },
  {
    orderId: 'O003',
    type: 'shop',
    status: 'pending',
    totalAmount: 159.8,
    createdAt: '2026-04-17T14:20:00Z',
    productNames: ['新鲜水果篮', '有机蔬菜'],
  },
];

const mockNotifications = [
  {
    id: 'N001',
    title: '订单已完成',
    message: '您的外卖订单已送达，感谢您的使用',
    read: false,
    createdAt: '2026-04-15T13:00:00Z',
  },
  {
    id: 'N002',
    title: '新活动通知',
    message: '限时优惠：外卖订单满50减20',
    read: false,
    createdAt: '2026-04-16T10:00:00Z',
  },
  {
    id: 'N003',
    title: '账户安全提醒',
    message: '您的账户密码已修改，请确认是否为本人操作',
    read: true,
    createdAt: '2026-04-14T15:30:00Z',
  },
];

const app = express();
const PORT = process.env.NODE_ENV === 'test' ? 8086 : 8085;

// 安全中间件
app.use(helmet());

// 压缩中间件
app.use(compression());

app.use(cors({
  origin: 'http://localhost:8084',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 每个IP在windowMs时间内最多请求100次
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: '请求过于频繁，请稍后再试'
  }
});

app.use(limiter);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: '未授权' });
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: '无效的令牌' });
  }
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.register(username, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/api/auth/logout', authenticate, async (req, res) => {
  res.json({ message: '登出成功' });
});

app.get('/api/auth/me', authenticate, async (req, res) => {
  try {
    const user = await authService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

app.use('/api/auth/oauth', oauthRoutes);

app.get('/api/users/me', authenticate, async (req, res) => {
  try {
    const user = await userService.getUserById(req.user.id);
    res.json(user);
  } catch (error) {
    res.status(404).json({ error: '用户未找到' });
  }
});

app.put('/api/users/me', authenticate, async (req, res) => {
  try {
    const user = await userService.updateUser(req.user.id, req.body);
    res.json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/users/me/addresses', authenticate, async (req, res) => {
  try {
    const addresses = await userService.getUserAddresses(req.user.id);
    res.json(addresses);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post('/api/users/me/addresses', authenticate, async (req, res) => {
  try {
    const address = await userService.addUserAddress(req.user.id, req.body);
    res.status(201).json(address);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/me/addresses/:id', authenticate, async (req, res) => {
  try {
    const address = await userService.updateUserAddress(req.user.id, req.params.id, req.body);
    res.json(address);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete('/api/users/me/addresses/:id', authenticate, async (req, res) => {
  try {
    await userService.deleteUserAddress(req.user.id, req.params.id);
    res.json({ message: '地址删除成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/users/me/addresses/:id/default', authenticate, async (req, res) => {
  try {
    await userService.setDefaultAddress(req.user.id, req.params.id);
    res.json({ message: '默认地址设置成功' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// 业务API路由

// 食品外卖API
app.get('/api/food/merchants', (req, res) => {
  res.json({
    status: 'success',
    data: mockFoodMerchants
  });
});

app.get('/api/food/merchants/:merchantId/menu', (req, res) => {
  const { merchantId } = req.params;
  const menu = [
    {
      id: '1',
      name: '汉堡',
      price: 25,
      description: '经典汉堡',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=hamburger&image_size=square'
    },
    {
      id: '2',
      name: '薯条',
      price: 15,
      description: '香脆薯条',
      image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=french%20fries&image_size=square'
    }
  ];
  res.json({
    status: 'success',
    data: menu
  });
});

app.post('/api/food/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'FOOD' + Date.now(),
      status: 'pending',
      totalAmount: req.body.totalAmount
    }
  });
});

// 跑腿服务API
app.post('/api/errand/estimate', (req, res) => {
  res.json({
    status: 'success',
    data: {
      estimatedPrice: {
        min: 15,
        max: 25
      },
      estimatedTime: 30
    }
  });
});

app.post('/api/errand/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'ERRAND' + Date.now(),
      status: 'pending',
      estimatedPrice: req.body.estimatedPrice
    }
  });
});

// 商城API
app.get('/api/shop/products', (req, res) => {
  res.json({
    status: 'success',
    data: mockShopProducts
  });
});

app.get('/api/shop/products/:id', (req, res) => {
  const { id } = req.params;
  const product = mockShopProducts.find(p => p.productId === id);
  res.json({
    status: 'success',
    data: product
  });
});

app.get('/api/shop/cart', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: []
  });
});

app.post('/api/shop/cart', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      cartId: 'CART' + Date.now(),
      product: req.body
    }
  });
});

// 打车服务API
app.get('/api/ride/drivers', (req, res) => {
  res.json({
    status: 'success',
    data: mockRideDrivers
  });
});

app.post('/api/ride/estimate', (req, res) => {
  res.json({
    status: 'success',
    data: {
      estimatedPrice: 35,
      estimatedTime: 15
    }
  });
});

app.post('/api/ride/order', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      orderId: 'RIDE' + Date.now(),
      status: 'pending',
      driverId: 'D001',
      driverName: '张师傅'
    }
  });
});

// 订单API
app.get('/api/orders', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: mockOrders
  });
});

app.get('/api/orders/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const order = mockOrders.find(o => o.orderId === id);
  res.json({
    status: 'success',
    data: order
  });
});

// 通知API
app.get('/api/notification/list', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: mockNotifications
  });
});

app.get('/api/notification/unread-count', authenticate, (req, res) => {
  const unreadCount = mockNotifications.filter(n => !n.read).length;
  res.json({
    status: 'success',
    data: { unreadCount }
  });
});

// AI服务API
app.post('/api/ai/chat', (req, res) => {
  res.json({
    status: 'success',
    data: {
      response: '您好！我是MIXMLAAL的智能助手，有什么可以帮助您的吗？'
    }
  });
});

// 地址API
app.get('/api/addresses', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: []
  });
});

app.post('/api/addresses', authenticate, (req, res) => {
  res.json({
    status: 'success',
    data: {
      id: 'ADDR' + Date.now(),
      ...req.body
    }
  });
});

app.listen(PORT, () => {
  console.log(`API服务器运行在 http://localhost:${PORT}`);
});

module.exports = app;
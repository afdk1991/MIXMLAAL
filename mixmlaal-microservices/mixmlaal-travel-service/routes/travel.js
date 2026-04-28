// 旅游服务路由

const express = require('express');
const router = express.Router();

// 模拟旅游服务数据
const travelPackages = [
  {
    id: '1',
    name: '三亚5日游',
    description: '三亚5日游，包含机票、酒店、景点门票和餐饮',
    price: 2999,
    duration: 5,
    destination: '三亚',
    category: '国内游',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sanya%20beach%20travel%20package&image_size=square'
  },
  {
    id: '2',
    name: '北京4日游',
    description: '北京4日游，包含故宫、长城、颐和园等著名景点',
    price: 1999,
    duration: 4,
    destination: '北京',
    category: '国内游',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20forbidden%20city%20travel&image_size=square'
  },
  {
    id: '3',
    name: '泰国6日游',
    description: '泰国6日游，包含曼谷、普吉岛等著名景点',
    price: 3999,
    duration: 6,
    destination: '泰国',
    category: '境外游',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=thailand%20beach%20travel%20package&image_size=square'
  },
  {
    id: '4',
    name: '日本7日游',
    description: '日本7日游，包含东京、大阪、京都等著名景点',
    price: 4999,
    duration: 7,
    destination: '日本',
    category: '境外游',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=japan%20tokyo%20travel%20package&image_size=square'
  },
  {
    id: '5',
    name: '云南6日游',
    description: '云南6日游，包含昆明、大理、丽江等著名景点',
    price: 2499,
    duration: 6,
    destination: '云南',
    category: '国内游',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yunnan%20lijiang%20travel%20package&image_size=square'
  },
  {
    id: '6',
    name: '巴厘岛5日游',
    description: '巴厘岛5日游，包含海滩、寺庙等著名景点',
    price: 3499,
    duration: 5,
    destination: '巴厘岛',
    category: '境外游',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=bali%20beach%20travel%20package&image_size=square'
  }
];

// 模拟订单数据
const orders = [];

// 获取旅游套餐列表
router.get('/packages', (req, res) => {
  const { category, destination, minPrice, maxPrice, rating } = req.query;
  let filteredPackages = travelPackages;

  // 按分类筛选
  if (category) {
    filteredPackages = filteredPackages.filter(pkg => pkg.category === category);
  }

  // 按目的地筛选
  if (destination) {
    filteredPackages = filteredPackages.filter(pkg => pkg.destination === destination);
  }

  // 按价格范围筛选
  if (minPrice) {
    filteredPackages = filteredPackages.filter(pkg => pkg.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredPackages = filteredPackages.filter(pkg => pkg.price <= parseInt(maxPrice));
  }

  // 按评分筛选
  if (rating) {
    filteredPackages = filteredPackages.filter(pkg => pkg.rating >= parseFloat(rating));
  }

  res.status(200).json({
    status: 'success',
    data: filteredPackages
  });
});

// 获取旅游套餐详情
router.get('/packages/:id', (req, res) => {
  const { id } = req.params;
  const pkg = travelPackages.find(pkg => pkg.id === id);

  if (!pkg) {
    return res.status(404).json({
      status: 'error',
      message: '套餐不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: pkg
  });
});

// 下单旅游套餐
router.post('/orders', (req, res) => {
  const { packageId, userId, startDate, travelers, notes } = req.body;

  // 验证参数
  if (!packageId || !userId || !startDate || !travelers) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 查找套餐
  const pkg = travelPackages.find(pkg => pkg.id === packageId);
  if (!pkg) {
    return res.status(404).json({
      status: 'error',
      message: '套餐不存在'
    });
  }

  // 创建订单
  const order = {
    id: `order_${Date.now()}`,
    packageId,
    packageName: pkg.name,
    userId,
    startDate,
    travelers,
    notes,
    price: pkg.price * travelers,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(order);

  res.status(201).json({
    status: 'success',
    data: order
  });
});

// 获取用户订单列表
router.get('/orders', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  const userOrders = orders.filter(order => order.userId === userId);

  res.status(200).json({
    status: 'success',
    data: userOrders
  });
});

// 获取订单详情
router.get('/orders/:id', (req, res) => {
  const { id } = req.params;
  const order = orders.find(order => order.id === id);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: order
  });
});

// 取消订单
router.put('/orders/:id/cancel', (req, res) => {
  const { id } = req.params;
  const order = orders.find(order => order.id === id);

  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在'
    });
  }

  if (order.status === 'completed' || order.status === 'cancelled') {
    return res.status(400).json({
      status: 'error',
      message: '订单状态不允许取消'
    });
  }

  order.status = 'cancelled';
  order.updatedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    data: order
  });
});

// 评价套餐
router.post('/orders/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({
      status: 'error',
      message: '缺少评价参数'
    });
  }

  const order = orders.find(order => order.id === id);
  if (!order) {
    return res.status(404).json({
      status: 'error',
      message: '订单不存在'
    });
  }

  if (order.status !== 'completed') {
    return res.status(400).json({
      status: 'error',
      message: '订单未完成，无法评价'
    });
  }

  order.rating = rating;
  order.comment = comment;
  order.updatedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    data: order
  });
});

module.exports = router;
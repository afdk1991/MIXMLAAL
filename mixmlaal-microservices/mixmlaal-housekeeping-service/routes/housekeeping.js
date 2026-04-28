// 家政服务路由

const express = require('express');
const router = express.Router();

// 模拟家政服务数据
const housekeepingServices = [
  {
    id: '1',
    name: '日常保洁',
    description: '专业的日常保洁服务，包括客厅、卧室、厨房、卫生间等全屋清洁',
    price: 80,
    duration: 120,
    category: '保洁',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20house%20cleaning%20service&image_size=square'
  },
  {
    id: '2',
    name: '深度保洁',
    description: '深度清洁服务，包括顽固污渍处理、家具内部清洁、厨房油污清除等',
    price: 150,
    duration: 240,
    category: '保洁',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20house%20cleaning%20service&image_size=square'
  },
  {
    id: '3',
    name: '开荒保洁',
    description: '新房入住前的全面清洁，包括墙面、地面、门窗、橱柜等的彻底清洁',
    price: 300,
    duration: 360,
    category: '保洁',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=new%20house%20cleaning%20service&image_size=square'
  },
  {
    id: '4',
    name: '家电清洗',
    description: '专业家电清洗服务，包括空调、洗衣机、冰箱、油烟机等',
    price: 100,
    duration: 90,
    category: '家电清洗',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=appliance%20cleaning%20service&image_size=square'
  },
  {
    id: '5',
    name: '保姆服务',
    description: '专业保姆服务，包括照顾老人、小孩，做饭、打扫卫生等',
    price: 200,
    duration: 480,
    category: '保姆',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20nanny%20service&image_size=square'
  },
  {
    id: '6',
    name: '月嫂服务',
    description: '专业月嫂服务，包括产妇护理、新生儿护理、月子餐制作等',
    price: 300,
    duration: 480,
    category: '月嫂',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20maternity%20care%20service&image_size=square'
  }
];

// 模拟订单数据
const orders = [];

// 获取家政服务列表
router.get('/services', (req, res) => {
  const { category, minPrice, maxPrice, rating } = req.query;
  let filteredServices = housekeepingServices;

  // 按分类筛选
  if (category) {
    filteredServices = filteredServices.filter(service => service.category === category);
  }

  // 按价格范围筛选
  if (minPrice) {
    filteredServices = filteredServices.filter(service => service.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredServices = filteredServices.filter(service => service.price <= parseInt(maxPrice));
  }

  // 按评分筛选
  if (rating) {
    filteredServices = filteredServices.filter(service => service.rating >= parseFloat(rating));
  }

  res.status(200).json({
    status: 'success',
    data: filteredServices
  });
});

// 获取家政服务详情
router.get('/services/:id', (req, res) => {
  const { id } = req.params;
  const service = housekeepingServices.find(service => service.id === id);

  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: '服务不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: service
  });
});

// 下单家政服务
router.post('/orders', (req, res) => {
  const { serviceId, userId, address, date, time, notes } = req.body;

  // 验证参数
  if (!serviceId || !userId || !address || !date || !time) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 查找服务
  const service = housekeepingServices.find(service => service.id === serviceId);
  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: '服务不存在'
    });
  }

  // 创建订单
  const order = {
    id: `order_${Date.now()}`,
    serviceId,
    serviceName: service.name,
    userId,
    address,
    date,
    time,
    notes,
    price: service.price,
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

// 评价服务
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
// 健康医疗服务路由

const express = require('express');
const router = express.Router();

// 模拟健康医疗数据
const healthServices = [
  {
    id: '1',
    name: '体检套餐',
    description: '全面的体检套餐，包括血常规、尿常规、肝功能、肾功能等',
    price: 599,
    duration: 120,
    category: '体检',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20checkup%20package&image_size=square'
  },
  {
    id: '2',
    name: '心理咨询',
    description: '专业心理咨询服务，帮助解决情绪问题和心理困扰',
    price: 399,
    duration: 60,
    category: '心理咨询',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=psychological%20counseling%20service&image_size=square'
  },
  {
    id: '3',
    name: '中医推拿',
    description: '传统中医推拿服务，缓解身体疲劳和疼痛',
    price: 199,
    duration: 60,
    category: '中医',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=traditional%20chinese%20massage&image_size=square'
  },
  {
    id: '4',
    name: '疫苗接种',
    description: '各类疫苗接种服务，包括流感疫苗、HPV疫苗等',
    price: 299,
    duration: 30,
    category: '疫苗',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=vaccination%20service&image_size=square'
  },
  {
    id: '5',
    name: '牙科服务',
    description: '专业牙科服务，包括洗牙、补牙、拔牙等',
    price: 299,
    duration: 60,
    category: '牙科',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=dental%20service&image_size=square'
  },
  {
    id: '6',
    name: '健康咨询',
    description: '专业健康咨询服务，提供健康生活建议和疾病预防指导',
    price: 199,
    duration: 30,
    category: '健康咨询',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20consultation%20service&image_size=square'
  }
];

// 模拟订单数据
const orders = [];

// 获取健康服务列表
router.get('/services', (req, res) => {
  const { category, minPrice, maxPrice, rating } = req.query;
  let filteredServices = healthServices;

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

// 获取健康服务详情
router.get('/services/:id', (req, res) => {
  const { id } = req.params;
  const service = healthServices.find(service => service.id === id);

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

// 预约健康服务
router.post('/appointments', (req, res) => {
  const { serviceId, userId, date, time, notes } = req.body;

  // 验证参数
  if (!serviceId || !userId || !date || !time) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 查找服务
  const service = healthServices.find(service => service.id === serviceId);
  if (!service) {
    return res.status(404).json({
      status: 'error',
      message: '服务不存在'
    });
  }

  // 创建预约
  const appointment = {
    id: `appointment_${Date.now()}`,
    serviceId,
    serviceName: service.name,
    userId,
    date,
    time,
    notes,
    price: service.price,
    status: 'pending',
    createdAt: new Date().toISOString()
  };

  orders.push(appointment);

  res.status(201).json({
    status: 'success',
    data: appointment
  });
});

// 获取用户预约列表
router.get('/appointments', (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  const userAppointments = orders.filter(appointment => appointment.userId === userId);

  res.status(200).json({
    status: 'success',
    data: userAppointments
  });
});

// 获取预约详情
router.get('/appointments/:id', (req, res) => {
  const { id } = req.params;
  const appointment = orders.find(appointment => appointment.id === id);

  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: '预约不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

// 取消预约
router.put('/appointments/:id/cancel', (req, res) => {
  const { id } = req.params;
  const appointment = orders.find(appointment => appointment.id === id);

  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: '预约不存在'
    });
  }

  if (appointment.status === 'completed' || appointment.status === 'cancelled') {
    return res.status(400).json({
      status: 'error',
      message: '预约状态不允许取消'
    });
  }

  appointment.status = 'cancelled';
  appointment.updatedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

// 评价服务
router.post('/appointments/:id/rate', (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  if (!rating || !comment) {
    return res.status(400).json({
      status: 'error',
      message: '缺少评价参数'
    });
  }

  const appointment = orders.find(appointment => appointment.id === id);
  if (!appointment) {
    return res.status(404).json({
      status: 'error',
      message: '预约不存在'
    });
  }

  if (appointment.status !== 'completed') {
    return res.status(400).json({
      status: 'error',
      message: '预约未完成，无法评价'
    });
  }

  appointment.rating = rating;
  appointment.comment = comment;
  appointment.updatedAt = new Date().toISOString();

  res.status(200).json({
    status: 'success',
    data: appointment
  });
});

module.exports = router;
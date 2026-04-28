// 教育培训服务路由

const express = require('express');
const router = express.Router();

// 模拟教育培训数据
const educationCourses = [
  {
    id: '1',
    title: '少儿编程入门',
    description: '适合7-12岁儿童的编程启蒙课程，通过趣味游戏学习编程基础',
    price: 999,
    duration: 12,
    category: '少儿教育',
    level: '入门',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20programming%20course&image_size=square'
  },
  {
    id: '2',
    title: '英语口语提升',
    description: '专业外教一对一授课，提升英语口语表达能力',
    price: 1999,
    duration: 24,
    category: '语言培训',
    level: '中级',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20speaking%20course&image_size=square'
  },
  {
    id: '3',
    title: '数学思维训练',
    description: '培养数学思维能力，提高解决问题的能力',
    price: 1299,
    duration: 16,
    category: '学科辅导',
    level: '中级',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=math%20thinking%20training%20course&image_size=square'
  },
  {
    id: '4',
    title: '艺术绘画课程',
    description: '专业美术老师授课，培养艺术创造力',
    price: 1599,
    duration: 16,
    category: '艺术教育',
    level: '入门',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=art%20painting%20course&image_size=square'
  },
  {
    id: '5',
    title: 'Python数据分析',
    description: '从基础到高级的Python数据分析课程，掌握数据处理和可视化技能',
    price: 2999,
    duration: 32,
    category: '职业技能',
    level: '高级',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=python%20data%20analysis%20course&image_size=square'
  },
  {
    id: '6',
    title: '瑜伽冥想课程',
    description: '专业瑜伽教练授课，提升身体柔韧性和心理健康',
    price: 1299,
    duration: 20,
    category: '健康生活',
    level: '入门',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20meditation%20course&image_size=square'
  }
];

// 模拟订单数据
const orders = [];

// 获取课程列表
router.get('/courses', (req, res) => {
  const { category, level, minPrice, maxPrice, rating } = req.query;
  let filteredCourses = educationCourses;

  // 按分类筛选
  if (category) {
    filteredCourses = filteredCourses.filter(course => course.category === category);
  }

  // 按级别筛选
  if (level) {
    filteredCourses = filteredCourses.filter(course => course.level === level);
  }

  // 按价格范围筛选
  if (minPrice) {
    filteredCourses = filteredCourses.filter(course => course.price >= parseInt(minPrice));
  }
  if (maxPrice) {
    filteredCourses = filteredCourses.filter(course => course.price <= parseInt(maxPrice));
  }

  // 按评分筛选
  if (rating) {
    filteredCourses = filteredCourses.filter(course => course.rating >= parseFloat(rating));
  }

  res.status(200).json({
    status: 'success',
    data: filteredCourses
  });
});

// 获取课程详情
router.get('/courses/:id', (req, res) => {
  const { id } = req.params;
  const course = educationCourses.find(course => course.id === id);

  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: '课程不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: course
  });
});

// 下单课程
router.post('/orders', (req, res) => {
  const { courseId, userId, paymentMethod, notes } = req.body;

  // 验证参数
  if (!courseId || !userId || !paymentMethod) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 查找课程
  const course = educationCourses.find(course => course.id === courseId);
  if (!course) {
    return res.status(404).json({
      status: 'error',
      message: '课程不存在'
    });
  }

  // 创建订单
  const order = {
    id: `order_${Date.now()}`,
    courseId,
    courseName: course.title,
    userId,
    paymentMethod,
    notes,
    price: course.price,
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

// 评价课程
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
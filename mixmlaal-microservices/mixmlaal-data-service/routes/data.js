// 数据服务路由

const express = require('express');
const router = express.Router();

// 模拟销售数据
const salesData = [
  {
    id: '1',
    date: '2023-12-01',
    amount: 10000,
    orders: 100,
    products: 50,
    category: 'electronics'
  },
  {
    id: '2',
    date: '2023-12-02',
    amount: 15000,
    orders: 150,
    products: 75,
    category: 'electronics'
  },
  {
    id: '3',
    date: '2023-12-03',
    amount: 12000,
    orders: 120,
    products: 60,
    category: 'electronics'
  },
  {
    id: '4',
    date: '2023-12-04',
    amount: 18000,
    orders: 180,
    products: 90,
    category: 'electronics'
  },
  {
    id: '5',
    date: '2023-12-05',
    amount: 20000,
    orders: 200,
    products: 100,
    category: 'electronics'
  },
  {
    id: '6',
    date: '2023-12-01',
    amount: 5000,
    orders: 50,
    products: 25,
    category: 'housekeeping'
  },
  {
    id: '7',
    date: '2023-12-02',
    amount: 7500,
    orders: 75,
    products: 37,
    category: 'housekeeping'
  },
  {
    id: '8',
    date: '2023-12-03',
    amount: 6000,
    orders: 60,
    products: 30,
    category: 'housekeeping'
  },
  {
    id: '9',
    date: '2023-12-04',
    amount: 9000,
    orders: 90,
    products: 45,
    category: 'housekeeping'
  },
  {
    id: '10',
    date: '2023-12-05',
    amount: 10000,
    orders: 100,
    products: 50,
    category: 'housekeeping'
  }
];

// 模拟用户数据
const userData = [
  {
    id: '1',
    userId: 'user1',
    name: '张三',
    email: 'zhangsan@example.com',
    phone: '13800138001',
    registrationDate: '2023-01-01',
    lastLoginDate: '2023-12-01',
    totalOrders: 10,
    totalSpent: 5000,
    membershipLevel: '银卡会员'
  },
  {
    id: '2',
    userId: 'user2',
    name: '李四',
    email: 'lisi@example.com',
    phone: '13900139002',
    registrationDate: '2023-02-01',
    lastLoginDate: '2023-12-02',
    totalOrders: 20,
    totalSpent: 10000,
    membershipLevel: '金卡会员'
  },
  {
    id: '3',
    userId: 'user3',
    name: '王五',
    email: 'wangwu@example.com',
    phone: '13700137003',
    registrationDate: '2023-03-01',
    lastLoginDate: '2023-12-03',
    totalOrders: 5,
    totalSpent: 2500,
    membershipLevel: '普通会员'
  }
];

// 模拟产品数据
const productData = [
  {
    id: '1',
    productId: '1',
    name: '智能手表',
    category: 'electronics',
    price: 1999,
    stock: 100,
    sales: 50,
    rating: 4.8,
    reviews: 25
  },
  {
    id: '2',
    productId: '2',
    name: '无线耳机',
    category: 'electronics',
    price: 899,
    stock: 200,
    sales: 100,
    rating: 4.7,
    reviews: 50
  },
  {
    id: '3',
    productId: '3',
    name: '健身手环',
    category: 'fitness',
    price: 399,
    stock: 150,
    sales: 75,
    rating: 4.6,
    reviews: 37
  },
  {
    id: '4',
    productId: '4',
    name: '智能音箱',
    category: 'electronics',
    price: 599,
    stock: 120,
    sales: 60,
    rating: 4.5,
    reviews: 30
  }
];

// 模拟AI分析结果
const aiAnalysis = {
  salesForecast: {
    nextWeek: 100000,
    nextMonth: 400000,
    nextQuarter: 1200000
  },
  customerSegments: [
    {
      name: '高频消费者',
      count: 1000,
      averageSpend: 5000,
      preferredCategories: ['electronics', 'housekeeping']
    },
    {
      name: '中频消费者',
      count: 5000,
      averageSpend: 2000,
      preferredCategories: ['electronics', 'education']
    },
    {
      name: '低频消费者',
      count: 10000,
      averageSpend: 500,
      preferredCategories: ['health', 'travel']
    }
  ],
  productRecommendations: [
    {
      productId: '1',
      score: 0.95,
      reason: '基于用户购买历史和浏览行为'
    },
    {
      productId: '2',
      score: 0.85,
      reason: '基于用户购买历史和浏览行为'
    },
    {
      productId: '3',
      score: 0.75,
      reason: '基于用户购买历史和浏览行为'
    }
  ]
};

// 获取销售数据
router.get('/sales', (req, res) => {
  const { startDate, endDate, category } = req.query;
  let filteredData = salesData;

  if (startDate) {
    filteredData = filteredData.filter(item => item.date >= startDate);
  }

  if (endDate) {
    filteredData = filteredData.filter(item => item.date <= endDate);
  }

  if (category) {
    filteredData = filteredData.filter(item => item.category === category);
  }

  res.status(200).json({
    status: 'success',
    data: filteredData
  });
});

// 获取销售统计
router.get('/sales/stats', (req, res) => {
  const { startDate, endDate } = req.query;
  let filteredData = salesData;

  if (startDate) {
    filteredData = filteredData.filter(item => item.date >= startDate);
  }

  if (endDate) {
    filteredData = filteredData.filter(item => item.date <= endDate);
  }

  const stats = {
    totalSales: filteredData.reduce((sum, item) => sum + item.amount, 0),
    totalOrders: filteredData.reduce((sum, item) => sum + item.orders, 0),
    totalProducts: filteredData.reduce((sum, item) => sum + item.products, 0),
    averageOrderValue: filteredData.length > 0 ? 
      filteredData.reduce((sum, item) => sum + item.amount, 0) / filteredData.reduce((sum, item) => sum + item.orders, 0) : 0
  };

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// 获取用户数据
router.get('/users', (req, res) => {
  const { membershipLevel, startDate, endDate } = req.query;
  let filteredData = userData;

  if (membershipLevel) {
    filteredData = filteredData.filter(item => item.membershipLevel === membershipLevel);
  }

  if (startDate) {
    filteredData = filteredData.filter(item => item.registrationDate >= startDate);
  }

  if (endDate) {
    filteredData = filteredData.filter(item => item.registrationDate <= endDate);
  }

  res.status(200).json({
    status: 'success',
    data: filteredData
  });
});

// 获取用户统计
router.get('/users/stats', (req, res) => {
  const stats = {
    totalUsers: userData.length,
    averageOrders: userData.reduce((sum, item) => sum + item.totalOrders, 0) / userData.length,
    averageSpent: userData.reduce((sum, item) => sum + item.totalSpent, 0) / userData.length,
    membershipDistribution: {
      '普通会员': userData.filter(item => item.membershipLevel === '普通会员').length,
      '银卡会员': userData.filter(item => item.membershipLevel === '银卡会员').length,
      '金卡会员': userData.filter(item => item.membershipLevel === '金卡会员').length,
      '钻石会员': userData.filter(item => item.membershipLevel === '钻石会员').length
    }
  };

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// 获取产品数据
router.get('/products', (req, res) => {
  const { category, minPrice, maxPrice, minRating } = req.query;
  let filteredData = productData;

  if (category) {
    filteredData = filteredData.filter(item => item.category === category);
  }

  if (minPrice) {
    filteredData = filteredData.filter(item => item.price >= parseInt(minPrice));
  }

  if (maxPrice) {
    filteredData = filteredData.filter(item => item.price <= parseInt(maxPrice));
  }

  if (minRating) {
    filteredData = filteredData.filter(item => item.rating >= parseFloat(minRating));
  }

  res.status(200).json({
    status: 'success',
    data: filteredData
  });
});

// 获取产品统计
router.get('/products/stats', (req, res) => {
  const stats = {
    totalProducts: productData.length,
    totalStock: productData.reduce((sum, item) => sum + item.stock, 0),
    totalSales: productData.reduce((sum, item) => sum + item.sales, 0),
    averagePrice: productData.reduce((sum, item) => sum + item.price, 0) / productData.length,
    averageRating: productData.reduce((sum, item) => sum + item.rating, 0) / productData.length
  };

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

// 获取AI分析结果
router.get('/ai/analysis', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: aiAnalysis
  });
});

// 获取销售预测
router.get('/ai/forecast', (req, res) => {
  const { period } = req.query;
  let forecast = aiAnalysis.salesForecast;

  if (period && forecast[period]) {
    forecast = { [period]: forecast[period] };
  }

  res.status(200).json({
    status: 'success',
    data: forecast
  });
});

// 获取客户细分
router.get('/ai/customer-segments', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: aiAnalysis.customerSegments
  });
});

// 获取产品推荐
router.get('/ai/product-recommendations', (req, res) => {
  const { userId } = req.query;
  // 这里可以根据用户ID生成个性化推荐
  res.status(200).json({
    status: 'success',
    data: aiAnalysis.productRecommendations
  });
});

// 执行自定义数据分析
router.post('/analysis/custom', (req, res) => {
  const { query, parameters } = req.body;

  if (!query) {
    return res.status(400).json({
      status: 'error',
      message: '缺少查询参数'
    });
  }

  // 模拟执行自定义查询
  const result = {
    query,
    parameters,
    data: [
      { name: '产品A', value: 1000 },
      { name: '产品B', value: 2000 },
      { name: '产品C', value: 1500 }
    ],
    summary: '查询执行成功'
  };

  res.status(200).json({
    status: 'success',
    data: result
  });
});

module.exports = router;
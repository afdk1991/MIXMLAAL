// 推荐服务路由

const express = require('express');
const router = express.Router();

// 模拟产品数据
const products = [
  {
    id: '1',
    name: '智能手表',
    price: 1999,
    category: 'electronics',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20watch&image_size=square'
  },
  {
    id: '2',
    name: '无线耳机',
    price: 899,
    category: 'electronics',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=wireless%20earphones&image_size=square'
  },
  {
    id: '3',
    name: '健身手环',
    price: 399,
    category: 'fitness',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=fitness%20band&image_size=square'
  },
  {
    id: '4',
    name: '智能音箱',
    price: 599,
    category: 'electronics',
    rating: 4.5,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=smart%20speaker&image_size=square'
  },
  {
    id: '5',
    name: '运动鞋',
    price: 699,
    category: 'sports',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sports%20shoes&image_size=square'
  },
  {
    id: '6',
    name: '瑜伽垫',
    price: 199,
    category: 'fitness',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=yoga%20mat&image_size=square'
  },
  {
    id: '7',
    name: '咖啡机',
    price: 1299,
    category: 'home',
    rating: 4.6,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=coffee%20machine&image_size=square'
  },
  {
    id: '8',
    name: '空气净化器',
    price: 1999,
    category: 'home',
    rating: 4.7,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=air%20purifier&image_size=square'
  }
];

// 模拟用户行为数据
const userBehavior = {
  'user1': {
    preferences: ['electronics', 'fitness'],
    viewed: ['1', '2', '3', '4'],
    purchased: ['1', '3'],
    rated: [
      { productId: '1', rating: 5 },
      { productId: '3', rating: 4 }
    ]
  },
  'user2': {
    preferences: ['sports', 'home'],
    viewed: ['5', '6', '7', '8'],
    purchased: ['5', '7'],
    rated: [
      { productId: '5', rating: 5 },
      { productId: '7', rating: 4 }
    ]
  }
};

// 模拟家政服务数据
const housekeepingServices = [
  {
    id: '1',
    name: '日常保洁',
    price: 80,
    category: '保洁',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20house%20cleaning%20service&image_size=square'
  },
  {
    id: '2',
    name: '深度保洁',
    price: 150,
    category: '保洁',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=deep%20house%20cleaning%20service&image_size=square'
  }
];

// 模拟教育培训数据
const educationCourses = [
  {
    id: '1',
    title: '少儿编程入门',
    price: 999,
    category: '少儿教育',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=children%20programming%20course&image_size=square'
  },
  {
    id: '2',
    title: '英语口语提升',
    price: 1999,
    category: '语言培训',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=english%20speaking%20course&image_size=square'
  }
];

// 模拟健康医疗数据
const healthServices = [
  {
    id: '1',
    name: '体检套餐',
    price: 599,
    category: '体检',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=health%20checkup%20package&image_size=square'
  },
  {
    id: '2',
    name: '心理咨询',
    price: 399,
    category: '心理咨询',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=psychological%20counseling%20service&image_size=square'
  }
];

// 模拟旅游服务数据
const travelPackages = [
  {
    id: '1',
    name: '三亚5日游',
    price: 2999,
    category: '国内游',
    rating: 4.8,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=sanya%20beach%20travel%20package&image_size=square'
  },
  {
    id: '2',
    name: '北京4日游',
    price: 1999,
    category: '国内游',
    rating: 4.9,
    image: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=beijing%20forbidden%20city%20travel&image_size=square'
  }
];

// 获取个性化推荐
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const { type, limit = 10 } = req.query;

  // 获取用户行为数据
  const behavior = userBehavior[userId] || {
    preferences: [],
    viewed: [],
    purchased: [],
    rated: []
  };

  let recommendations = [];

  // 根据类型获取不同的推荐
  switch (type) {
    case 'products':
      recommendations = getProductRecommendations(behavior, parseInt(limit));
      break;
    case 'housekeeping':
      recommendations = getHousekeepingRecommendations(behavior, parseInt(limit));
      break;
    case 'education':
      recommendations = getEducationRecommendations(behavior, parseInt(limit));
      break;
    case 'health':
      recommendations = getHealthRecommendations(behavior, parseInt(limit));
      break;
    case 'travel':
      recommendations = getTravelRecommendations(behavior, parseInt(limit));
      break;
    default:
      // 混合推荐
      const productRecs = getProductRecommendations(behavior, 3);
      const housekeepingRecs = getHousekeepingRecommendations(behavior, 2);
      const educationRecs = getEducationRecommendations(behavior, 2);
      const healthRecs = getHealthRecommendations(behavior, 2);
      const travelRecs = getTravelRecommendations(behavior, 1);
      recommendations = [...productRecs, ...housekeepingRecs, ...educationRecs, ...healthRecs, ...travelRecs].slice(0, parseInt(limit));
  }

  res.status(200).json({
    status: 'success',
    data: recommendations
  });
});

// 获取产品推荐
function getProductRecommendations(behavior, limit) {
  // 基于用户偏好和历史行为推荐
  const recommended = products
    .filter(product => {
      // 排除已购买的产品
      return !behavior.purchased.includes(product.id);
    })
    .sort((a, b) => {
      // 基于用户偏好的评分
      let scoreA = 0;
      let scoreB = 0;

      // 偏好匹配加分
      if (behavior.preferences.includes(a.category)) scoreA += 2;
      if (behavior.preferences.includes(b.category)) scoreB += 2;

      // 评分加分
      scoreA += a.rating;
      scoreB += b.rating;

      // 浏览历史加分
      if (behavior.viewed.includes(a.id)) scoreA += 1;
      if (behavior.viewed.includes(b.id)) scoreB += 1;

      return scoreB - scoreA;
    })
    .slice(0, limit);

  return recommended;
}

// 获取家政服务推荐
function getHousekeepingRecommendations(behavior, limit) {
  // 简单基于评分推荐
  const recommended = housekeepingServices
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return recommended;
}

// 获取教育培训推荐
function getEducationRecommendations(behavior, limit) {
  // 简单基于评分推荐
  const recommended = educationCourses
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return recommended;
}

// 获取健康医疗推荐
function getHealthRecommendations(behavior, limit) {
  // 简单基于评分推荐
  const recommended = healthServices
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return recommended;
}

// 获取旅游服务推荐
function getTravelRecommendations(behavior, limit) {
  // 简单基于评分推荐
  const recommended = travelPackages
    .sort((a, b) => b.rating - a.rating)
    .slice(0, limit);

  return recommended;
}

// 获取热门推荐
router.get('/popular', (req, res) => {
  const { type, limit = 10 } = req.query;

  let popularItems = [];

  switch (type) {
    case 'products':
      popularItems = products
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));
      break;
    case 'housekeeping':
      popularItems = housekeepingServices
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));
      break;
    case 'education':
      popularItems = educationCourses
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));
      break;
    case 'health':
      popularItems = healthServices
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));
      break;
    case 'travel':
      popularItems = travelPackages
        .sort((a, b) => b.rating - a.rating)
        .slice(0, parseInt(limit));
      break;
    default:
      // 混合热门推荐
      const popularProducts = products.sort((a, b) => b.rating - a.rating).slice(0, 3);
      const popularHousekeeping = housekeepingServices.sort((a, b) => b.rating - a.rating).slice(0, 2);
      const popularEducation = educationCourses.sort((a, b) => b.rating - a.rating).slice(0, 2);
      const popularHealth = healthServices.sort((a, b) => b.rating - a.rating).slice(0, 2);
      const popularTravel = travelPackages.sort((a, b) => b.rating - a.rating).slice(0, 1);
      popularItems = [...popularProducts, ...popularHousekeeping, ...popularEducation, ...popularHealth, ...popularTravel].slice(0, parseInt(limit));
  }

  res.status(200).json({
    status: 'success',
    data: popularItems
  });
});

// 获取相关推荐
router.get('/related/:itemId', (req, res) => {
  const { itemId } = req.params;
  const { type, limit = 5 } = req.query;

  let relatedItems = [];

  switch (type) {
    case 'products':
      const product = products.find(p => p.id === itemId);
      if (product) {
        relatedItems = products
          .filter(p => p.id !== itemId && p.category === product.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, parseInt(limit));
      }
      break;
    case 'housekeeping':
      const housekeeping = housekeepingServices.find(h => h.id === itemId);
      if (housekeeping) {
        relatedItems = housekeepingServices
          .filter(h => h.id !== itemId && h.category === housekeeping.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, parseInt(limit));
      }
      break;
    case 'education':
      const education = educationCourses.find(e => e.id === itemId);
      if (education) {
        relatedItems = educationCourses
          .filter(e => e.id !== itemId && e.category === education.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, parseInt(limit));
      }
      break;
    case 'health':
      const health = healthServices.find(h => h.id === itemId);
      if (health) {
        relatedItems = healthServices
          .filter(h => h.id !== itemId && h.category === health.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, parseInt(limit));
      }
      break;
    case 'travel':
      const travel = travelPackages.find(t => t.id === itemId);
      if (travel) {
        relatedItems = travelPackages
          .filter(t => t.id !== itemId && t.category === travel.category)
          .sort((a, b) => b.rating - a.rating)
          .slice(0, parseInt(limit));
      }
      break;
  }

  res.status(200).json({
    status: 'success',
    data: relatedItems
  });
});

// 记录用户行为
router.post('/user/:userId/behavior', (req, res) => {
  const { userId } = req.params;
  const { type, itemId, rating } = req.body;

  if (!type || !itemId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 确保用户行为数据存在
  if (!userBehavior[userId]) {
    userBehavior[userId] = {
      preferences: [],
      viewed: [],
      purchased: [],
      rated: []
    };
  }

  // 记录不同类型的行为
  switch (type) {
    case 'view':
      if (!userBehavior[userId].viewed.includes(itemId)) {
        userBehavior[userId].viewed.push(itemId);
      }
      break;
    case 'purchase':
      if (!userBehavior[userId].purchased.includes(itemId)) {
        userBehavior[userId].purchased.push(itemId);
      }
      break;
    case 'rate':
      if (rating) {
        const existingRating = userBehavior[userId].rated.find(r => r.productId === itemId);
        if (existingRating) {
          existingRating.rating = rating;
        } else {
          userBehavior[userId].rated.push({ productId: itemId, rating });
        }
      }
      break;
    case 'preference':
      if (!userBehavior[userId].preferences.includes(itemId)) {
        userBehavior[userId].preferences.push(itemId);
      }
      break;
  }

  res.status(201).json({
    status: 'success',
    data: userBehavior[userId]
  });
});

module.exports = router;
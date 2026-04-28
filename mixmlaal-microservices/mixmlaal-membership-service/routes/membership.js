// 会员服务路由

const express = require('express');
const router = express.Router();

// 模拟会员等级数据
const membershipLevels = [
  {
    id: '1',
    name: '普通会员',
    minPoints: 0,
    maxPoints: 999,
    benefits: [
      '基础购物体验',
      '积分累计',
      '生日礼包'
    ],
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=basic%20member%20badge&image_size=square'
  },
  {
    id: '2',
    name: '银卡会员',
    minPoints: 1000,
    maxPoints: 4999,
    benefits: [
      '9.5折优惠',
      '优先客服',
      '每月会员日活动',
      '生日礼包升级'
    ],
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=silver%20member%20badge&image_size=square'
  },
  {
    id: '3',
    name: '金卡会员',
    minPoints: 5000,
    maxPoints: 9999,
    benefits: [
      '9折优惠',
      '专属客服',
      '每月会员日活动',
      '生日礼包升级',
      '免费配送'
    ],
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=gold%20member%20badge&image_size=square'
  },
  {
    id: '4',
    name: '钻石会员',
    minPoints: 10000,
    maxPoints: Infinity,
    benefits: [
      '8.5折优惠',
      '专属客服',
      '每月会员日活动',
      '豪华生日礼包',
      '免费配送',
      '专属活动邀请'
    ],
    icon: 'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=diamond%20member%20badge&image_size=square'
  }
];

// 模拟用户会员数据
const userMembership = {
  'user1': {
    userId: 'user1',
    levelId: '2',
    points: 1500,
    totalPoints: 2500,
    joinDate: '2023-01-01',
    lastUpdate: '2023-12-01'
  },
  'user2': {
    userId: 'user2',
    levelId: '3',
    points: 5500,
    totalPoints: 6500,
    joinDate: '2022-06-01',
    lastUpdate: '2023-12-01'
  }
};

// 模拟积分记录
const pointsRecords = {
  'user1': [
    {
      id: '1',
      type: 'purchase',
      points: 100,
      description: '购买商品',
      createdAt: '2023-12-01'
    },
    {
      id: '2',
      type: 'signin',
      points: 10,
      description: '每日签到',
      createdAt: '2023-12-02'
    }
  ],
  'user2': [
    {
      id: '3',
      type: 'purchase',
      points: 500,
      description: '购买商品',
      createdAt: '2023-12-01'
    },
    {
      id: '4',
      type: 'referral',
      points: 200,
      description: '推荐好友',
      createdAt: '2023-12-02'
    }
  ]
};

// 模拟会员专属服务
const exclusiveServices = [
  {
    id: '1',
    name: '专属客服',
    description: '提供一对一的专属客服服务',
    requiredLevel: '2'
  },
  {
    id: '2',
    name: '免费配送',
    description: '享受免费配送服务',
    requiredLevel: '3'
  },
  {
    id: '3',
    name: '专属活动',
    description: '邀请参加专属会员活动',
    requiredLevel: '4'
  },
  {
    id: '4',
    name: '生日礼包',
    description: '生日当月领取专属礼包',
    requiredLevel: '1'
  }
];

// 获取会员等级列表
router.get('/levels', (req, res) => {
  res.status(200).json({
    status: 'success',
    data: membershipLevels
  });
});

// 获取会员等级详情
router.get('/levels/:id', (req, res) => {
  const { id } = req.params;
  const level = membershipLevels.find(level => level.id === id);

  if (!level) {
    return res.status(404).json({
      status: 'error',
      message: '会员等级不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: level
  });
});

// 获取用户会员信息
router.get('/user/:userId', (req, res) => {
  const { userId } = req.params;
  const membership = userMembership[userId];

  if (!membership) {
    // 如果用户不存在，创建默认会员信息
    const defaultMembership = {
      userId,
      levelId: '1',
      points: 0,
      totalPoints: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    userMembership[userId] = defaultMembership;
    pointsRecords[userId] = [];

    return res.status(200).json({
      status: 'success',
      data: defaultMembership
    });
  }

  // 获取会员等级详情
  const level = membershipLevels.find(level => level.id === membership.levelId);
  membership.level = level;

  res.status(200).json({
    status: 'success',
    data: membership
  });
});

// 获取用户积分记录
router.get('/user/:userId/points', (req, res) => {
  const { userId } = req.params;
  const records = pointsRecords[userId] || [];

  res.status(200).json({
    status: 'success',
    data: records
  });
});

// 添加积分
router.post('/user/:userId/points', (req, res) => {
  const { userId } = req.params;
  const { type, points, description } = req.body;

  if (!type || !points || !description) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 确保用户存在
  if (!userMembership[userId]) {
    userMembership[userId] = {
      userId,
      levelId: '1',
      points: 0,
      totalPoints: 0,
      joinDate: new Date().toISOString().split('T')[0],
      lastUpdate: new Date().toISOString().split('T')[0]
    };
    pointsRecords[userId] = [];
  }

  // 添加积分记录
  const record = {
    id: `record_${Date.now()}`,
    type,
    points,
    description,
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (!pointsRecords[userId]) {
    pointsRecords[userId] = [];
  }
  pointsRecords[userId].push(record);

  // 更新用户积分
  userMembership[userId].points += points;
  userMembership[userId].totalPoints += points;
  userMembership[userId].lastUpdate = new Date().toISOString().split('T')[0];

  // 更新会员等级
  const newLevel = membershipLevels.find(level => 
    userMembership[userId].points >= level.minPoints && 
    userMembership[userId].points <= level.maxPoints
  );

  if (newLevel) {
    userMembership[userId].levelId = newLevel.id;
  }

  res.status(201).json({
    status: 'success',
    data: {
      record,
      membership: userMembership[userId]
    }
  });
});

// 使用积分
router.post('/user/:userId/points/use', (req, res) => {
  const { userId } = req.params;
  const { points, description } = req.body;

  if (!points || !description) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 确保用户存在
  if (!userMembership[userId]) {
    return res.status(404).json({
      status: 'error',
      message: '用户不存在'
    });
  }

  // 检查积分是否足够
  if (userMembership[userId].points < points) {
    return res.status(400).json({
      status: 'error',
      message: '积分不足'
    });
  }

  // 添加积分记录
  const record = {
    id: `record_${Date.now()}`,
    type: 'use',
    points: -points,
    description,
    createdAt: new Date().toISOString().split('T')[0]
  };

  if (!pointsRecords[userId]) {
    pointsRecords[userId] = [];
  }
  pointsRecords[userId].push(record);

  // 更新用户积分
  userMembership[userId].points -= points;
  userMembership[userId].lastUpdate = new Date().toISOString().split('T')[0];

  // 更新会员等级
  const newLevel = membershipLevels.find(level => 
    userMembership[userId].points >= level.minPoints && 
    userMembership[userId].points <= level.maxPoints
  );

  if (newLevel) {
    userMembership[userId].levelId = newLevel.id;
  }

  res.status(201).json({
    status: 'success',
    data: {
      record,
      membership: userMembership[userId]
    }
  });
});

// 获取会员专属服务
router.get('/exclusive-services', (req, res) => {
  const { userId } = req.query;

  if (userId) {
    // 获取用户会员信息
    const membership = userMembership[userId];
    if (membership) {
      // 筛选用户可用的专属服务
      const availableServices = exclusiveServices.filter(service => 
        parseInt(service.requiredLevel) <= parseInt(membership.levelId)
      );
      return res.status(200).json({
        status: 'success',
        data: availableServices
      });
    }
  }

  // 返回所有专属服务
  res.status(200).json({
    status: 'success',
    data: exclusiveServices
  });
});

module.exports = router;
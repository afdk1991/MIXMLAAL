// 营销服务路由

const express = require('express');
const router = express.Router();

// 模拟优惠券数据
const coupons = [
  {
    id: '1',
    name: '新人立减券',
    type: 'fixed',
    value: 50,
    minSpend: 200,
    maxDiscount: 50,
    usageLimit: 1000,
    usedCount: 0,
    startDate: '2023-12-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableTo: 'all',
    code: 'NEW50'
  },
  {
    id: '2',
    name: '全场8折券',
    type: 'percentage',
    value: 20,
    minSpend: 100,
    maxDiscount: 200,
    usageLimit: 500,
    usedCount: 0,
    startDate: '2023-12-01',
    endDate: '2024-01-31',
    status: 'active',
    applicableTo: 'all',
    code: 'DISCOUNT20'
  },
  {
    id: '3',
    name: '家政服务满减券',
    type: 'fixed',
    value: 100,
    minSpend: 500,
    maxDiscount: 100,
    usageLimit: 200,
    usedCount: 0,
    startDate: '2023-12-01',
    endDate: '2024-03-31',
    status: 'active',
    applicableTo: 'housekeeping',
    code: 'HOUSE100'
  },
  {
    id: '4',
    name: '教育培训优惠券',
    type: 'percentage',
    value: 15,
    minSpend: 1000,
    maxDiscount: 500,
    usageLimit: 100,
    usedCount: 0,
    startDate: '2023-12-01',
    endDate: '2024-06-30',
    status: 'active',
    applicableTo: 'education',
    code: 'EDU15'
  }
];

// 模拟促销活动数据
const promotions = [
  {
    id: '1',
    name: '双12大促',
    description: '全场商品5折起，限时抢购',
    startDate: '2023-12-01',
    endDate: '2023-12-12',
    status: 'active',
    discountType: 'percentage',
    discountValue: 50,
    minSpend: 0,
    applicableProducts: 'all'
  },
  {
    id: '2',
    name: '新年特惠',
    description: '新年期间，所有服务享受8折优惠',
    startDate: '2024-01-01',
    endDate: '2024-01-07',
    status: 'upcoming',
    discountType: 'percentage',
    discountValue: 20,
    minSpend: 0,
    applicableProducts: 'all'
  },
  {
    id: '3',
    name: '家政服务节',
    description: '家政服务全场7折，再送100元优惠券',
    startDate: '2024-03-01',
    endDate: '2024-03-31',
    status: 'upcoming',
    discountType: 'percentage',
    discountValue: 30,
    minSpend: 0,
    applicableProducts: 'housekeeping'
  }
];

// 模拟会员营销数据
const memberMarketing = [
  {
    id: '1',
    name: '会员专享折扣',
    description: '银卡会员享受9.5折，金卡会员享受9折，钻石会员享受8.5折',
    startDate: '2023-12-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableLevels: ['2', '3', '4']
  },
  {
    id: '2',
    name: '会员生日礼包',
    description: '会员生日当月可领取专属生日礼包',
    startDate: '2023-12-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableLevels: ['1', '2', '3', '4']
  },
  {
    id: '3',
    name: '会员专属活动',
    description: '定期举办会员专属活动，享受独家优惠',
    startDate: '2023-12-01',
    endDate: '2024-12-31',
    status: 'active',
    applicableLevels: ['3', '4']
  }
];

// 模拟用户优惠券数据
const userCoupons = {
  'user1': [
    {
      id: 'uc1',
      couponId: '1',
      userId: 'user1',
      status: 'unused',
      acquiredAt: '2023-12-01',
      expiresAt: '2024-12-31'
    },
    {
      id: 'uc2',
      couponId: '2',
      userId: 'user1',
      status: 'unused',
      acquiredAt: '2023-12-01',
      expiresAt: '2024-01-31'
    }
  ],
  'user2': [
    {
      id: 'uc3',
      couponId: '3',
      userId: 'user2',
      status: 'unused',
      acquiredAt: '2023-12-01',
      expiresAt: '2024-03-31'
    }
  ]
};

// 获取优惠券列表
router.get('/coupons', (req, res) => {
  const { type, status, applicableTo } = req.query;
  let filteredCoupons = coupons;

  // 按类型筛选
  if (type) {
    filteredCoupons = filteredCoupons.filter(coupon => coupon.type === type);
  }

  // 按状态筛选
  if (status) {
    filteredCoupons = filteredCoupons.filter(coupon => coupon.status === status);
  }

  // 按适用范围筛选
  if (applicableTo) {
    filteredCoupons = filteredCoupons.filter(coupon => 
      coupon.applicableTo === 'all' || coupon.applicableTo === applicableTo
    );
  }

  res.status(200).json({
    status: 'success',
    data: filteredCoupons
  });
});

// 获取优惠券详情
router.get('/coupons/:id', (req, res) => {
  const { id } = req.params;
  const coupon = coupons.find(coupon => coupon.id === id);

  if (!coupon) {
    return res.status(404).json({
      status: 'error',
      message: '优惠券不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: coupon
  });
});

// 领取优惠券
router.post('/coupons/:id/claim', (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      status: 'error',
      message: '缺少用户ID'
    });
  }

  // 查找优惠券
  const coupon = coupons.find(coupon => coupon.id === id);
  if (!coupon) {
    return res.status(404).json({
      status: 'error',
      message: '优惠券不存在'
    });
  }

  // 检查优惠券状态
  if (coupon.status !== 'active') {
    return res.status(400).json({
      status: 'error',
      message: '优惠券已过期或已失效'
    });
  }

  // 检查使用次数
  if (coupon.usedCount >= coupon.usageLimit) {
    return res.status(400).json({
      status: 'error',
      message: '优惠券已领完'
    });
  }

  // 确保用户优惠券列表存在
  if (!userCoupons[userId]) {
    userCoupons[userId] = [];
  }

  // 检查用户是否已领取
  const existingCoupon = userCoupons[userId].find(uc => uc.couponId === id && uc.status === 'unused');
  if (existingCoupon) {
    return res.status(400).json({
      status: 'error',
      message: '您已领取过该优惠券'
    });
  }

  // 创建用户优惠券
  const userCoupon = {
    id: `uc${Date.now()}`,
    couponId: id,
    userId,
    status: 'unused',
    acquiredAt: new Date().toISOString().split('T')[0],
    expiresAt: coupon.endDate
  };

  userCoupons[userId].push(userCoupon);

  // 更新优惠券使用次数
  coupon.usedCount++;
  if (coupon.usedCount >= coupon.usageLimit) {
    coupon.status = 'expired';
  }

  res.status(201).json({
    status: 'success',
    data: userCoupon
  });
});

// 获取用户优惠券列表
router.get('/user/:userId/coupons', (req, res) => {
  const { userId } = req.params;
  const { status } = req.query;
  const userCouponList = userCoupons[userId] || [];

  let filteredCoupons = userCouponList;
  if (status) {
    filteredCoupons = filteredCoupons.filter(coupon => coupon.status === status);
  }

  // 关联优惠券详情
  const couponsWithDetails = filteredCoupons.map(userCoupon => {
    const couponDetails = coupons.find(coupon => coupon.id === userCoupon.couponId);
    return {
      ...userCoupon,
      coupon: couponDetails
    };
  });

  res.status(200).json({
    status: 'success',
    data: couponsWithDetails
  });
});

// 使用优惠券
router.post('/user/:userId/coupons/:id/use', (req, res) => {
  const { userId, id } = req.params;
  const { orderId, amount } = req.body;

  if (!orderId || !amount) {
    return res.status(400).json({
      status: 'error',
      message: '缺少必要参数'
    });
  }

  // 查找用户优惠券
  const userCouponList = userCoupons[userId] || [];
  const userCoupon = userCouponList.find(uc => uc.id === id);

  if (!userCoupon) {
    return res.status(404).json({
      status: 'error',
      message: '优惠券不存在'
    });
  }

  if (userCoupon.status !== 'unused') {
    return res.status(400).json({
      status: 'error',
      message: '优惠券已使用或已过期'
    });
  }

  // 查找优惠券详情
  const coupon = coupons.find(c => c.id === userCoupon.couponId);
  if (!coupon) {
    return res.status(404).json({
      status: 'error',
      message: '优惠券不存在'
    });
  }

  // 检查优惠券是否过期
  const today = new Date().toISOString().split('T')[0];
  if (today > coupon.endDate) {
    userCoupon.status = 'expired';
    return res.status(400).json({
      status: 'error',
      message: '优惠券已过期'
    });
  }

  // 检查最低消费
  if (amount < coupon.minSpend) {
    return res.status(400).json({
      status: 'error',
      message: `消费金额未达到最低要求${coupon.minSpend}元`
    });
  }

  // 计算折扣金额
  let discountAmount = 0;
  if (coupon.type === 'fixed') {
    discountAmount = coupon.value;
  } else if (coupon.type === 'percentage') {
    discountAmount = (amount * coupon.value) / 100;
  }

  // 检查最大折扣
  if (discountAmount > coupon.maxDiscount) {
    discountAmount = coupon.maxDiscount;
  }

  // 更新优惠券状态
  userCoupon.status = 'used';
  userCoupon.usedAt = today;
  userCoupon.orderId = orderId;

  res.status(200).json({
    status: 'success',
    data: {
      userCoupon,
      discountAmount
    }
  });
});

// 获取促销活动列表
router.get('/promotions', (req, res) => {
  const { status, applicableProducts } = req.query;
  let filteredPromotions = promotions;

  // 按状态筛选
  if (status) {
    filteredPromotions = filteredPromotions.filter(promo => promo.status === status);
  }

  // 按适用产品筛选
  if (applicableProducts) {
    filteredPromotions = filteredPromotions.filter(promo => 
      promo.applicableProducts === 'all' || promo.applicableProducts === applicableProducts
    );
  }

  res.status(200).json({
    status: 'success',
    data: filteredPromotions
  });
});

// 获取促销活动详情
router.get('/promotions/:id', (req, res) => {
  const { id } = req.params;
  const promotion = promotions.find(promo => promo.id === id);

  if (!promotion) {
    return res.status(404).json({
      status: 'error',
      message: '促销活动不存在'
    });
  }

  res.status(200).json({
    status: 'success',
    data: promotion
  });
});

// 获取会员营销活动列表
router.get('/member-marketing', (req, res) => {
  const { status, level } = req.query;
  let filteredMarketing = memberMarketing;

  // 按状态筛选
  if (status) {
    filteredMarketing = filteredMarketing.filter(marketing => marketing.status === status);
  }

  // 按会员等级筛选
  if (level) {
    filteredMarketing = filteredMarketing.filter(marketing => 
      marketing.applicableLevels.includes(level)
    );
  }

  res.status(200).json({
    status: 'success',
    data: filteredMarketing
  });
});

module.exports = router;
/**
 * 输入验证中间件
 * 版本: v1.0.0.0
 * 说明: 提供请求数据的验证功能
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * 验证结果处理
 */
function validateResults(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: '验证失败',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }
  next();
}

/**
 * 认证相关验证
 */
const authValidations = {
  // 登录验证
  login: [
    body('phone')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的手机号'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为6位'),
    validateResults
  ],
  
  // 注册验证
  register: [
    body('phone')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的手机号'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('密码长度至少为6位'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    validateResults
  ],
  
  // 验证码验证
  verifyCode: [
    body('phone')
      .isMobilePhone('zh-CN')
      .withMessage('请输入有效的手机号'),
    body('code')
      .isLength({ min: 6, max: 6 })
      .withMessage('验证码长度为6位'),
    validateResults
  ]
};

/**
 * 订单相关验证
 */
const orderValidations = {
  // 创建订单验证
  create: [
    body('type')
      .isIn(['food', 'ride', 'errand', 'mall'])
      .withMessage('订单类型无效'),
    body('amount')
      .isDecimal({ min: 0.01 })
      .withMessage('订单金额必须大于0'),
    body('items')
      .optional()
      .isArray()
      .withMessage('商品列表必须是数组'),
    validateResults
  ],
  
  // 更新订单验证
  update: [
    param('orderId')
      .notEmpty()
      .withMessage('订单ID不能为空'),
    body('status')
      .optional()
      .isIn(['pending', 'processing', 'completed', 'cancelled'])
      .withMessage('订单状态无效'),
    validateResults
  ]
};

/**
 * 用户相关验证
 */
const userValidations = {
  // 更新用户信息验证
  update: [
    body('nickname')
      .optional()
      .isLength({ min: 1, max: 50 })
      .withMessage('昵称长度不能超过50位'),
    body('email')
      .optional()
      .isEmail()
      .withMessage('请输入有效的邮箱地址'),
    validateResults
  ],
  
  // 修改密码验证
  changePassword: [
    body('oldPassword')
      .notEmpty()
      .withMessage('旧密码不能为空'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('新密码长度至少为6位'),
    validateResults
  ]
};

/**
 * 服务套餐相关验证
 */
const packageValidations = {
  // 创建服务套餐验证
  create: [
    body('rideInfo')
      .notEmpty()
      .withMessage('出行信息不能为空'),
    body('foodInfo')
      .notEmpty()
      .withMessage('美食信息不能为空'),
    body('rideInfo.from')
      .notEmpty()
      .withMessage('出发地不能为空'),
    body('rideInfo.to')
      .notEmpty()
      .withMessage('目的地不能为空'),
    body('foodInfo.merchantId')
      .notEmpty()
      .withMessage('商家ID不能为空'),
    body('foodInfo.items')
      .isArray()
      .withMessage('商品列表必须是数组'),
    validateResults
  ]
};

module.exports = {
  validateResults,
  authValidations,
  orderValidations,
  userValidations,
  packageValidations
};

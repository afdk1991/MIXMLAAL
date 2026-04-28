/**
 * 请求参数验证中间件
 * 版本: v1.0.0.0
 * 说明: 基于express-validator的输入验证
 */

const { body, param, query, validationResult } = require('express-validator');

/**
 * 处理验证错误
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      code: 'VALIDATION_ERROR',
      message: '参数验证失败',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg,
        value: err.value,
      })),
    });
  }
  next();
};

/**
 * 手机号验证规则
 */
const phoneValidation = [
  body('phone')
    .notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确')
    .trim(),
  handleValidationErrors,
];

/**
 * 邮箱验证规则
 */
const emailValidation = [
  body('email')
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  handleValidationErrors,
];

/**
 * 密码验证规则
 */
const passwordValidation = [
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度应在6-20位之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('密码必须包含字母和数字'),
  handleValidationErrors,
];

/**
 * 验证码验证规则
 */
const codeValidation = [
  body('code')
    .notEmpty().withMessage('验证码不能为空')
    .isLength({ min: 4, max: 6 }).withMessage('验证码长度不正确')
    .isNumeric().withMessage('验证码必须为数字')
    .trim(),
  handleValidationErrors,
];

/**
 * 用户注册验证规则
 */
const registerValidation = [
  body('phone')
    .notEmpty().withMessage('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确')
    .trim(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6, max: 20 }).withMessage('密码长度应在6-20位之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/).withMessage('密码必须包含字母和数字'),
  body('code')
    .optional()
    .isLength({ min: 4, max: 6 }).withMessage('验证码长度不正确')
    .trim(),
  body('nickname')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 20 }).withMessage('昵称长度不能超过20个字符'),
  handleValidationErrors,
];

/**
 * 登录验证规则
 */
const loginValidation = [
  body('phone')
    .optional()
    .matches(/^1[3-9]\d{9}$/).withMessage('手机号格式不正确')
    .trim(),
  body('email')
    .optional()
    .isEmail().withMessage('邮箱格式不正确')
    .normalizeEmail(),
  body('password')
    .optional()
    .notEmpty().withMessage('密码不能为空'),
  body('code')
    .optional()
    .isLength({ min: 4, max: 6 }).withMessage('验证码长度不正确')
    .trim(),
  handleValidationErrors,
];

/**
 * 坐标验证规则
 */
const coordinateValidation = [
  query('lat')
    .notEmpty().withMessage('纬度不能为空')
    .isFloat({ min: -90, max: 90 }).withMessage('纬度范围不正确')
    .toFloat(),
  query('lng')
    .notEmpty().withMessage('经度不能为空')
    .isFloat({ min: -180, max: 180 }).withMessage('经度范围不正确')
    .toFloat(),
  handleValidationErrors,
];

/**
 * 分页参数验证规则
 */
const paginationValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 }).withMessage('页码必须为正整数')
    .toInt(),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('每页数量必须在1-100之间')
    .toInt(),
  handleValidationErrors,
];

/**
 * ID参数验证规则
 */
const idValidation = [
  param('id')
    .notEmpty().withMessage('ID不能为空')
    .isInt({ min: 1 }).withMessage('ID必须为正整数')
    .toInt(),
  handleValidationErrors,
];

/**
 * 订单创建验证规则
 */
const orderValidation = [
  body('startLocation')
    .notEmpty().withMessage('起点位置不能为空')
    .isObject().withMessage('起点位置格式不正确'),
  body('startLocation.lat')
    .notEmpty().withMessage('起点纬度不能为空')
    .isFloat({ min: -90, max: 90 }).withMessage('起点纬度范围不正确')
    .toFloat(),
  body('startLocation.lng')
    .notEmpty().withMessage('起点经度不能为空')
    .isFloat({ min: -180, max: 180 }).withMessage('起点经度范围不正确')
    .toFloat(),
  body('startLocation.address')
    .notEmpty().withMessage('起点地址不能为空')
    .trim()
    .escape()
    .isLength({ max: 200 }).withMessage('起点地址长度不能超过200个字符'),
  body('endLocation')
    .notEmpty().withMessage('终点位置不能为空')
    .isObject().withMessage('终点位置格式不正确'),
  body('endLocation.lat')
    .notEmpty().withMessage('终点纬度不能为空')
    .isFloat({ min: -90, max: 90 }).withMessage('终点纬度范围不正确')
    .toFloat(),
  body('endLocation.lng')
    .notEmpty().withMessage('终点经度不能为空')
    .isFloat({ min: -180, max: 180 }).withMessage('终点经度范围不正确')
    .toFloat(),
  body('endLocation.address')
    .notEmpty().withMessage('终点地址不能为空')
    .trim()
    .escape()
    .isLength({ max: 200 }).withMessage('终点地址长度不能超过200个字符'),
  body('remark')
    .optional()
    .trim()
    .escape()
    .isLength({ max: 500 }).withMessage('备注长度不能超过500个字符'),
  handleValidationErrors,
];

/**
 * 支付验证规则
 */
const paymentValidation = [
  body('orderId')
    .notEmpty().withMessage('订单ID不能为空')
    .isInt({ min: 1 }).withMessage('订单ID必须为正整数')
    .toInt(),
  body('paymentMethod')
    .notEmpty().withMessage('支付方式不能为空')
    .isIn(['alipay', 'wechat', 'card', 'balance']).withMessage('不支持的支付方式')
    .trim(),
  handleValidationErrors,
];

/**
 * 通用字符串验证规则（防XSS）
 */
const stringValidation = (field, options = {}) => {
  const { required = false, maxLength = 255, message = '' } = options;
  const validation = body(field);

  if (required) {
    validation.notEmpty().withMessage(message || `${field}不能为空`);
  } else {
    validation.optional();
  }

  return [
    validation
      .trim()
      .escape()
      .isLength({ max: maxLength }).withMessage(`${field}长度不能超过${maxLength}个字符`),
    handleValidationErrors,
  ];
};

module.exports = {
  handleValidationErrors,
  phoneValidation,
  emailValidation,
  passwordValidation,
  codeValidation,
  registerValidation,
  loginValidation,
  coordinateValidation,
  paginationValidation,
  idValidation,
  orderValidation,
  paymentValidation,
  stringValidation,
};

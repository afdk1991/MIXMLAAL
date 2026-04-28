-- ============================================
-- MIXMLAAL 数据库初始化脚本
-- 版本: v1.0.0.0
-- 说明: 初始化MySQL数据库结构和基础数据
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mixmlaal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE mixmlaal;

-- 清除现有表结构（如果存在）
DROP TABLE IF EXISTS `ride_orders`;
DROP TABLE IF EXISTS `drivers`;
DROP TABLE IF EXISTS `users`;

-- 用户表
CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '用户唯一标识',
  `phone` VARCHAR(11) UNIQUE NOT NULL COMMENT '手机号',
  `password` VARCHAR(255) NOT NULL COMMENT '密码',
  `nickname` VARCHAR(50) DEFAULT NULL COMMENT '昵称',
  `avatar` VARCHAR(255) DEFAULT NULL COMMENT '头像',
  `gender` TINYINT DEFAULT 0 COMMENT '性别: 0未知, 1男, 2女',
  `birthday` DATE DEFAULT NULL COMMENT '生日',
  `email` VARCHAR(100) DEFAULT NULL COMMENT '邮箱',
  `level` INT DEFAULT 1 COMMENT '用户等级',
  `points` INT DEFAULT 0 COMMENT '积分',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1正常, 0禁用',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_phone` (`phone`),
  INDEX `idx_user_id` (`user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 司机表
CREATE TABLE IF NOT EXISTS `drivers` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `driver_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '司机唯一标识',
  `user_id` VARCHAR(32) NOT NULL COMMENT '关联用户ID',
  `name` VARCHAR(50) NOT NULL COMMENT '司机姓名',
  `phone` VARCHAR(11) NOT NULL COMMENT '手机号',
  `license_number` VARCHAR(20) NOT NULL COMMENT '驾驶证号',
  `vehicle_license` VARCHAR(20) NOT NULL COMMENT '行驶证号',
  `vehicle_model` VARCHAR(50) NOT NULL COMMENT '车型',
  `vehicle_color` VARCHAR(20) NOT NULL COMMENT '车辆颜色',
  `plate_number` VARCHAR(20) NOT NULL COMMENT '车牌号',
  `rating` DECIMAL(3,1) DEFAULT 5.0 COMMENT '评分',
  `status` TINYINT DEFAULT 0 COMMENT '状态: 0待审核, 1正常, 2禁用, 3注销',
  `service_count` INT DEFAULT 0 COMMENT '服务次数',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_driver_id` (`driver_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机表';

-- 行程订单表
CREATE TABLE IF NOT EXISTS `ride_orders` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `order_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '订单唯一标识',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `driver_id` VARCHAR(32) DEFAULT NULL COMMENT '司机ID',
  `from_address` VARCHAR(255) NOT NULL COMMENT '出发地址',
  `to_address` VARCHAR(255) NOT NULL COMMENT '目的地地址',
  `from_lng` DECIMAL(10,6) NOT NULL COMMENT '出发经度',
  `from_lat` DECIMAL(10,6) NOT NULL COMMENT '出发纬度',
  `to_lng` DECIMAL(10,6) NOT NULL COMMENT '目的地经度',
  `to_lat` DECIMAL(10,6) NOT NULL COMMENT '目的地纬度',
  `distance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '距离(公里)',
  `duration` INT DEFAULT 0 COMMENT '预计时长(分钟)',
  `type` VARCHAR(20) NOT NULL COMMENT '订单类型: express, premium, luxury, taxi',
  `estimated_price` DECIMAL(10,2) NOT NULL COMMENT '预估价格',
  `actual_price` DECIMAL(10,2) DEFAULT 0.00 COMMENT '实际价格',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: pending, searching, confirmed, onboarding, ongoing, completed, cancelled, refunded',
  `payment_status` VARCHAR(20) DEFAULT 'unpaid' COMMENT '支付状态: unpaid, paid, refunded',
  `start_time` TIMESTAMP DEFAULT NULL COMMENT '开始时间',
  `end_time` TIMESTAMP DEFAULT NULL COMMENT '结束时间',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_driver_id` (`driver_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_payment_status` (`payment_status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程订单表';

-- 支付表
CREATE TABLE IF NOT EXISTS `payments` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `payment_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '支付唯一标识',
  `order_id` VARCHAR(32) NOT NULL COMMENT '关联订单ID',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  `channel` VARCHAR(20) NOT NULL COMMENT '支付渠道: wechat, alipay',
  `trade_no` VARCHAR(100) DEFAULT NULL COMMENT '支付平台交易号',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: pending, success, failed, refunded',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `paid_at` TIMESTAMP DEFAULT NULL COMMENT '支付时间',
  INDEX `idx_payment_id` (`payment_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付表';

-- 退款表
CREATE TABLE IF NOT EXISTS `refunds` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `refund_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '退款唯一标识',
  `payment_id` VARCHAR(32) NOT NULL COMMENT '关联支付ID',
  `order_id` VARCHAR(32) NOT NULL COMMENT '关联订单ID',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '退款金额',
  `reason` VARCHAR(255) NOT NULL COMMENT '退款原因',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: pending, success, failed',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `refunded_at` TIMESTAMP DEFAULT NULL COMMENT '退款时间',
  INDEX `idx_refund_id` (`refund_id`),
  INDEX `idx_payment_id` (`payment_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`payment_id`) REFERENCES `payments`(`payment_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款表';

-- 用户钱包表
CREATE TABLE IF NOT EXISTS `user_wallets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '用户ID',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
  `freeze_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '冻结金额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户钱包表';

-- 钱包流水表
CREATE TABLE IF NOT EXISTS `wallet_transactions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '交易唯一标识',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: recharge, payment, refund, withdrawal',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: success, failed, pending',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_transaction_id` (`transaction_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包流水表';

-- 司机钱包表
CREATE TABLE IF NOT EXISTS `driver_wallets` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `driver_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '司机ID',
  `balance` DECIMAL(10,2) DEFAULT 0.00 COMMENT '余额',
  `freeze_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '冻结金额',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_driver_id` (`driver_id`),
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机钱包表';

-- 司机钱包流水表
CREATE TABLE IF NOT EXISTS `driver_transactions` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `transaction_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '交易唯一标识',
  `driver_id` VARCHAR(32) NOT NULL COMMENT '司机ID',
  `amount` DECIMAL(10,2) NOT NULL COMMENT '交易金额',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: income, withdrawal, penalty',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: success, failed, pending',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_transaction_id` (`transaction_id`),
  INDEX `idx_driver_id` (`driver_id`),
  INDEX `idx_type` (`type`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机钱包流水表';

-- 司机位置表
CREATE TABLE IF NOT EXISTS `driver_locations` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `driver_id` VARCHAR(32) NOT NULL COMMENT '司机ID',
  `lng` DECIMAL(10,6) NOT NULL COMMENT '经度',
  `lat` DECIMAL(10,6) NOT NULL COMMENT '纬度',
  `status` VARCHAR(20) NOT NULL COMMENT '状态: online, offline, busy',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_driver_id` (`driver_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机位置表';

-- 评价表
CREATE TABLE IF NOT EXISTS `ratings` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `rating_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '评价唯一标识',
  `order_id` VARCHAR(32) NOT NULL COMMENT '关联订单ID',
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `driver_id` VARCHAR(32) NOT NULL COMMENT '司机ID',
  `score` TINYINT NOT NULL COMMENT '评分: 1-5',
  `comment` VARCHAR(500) DEFAULT NULL COMMENT '评价内容',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_rating_id` (`rating_id`),
  INDEX `idx_order_id` (`order_id`),
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_driver_id` (`driver_id`),
  FOREIGN KEY (`order_id`) REFERENCES `ride_orders`(`order_id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`driver_id`) REFERENCES `drivers`(`driver_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 优惠券表
CREATE TABLE IF NOT EXISTS `coupons` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `coupon_id` VARCHAR(32) UNIQUE NOT NULL COMMENT '优惠券唯一标识',
  `name` VARCHAR(100) NOT NULL COMMENT '优惠券名称',
  `type` VARCHAR(20) NOT NULL COMMENT '类型: discount, cash',
  `value` DECIMAL(10,2) NOT NULL COMMENT '优惠金额或折扣',
  `min_amount` DECIMAL(10,2) DEFAULT 0.00 COMMENT '最低消费金额',
  `start_time` TIMESTAMP NOT NULL COMMENT '开始时间',
  `end_time` TIMESTAMP NOT NULL COMMENT '结束时间',
  `status` TINYINT DEFAULT 1 COMMENT '状态: 1有效, 0无效',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_coupon_id` (`coupon_id`),
  INDEX `idx_status` (`status`),
  INDEX `idx_end_time` (`end_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS `user_coupons` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `user_id` VARCHAR(32) NOT NULL COMMENT '用户ID',
  `coupon_id` VARCHAR(32) NOT NULL COMMENT '优惠券ID',
  `status` VARCHAR(20) DEFAULT 'unused' COMMENT '状态: unused, used, expired',
  `received_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '领取时间',
  `used_at` TIMESTAMP DEFAULT NULL COMMENT '使用时间',
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_coupon_id` (`coupon_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE,
  FOREIGN KEY (`coupon_id`) REFERENCES `coupons`(`coupon_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- 系统配置表
CREATE TABLE IF NOT EXISTS `system_configs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `key` VARCHAR(100) UNIQUE NOT NULL COMMENT '配置键',
  `value` TEXT COMMENT '配置值',
  `description` VARCHAR(255) DEFAULT NULL COMMENT '描述',
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX `idx_key` (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 系统日志表
CREATE TABLE IF NOT EXISTS `system_logs` (
  `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  `level` VARCHAR(20) NOT NULL COMMENT '日志级别: info, warn, error',
  `module` VARCHAR(100) DEFAULT NULL COMMENT '模块',
  `message` TEXT NOT NULL COMMENT '日志内容',
  `ip` VARCHAR(50) DEFAULT NULL COMMENT 'IP地址',
  `user_agent` TEXT DEFAULT NULL COMMENT '用户代理',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX `idx_level` (`level`),
  INDEX `idx_module` (`module`),
  INDEX `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志表';

-- 插入系统配置数据
INSERT INTO `system_configs` (`key`, `value`, `description`) VALUES
('platform_commission_rate', '0.27', '平台抽成比例'),
('driver_min_withdrawal', '100', '司机最低提现金额'),
('order_auto_cancel_minutes', '5', '订单自动取消时间(分钟)'),
('ride_share_expire_hours', '24', '行程分享有效期(小时)'),
('app_version', '1.0.0.0', '应用版本号'),
('api_version', 'v1', 'API版本号'),
('maintenance_mode', 'false', '维护模式');

-- 插入测试数据
INSERT INTO `users` (`user_id`, `phone`, `password`, `nickname`, `status`) VALUES
('user_123456', '13800138000', '$2a$10$e8tGQzG4QZ8gCq4O7V3Cve.1vQ3z6Y7z7z7z7z7z7z7z7z7z7z7', '测试用户', 1);

INSERT INTO `user_wallets` (`user_id`, `balance`) VALUES
('user_123456', 100.00);

-- 插入测试司机数据
INSERT INTO `drivers` (`driver_id`, `user_id`, `name`, `phone`, `license_number`, `vehicle_license`, `vehicle_model`, `vehicle_color`, `plate_number`, `status`) VALUES
('driver_123456', 'user_123456', '测试司机', '13900139000', '123456789012345678', '123456789012345678', '丰田凯美瑞', '黑色', '京A12345', 1);

INSERT INTO `driver_wallets` (`driver_id`, `balance`) VALUES
('driver_123456', 200.00);

-- 插入测试司机位置数据
INSERT INTO `driver_locations` (`driver_id`, `lng`, `lat`, `status`) VALUES
('driver_123456', 116.4074, 39.9042, 'online');

-- 插入测试优惠券数据
INSERT INTO `coupons` (`coupon_id`, `name`, `type`, `value`, `min_amount`, `start_time`, `end_time`) VALUES
('coupon_123456', '新用户立减券', 'cash', 20.00, 0.00, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('coupon_123457', '出行折扣券', 'discount', 0.8, 50.00, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY));

-- 插入测试用户优惠券数据
INSERT INTO `user_coupons` (`user_id`, `coupon_id`) VALUES
('user_123456', 'coupon_123456'),
('user_123456', 'coupon_123457');

-- 创建数据库用户并授权
CREATE USER IF NOT EXISTS 'mixmlaal'@'%' IDENTIFIED BY 'mixmlaal123';
GRANT ALL PRIVILEGES ON mixmlaal.* TO 'mixmlaal'@'%';
FLUSH PRIVILEGES;

-- 优化表结构
OPTIMIZE TABLE `users`;
OPTIMIZE TABLE `drivers`;
OPTIMIZE TABLE `ride_orders`;
OPTIMIZE TABLE `payments`;
OPTIMIZE TABLE `refunds`;
OPTIMIZE TABLE `user_wallets`;
OPTIMIZE TABLE `wallet_transactions`;
OPTIMIZE TABLE `driver_wallets`;
OPTIMIZE TABLE `driver_transactions`;
OPTIMIZE TABLE `driver_locations`;
OPTIMIZE TABLE `ratings`;
OPTIMIZE TABLE `coupons`;
OPTIMIZE TABLE `user_coupons`;
OPTIMIZE TABLE `system_configs`;
OPTIMIZE TABLE `system_logs`;

-- 完成初始化
SELECT 'MIXMLAAL 数据库初始化完成' AS message;

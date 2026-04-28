-- ============================================
-- MIXMLAAL 数据库表结构
-- 版本: v1.0.0.0
-- 说明: MySQL 8.0+
-- ============================================

-- 创建数据库
CREATE DATABASE IF NOT EXISTS mixmlaal
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mixmlaal;

-- ============================================
-- 用户相关表
-- ============================================

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL UNIQUE COMMENT '用户唯一标识',
    phone VARCHAR(20) NOT NULL UNIQUE COMMENT '手机号',
    password_hash VARCHAR(255) NOT NULL COMMENT '密码哈希',
    email VARCHAR(100) COMMENT '邮箱',
    nickname VARCHAR(50) COMMENT '昵称',
    avatar VARCHAR(255) COMMENT '头像URL',
    real_name VARCHAR(50) COMMENT '真实姓名',
    id_card VARCHAR(18) COMMENT '身份证号',
    gender TINYINT DEFAULT 0 COMMENT '性别: 0-未知, 1-男, 2-女',
    birthday DATE COMMENT '生日',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-禁用, 1-正常, 2-注销',
    user_type TINYINT DEFAULT 1 COMMENT '用户类型: 1-普通用户, 2-司机, 3-商家',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    INDEX idx_phone (phone),
    INDEX idx_status (status),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 用户认证表
CREATE TABLE IF NOT EXISTS user_auths (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    auth_type VARCHAR(20) NOT NULL COMMENT '认证类型: wechat, alipay, apple',
    auth_id VARCHAR(100) NOT NULL COMMENT '第三方唯一标识',
    auth_data JSON COMMENT '第三方认证数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_auth (user_id, auth_type),
    INDEX idx_auth_id (auth_type, auth_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户第三方认证表';

-- 用户地址表
CREATE TABLE IF NOT EXISTS user_addresses (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    name VARCHAR(50) COMMENT '地址名称(家/公司)',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系人电话',
    province VARCHAR(50) NOT NULL COMMENT '省',
    city VARCHAR(50) NOT NULL COMMENT '市',
    district VARCHAR(50) NOT NULL COMMENT '区/县',
    detail VARCHAR(255) NOT NULL COMMENT '详细地址',
    lng DECIMAL(10, 7) COMMENT '经度',
    lat DECIMAL(10, 7) COMMENT '纬度',
    is_default TINYINT DEFAULT 0 COMMENT '是否默认: 0-否, 1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_location (lng, lat)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址表';

-- ============================================
-- 司机相关表
-- ============================================

-- 司机信息表
CREATE TABLE IF NOT EXISTS drivers (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    driver_id VARCHAR(32) NOT NULL UNIQUE COMMENT '司机唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '关联用户ID',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待审核, 1-正常, 2-禁用, 3-注销',
    rating DECIMAL(2, 1) DEFAULT 5.0 COMMENT '评分 1.0-5.0',
    total_trips INT UNSIGNED DEFAULT 0 COMMENT '总接单数',
    total_income DECIMAL(10, 2) DEFAULT 0.00 COMMENT '总收入',
    balance DECIMAL(10, 2) DEFAULT 0.00 COMMENT '账户余额',
    id_card_front VARCHAR(255) COMMENT '身份证正面',
    id_card_back VARCHAR(255) COMMENT '身份证反面',
    driver_license VARCHAR(255) COMMENT '驾驶证',
    vehicle_license VARCHAR(255) COMMENT '行驶证',
    audit_remark VARCHAR(255) COMMENT '审核备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机信息表';

-- 司机车辆表
CREATE TABLE IF NOT EXISTS driver_vehicles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    driver_id VARCHAR(32) NOT NULL COMMENT '司机ID',
    vehicle_type TINYINT DEFAULT 1 COMMENT '车型: 1-快车, 2-专车, 3-豪华车, 4-出租车',
    brand VARCHAR(50) COMMENT '品牌',
    model VARCHAR(50) COMMENT '型号',
    color VARCHAR(20) COMMENT '颜色',
    plate_number VARCHAR(20) NOT NULL COMMENT '车牌号',
    seat_count TINYINT DEFAULT 4 COMMENT '座位数',
    vehicle_images JSON COMMENT '车辆照片',
    is_active TINYINT DEFAULT 1 COMMENT '是否启用: 0-否, 1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_driver_id (driver_id),
    INDEX idx_plate (plate_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='司机车辆表';

-- ============================================
-- 出行订单相关表
-- ============================================

-- 行程订单表
CREATE TABLE IF NOT EXISTS ride_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL UNIQUE COMMENT '订单唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    driver_id VARCHAR(32) COMMENT '司机ID',
    vehicle_type TINYINT DEFAULT 1 COMMENT '车型: 1-快车, 2-专车, 3-豪华车, 4-出租车',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待接单, 1-已接单, 2-进行中, 3-已完成, 4-已取消',
    
    -- 起点信息
    from_name VARCHAR(100) COMMENT '起点名称',
    from_address VARCHAR(255) COMMENT '起点地址',
    from_lng DECIMAL(10, 7) COMMENT '起点经度',
    from_lat DECIMAL(10, 7) COMMENT '起点纬度',
    
    -- 终点信息
    to_name VARCHAR(100) COMMENT '终点名称',
    to_address VARCHAR(255) COMMENT '终点地址',
    to_lng DECIMAL(10, 7) COMMENT '终点经度',
    to_lat DECIMAL(10, 7) COMMENT '终点纬度',
    
    -- 费用信息
    estimated_price DECIMAL(8, 2) COMMENT '预估价格',
    actual_price DECIMAL(8, 2) COMMENT '实际价格',
    discount_amount DECIMAL(8, 2) DEFAULT 0.00 COMMENT '优惠金额',
    platform_fee DECIMAL(8, 2) COMMENT '平台抽成',
    driver_income DECIMAL(8, 2) COMMENT '司机收入',
    
    -- 行程信息
    distance INT UNSIGNED COMMENT '行程距离(米)',
    duration INT UNSIGNED COMMENT '行程时长(秒)',
    route_polyline TEXT COMMENT '路线坐标串',
    
    -- 时间记录
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    accepted_at TIMESTAMP NULL COMMENT '接单时间',
    arrived_at TIMESTAMP NULL COMMENT '到达时间',
    started_at TIMESTAMP NULL COMMENT '开始时间',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    cancelled_at TIMESTAMP NULL COMMENT '取消时间',
    cancel_reason VARCHAR(255) COMMENT '取消原因',
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程订单表';

-- 行程位置记录表
CREATE TABLE IF NOT EXISTS ride_locations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    driver_id VARCHAR(32) NOT NULL COMMENT '司机ID',
    lng DECIMAL(10, 7) NOT NULL COMMENT '经度',
    lat DECIMAL(10, 7) NOT NULL COMMENT '纬度',
    accuracy FLOAT COMMENT '精度(米)',
    speed FLOAT COMMENT '速度(m/s)',
    direction FLOAT COMMENT '方向(度)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_driver_id (driver_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='行程位置记录表';

-- ============================================
-- 电商订单相关表
-- ============================================

-- 商品分类表
CREATE TABLE IF NOT EXISTS product_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    parent_id INT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    icon VARCHAR(255) COMMENT '图标',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent_id (parent_id),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品分类表';

-- 商品表
CREATE TABLE IF NOT EXISTS products (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    product_id VARCHAR(32) NOT NULL UNIQUE COMMENT '商品唯一标识',
    merchant_id VARCHAR(32) NOT NULL COMMENT '商家ID',
    category_id INT UNSIGNED COMMENT '分类ID',
    name VARCHAR(200) NOT NULL COMMENT '商品名称',
    description TEXT COMMENT '商品描述',
    main_image VARCHAR(255) COMMENT '主图',
    images JSON COMMENT '图片列表',
    price DECIMAL(10, 2) NOT NULL COMMENT '售价',
    original_price DECIMAL(10, 2) COMMENT '原价',
    stock INT UNSIGNED DEFAULT 0 COMMENT '库存',
    sales_count INT UNSIGNED DEFAULT 0 COMMENT '销量',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-下架, 1-上架, 2-售罄',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_merchant (merchant_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商品表';

-- 电商订单表
CREATE TABLE IF NOT EXISTS shop_orders (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL UNIQUE COMMENT '订单唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    merchant_id VARCHAR(32) NOT NULL COMMENT '商家ID',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待支付, 1-待发货, 2-待收货, 3-已完成, 4-已取消',
    
    -- 金额信息
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '商品总金额',
    delivery_fee DECIMAL(8, 2) DEFAULT 0.00 COMMENT '运费',
    discount_amount DECIMAL(8, 2) DEFAULT 0.00 COMMENT '优惠金额',
    actual_amount DECIMAL(10, 2) NOT NULL COMMENT '实付金额',
    
    -- 收货信息
    receiver_name VARCHAR(50) COMMENT '收货人',
    receiver_phone VARCHAR(20) COMMENT '收货电话',
    receiver_address VARCHAR(255) COMMENT '收货地址',
    
    -- 物流信息
    delivery_company VARCHAR(50) COMMENT '快递公司',
    delivery_no VARCHAR(50) COMMENT '快递单号',
    delivered_at TIMESTAMP NULL COMMENT '发货时间',
    received_at TIMESTAMP NULL COMMENT '收货时间',
    
    remark VARCHAR(255) COMMENT '订单备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_user_id (user_id),
    INDEX idx_merchant (merchant_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='电商订单表';

-- 订单商品明细表
CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    product_id VARCHAR(32) NOT NULL COMMENT '商品ID',
    product_name VARCHAR(200) COMMENT '商品名称',
    product_image VARCHAR(255) COMMENT '商品图片',
    price DECIMAL(10, 2) NOT NULL COMMENT '单价',
    quantity INT UNSIGNED NOT NULL COMMENT '数量',
    total_amount DECIMAL(10, 2) NOT NULL COMMENT '小计金额',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_id (order_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单商品明细表';

-- ============================================
-- 支付相关表
-- ============================================

-- 支付记录表
CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    payment_id VARCHAR(32) NOT NULL UNIQUE COMMENT '支付单号',
    order_id VARCHAR(32) NOT NULL COMMENT '业务订单ID',
    order_type TINYINT NOT NULL COMMENT '订单类型: 1-出行, 2-电商',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    
    -- 支付信息
    channel VARCHAR(20) NOT NULL COMMENT '支付渠道: wechat, alipay',
    amount DECIMAL(10, 2) NOT NULL COMMENT '支付金额',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待支付, 1-支付成功, 2-支付失败, 3-已退款',
    
    -- 第三方信息
    third_party_id VARCHAR(64) COMMENT '第三方支付单号',
    third_party_data JSON COMMENT '第三方支付数据',
    
    -- 时间记录
    paid_at TIMESTAMP NULL COMMENT '支付时间',
    expired_at TIMESTAMP NULL COMMENT '过期时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_order (order_id, order_type),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_third_party (channel, third_party_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付记录表';

-- 退款记录表
CREATE TABLE IF NOT EXISTS refunds (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    refund_id VARCHAR(32) NOT NULL UNIQUE COMMENT '退款单号',
    payment_id VARCHAR(32) NOT NULL COMMENT '支付单号',
    order_id VARCHAR(32) NOT NULL COMMENT '订单ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    
    amount DECIMAL(10, 2) NOT NULL COMMENT '退款金额',
    reason VARCHAR(255) COMMENT '退款原因',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-处理中, 1-退款成功, 2-退款失败',
    
    third_party_id VARCHAR(64) COMMENT '第三方退款单号',
    completed_at TIMESTAMP NULL COMMENT '完成时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_payment (payment_id),
    INDEX idx_order (order_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='退款记录表';

-- ============================================
-- 钱包相关表
-- ============================================

-- 用户钱包表
CREATE TABLE IF NOT EXISTS user_wallets (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL UNIQUE COMMENT '用户ID',
    balance DECIMAL(10, 2) DEFAULT 0.00 COMMENT '余额',
    frozen_amount DECIMAL(10, 2) DEFAULT 0.00 COMMENT '冻结金额',
    total_recharge DECIMAL(10, 2) DEFAULT 0.00 COMMENT '累计充值',
    total_consume DECIMAL(10, 2) DEFAULT 0.00 COMMENT '累计消费',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户钱包表';

-- 钱包流水表
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    transaction_id VARCHAR(32) NOT NULL UNIQUE COMMENT '流水号',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    type TINYINT NOT NULL COMMENT '类型: 1-充值, 2-消费, 3-退款, 4-提现, 5-收入',
    amount DECIMAL(10, 2) NOT NULL COMMENT '金额',
    balance_before DECIMAL(10, 2) NOT NULL COMMENT '变动前余额',
    balance_after DECIMAL(10, 2) NOT NULL COMMENT '变动后余额',
    related_id VARCHAR(32) COMMENT '关联业务ID',
    related_type VARCHAR(20) COMMENT '关联业务类型',
    remark VARCHAR(255) COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='钱包流水表';

-- ============================================
-- 社交相关表
-- ============================================

-- 文章表
CREATE TABLE IF NOT EXISTS posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id VARCHAR(32) NOT NULL UNIQUE COMMENT '文章唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '作者ID',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    summary VARCHAR(500) COMMENT '摘要',
    cover_image VARCHAR(255) COMMENT '封面图',
    category_id INT UNSIGNED COMMENT '分类ID',
    tags JSON COMMENT '标签',
    view_count INT UNSIGNED DEFAULT 0 COMMENT '浏览量',
    like_count INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
    comment_count INT UNSIGNED DEFAULT 0 COMMENT '评论数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-草稿, 1-已发布, 2-已下架',
    is_top TINYINT DEFAULT 0 COMMENT '是否置顶',
    published_at TIMESTAMP NULL COMMENT '发布时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_published (published_at),
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='文章表';

-- 评论表
CREATE TABLE IF NOT EXISTS comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    comment_id VARCHAR(32) NOT NULL UNIQUE COMMENT '评论唯一标识',
    post_id VARCHAR(32) NOT NULL COMMENT '文章ID',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    parent_id VARCHAR(32) DEFAULT '0' COMMENT '父评论ID',
    content TEXT NOT NULL COMMENT '评论内容',
    like_count INT UNSIGNED DEFAULT 0 COMMENT '点赞数',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-删除, 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评论表';

-- ============================================
-- 系统相关表
-- ============================================

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_configs (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    config_key VARCHAR(50) NOT NULL UNIQUE COMMENT '配置键',
    config_value TEXT COMMENT '配置值',
    description VARCHAR(255) COMMENT '描述',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置表';

-- 短信验证码表
CREATE TABLE IF NOT EXISTS sms_codes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    phone VARCHAR(20) NOT NULL COMMENT '手机号',
    code VARCHAR(10) NOT NULL COMMENT '验证码',
    type VARCHAR(20) NOT NULL COMMENT '类型: register, login, reset',
    expired_at TIMESTAMP NOT NULL COMMENT '过期时间',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_phone_type (phone, type),
    INDEX idx_expired (expired_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='短信验证码表';

-- 操作日志表
CREATE TABLE IF NOT EXISTS operation_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) COMMENT '用户ID',
    action VARCHAR(50) NOT NULL COMMENT '操作类型',
    target_type VARCHAR(50) COMMENT '目标类型',
    target_id VARCHAR(32) COMMENT '目标ID',
    ip VARCHAR(50) COMMENT 'IP地址',
    user_agent VARCHAR(500) COMMENT 'User-Agent',
    request_data JSON COMMENT '请求数据',
    response_data JSON COMMENT '响应数据',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='操作日志表';

-- ============================================
-- 新增表结构
-- ============================================

-- 商家表
CREATE TABLE IF NOT EXISTS merchants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    merchant_id VARCHAR(32) NOT NULL UNIQUE COMMENT '商家唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '关联用户ID',
    merchant_name VARCHAR(100) NOT NULL COMMENT '商家名称',
    contact_name VARCHAR(50) COMMENT '联系人姓名',
    contact_phone VARCHAR(20) COMMENT '联系人电话',
    business_license VARCHAR(255) COMMENT '营业执照',
    status TINYINT DEFAULT 0 COMMENT '状态: 0-待审核, 1-正常, 2-禁用, 3-注销',
    rating DECIMAL(2, 1) DEFAULT 5.0 COMMENT '评分 1.0-5.0',
    total_sales DECIMAL(12, 2) DEFAULT 0.00 COMMENT '总销售额',
    balance DECIMAL(10, 2) DEFAULT 0.00 COMMENT '账户余额',
    audit_remark VARCHAR(255) COMMENT '审核备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='商家表';

-- 店铺表
CREATE TABLE IF NOT EXISTS shops (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    shop_id VARCHAR(32) NOT NULL UNIQUE COMMENT '店铺唯一标识',
    merchant_id VARCHAR(32) NOT NULL COMMENT '商家ID',
    shop_name VARCHAR(100) NOT NULL COMMENT '店铺名称',
    description TEXT COMMENT '店铺描述',
    logo VARCHAR(255) COMMENT '店铺logo',
    cover_image VARCHAR(255) COMMENT '店铺封面',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-关闭, 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_merchant_id (merchant_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='店铺表';

-- 通知表
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    notification_id VARCHAR(32) NOT NULL UNIQUE COMMENT '通知唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    type VARCHAR(20) NOT NULL COMMENT '通知类型: system, order, payment, promotion',
    title VARCHAR(100) NOT NULL COMMENT '通知标题',
    content TEXT NOT NULL COMMENT '通知内容',
    data JSON COMMENT '附加数据',
    read TINYINT DEFAULT 0 COMMENT '是否已读: 0-未读, 1-已读',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type),
    INDEX idx_read (read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='通知表';

-- 购物车表
CREATE TABLE IF NOT EXISTS shopping_carts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    cart_id VARCHAR(32) NOT NULL UNIQUE COMMENT '购物车唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    product_id VARCHAR(32) NOT NULL COMMENT '商品ID',
    quantity INT UNSIGNED NOT NULL COMMENT '数量',
    selected TINYINT DEFAULT 1 COMMENT '是否选中: 0-否, 1-是',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_product (user_id, product_id),
    INDEX idx_user_id (user_id),
    INDEX idx_product_id (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='购物车表';

-- 优惠券表
CREATE TABLE IF NOT EXISTS coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coupon_id VARCHAR(32) NOT NULL UNIQUE COMMENT '优惠券唯一标识',
    name VARCHAR(100) NOT NULL COMMENT '优惠券名称',
    type TINYINT NOT NULL COMMENT '类型: 1-满减券, 2-折扣券',
    value DECIMAL(10, 2) NOT NULL COMMENT '优惠金额或折扣',
    min_amount DECIMAL(10, 2) DEFAULT 0 COMMENT '最低使用金额',
    start_time TIMESTAMP NOT NULL COMMENT '开始时间',
    end_time TIMESTAMP NOT NULL COMMENT '结束时间',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-无效, 1-有效',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_time (start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券表';

-- 用户优惠券表
CREATE TABLE IF NOT EXISTS user_coupons (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    coupon_id VARCHAR(32) NOT NULL COMMENT '优惠券ID',
    status TINYINT DEFAULT 1 COMMENT '状态: 1-未使用, 2-已使用, 3-已过期',
    obtained_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '获取时间',
    used_at TIMESTAMP NULL COMMENT '使用时间',
    INDEX idx_user_id (user_id),
    INDEX idx_coupon_id (coupon_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户优惠券表';

-- 评价表
CREATE TABLE IF NOT EXISTS reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    review_id VARCHAR(32) NOT NULL UNIQUE COMMENT '评价唯一标识',
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    target_id VARCHAR(32) NOT NULL COMMENT '评价目标ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: product, driver, merchant',
    rating TINYINT NOT NULL COMMENT '评分 1-5',
    content TEXT COMMENT '评价内容',
    images JSON COMMENT '评价图片',
    status TINYINT DEFAULT 1 COMMENT '状态: 0-删除, 1-正常',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_id, target_type),
    INDEX idx_rating (rating),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='评价表';

-- 收藏表
CREATE TABLE IF NOT EXISTS collections (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    target_id VARCHAR(32) NOT NULL COMMENT '收藏目标ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: product, shop, post',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_target (user_id, target_id, target_type),
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_id, target_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='收藏表';

-- 浏览历史表
CREATE TABLE IF NOT EXISTS browse_history (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    target_id VARCHAR(32) NOT NULL COMMENT '浏览目标ID',
    target_type VARCHAR(20) NOT NULL COMMENT '目标类型: product, shop, post',
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '浏览时间',
    INDEX idx_user_id (user_id),
    INDEX idx_target (target_id, target_type),
    INDEX idx_viewed_at (viewed_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='浏览历史表';

-- 插入默认配置
INSERT INTO system_configs (config_key, config_value, description) VALUES
('platform_name', '米小米拉阿狸', '平台名称'),
('platform_commission_rate', '0.27', '平台抽成比例'),
('order_auto_cancel_minutes', '5', '订单自动取消时间(分钟)'),
('driver_min_withdrawal', '100', '司机最低提现金额'),
('ride_share_expire_hours', '24', '行程分享有效期(小时)'),
('max_login_attempts', '5', '最大登录尝试次数'),
('sms_code_expire_minutes', '5', '短信验证码有效期(分钟)'),
('free_shipping_threshold', '99', '免运费门槛'),
('default_shipping_fee', '10', '默认运费'),
('max_cart_items', '100', '购物车最大商品数')
ON DUPLICATE KEY UPDATE config_value = VALUES(config_value);

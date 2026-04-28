-- 创建主数据库
CREATE DATABASE IF NOT EXISTS mixmlaal_0 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS mixmlaal_1 CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 切换到 mixmlaal_0 数据库
USE mixmlaal_0;

-- 创建用户表 - 4个分表
CREATE TABLE IF NOT EXISTS users_0 (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE,
  password VARCHAR(100),
  name VARCHAR(50),
  phone VARCHAR(20),
  email VARCHAR(100),
  role ENUM('admin', 'user', 'delivery') NOT NULL DEFAULT 'user',
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  avatar VARCHAR(500),
  wechatOpenid VARCHAR(100) UNIQUE,
  wechatUnionid VARCHAR(100),
  qqOpenid VARCHAR(100) UNIQUE,
  googleOpenid VARCHAR(100) UNIQUE,
  thirdPartyProvider ENUM('wechat', 'qq', 'google', 'none') NOT NULL DEFAULT 'none',
  thirdPartyId VARCHAR(100),
  membershipLevel ENUM('normal', 'bronze', 'silver', 'gold', 'platinum') NOT NULL DEFAULT 'normal',
  membershipExpiry DATETIME,
  points INT NOT NULL DEFAULT 0,
  growthPoints INT NOT NULL DEFAULT 0 COMMENT '成长值，用于会员等级提升',
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users_1 LIKE users_0;
CREATE TABLE IF NOT EXISTS users_2 LIKE users_0;
CREATE TABLE IF NOT EXISTS users_3 LIKE users_0;

-- 创建订单表 - 4个分表
CREATE TABLE IF NOT EXISTS orders_0 (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  order_no VARCHAR(32) UNIQUE,
  total_amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'shipping', 'completed', 'cancelled') NOT NULL DEFAULT 'pending',
  payment_method ENUM('alipay', 'wechat', 'creditcard', 'cod') NOT NULL DEFAULT 'alipay',
  payment_status ENUM('unpaid', 'paid', 'refunded') NOT NULL DEFAULT 'unpaid',
  shipping_address TEXT,
  tracking_no VARCHAR(50),
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS orders_1 LIKE orders_0;
CREATE TABLE IF NOT EXISTS orders_2 LIKE orders_0;
CREATE TABLE IF NOT EXISTS orders_3 LIKE orders_0;

-- 创建商品表 - 4个分表
CREATE TABLE IF NOT EXISTS products_0 (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  category_id INT,
  brand_id INT,
  image_url VARCHAR(500),
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category_id (category_id),
  INDEX idx_status (status),
  INDEX idx_price (price)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS products_1 LIKE products_0;
CREATE TABLE IF NOT EXISTS products_2 LIKE products_0;
CREATE TABLE IF NOT EXISTS products_3 LIKE products_0;

-- 切换到 mixmlaal_1 数据库
USE mixmlaal_1;

-- 创建相同的表结构
CREATE TABLE IF NOT EXISTS users_0 LIKE mixmlaal_0.users_0;
CREATE TABLE IF NOT EXISTS users_1 LIKE mixmlaal_0.users_0;
CREATE TABLE IF NOT EXISTS users_2 LIKE mixmlaal_0.users_0;
CREATE TABLE IF NOT EXISTS users_3 LIKE mixmlaal_0.users_0;

CREATE TABLE IF NOT EXISTS orders_0 LIKE mixmlaal_0.orders_0;
CREATE TABLE IF NOT EXISTS orders_1 LIKE mixmlaal_0.orders_0;
CREATE TABLE IF NOT EXISTS orders_2 LIKE mixmlaal_0.orders_0;
CREATE TABLE IF NOT EXISTS orders_3 LIKE mixmlaal_0.orders_0;

CREATE TABLE IF NOT EXISTS products_0 LIKE mixmlaal_0.products_0;
CREATE TABLE IF NOT EXISTS products_1 LIKE mixmlaal_0.products_0;
CREATE TABLE IF NOT EXISTS products_2 LIKE mixmlaal_0.products_0;
CREATE TABLE IF NOT EXISTS products_3 LIKE mixmlaal_0.products_0;

-- 创建从库复制用户（如果需要）
-- CREATE USER 'repl'@'%' IDENTIFIED BY 'repl_password';
-- GRANT REPLICATION SLAVE ON *.* TO 'repl'@'%';
-- FLUSH PRIVILEGES;

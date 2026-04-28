-- ============================================
-- MIXMLAAL 数据库表结构优化
-- 版本: v1.0.0.0
-- 说明: 添加权限管理和内容管理相关表，优化现有表结构
-- ============================================

USE mixmlaal;

-- ============================================
-- 权限管理相关表
-- ============================================

-- 权限表
CREATE TABLE IF NOT EXISTS permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '权限名称',
    code VARCHAR(50) NOT NULL COMMENT '权限代码',
    description TEXT COMMENT '权限描述',
    category VARCHAR(50) COMMENT '权限分类',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code),
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='权限表';

-- 角色表
CREATE TABLE IF NOT EXISTS roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '角色名称',
    code VARCHAR(50) NOT NULL COMMENT '角色代码',
    description TEXT COMMENT '角色描述',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色表';

-- 角色-权限关联表
CREATE TABLE IF NOT EXISTS role_permissions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    permission_id BIGINT UNSIGNED NOT NULL COMMENT '权限ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_role_permission (role_id, permission_id),
    INDEX idx_role (role_id),
    INDEX idx_permission (permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色-权限关联表';

-- 用户-角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(32) NOT NULL COMMENT '用户ID',
    role_id BIGINT UNSIGNED NOT NULL COMMENT '角色ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_role (user_id, role_id),
    INDEX idx_user (user_id),
    INDEX idx_role (role_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户-角色关联表';

-- ============================================
-- 内容管理相关表
-- ============================================

-- 内容表
CREATE TABLE IF NOT EXISTS contents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content_id VARCHAR(32) NOT NULL UNIQUE COMMENT '内容唯一标识',
    title VARCHAR(200) NOT NULL COMMENT '标题',
    content TEXT NOT NULL COMMENT '内容',
    type VARCHAR(50) NOT NULL COMMENT '内容类型',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' COMMENT '状态: draft-草稿, published-已发布, archived-已归档',
    author_id VARCHAR(32) NOT NULL COMMENT '作者ID',
    tags JSON COMMENT '标签',
    metadata JSON COMMENT '元数据',
    view_count INT UNSIGNED DEFAULT 0 COMMENT '浏览量',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_author (author_id),
    INDEX idx_type (type),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    FULLTEXT INDEX ft_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容表';

-- 内容分类表
CREATE TABLE IF NOT EXISTS content_categories (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL COMMENT '分类名称',
    parent_id BIGINT UNSIGNED DEFAULT 0 COMMENT '父分类ID',
    sort_order INT DEFAULT 0 COMMENT '排序',
    is_active TINYINT DEFAULT 1 COMMENT '是否启用',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_parent (parent_id),
    INDEX idx_sort (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容分类表';

-- 内容-分类关联表
CREATE TABLE IF NOT EXISTS content_category_relations (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    content_id VARCHAR(32) NOT NULL COMMENT '内容ID',
    category_id BIGINT UNSIGNED NOT NULL COMMENT '分类ID',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_content_category (content_id, category_id),
    INDEX idx_content (content_id),
    INDEX idx_category (category_id),
    FOREIGN KEY (content_id) REFERENCES contents(content_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES content_categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='内容-分类关联表';

-- ============================================
-- 优化现有表结构
-- ============================================

-- 1. 用户表优化
-- 添加索引
ALTER TABLE users ADD INDEX idx_last_login (last_login_at);

-- 2. 订单表优化
-- 为出行订单表添加复合索引
ALTER TABLE ride_orders ADD INDEX idx_user_status (user_id, status);
ALTER TABLE ride_orders ADD INDEX idx_driver_status (driver_id, status);

-- 为电商订单表添加复合索引
ALTER TABLE shop_orders ADD INDEX idx_user_status (user_id, status);
ALTER TABLE shop_orders ADD INDEX idx_merchant_status (merchant_id, status);

-- 3. 商品表优化
-- 添加复合索引
ALTER TABLE products ADD INDEX idx_merchant_status (merchant_id, status);
ALTER TABLE products ADD INDEX idx_category_status (category_id, status);

-- 4. 支付表优化
-- 添加复合索引
ALTER TABLE payments ADD INDEX idx_user_status (user_id, status);
ALTER TABLE payments ADD INDEX idx_order_status (order_id, status);

-- 5. 钱包表优化
-- 添加复合索引
ALTER TABLE wallet_transactions ADD INDEX idx_user_type (user_id, type);

-- 6. 社交表优化
-- 为文章表添加复合索引
ALTER TABLE posts ADD INDEX idx_user_status (user_id, status);
ALTER TABLE posts ADD INDEX idx_category_status (category_id, status);

-- 为评论表添加复合索引
ALTER TABLE comments ADD INDEX idx_post_status (post_id, status);
ALTER TABLE comments ADD INDEX idx_user_status (user_id, status);

-- 7. 通知表优化
-- 添加复合索引
ALTER TABLE notifications ADD INDEX idx_user_read (user_id, read);
ALTER TABLE notifications ADD INDEX idx_user_type (user_id, type);

-- 8. 评价表优化
-- 添加复合索引
ALTER TABLE reviews ADD INDEX idx_target_status (target_id, status);
ALTER TABLE reviews ADD INDEX idx_user_target (user_id, target_id, target_type);

-- ============================================
-- 插入默认数据
-- ============================================

-- 插入默认权限
INSERT INTO permissions (name, code, description, category) VALUES
('用户管理', 'user:manage', '管理用户信息', '用户'),
('司机管理', 'driver:manage', '管理司机信息', '司机'),
('订单管理', 'order:manage', '管理订单信息', '订单'),
('商品管理', 'product:manage', '管理商品信息', '商品'),
('支付管理', 'payment:manage', '管理支付信息', '支付'),
('钱包管理', 'wallet:manage', '管理钱包信息', '钱包'),
('内容管理', 'content:manage', '管理内容信息', '内容'),
('权限管理', 'permission:manage', '管理权限信息', '系统'),
('角色管理', 'role:manage', '管理角色信息', '系统'),
('系统设置', 'system:manage', '管理系统设置', '系统')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), category = VALUES(category);

-- 插入默认角色
INSERT INTO roles (name, code, description) VALUES
('超级管理员', 'super_admin', '拥有所有权限的超级管理员'),
('管理员', 'admin', '拥有管理权限的管理员'),
('普通用户', 'user', '普通用户')
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 为超级管理员分配所有权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'super_admin'
ON DUPLICATE KEY UPDATE role_id = r.id, permission_id = p.id;

-- 为管理员分配部分权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'admin' AND p.code IN ('user:manage', 'driver:manage', 'order:manage', 'product:manage', 'content:manage')
ON DUPLICATE KEY UPDATE role_id = r.id, permission_id = p.id;

-- 为普通用户分配基本权限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.code = 'user' AND p.code IN ('order:manage', 'product:manage')
ON DUPLICATE KEY UPDATE role_id = r.id, permission_id = p.id;

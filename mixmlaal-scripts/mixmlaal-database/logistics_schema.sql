-- 前置仓轻客配送系统数据库表结构

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role ENUM('admin', 'dispatcher', 'warehouse', 'driver') NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    vehicle_id INT,
    warehouse_id INT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 车辆表
CREATE TABLE IF NOT EXISTS vehicle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    brand VARCHAR(50) NOT NULL,
    model VARCHAR(50) NOT NULL,
    vehicle_type ENUM('fuel', 'electric') NOT NULL,
    volume FLOAT NOT NULL, -- 容积（m³）
    weight_capacity FLOAT NOT NULL, -- 载重（kg）
    height FLOAT, -- 高度（m）
    length FLOAT, -- 长度（m）
    width FLOAT, -- 宽度（m）
    can_enter_garage BOOLEAN DEFAULT FALSE, -- 是否可进地库
    warehouse_id INT,
    status ENUM('available', 'maintenance', 'in_use') DEFAULT 'available',
    maintenance_date DATE,
    inspection_date DATE,
    insurance_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 前置仓表
CREATE TABLE IF NOT EXISTS warehouse (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    address VARCHAR(200) NOT NULL,
    contact_name VARCHAR(50),
    contact_phone VARCHAR(20),
    longitude FLOAT,
    latitude FLOAT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 订单主表
CREATE TABLE IF NOT EXISTS order_main (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_no VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT,
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address VARCHAR(200) NOT NULL,
    longitude FLOAT,
    latitude FLOAT,
    total_amount FLOAT NOT NULL,
    order_type ENUM('normal', 'express', 'fresh') DEFAULT 'normal',
    status ENUM('pending', 'processing', 'delivered', 'cancelled') DEFAULT 'pending',
    delivery_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 订单商品表
CREATE TABLE IF NOT EXISTS order_item (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    unit_price FLOAT NOT NULL,
    total_price FLOAT NOT NULL,
    weight FLOAT, -- 重量（kg）
    volume FLOAT, -- 体积（m³）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 发车任务表
CREATE TABLE IF NOT EXISTS task (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_no VARCHAR(50) NOT NULL UNIQUE,
    warehouse_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    status ENUM('pending', 'in_transit', 'completed', 'cancelled') DEFAULT 'pending',
    estimated_distance FLOAT, -- 预计距离（km）
    estimated_duration INT, -- 预计时长（分钟）
    actual_distance FLOAT, -- 实际距离（km）
    actual_duration INT, -- 实际时长（分钟）
    start_time DATETIME,
    end_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 任务点位表
CREATE TABLE IF NOT EXISTS task_point (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    order_id INT NOT NULL,
    sequence INT NOT NULL, -- 配送顺序
    status ENUM('pending', 'delivering', 'completed', 'failed') DEFAULT 'pending',
    estimated_arrival_time DATETIME,
    actual_arrival_time DATETIME,
    actual_departure_time DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 签收记录表
CREATE TABLE IF NOT EXISTS sign_record (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_point_id INT NOT NULL,
    order_id INT NOT NULL,
    driver_id INT NOT NULL,
    sign_type ENUM('handwritten', 'photo', 'digital') NOT NULL,
    sign_content VARCHAR(255), -- 签名内容或照片路径
    sign_time DATETIME NOT NULL,
    exception_type ENUM('none', 'rejection', 'no_one', 'address_error', 'other'),
    exception_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 行驶轨迹表
CREATE TABLE IF NOT EXISTS track (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    driver_id INT NOT NULL,
    longitude FLOAT NOT NULL,
    latitude FLOAT NOT NULL,
    speed FLOAT,
    direction FLOAT,
    timestamp DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 车辆成本表
CREATE TABLE IF NOT EXISTS vehicle_cost (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vehicle_id INT NOT NULL,
    cost_type ENUM('fuel', 'maintenance', 'insurance', 'fine', 'other') NOT NULL,
    amount FLOAT NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 司机薪资表
CREATE TABLE IF NOT EXISTS driver_salary (
    id INT AUTO_INCREMENT PRIMARY KEY,
    driver_id INT NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    base_salary FLOAT DEFAULT 0,
    delivery_fee FLOAT DEFAULT 0,
    mileage_fee FLOAT DEFAULT 0,
    bonus FLOAT DEFAULT 0,
    deduction FLOAT DEFAULT 0,
    total_salary FLOAT DEFAULT 0,
    status ENUM('pending', 'calculated', 'paid') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_vehicle_id ON users(vehicle_id);
CREATE INDEX idx_users_warehouse_id ON users(warehouse_id);

CREATE INDEX idx_vehicle_warehouse_id ON vehicle(warehouse_id);
CREATE INDEX idx_vehicle_status ON vehicle(status);

CREATE INDEX idx_order_main_warehouse_id ON order_main(warehouse_id);
CREATE INDEX idx_order_main_status ON order_main(status);

CREATE INDEX idx_order_item_order_id ON order_item(order_id);

CREATE INDEX idx_task_warehouse_id ON task(warehouse_id);
CREATE INDEX idx_task_vehicle_id ON task(vehicle_id);
CREATE INDEX idx_task_driver_id ON task(driver_id);
CREATE INDEX idx_task_status ON task(status);

CREATE INDEX idx_task_point_task_id ON task_point(task_id);
CREATE INDEX idx_task_point_order_id ON task_point(order_id);
CREATE INDEX idx_task_point_status ON task_point(status);

CREATE INDEX idx_sign_record_task_point_id ON sign_record(task_point_id);
CREATE INDEX idx_sign_record_order_id ON sign_record(order_id);
CREATE INDEX idx_sign_record_driver_id ON sign_record(driver_id);

CREATE INDEX idx_track_task_id ON track(task_id);
CREATE INDEX idx_track_vehicle_id ON track(vehicle_id);
CREATE INDEX idx_track_driver_id ON track(driver_id);

CREATE INDEX idx_vehicle_cost_vehicle_id ON vehicle_cost(vehicle_id);
CREATE INDEX idx_vehicle_cost_date ON vehicle_cost(date);

CREATE INDEX idx_driver_salary_driver_id ON driver_salary(driver_id);
CREATE INDEX idx_driver_salary_period ON driver_salary(period_start, period_end);
CREATE INDEX idx_driver_salary_status ON driver_salary(status);

-- 外键约束
ALTER TABLE users ADD CONSTRAINT fk_users_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE SET NULL;
ALTER TABLE users ADD CONSTRAINT fk_users_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id) ON DELETE SET NULL;

ALTER TABLE vehicle ADD CONSTRAINT fk_vehicle_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id) ON DELETE SET NULL;

ALTER TABLE order_main ADD CONSTRAINT fk_order_main_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id) ON DELETE SET NULL;

ALTER TABLE order_item ADD CONSTRAINT fk_order_item_order FOREIGN KEY (order_id) REFERENCES order_main(id) ON DELETE CASCADE;

ALTER TABLE task ADD CONSTRAINT fk_task_warehouse FOREIGN KEY (warehouse_id) REFERENCES warehouse(id) ON DELETE CASCADE;
ALTER TABLE task ADD CONSTRAINT fk_task_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;
ALTER TABLE task ADD CONSTRAINT fk_task_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE task_point ADD CONSTRAINT fk_task_point_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE;
ALTER TABLE task_point ADD CONSTRAINT fk_task_point_order FOREIGN KEY (order_id) REFERENCES order_main(id) ON DELETE CASCADE;

ALTER TABLE sign_record ADD CONSTRAINT fk_sign_record_task_point FOREIGN KEY (task_point_id) REFERENCES task_point(id) ON DELETE CASCADE;
ALTER TABLE sign_record ADD CONSTRAINT fk_sign_record_order FOREIGN KEY (order_id) REFERENCES order_main(id) ON DELETE CASCADE;
ALTER TABLE sign_record ADD CONSTRAINT fk_sign_record_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE track ADD CONSTRAINT fk_track_task FOREIGN KEY (task_id) REFERENCES task(id) ON DELETE CASCADE;
ALTER TABLE track ADD CONSTRAINT fk_track_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;
ALTER TABLE track ADD CONSTRAINT fk_track_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE;

ALTER TABLE vehicle_cost ADD CONSTRAINT fk_vehicle_cost_vehicle FOREIGN KEY (vehicle_id) REFERENCES vehicle(id) ON DELETE CASCADE;

ALTER TABLE driver_salary ADD CONSTRAINT fk_driver_salary_driver FOREIGN KEY (driver_id) REFERENCES users(id) ON DELETE CASCADE;
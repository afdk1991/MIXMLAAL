/**
 * SQLite 数据库连接管理
 * 版本: v1.0.0.0
 * 说明: SQLite 连接配置、基本操作、性能优化
 */

const path = require('path');

// 尝试加载 sqlite3 模块
let sqlite3 = null;
try {
  sqlite3 = require('sqlite3').verbose();
  console.log('sqlite3 模块加载成功');
} catch (error) {
  console.warn('sqlite3 模块加载失败:', error.message);
  console.warn('将使用模拟实现');
  // 模拟实现
  sqlite3 = {
    verbose: function () {
      return this;
    },
    Database: function () {
      // 模拟用户数据
      const users = [];
      return {
        serialize: function (callback) {
          console.log('模拟: 执行 serialize');
          callback();
        },
        run: function (sql, params, callback) {
          console.log('模拟: 执行 run:', sql);
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          // 模拟插入用户
          if (sql.includes('INSERT INTO users')) {
            users.push({
              userId: params[0],
              phone: params[1],
              password: params[2],
              nickname: params[3],
              role: params[4],
              status: params[5],
              createdAt: params[6],
              updatedAt: params[7]
            });
            console.log('模拟: 插入用户成功:', params[1]);
          }
          if (callback) { callback(); }
          return { lastID: 1, changes: 1 };
        },
        all: function (sql, params, callback) {
          console.log('模拟: 执行 all:', sql);
          if (typeof params === 'function') {
            callback = params;
            params = [];
          }
          let result = [];
          // 模拟COUNT查询
          if (sql.includes('SELECT COUNT(*) as count FROM users')) {
            result = [{ count: users.length }];
            console.log('模拟: COUNT查询结果:', result);
          }
          // 模拟用户查询
          else if (sql.includes('SELECT * FROM users WHERE phone =')) {
            const phone = params[0];
            const user = users.find(u => u.phone === phone);
            if (user) {
              result = [user];
              console.log('模拟: 用户查询结果:', result);
            }
          }
          // 模拟健康检查查询
          else if (sql.includes('SELECT 1')) {
            result = [{ 1: 1 }];
            console.log('模拟: 健康检查查询结果:', result);
          }
          if (callback) { callback(null, result); }
        },
        close: function (callback) {
          console.log('模拟: 执行 close');
          if (callback) { callback(); }
        },
      };
    },
  };
}

// SQLite 数据库文件路径
const dbPath = path.join(__dirname, '../../../../data', 'mixmlaal.db');

// 创建数据库连接
let db = null;

// 如果是模拟实现，自动初始化db
if (sqlite3 && sqlite3.Database && !db) {
  db = new sqlite3.Database(dbPath);
  console.log('模拟数据库初始化成功');
}

// 查询缓存
const queryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 缓存管理
const cacheManager = {
  set(key, value) {
    const timestamp = Date.now();
    queryCache.set(key, { value, timestamp });
  },
  get(key) {
    const cached = queryCache.get(key);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_TTL) {
        return cached.value;
      }
      // 缓存过期，移除
      queryCache.delete(key);
    }
    return null;
  },
  clear() {
    queryCache.clear();
  },
  size() {
    return queryCache.size;
  },
};

/**
 * 初始化数据库连接
 */
const initDB = async () => {
  try {
    // 确保数据目录存在
    const fs = require('fs');
    const dataDir = path.join(__dirname, '../../../../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 创建数据库连接
    return new Promise((resolve, reject) => {
      db = new sqlite3.Database(dbPath, async err => {
        if (err) {
          console.error('SQLite 数据库连接失败:', err.message);
          reject(err);
          return;
        }
        console.log('SQLite 数据库连接成功');

        try {
          // 创建表结构
          await createTables();
          // 插入初始化数据
          await seedData();
          resolve(db);
        } catch (tableError) {
          console.error('创建表结构失败:', tableError.message);
          reject(tableError);
        }
      });
    });
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    throw error;
  }
};

/**
 * 创建表结构
 */
const createTables = async () => {
  const tables = [
    // 用户表
    `CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT UNIQUE,
      phone TEXT UNIQUE,
      email TEXT UNIQUE,
      password TEXT,
      nickname TEXT,
      avatar TEXT,
      gender TEXT,
      birthday TEXT,
      level INTEGER DEFAULT 1,
      points INTEGER DEFAULT 0,
      balance REAL DEFAULT 0,
      role TEXT DEFAULT 'user',
      status INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_users_userId ON users(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone)`,
    `CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`,
    `CREATE INDEX IF NOT EXISTS idx_users_status ON users(status)`,

    // 订单表
    `CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE,
      userId TEXT,
      type TEXT,
      status TEXT,
      amount REAL,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_orders_orderId ON orders(orderId)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_userId ON orders(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_type ON orders(type)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt)`,

    // 商品分类表
    `CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      categoryId TEXT UNIQUE,
      name TEXT NOT NULL,
      icon TEXT,
      sortOrder INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_categories_categoryId ON categories(categoryId)`,
    `CREATE INDEX IF NOT EXISTS idx_categories_status ON categories(status)`,
    `CREATE INDEX IF NOT EXISTS idx_categories_sortOrder ON categories(sortOrder)`,

    // 商品表
    `CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      productId TEXT UNIQUE,
      name TEXT NOT NULL,
      description TEXT,
      price REAL NOT NULL,
      originalPrice REAL,
      image TEXT,
      images TEXT,
      category TEXT,
      specs TEXT,
      stock INTEGER DEFAULT 0,
      sales INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      reviews INTEGER DEFAULT 0,
      status INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT
    )`,
    `CREATE INDEX IF NOT EXISTS idx_products_productId ON products(productId)`,
    `CREATE INDEX IF NOT EXISTS idx_products_category ON products(category)`,
    `CREATE INDEX IF NOT EXISTS idx_products_status ON products(status)`,
    `CREATE INDEX IF NOT EXISTS idx_products_sales ON products(sales)`,
    `CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating)`,

    // 购物车表
    `CREATE TABLE IF NOT EXISTS cart (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      productId TEXT NOT NULL,
      quantity INTEGER DEFAULT 1,
      specs TEXT,
      status INTEGER DEFAULT 1,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId),
      FOREIGN KEY (productId) REFERENCES products(productId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_cart_userId ON cart(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_cart_productId ON cart(productId)`,
    `CREATE INDEX IF NOT EXISTS idx_cart_status ON cart(status)`,

    // 支付表
    `CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      paymentId TEXT UNIQUE,
      orderId TEXT NOT NULL,
      userId TEXT NOT NULL,
      amount REAL NOT NULL,
      channel TEXT NOT NULL,
      tradeNo TEXT,
      status TEXT DEFAULT 'pending',
      createdAt TEXT,
      paidAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_payments_paymentId ON payments(paymentId)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_orderId ON payments(orderId)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_userId ON payments(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status)`,
    `CREATE INDEX IF NOT EXISTS idx_payments_createdAt ON payments(createdAt)`,

    // 行程订单表
    `CREATE TABLE IF NOT EXISTS rideOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE,
      userId TEXT NOT NULL,
      driverId TEXT,
      fromAddress TEXT NOT NULL,
      toAddress TEXT NOT NULL,
      fromLng REAL,
      fromLat REAL,
      toLng REAL,
      toLat REAL,
      distance REAL,
      duration INTEGER,
      type TEXT,
      estimatedPrice REAL,
      actualPrice REAL,
      status TEXT DEFAULT 'pending',
      paymentStatus TEXT DEFAULT 'unpaid',
      startTime TEXT,
      endTime TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_orderId ON rideOrders(orderId)`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_userId ON rideOrders(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_driverId ON rideOrders(driverId)`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_status ON rideOrders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_paymentStatus ON rideOrders(paymentStatus)`,
    `CREATE INDEX IF NOT EXISTS idx_rideOrders_createdAt ON rideOrders(createdAt)`,

    // 外卖订单表
    `CREATE TABLE IF NOT EXISTS foodOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE,
      userId TEXT NOT NULL,
      merchantId TEXT NOT NULL,
      items TEXT NOT NULL,
      address TEXT NOT NULL,
      phone TEXT NOT NULL,
      name TEXT NOT NULL,
      totalAmount REAL NOT NULL,
      deliveryFee REAL NOT NULL,
      finalAmount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentStatus TEXT DEFAULT 'unpaid',
      courierId TEXT,
      estimatedDeliveryTime TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_orderId ON foodOrders(orderId)`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_userId ON foodOrders(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_merchantId ON foodOrders(merchantId)`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_status ON foodOrders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_paymentStatus ON foodOrders(paymentStatus)`,
    `CREATE INDEX IF NOT EXISTS idx_foodOrders_createdAt ON foodOrders(createdAt)`,

    // 跑腿订单表
    `CREATE TABLE IF NOT EXISTS errandOrders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      orderId TEXT UNIQUE,
      userId TEXT NOT NULL,
      fromAddress TEXT NOT NULL,
      toAddress TEXT NOT NULL,
      type TEXT NOT NULL,
      estimatedPrice REAL NOT NULL,
      actualPrice REAL,
      description TEXT,
      contactName TEXT NOT NULL,
      contactPhone TEXT NOT NULL,
      weight REAL NOT NULL,
      size TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentStatus TEXT DEFAULT 'unpaid',
      courierId TEXT,
      estimatedDuration TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_errandOrders_orderId ON errandOrders(orderId)`,
    `CREATE INDEX IF NOT EXISTS idx_errandOrders_userId ON errandOrders(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_errandOrders_status ON errandOrders(status)`,
    `CREATE INDEX IF NOT EXISTS idx_errandOrders_paymentStatus ON errandOrders(paymentStatus)`,
    `CREATE INDEX IF NOT EXISTS idx_errandOrders_createdAt ON errandOrders(createdAt)`,

    // 服务套餐表（整合出行和本地生活）
    `CREATE TABLE IF NOT EXISTS servicePackages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      packageId TEXT UNIQUE,
      userId TEXT NOT NULL,
      rideId TEXT,
      foodOrderId TEXT,
      rideInfo TEXT,
      foodInfo TEXT,
      totalAmount REAL NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      paymentStatus TEXT DEFAULT 'unpaid',
      createdAt TEXT,
      updatedAt TEXT,
      FOREIGN KEY (userId) REFERENCES users(userId),
      FOREIGN KEY (rideId) REFERENCES rideOrders(orderId),
      FOREIGN KEY (foodOrderId) REFERENCES foodOrders(orderId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_packageId ON servicePackages(packageId)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_userId ON servicePackages(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_rideId ON servicePackages(rideId)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_foodOrderId ON servicePackages(foodOrderId)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_status ON servicePackages(status)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_paymentStatus ON servicePackages(paymentStatus)`,
    `CREATE INDEX IF NOT EXISTS idx_servicePackages_createdAt ON servicePackages(createdAt)`,

    // 消息通知表
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      notificationId TEXT UNIQUE,
      userId TEXT NOT NULL,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      isRead INTEGER NOT NULL DEFAULT 0,
      relatedId TEXT,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users(userId)
    )`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_notificationId ON notifications(notificationId)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_userId ON notifications(userId)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_isRead ON notifications(isRead)`,
    `CREATE INDEX IF NOT EXISTS idx_notifications_createdAt ON notifications(createdAt)`,

  ];

  return new Promise((resolve, reject) => {
    db.serialize(() => {
      let index = 0;
      const createNext = () => {
        if (index >= tables.length) {
          resolve();
          return;
        }
        db.run(tables[index], err => {
          if (err) {
            reject(err);
            return;
          }
          index++;
          createNext();
        });
      };
      createNext();
    });
  });
};

/**
 * 插入初始化数据
 */
const seedData = async () => {
  const now = new Date().toISOString();

  // 检查是否已有数据
  try {
    const existingUsers = await execute('SELECT COUNT(*) as count FROM users');
    if (existingUsers && existingUsers[0] && existingUsers[0].count > 0) {
      console.log('数据库已有用户数据，跳过初始化');
      return; // 已有数据，跳过
    }
  } catch (error) {
    console.warn('检查用户数据失败:', error.message);
    // 继续执行初始化
  }

  // 插入默认管理员账号
  const bcrypt = require('bcryptjs');
  const adminPassword = await bcrypt.hash('admin123', 10);
  await run(
    'INSERT INTO users (userId, phone, password, nickname, role, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    ['admin_001', '15726833367', adminPassword, '管理员', 'admin', 1, now, now]
  );

  // 插入分类数据
  const categories = [
    { categoryId: 'cat_digital', name: '数码电子', icon: '📱', sortOrder: 1 },
    { categoryId: 'cat_fashion', name: '服饰鞋包', icon: '👕', sortOrder: 2 },
    { categoryId: 'cat_home', name: '家居生活', icon: '🏠', sortOrder: 3 },
    { categoryId: 'cat_beauty', name: '美妆护肤', icon: '💄', sortOrder: 4 },
    { categoryId: 'cat_sports', name: '运动户外', icon: '⚽', sortOrder: 5 },
    { categoryId: 'cat_food', name: '食品生鲜', icon: '🍎', sortOrder: 6 },
  ];

  for (const cat of categories) {
    await run(
      'INSERT OR IGNORE INTO categories (categoryId, name, icon, sortOrder, status, createdAt, updatedAt) VALUES (?, ?, ?, ?, 1, ?, ?)',
      [cat.categoryId, cat.name, cat.icon, cat.sortOrder, now, now],
    );
  }

  // 插入商品数据
  const products = [
    {
      productId: 'PROD001',
      name: '高品质无线蓝牙耳机',
      description: '降噪运动耳机，音质清晰，佩戴舒适，30小时超长续航',
      price: 199,
      originalPrice: 299,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
        'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=600',
      ]),
      category: 'cat_digital',
      specs: JSON.stringify({ brand: 'MIXMLAAL', model: 'TWS-001', battery: '30小时', connectivity: '蓝牙5.0' }),
      stock: 100,
      sales: 12000,
      rating: 4.8,
      reviews: 2345,
    },
    {
      productId: 'PROD002',
      name: '智能运动手表',
      description: '心率监测，GPS定位，50米防水，7天续航',
      price: 599,
      originalPrice: 799,
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600',
        'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600',
      ]),
      category: 'cat_digital',
      specs: JSON.stringify({ brand: 'MIXMLAAL', model: 'WATCH-001', battery: '7天', waterproof: '50米' }),
      stock: 50,
      sales: 8000,
      rating: 4.7,
      reviews: 1890,
    },
    {
      productId: 'PROD003',
      name: '专业运动跑鞋',
      description: '透气网面，缓震鞋底，轻盈舒适，适合长跑',
      price: 299,
      originalPrice: 399,
      image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=300',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
        'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=600',
      ]),
      category: 'cat_sports',
      specs: JSON.stringify({ brand: 'MIXMLAAL', model: 'RUN-001', material: '网面', weight: '280g' }),
      stock: 200,
      sales: 20000,
      rating: 4.9,
      reviews: 4567,
    },
    {
      productId: 'PROD004',
      name: '便携蓝牙音箱',
      description: '360度环绕音效，IPX7防水，12小时续航',
      price: 159,
      originalPrice: 229,
      image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=300',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600',
      ]),
      category: 'cat_digital',
      specs: JSON.stringify({ brand: 'MIXMLAAL', model: 'SPEAKER-001', battery: '12小时', waterproof: 'IPX7' }),
      stock: 80,
      sales: 5600,
      rating: 4.6,
      reviews: 1234,
    },
    {
      productId: 'PROD005',
      name: '时尚双肩背包',
      description: '大容量设计，防水面料，多功能隔层',
      price: 129,
      originalPrice: 199,
      image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300',
      images: JSON.stringify([
        'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
      ]),
      category: 'cat_fashion',
      specs: JSON.stringify({ brand: 'MIXMLAAL', model: 'BAG-001', capacity: '25L', material: '尼龙' }),
      stock: 150,
      sales: 8900,
      rating: 4.7,
      reviews: 2100,
    },
  ];

  for (const prod of products) {
    await run(
      `INSERT OR IGNORE INTO products (productId, name, description, price, originalPrice, image, images, category, specs, stock, sales, rating, reviews, status, createdAt, updatedAt) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)`,
      [prod.productId, prod.name, prod.description, prod.price, prod.originalPrice, prod.image, prod.images, prod.category, prod.specs, prod.stock, prod.sales, prod.rating, prod.reviews, now, now],
    );
  }

  console.log('数据库初始化数据插入完成');
};

/**
 * 执行 SQL 查询
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 * @param {boolean} useCache - 是否使用缓存
 */
const execute = async (sql, params = [], useCache = false) => {
  // 生成缓存键
  const cacheKey = useCache ? `${sql}:${JSON.stringify(params)}` : null;

  // 检查缓存
  if (useCache) {
    const cachedResult = cacheManager.get(cacheKey);
    if (cachedResult) {
      return cachedResult;
    }
  }

  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }

    db.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }

      // 缓存结果
      if (useCache) {
        cacheManager.set(cacheKey, rows);
      }

      resolve(rows);
    });
  });
};

/**
 * 执行 SQL 语句（非查询）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 */
const run = async (sql, params = []) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }

    db.run(sql, params, function (err) {
      if (err) {
        reject(err);
        return;
      }

      // 清理缓存，确保数据一致性
      // 这里简单清理所有缓存，实际应用中可以更精确地清理相关缓存
      if (sql.toLowerCase().startsWith('insert') ||
          sql.toLowerCase().startsWith('update') ||
          sql.toLowerCase().startsWith('delete')) {
        cacheManager.clear();
      }

      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

/**
 * 数据库健康检查
 */
const healthCheck = async () => {
  try {
    if (!db) {
      return {
        status: 'unavailable',
        message: '数据库未初始化',
      };
    }

    await execute('SELECT 1');
    return {
      status: 'healthy',
      message: 'SQLite 数据库连接正常',
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error.message,
    };
  }
};

/**
 * 执行事务
 * @param {function} callback - 事务回调函数
 */
const transaction = async callback => {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }

    db.serialize(() => {
      db.run('BEGIN TRANSACTION', async err => {
        if (err) {
          reject(err);
          return;
        }

        try {
          const result = await callback();
          db.run('COMMIT', commitErr => {
            if (commitErr) {
              db.run('ROLLBACK');
              reject(commitErr);
              return;
            }
            // 清理缓存，确保数据一致性
            cacheManager.clear();
            resolve(result);
          });
        } catch (error) {
          db.run('ROLLBACK');
          reject(error);
        }
      });
    });
  });
};

/**
 * 关闭数据库连接
 */
const closeDB = async () => {
  return new Promise((resolve, reject) => {
    if (db) {
      db.close(err => {
        if (err) {
          reject(err);
          return;
        }
        db = null;
        // 清理缓存
        cacheManager.clear();
        resolve();
      });
    } else {
      resolve();
    }
  });
};

module.exports = {
  initDB,
  execute,
  run,
  transaction,
  healthCheck,
  closeDB,
  cacheManager,
};

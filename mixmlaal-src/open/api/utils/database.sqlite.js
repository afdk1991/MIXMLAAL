/**
 * 内存数据库管理
 * 版本: v1.0.0.0
 * 说明: 轻量级内存数据库，用于开发和测试环境
 */

// 内存数据存储
const data = {
  users: [],
  orders: [],
  categories: [],
  products: [],
  cart: [],
  payments: [],
  rideOrders: [],
  foodOrders: [],
  errandOrders: []
};

// 自增ID
const autoIncrement = {
  users: 1,
  orders: 1,
  categories: 1,
  products: 1,
  cart: 1,
  payments: 1,
  rideOrders: 1,
  foodOrders: 1,
  errandOrders: 1
};

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
  }
};

/**
 * 初始化数据库
 */
const initDB = async () => {
  try {
    console.log('开始初始化内存数据库...');
    
    // 初始化表结构（内存数据库不需要创建表）
    // 插入初始化数据
    await seedData();
    
    console.log('内存数据库初始化完成');
    return true;
  } catch (error) {
    console.error('数据库初始化失败:', error.message);
    throw error;
  }
};

/**
 * 插入初始化数据
 */
const seedData = async () => {
  const now = new Date().toISOString();

  // 检查是否已有数据
  if (data.products.length > 0) {
    return; // 已有数据，跳过
  }

  // 插入分类数据
  const categories = [
    { categoryId: 'cat_digital', name: '数码电子', icon: '📱', sortOrder: 1, status: 1, createdAt: now, updatedAt: now },
    { categoryId: 'cat_fashion', name: '服饰鞋包', icon: '👕', sortOrder: 2, status: 1, createdAt: now, updatedAt: now },
    { categoryId: 'cat_home', name: '家居生活', icon: '🏠', sortOrder: 3, status: 1, createdAt: now, updatedAt: now },
    { categoryId: 'cat_beauty', name: '美妆护肤', icon: '💄', sortOrder: 4, status: 1, createdAt: now, updatedAt: now },
    { categoryId: 'cat_sports', name: '运动户外', icon: '⚽', sortOrder: 5, status: 1, createdAt: now, updatedAt: now },
    { categoryId: 'cat_food', name: '食品生鲜', icon: '🍎', sortOrder: 6, status: 1, createdAt: now, updatedAt: now },
  ];

  for (const cat of categories) {
    cat.id = autoIncrement.categories++;
    data.categories.push(cat);
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
      status: 1,
      createdAt: now,
      updatedAt: now
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
      status: 1,
      createdAt: now,
      updatedAt: now
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
      status: 1,
      createdAt: now,
      updatedAt: now
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
      status: 1,
      createdAt: now,
      updatedAt: now
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
      status: 1,
      createdAt: now,
      updatedAt: now
    },
  ];

  for (const prod of products) {
    prod.id = autoIncrement.products++;
    data.products.push(prod);
  }

  // 添加示例用户
  const sampleUser = {
    id: autoIncrement.users++,
    userId: 'user_1234567890',
    phone: '13800138000',
    password: '$2a$10$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', // 密码: 123456
    nickname: '测试用户',
    status: 1,
    createdAt: now,
    updatedAt: now
  };
  data.users.push(sampleUser);

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

  try {
    // 简单的SQL解析，只支持基本的SELECT语句
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.startsWith('select')) {
      // 提取表名
      const tableMatch = lowerSql.match(/from\s+(\w+)/);
      if (!tableMatch) {
        return [];
      }
      const tableName = tableMatch[1];
      
      if (!data[tableName]) {
        return [];
      }
      
      // 简单的WHERE条件处理
      let result = [...data[tableName]];
      
      const whereMatch = lowerSql.match(/where\s+(.+)/);
      if (whereMatch) {
        const whereClause = whereMatch[1];
        // 简单处理 = 条件
        const eqMatch = whereClause.match(/(\w+)\s*=\s*\?/);
        if (eqMatch && params.length > 0) {
          const field = eqMatch[1];
          const value = params[0];
          result = result.filter(item => item[field] == value);
        }
      }
      
      // 处理COUNT(*)
      if (lowerSql.includes('count(*)')) {
        return [{ count: result.length }];
      }
      
      // 缓存结果
      if (useCache) {
        cacheManager.set(cacheKey, result);
      }
      
      return result;
    }
    
    return [];
  } catch (error) {
    console.error('执行查询失败:', error.message);
    return [];
  }
};

/**
 * 执行 SQL 语句（非查询）
 * @param {string} sql - SQL语句
 * @param {Array} params - 参数
 */
const run = async (sql, params = []) => {
  try {
    const lowerSql = sql.toLowerCase();
    
    if (lowerSql.startsWith('insert')) {
      // 提取表名
      const tableMatch = lowerSql.match(/into\s+(\w+)/);
      if (!tableMatch) {
        return { changes: 0 };
      }
      const tableName = tableMatch[1];
      
      if (!data[tableName]) {
        return { changes: 0 };
      }
      
      // 简单的插入处理
      const fieldsMatch = lowerSql.match(/\(([^)]+)\)\s+values\s+\(([^)]+)\)/);
      if (fieldsMatch) {
        const fields = fieldsMatch[1].split(',').map(f => f.trim());
        const values = params;
        
        const newItem = {
          id: autoIncrement[tableName]++
        };
        
        fields.forEach((field, index) => {
          if (field !== 'id') {
            newItem[field] = values[index];
          }
        });
        
        data[tableName].push(newItem);
        // 清理缓存
        cacheManager.clear();
        return { lastID: newItem.id, changes: 1 };
      }
    } else if (lowerSql.startsWith('update')) {
      // 简单的更新处理
      const tableMatch = lowerSql.match(/update\s+(\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        
        if (!data[tableName]) {
          return { changes: 0 };
        }
        
        const setMatch = lowerSql.match(/set\s+(.+?)\s+where/);
        const whereMatch = lowerSql.match(/where\s+(.+)/);
        
        if (setMatch && whereMatch) {
          const setClause = setMatch[1];
          const whereClause = whereMatch[1];
          
          // 简单处理 = 条件
          const eqMatch = whereClause.match(/(\w+)\s*=\s*\?/);
          if (eqMatch && params.length > 0) {
            const field = eqMatch[1];
            const value = params[params.length - 1];
            
            let changes = 0;
            data[tableName].forEach(item => {
              if (item[field] == value) {
                // 处理SET子句
                const setPairs = setClause.split(',').map(p => p.trim());
                setPairs.forEach(pair => {
                  const [setField, _] = pair.split('=').map(p => p.trim());
                  const setIndex = setPairs.indexOf(pair);
                  item[setField] = params[setIndex];
                });
                changes++;
              }
            });
            
            // 清理缓存
            cacheManager.clear();
            return { changes };
          }
        }
      }
    } else if (lowerSql.startsWith('delete')) {
      // 简单的删除处理
      const tableMatch = lowerSql.match(/from\s+(\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        
        if (!data[tableName]) {
          return { changes: 0 };
        }
        
        const whereMatch = lowerSql.match(/where\s+(.+)/);
        if (whereMatch) {
          const whereClause = whereMatch[1];
          // 简单处理 = 条件
          const eqMatch = whereClause.match(/(\w+)\s*=\s*\?/);
          if (eqMatch && params.length > 0) {
            const field = eqMatch[1];
            const value = params[0];
            
            const initialLength = data[tableName].length;
            data[tableName] = data[tableName].filter(item => item[field] != value);
            const changes = initialLength - data[tableName].length;
            
            // 清理缓存
            cacheManager.clear();
            return { changes };
          }
        }
      }
    }
    
    return { changes: 0 };
  } catch (error) {
    console.error('执行操作失败:', error.message);
    return { changes: 0 };
  }
};

/**
 * 数据库健康检查
 */
const healthCheck = async () => {
  try {
    return {
      status: 'healthy',
      message: '内存数据库运行正常',
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
const transaction = async (callback) => {
  try {
    const result = await callback();
    // 清理缓存，确保数据一致性
    cacheManager.clear();
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * 关闭数据库连接
 */
const closeDB = async () => {
  try {
    // 清理缓存
    cacheManager.clear();
    console.log('内存数据库已关闭');
    return;
  } catch (error) {
    console.error('关闭数据库失败:', error.message);
    throw error;
  }
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

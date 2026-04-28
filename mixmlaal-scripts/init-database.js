const { sequelize } = require('../mixmlaal-apps/mixmlaal-api-node/src/models');

const initDatabase = async () => {
  try {
    console.log('开始初始化数据库...');

    await sequelize.authenticate();
    console.log('数据库连接成功');

    await sequelize.sync({ force: process.env.NODE_ENV === 'development' });
    console.log('数据表同步完成');

    const { Role, Permission, Category, MembershipLevel, GrowthTask } = require('../MIXMLAAL-apps/MIXMLAAL-api-node/src/models');

    const roles = [
      { name: '超级管理员', code: 'super_admin', description: '系统超级管理员，拥有所有权限' },
      { name: '普通管理员', code: 'admin', description: '普通管理员' },
      { name: '普通用户', code: 'user', description: '普通用户' },
      { name: '配送员', code: 'delivery', description: '配送人员' },
      { name: '商家', code: 'merchant', description: '商家用户' }
    ];

    for (const roleData of roles) {
      await Role.findOrCreate({ where: { code: roleData.code }, defaults: roleData });
    }
    console.log('角色初始化完成');

    const permissions = [
      { name: '用户管理', code: 'user:list', type: 'button', url: '/api/v1/users', method: 'GET' },
      { name: '用户创建', code: 'user:create', type: 'button', url: '/api/v1/users', method: 'POST' },
      { name: '用户编辑', code: 'user:update', type: 'button', url: '/api/v1/users/:id', method: 'PUT' },
      { name: '用户删除', code: 'user:delete', type: 'button', url: '/api/v1/users/:id', method: 'DELETE' },
      { name: '订单管理', code: 'order:list', type: 'button', url: '/api/v1/order/*', method: 'GET' },
      { name: '订单处理', code: 'order:process', type: 'button', url: '/api/v1/order/*', method: 'PUT' },
      { name: '商品管理', code: 'product:list', type: 'button', url: '/api/v1/product/*', method: 'GET' },
      { name: '商品创建', code: 'product:create', type: 'button', url: '/api/v1/product/*', method: 'POST' },
      { name: '数据统计', code: 'stats:view', type: 'button', url: '/api/v1/analytics/*', method: 'GET' }
    ];

    for (const permData of permissions) {
      await Permission.findOrCreate({ where: { code: permData.code }, defaults: permData });
    }
    console.log('权限初始化完成');

    const categories = [
      { name: '数码电子', icon: 'fa-mobile', sort: 1 },
      { name: '服装鞋包', icon: 'fa-tshirt', sort: 2 },
      { name: '食品生鲜', icon: 'fa-apple-alt', sort: 3 },
      { name: '美妆护肤', icon: 'fa-spa', sort: 4 },
      { name: '家居生活', icon: 'fa-home', sort: 5 },
      { name: '图书音像', icon: 'fa-book', sort: 6 },
      { name: '运动户外', icon: 'fa-running', sort: 7 },
      { name: '母婴用品', icon: 'fa-baby', sort: 8 }
    ];

    for (const catData of categories) {
      await Category.findOrCreate({ where: { name: catData.name }, defaults: catData });
    }
    console.log('分类初始化完成');

    const levels = [
      { name: '普通会员', level: 1, minGrowth: 0, discount: 1.0, pointsMultiplier: 1.0 },
      { name: '青铜会员', level: 2, minGrowth: 500, discount: 0.98, pointsMultiplier: 1.2 },
      { name: '白银会员', level: 3, minGrowth: 2000, discount: 0.95, pointsMultiplier: 1.5 },
      { name: '黄金会员', level: 4, minGrowth: 5000, discount: 0.92, pointsMultiplier: 2.0 },
      { name: '铂金会员', level: 5, minGrowth: 10000, discount: 0.88, pointsMultiplier: 3.0 }
    ];

    for (const levelData of levels) {
      await MembershipLevel.findOrCreate({ where: { name: levelData.name }, defaults: levelData });
    }
    console.log('会员等级初始化完成');

    const tasks = [
      { name: '每日签到', type: 'daily', growthValue: 10, points: 5, status: 'active' },
      { name: '完成首单', type: 'once', growthValue: 50, points: 20, status: 'active' },
      { name: '分享商品', type: 'daily', growthValue: 5, points: 2, status: 'active' },
      { name: '评价订单', type: 'daily', growthValue: 10, points: 5, status: 'active' },
      { name: '邀请好友', type: 'once', growthValue: 100, points: 50, status: 'active' },
      { name: '完善资料', type: 'once', growthValue: 20, points: 10, status: 'active' },
      { name: '绑定手机', type: 'once', growthValue: 30, points: 15, status: 'active' },
      { name: '周订单满5单', type: 'once', growthValue: 100, points: 50, status: 'active' }
    ];

    for (const taskData of tasks) {
      await GrowthTask.findOrCreate({ where: { name: taskData.name }, defaults: taskData });
    }
    console.log('成长任务初始化完成');

    console.log('数据库初始化完成！');
    process.exit(0);
  } catch (error) {
    console.error('数据库初始化失败:', error);
    process.exit(1);
  }
};

initDatabase();

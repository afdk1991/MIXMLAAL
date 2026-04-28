const { GrowthTask } = require('../models');

async function initGrowthTasks() {
  try {
    const tasks = [
      {
        name: '每日登录',
        description: '每天登录APP一次',
        type: 'daily',
        category: 'login',
        target: 1,
        rewardPoints: 10,
        rewardGrowthPoints: 5,
        icon: '📱',
        level: 'normal',
        isActive: true,
        sortOrder: 1
      },
      {
        name: '每日下单',
        description: '每天完成一次订单',
        type: 'daily',
        category: 'order',
        target: 1,
        rewardPoints: 50,
        rewardGrowthPoints: 20,
        icon: '🛒',
        level: 'normal',
        isActive: true,
        sortOrder: 2
      },
      {
        name: '每日评价',
        description: '每天完成一次商品评价',
        type: 'daily',
        category: 'review',
        target: 1,
        rewardPoints: 20,
        rewardGrowthPoints: 10,
        icon: '⭐',
        level: 'normal',
        isActive: true,
        sortOrder: 3
      },
      {
        name: '每日分享',
        description: '每天分享一次商品或内容',
        type: 'daily',
        category: 'share',
        target: 1,
        rewardPoints: 15,
        rewardGrowthPoints: 8,
        icon: '📤',
        level: 'normal',
        isActive: true,
        sortOrder: 4
      },
      {
        name: '每周下单',
        description: '每周完成5次订单',
        type: 'weekly',
        category: 'order',
        target: 5,
        rewardPoints: 200,
        rewardGrowthPoints: 100,
        icon: '📦',
        level: 'bronze',
        isActive: true,
        sortOrder: 5
      },
      {
        name: '每周评价',
        description: '每周完成10次商品评价',
        type: 'weekly',
        category: 'review',
        target: 10,
        rewardPoints: 100,
        rewardGrowthPoints: 50,
        icon: '📝',
        level: 'bronze',
        isActive: true,
        sortOrder: 6
      },
      {
        name: '每月下单',
        description: '每月完成20次订单',
        type: 'monthly',
        category: 'order',
        target: 20,
        rewardPoints: 500,
        rewardGrowthPoints: 250,
        icon: '🏆',
        level: 'silver',
        isActive: true,
        sortOrder: 7
      },
      {
        name: '邀请好友',
        description: '成功邀请1位好友注册',
        type: 'once',
        category: 'promotion',
        target: 1,
        rewardPoints: 100,
        rewardGrowthPoints: 50,
        icon: '👥',
        level: 'normal',
        isActive: true,
        sortOrder: 8
      },
      {
        name: '邀请3位好友',
        description: '成功邀请3位好友注册',
        type: 'once',
        category: 'promotion',
        target: 3,
        rewardPoints: 350,
        rewardGrowthPoints: 150,
        icon: '🎉',
        level: 'bronze',
        isActive: true,
        sortOrder: 9
      },
      {
        name: '邀请10位好友',
        description: '成功邀请10位好友注册',
        type: 'once',
        category: 'promotion',
        target: 10,
        rewardPoints: 1500,
        rewardGrowthPoints: 500,
        icon: '🎊',
        level: 'silver',
        isActive: true,
        sortOrder: 10
      },
      {
        name: '累计消费1000元',
        description: '累计消费满1000元',
        type: 'once',
        category: 'order',
        target: 1000,
        rewardPoints: 500,
        rewardGrowthPoints: 200,
        icon: '💰',
        level: 'bronze',
        isActive: true,
        sortOrder: 11
      },
      {
        name: '累计消费5000元',
        description: '累计消费满5000元',
        type: 'once',
        category: 'order',
        target: 5000,
        rewardPoints: 3000,
        rewardGrowthPoints: 1000,
        icon: '💎',
        level: 'silver',
        isActive: true,
        sortOrder: 12
      },
      {
        name: '累计消费10000元',
        description: '累计消费满10000元',
        type: 'once',
        category: 'order',
        target: 10000,
        rewardPoints: 8000,
        rewardGrowthPoints: 3000,
        icon: '👑',
        level: 'gold',
        isActive: true,
        sortOrder: 13
      }
    ];

    for (const task of tasks) {
      const existingTask = await GrowthTask.findOne({ where: { name: task.name } });
      if (!existingTask) {
        await GrowthTask.create(task);
        console.log(`创建成长任务: ${task.name}`);
      }
    }

    console.log('成长任务初始化完成');
  } catch (error) {
    console.error('初始化成长任务失败:', error);
  }
}

if (require.main === module) {
  initGrowthTasks();
}

module.exports = initGrowthTasks;
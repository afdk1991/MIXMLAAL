const { MembershipLevel } = require('../models');

async function initMembershipLevels() {
  try {
    const levels = [
      {
        name: '普通会员',
        level: 'normal',
        price: 0,
        discount: 0,
        pointsMultiplier: 1,
        duration: 0,
        benefits: '基础会员权益',
        levelOrder: 0
      },
      {
        name: '青铜会员',
        level: 'bronze',
        price: 1000,
        discount: 5,
        pointsMultiplier: 1.2,
        duration: 30,
        benefits: '5%折扣，1.2倍积分',
        levelOrder: 1
      },
      {
        name: '白银会员',
        level: 'silver',
        price: 2000,
        discount: 10,
        pointsMultiplier: 1.5,
        duration: 60,
        benefits: '10%折扣，1.5倍积分',
        levelOrder: 2
      },
      {
        name: '黄金会员',
        level: 'gold',
        price: 5000,
        discount: 15,
        pointsMultiplier: 2,
        duration: 90,
        benefits: '15%折扣，2倍积分',
        levelOrder: 3
      },
      {
        name: '铂金会员',
        level: 'platinum',
        price: 10000,
        discount: 20,
        pointsMultiplier: 2.5,
        duration: 180,
        benefits: '20%折扣，2.5倍积分',
        levelOrder: 4
      }
    ];

    for (const level of levels) {
      const existingLevel = await MembershipLevel.findOne({ where: { level: level.level } });
      if (!existingLevel) {
        await MembershipLevel.create(level);
        console.log(`创建会员等级: ${level.name}`);
      }
    }

    console.log('会员等级初始化完成');
  } catch (error) {
    console.error('初始化会员等级失败:', error);
  }
}

if (require.main === module) {
  initMembershipLevels();
}

module.exports = initMembershipLevels;
const { DataTypes } = require('sequelize');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // 创建 roles 表
    await queryInterface.createTable('roles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // 创建 permissions 表
    await queryInterface.createTable('permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true
      },
      description: {
        type: DataTypes.STRING(200),
        allowNull: true
      },
      parentId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'permissions',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('active', 'inactive'),
        allowNull: false,
        defaultValue: 'active'
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // 创建 user_roles 表
    await queryInterface.createTable('user_roles', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // 创建 role_permissions 表
    await queryInterface.createTable('role_permissions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      roleId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'roles',
          key: 'id'
        }
      },
      permissionId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'permissions',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    });

    // 插入初始数据
    await queryInterface.bulkInsert('roles', [
      { name: '管理员', description: '系统管理员', status: 'active' },
      { name: '普通用户', description: '普通用户', status: 'active' },
      { name: '运营人员', description: '运营人员', status: 'active' }
    ]);

    await queryInterface.bulkInsert('permissions', [
      { name: '仪表盘', code: 'dashboard', description: '仪表盘权限' },
      { name: '查看仪表盘', code: 'dashboard:view', description: '查看仪表盘权限', parentId: 1 },
      { name: '用户管理', code: 'users', description: '用户管理权限' },
      { name: '查看用户', code: 'users:view', description: '查看用户权限', parentId: 3 },
      { name: '新增用户', code: 'users:add', description: '新增用户权限', parentId: 3 },
      { name: '编辑用户', code: 'users:edit', description: '编辑用户权限', parentId: 3 },
      { name: '删除用户', code: 'users:delete', description: '删除用户权限', parentId: 3 },
      { name: '角色管理', code: 'roles', description: '角色管理权限' },
      { name: '查看角色', code: 'roles:view', description: '查看角色权限', parentId: 8 },
      { name: '新增角色', code: 'roles:add', description: '新增角色权限', parentId: 8 },
      { name: '编辑角色', code: 'roles:edit', description: '编辑角色权限', parentId: 8 },
      { name: '删除角色', code: 'roles:delete', description: '删除角色权限', parentId: 8 },
      { name: '权限管理', code: 'permissions', description: '权限管理权限' },
      { name: '查看权限', code: 'permissions:view', description: '查看权限权限', parentId: 13 },
      { name: '新增权限', code: 'permissions:add', description: '新增权限权限', parentId: 13 },
      { name: '编辑权限', code: 'permissions:edit', description: '编辑权限权限', parentId: 13 },
      { name: '删除权限', code: 'permissions:delete', description: '删除权限权限', parentId: 13 },
      { name: '数据统计', code: 'statistics', description: '数据统计权限' },
      { name: '查看统计', code: 'statistics:view', description: '查看统计权限', parentId: 18 }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    // 删除表
    await queryInterface.dropTable('role_permissions');
    await queryInterface.dropTable('user_roles');
    await queryInterface.dropTable('permissions');
    await queryInterface.dropTable('roles');
  }
};
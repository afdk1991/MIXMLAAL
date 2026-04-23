const User = require('./User');
const Role = require('./Role');
const Permission = require('./Permission');
const UserRole = require('./UserRole');
const RolePermission = require('./RolePermission');
const Menu = require('./Menu');

// 定义模型关系

// User 和 Role 多对多关系
User.belongsToMany(Role, {
  through: UserRole,
  foreignKey: 'user_id',
  otherKey: 'role_id',
  as: 'roles'
});

Role.belongsToMany(User, {
  through: UserRole,
  foreignKey: 'role_id',
  otherKey: 'user_id',
  as: 'users'
});

// Role 和 Permission 多对多关系
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'role_id',
  otherKey: 'permission_id',
  as: 'permissions'
});

Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permission_id',
  otherKey: 'role_id',
  as: 'roles'
});

// 定义Menu模型的关联关系
Menu.hasMany(Menu, {
  foreignKey: 'parent_id',
  as: 'children'
});

Menu.belongsTo(Menu, {
  foreignKey: 'parent_id',
  as: 'parent'
});

module.exports = {
  User,
  Role,
  Permission,
  UserRole,
  RolePermission,
  Menu
};
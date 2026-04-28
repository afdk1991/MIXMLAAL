const Permission = require('../models/Permission');

// 获取权限列表
exports.getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    res.status(200).json(permissions);
  } catch (error) {
    res.status(500).json({ message: '获取权限列表失败', error });
  }
};

// 获取单个权限
exports.getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: '获取权限失败', error });
  }
};

// 创建权限
exports.createPermission = async (req, res) => {
  try {
    const { name, code, description, parentId } = req.body;
    const permission = await Permission.create({ name, code, description, parentId });
    res.status(201).json(permission);
  } catch (error) {
    res.status(500).json({ message: '创建权限失败', error });
  }
};

// 更新权限
exports.updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, description, parentId } = req.body;
    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }
    await permission.update({ name, code, description, parentId });
    res.status(200).json(permission);
  } catch (error) {
    res.status(500).json({ message: '更新权限失败', error });
  }
};

// 删除权限
exports.deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await Permission.findByPk(id);
    if (!permission) {
      return res.status(404).json({ message: '权限不存在' });
    }
    await permission.destroy();
    res.status(200).json({ message: '权限删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除权限失败', error });
  }
};

// 获取权限树
exports.getPermissionTree = async (req, res) => {
  try {
    const permissions = await Permission.findAll();
    const permissionMap = new Map();
    const rootPermissions = [];

    // 构建权限映射
    permissions.forEach(permission => {
      permissionMap.set(permission.id, {
        id: permission.id,
        name: permission.name,
        code: permission.code,
        description: permission.description,
        children: []
      });
    });

    // 构建权限树
    permissions.forEach(permission => {
      if (permission.parentId === null || permission.parentId === undefined) {
        rootPermissions.push(permissionMap.get(permission.id));
      } else {
        const parent = permissionMap.get(permission.parentId);
        if (parent) {
          parent.children.push(permissionMap.get(permission.id));
        }
      }
    });

    res.status(200).json(rootPermissions);
  } catch (error) {
    res.status(500).json({ message: '获取权限树失败', error });
  }
};
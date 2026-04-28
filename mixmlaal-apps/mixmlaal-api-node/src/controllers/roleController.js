const Role = require('../models/Role');

// 获取角色列表
exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll();
    res.status(200).json(roles);
  } catch (error) {
    res.status(500).json({ message: '获取角色列表失败', error });
  }
};

// 获取单个角色
exports.getRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: '获取角色失败', error });
  }
};

// 创建角色
exports.createRole = async (req, res) => {
  try {
    const { name, description } = req.body;
    const role = await Role.create({ name, description });
    res.status(201).json(role);
  } catch (error) {
    res.status(500).json({ message: '创建角色失败', error });
  }
};

// 更新角色
exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    await role.update({ name, description });
    res.status(200).json(role);
  } catch (error) {
    res.status(500).json({ message: '更新角色失败', error });
  }
};

// 删除角色
exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    await role.destroy();
    res.status(200).json({ message: '角色删除成功' });
  } catch (error) {
    res.status(500).json({ message: '删除角色失败', error });
  }
};

// 分配权限给角色
exports.assignPermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissions } = req.body;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    // 这里需要实现权限分配逻辑，暂时返回成功
    res.status(200).json({ message: '权限分配成功' });
  } catch (error) {
    res.status(500).json({ message: '分配权限失败', error });
  }
};

// 获取角色的权限
exports.getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    // 这里需要实现获取角色权限的逻辑，暂时返回空数组
    res.status(200).json([]);
  } catch (error) {
    res.status(500).json({ message: '获取角色权限失败', error });
  }
};
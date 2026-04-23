const { Menu } = require('../models')
const { Op } = require('sequelize')

// 获取菜单列表
const getMenuList = async (req, res) => {
  try {
    const { page = 1, page_size = 10, search = '', status = '' } = req.query
    
    const where = {}
    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }
    if (status) {
      where.status = status
    }
    
    const menus = await Menu.findAll({
      where,
      limit: parseInt(page_size),
      offset: (parseInt(page) - 1) * parseInt(page_size),
      order: [['sort', 'ASC']]
    })
    
    const total = await Menu.count({ where })
    
    res.status(200).json({
      success: true,
      data: {
        list: menus,
        total
      },
      message: '获取菜单列表成功'
    })
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取菜单列表失败'
    })
  }
}

// 获取菜单树
const getMenuTree = async (req, res) => {
  try {
    const menus = await Menu.findAll({
      where: { status: 'active' },
      order: [['sort', 'ASC']]
    })
    
    // 构建菜单树
    const menuMap = new Map()
    const menuTree = []
    
    menus.forEach(menu => {
      menuMap.set(menu.id, { ...menu.dataValues, children: [] })
    })
    
    menus.forEach(menu => {
      if (menu.parent_id === null) {
        menuTree.push(menuMap.get(menu.id))
      } else {
        const parent = menuMap.get(menu.parent_id)
        if (parent) {
          parent.children.push(menuMap.get(menu.id))
        }
      }
    })
    
    res.status(200).json({
      success: true,
      data: menuTree,
      message: '获取菜单树成功'
    })
  } catch (error) {
    console.error('获取菜单树失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取菜单树失败'
    })
  }
}

// 获取单个菜单
const getMenuById = async (req, res) => {
  try {
    const { id } = req.params
    const menu = await Menu.findByPk(id)
    
    if (!menu) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '菜单不存在'
      })
    }
    
    res.status(200).json({
      success: true,
      data: menu,
      message: '获取菜单成功'
    })
  } catch (error) {
    console.error('获取菜单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '获取菜单失败'
    })
  }
}

// 创建菜单
const createMenu = async (req, res) => {
  try {
    const { name, code, path, icon, parent_id, sort, status } = req.body
    
    // 检查菜单编码是否已存在
    const existingMenu = await Menu.findOne({ where: { code } })
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '菜单编码已存在'
      })
    }
    
    const menu = await Menu.create({
      name,
      code,
      path,
      icon,
      parent_id,
      sort,
      status
    })
    
    res.status(201).json({
      success: true,
      data: menu,
      message: '创建菜单成功'
    })
  } catch (error) {
    console.error('创建菜单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '创建菜单失败'
    })
  }
}

// 更新菜单
const updateMenu = async (req, res) => {
  try {
    const { id } = req.params
    const { name, code, path, icon, parent_id, sort, status } = req.body
    
    const menu = await Menu.findByPk(id)
    if (!menu) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '菜单不存在'
      })
    }
    
    // 检查菜单编码是否已存在（排除当前菜单）
    const existingMenu = await Menu.findOne({ where: { code, id: { [Op.ne]: id } } })
    if (existingMenu) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '菜单编码已存在'
      })
    }
    
    await menu.update({
      name,
      code,
      path,
      icon,
      parent_id,
      sort,
      status
    })
    
    res.status(200).json({
      success: true,
      data: menu,
      message: '更新菜单成功'
    })
  } catch (error) {
    console.error('更新菜单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '更新菜单失败'
    })
  }
}

// 删除菜单
const deleteMenu = async (req, res) => {
  try {
    const { id } = req.params
    
    const menu = await Menu.findByPk(id)
    if (!menu) {
      return res.status(404).json({
        success: false,
        data: null,
        message: '菜单不存在'
      })
    }
    
    // 检查是否有子菜单
    const childMenus = await Menu.count({ where: { parent_id: id } })
    if (childMenus > 0) {
      return res.status(400).json({
        success: false,
        data: null,
        message: '该菜单下存在子菜单，无法删除'
      })
    }
    
    await menu.destroy()
    
    res.status(200).json({
      success: true,
      data: null,
      message: '删除菜单成功'
    })
  } catch (error) {
    console.error('删除菜单失败:', error)
    res.status(500).json({
      success: false,
      data: null,
      message: '删除菜单失败'
    })
  }
}

module.exports = {
  getMenuList,
  getMenuTree,
  getMenuById,
  createMenu,
  updateMenu,
  deleteMenu
}
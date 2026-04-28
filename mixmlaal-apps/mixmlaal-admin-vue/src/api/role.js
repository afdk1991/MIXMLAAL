import api from './index'

// 获取角色列表
export const getRoles = (params) => {
  return api.get('/role', { params })
}

// 获取单个角色
export const getRole = (id) => {
  return api.get(`/role/${id}`)
}

// 创建角色
export const createRole = (data) => {
  return api.post('/role', data)
}

// 更新角色
export const updateRole = (id, data) => {
  return api.put(`/role/${id}`, data)
}

// 删除角色
export const deleteRole = (id) => {
  return api.delete(`/role/${id}`)
}

// 分配权限给角色
export const assignPermissions = (roleId, permissions) => {
  return api.post(`/role/${roleId}/permissions`, { permissions })
}

// 获取角色的权限
export const getRolePermissions = (roleId) => {
  return api.get(`/role/${roleId}/permissions`)
}
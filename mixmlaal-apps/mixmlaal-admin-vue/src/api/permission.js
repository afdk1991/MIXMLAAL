import api from './index'

// 获取权限列表
export const getPermissions = (params) => {
  return api.get('/permission', { params })
}

// 获取单个权限
export const getPermission = (id) => {
  return api.get(`/permission/${id}`)
}

// 创建权限
export const createPermission = (data) => {
  return api.post('/permission', data)
}

// 更新权限
export const updatePermission = (id, data) => {
  return api.put(`/permission/${id}`, data)
}

// 删除权限
export const deletePermission = (id) => {
  return api.delete(`/permission/${id}`)
}

// 获取权限树
export const getPermissionTree = () => {
  return api.get('/permission/tree')
}
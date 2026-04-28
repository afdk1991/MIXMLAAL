import api from './index'

// 获取用户列表
export const getUsers = (params) => {
  return api.get('/user', { params })
}

// 获取单个用户
export const getUser = (id) => {
  return api.get(`/user/${id}`)
}

// 创建用户
export const createUser = (data) => {
  return api.post('/user', data)
}

// 更新用户
export const updateUser = (id, data) => {
  return api.put(`/user/${id}`, data)
}

// 删除用户
export const deleteUser = (id) => {
  return api.delete(`/user/${id}`)
}

// 批量删除用户
export const batchDeleteUsers = (ids) => {
  return api.post('/user/batch-delete', { ids })
}

// 分配角色给用户
export const assignRoles = (userId, roles) => {
  return api.post(`/user/${userId}/roles`, { roles })
}

// 获取用户的角色
export const getUserRoles = (userId) => {
  return api.get(`/user/${userId}/roles`)
}
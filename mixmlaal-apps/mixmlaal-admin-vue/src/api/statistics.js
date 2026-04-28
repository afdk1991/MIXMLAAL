import api from './index'

// 获取用户增长趋势
export const getUserGrowth = (params) => {
  return api.get('/analytics/user-growth', { params })
}

// 获取订单数量趋势
export const getOrderGrowth = (params) => {
  return api.get('/analytics/order-growth', { params })
}

// 获取用户角色分布
export const getUserRoleDistribution = () => {
  return api.get('/analytics/user-role-distribution')
}

// 获取订单类型分布
export const getOrderTypeDistribution = () => {
  return api.get('/analytics/order-type-distribution')
}

// 获取系统概览数据
export const getSystemOverview = () => {
  return api.get('/analytics/overview')
}
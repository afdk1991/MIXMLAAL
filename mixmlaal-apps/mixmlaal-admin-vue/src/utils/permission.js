import { useUserStore } from '../store/user'

// 检查用户是否具有指定权限
export const hasPermission = (permission) => {
  const userStore = useUserStore()
  return userStore.permissions.includes(permission)
}

// 检查用户是否具有指定角色
export const hasRole = (role) => {
  const userStore = useUserStore()
  return userStore.user.role === role
}

// 检查用户是否是管理员
export const isAdmin = () => {
  return hasRole('admin')
}

// 权限控制的路由守卫
export const permissionGuard = (to, from, next) => {
  const userStore = useUserStore()
  
  // 检查用户是否登录
  if (!userStore.isLoggedIn) {
    return next('/login')
  }
  
  // 检查用户是否具有访问该路由的权限
  const requiredPermission = to.meta.permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return next('/403')
  }
  
  next()
}
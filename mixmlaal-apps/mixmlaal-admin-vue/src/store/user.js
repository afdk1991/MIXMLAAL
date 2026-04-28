import { defineStore } from 'pinia'
import axios from 'axios'

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
    roles: [],
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    hasPermission: (state) => (permission) => {
      return state.permissions.includes(permission)
    }
  },

  actions: {
    // 登录
    async login(credentials) {
      try {
        const response = await axios.post('/api/v1/auth/login', credentials)
        const { access_token, user } = response.data.data
        
        this.token = access_token
        this.userInfo = user
        this.roles = user.roles || []
        this.permissions = user.permissions || []
        
        // 存储到本地存储
        localStorage.setItem('token', access_token)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    // 注册
    async register(userData) {
      try {
        const response = await axios.post('/api/v1/auth/register', userData)
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    // 退出登录
    async logout() {
      try {
        await axios.post('/api/v1/auth/logout')
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        // 清除状态
        this.token = ''
        this.userInfo = {}
        this.roles = []
        this.permissions = []
        
        // 清除本地存储
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    },

    // 获取当前用户信息
    async getCurrentUser() {
      try {
        const response = await axios.get('/api/v1/auth/me')
        const { user } = response.data.data
        
        this.userInfo = user
        this.roles = user.roles || []
        this.permissions = user.permissions || []
        
        // 更新本地存储
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    // 刷新令牌
    async refreshToken() {
      try {
        const response = await axios.post('/api/v1/auth/refresh', {
          refresh_token: localStorage.getItem('refreshToken')
        })
        const { access_token, refresh_token } = response.data.data
        
        this.token = access_token
        
        // 存储到本地存储
        localStorage.setItem('token', access_token)
        localStorage.setItem('refreshToken', refresh_token)
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    }
  }
})
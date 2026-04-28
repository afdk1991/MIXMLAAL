import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || {},
    roles: [],
    permissions: []
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/v1/auth/login', credentials)
        const { access_token, user } = response.data.data
        
        this.token = access_token
        this.userInfo = user
        this.roles = user.roles || []
        this.permissions = user.permissions || []
        
        localStorage.setItem('token', access_token)
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    async logout() {
      try {
        await axios.post('/api/v1/auth/logout')
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.token = ''
        this.userInfo = {}
        this.roles = []
        this.permissions = []
        
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
      }
    },

    async getCurrentUser() {
      try {
        const response = await axios.get('/api/v1/auth/me')
        const { user } = response.data.data
        
        this.userInfo = user
        this.roles = user.roles || []
        this.permissions = user.permissions || []
        
        localStorage.setItem('userInfo', JSON.stringify(user))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    }
  }
})
import { defineStore } from 'pinia'
import axios from 'axios'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('merchant_token') || '',
    userInfo: JSON.parse(localStorage.getItem('merchant_userInfo')) || {},
    merchantInfo: JSON.parse(localStorage.getItem('merchant_merchantInfo')) || {}
  }),

  getters: {
    isLoggedIn: (state) => !!state.token
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/v1/auth/merchant/login', credentials)
        const { access_token, user, merchant } = response.data.data
        
        this.token = access_token
        this.userInfo = user
        this.merchantInfo = merchant
        
        localStorage.setItem('merchant_token', access_token)
        localStorage.setItem('merchant_userInfo', JSON.stringify(user))
        localStorage.setItem('merchant_merchantInfo', JSON.stringify(merchant))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    async logout() {
      try {
        await axios.post('/api/v1/auth/merchant/logout')
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.token = ''
        this.userInfo = {}
        this.merchantInfo = {}
        
        localStorage.removeItem('merchant_token')
        localStorage.removeItem('merchant_userInfo')
        localStorage.removeItem('merchant_merchantInfo')
      }
    },

    async getCurrentUser() {
      try {
        const response = await axios.get('/api/v1/auth/merchant/me')
        const { user, merchant } = response.data.data
        
        this.userInfo = user
        this.merchantInfo = merchant
        
        localStorage.setItem('merchant_userInfo', JSON.stringify(user))
        localStorage.setItem('merchant_merchantInfo', JSON.stringify(merchant))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    }
  }
})
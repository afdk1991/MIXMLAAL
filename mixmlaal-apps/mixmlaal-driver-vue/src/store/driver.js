import { defineStore } from 'pinia'
import axios from 'axios'

export const useDriverStore = defineStore('driver', {
  state: () => ({
    token: localStorage.getItem('driver_token') || '',
    driverInfo: JSON.parse(localStorage.getItem('driver_info')) || {},
    onlineStatus: false,
    currentOrder: null
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isOnline: (state) => state.onlineStatus
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/v1/auth/driver/login', credentials)
        const { access_token, driver } = response.data.data
        
        this.token = access_token
        this.driverInfo = driver
        
        localStorage.setItem('driver_token', access_token)
        localStorage.setItem('driver_info', JSON.stringify(driver))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    async logout() {
      try {
        await axios.post('/api/v1/auth/driver/logout')
      } catch (error) {
        console.error('退出登录失败:', error)
      } finally {
        this.token = ''
        this.driverInfo = {}
        this.onlineStatus = false
        this.currentOrder = null
        
        localStorage.removeItem('driver_token')
        localStorage.removeItem('driver_info')
      }
    },

    async getCurrentDriver() {
      try {
        const response = await axios.get('/api/v1/auth/driver/me')
        const { driver } = response.data.data
        
        this.driverInfo = driver
        this.onlineStatus = driver.online_status
        
        localStorage.setItem('driver_info', JSON.stringify(driver))
        
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    async toggleOnlineStatus(status) {
      try {
        const response = await axios.post('/api/v1/driver/online', { status })
        this.onlineStatus = status
        return response.data
      } catch (error) {
        throw error.response.data
      }
    },

    setCurrentOrder(order) {
      this.currentOrder = order
    }
  }
})
import { defineStore } from 'pinia'
import userApi from '../api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    profile: null,
    addresses: [],
    loading: false,
    error: null
  }),

  getters: {
    hasDefaultAddress: (state) => state.addresses.some(address => address.isDefault),
    defaultAddress: (state) => state.addresses.find(address => address.isDefault)
  },

  actions: {
    async fetchProfile() {
      this.loading = true
      this.error = null
      try {
        const response = await userApi.getProfile()
        this.profile = response
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateProfile(data) {
      this.loading = true
      this.error = null
      try {
        const response = await userApi.updateProfile(data)
        this.profile = response
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchAddresses() {
      this.loading = true
      this.error = null
      try {
        const response = await userApi.getAddresses()
        this.addresses = response
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addAddress(data) {
      this.loading = true
      this.error = null
      try {
        const response = await userApi.addAddress(data)
        this.addresses.push(response)
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateAddress(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await userApi.updateAddress(id, data)
        const index = this.addresses.findIndex(address => address.id === id)
        if (index !== -1) {
          this.addresses[index] = response
        }
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteAddress(id) {
      this.loading = true
      this.error = null
      try {
        await userApi.deleteAddress(id)
        this.addresses = this.addresses.filter(address => address.id !== id)
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async setDefaultAddress(id) {
      this.loading = true
      this.error = null
      try {
        await userApi.setDefaultAddress(id)
        // 更新本地地址列表
        this.addresses = this.addresses.map(address => ({
          ...address,
          isDefault: address.id === id
        }))
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    clearError() {
      this.error = null
    }
  }
})
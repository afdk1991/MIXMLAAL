import { defineStore } from 'pinia'
import apiClient from '../utils/api'
import { storage } from '../utils/storage'

export const useContentStore = defineStore('content', {
  state: () => ({
    contents: [],
    currentContent: null,
    loading: false,
    error: null,
    lastSyncTime: null,
    syncEnabled: true,
    syncInterval: 30000
  }),

  getters: {
    publishedContents: (state) => state.contents.filter(c => c.status === 'published'),
    getContentById: (state) => (id) => state.contents.find(c => c.id === id),
    getContentsByType: (state) => (type) => state.contents.filter(c => c.type === type),
    hasUnsyncedChanges: (state) => {
      if (!state.lastSyncTime) return true
      return state.contents.some(c => new Date(c.updatedAt) > state.lastSyncTime)
    }
  },

  actions: {
    async fetchContents(params = {}) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.content.getList(params)
        this.contents = response.contents || response
        return this.contents
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async fetchContentById(id) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.content.getById(id)
        this.currentContent = response
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async createContent(data) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.content.create(data)
        this.contents.unshift(response)
        this.lastSyncTime = Date.now()
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async updateContent(id, data) {
      this.loading = true
      this.error = null
      try {
        const response = await apiClient.content.update(id, data)
        const index = this.contents.findIndex(c => c.id === id)
        if (index !== -1) {
          this.contents[index] = response
        }
        if (this.currentContent?.id === id) {
          this.currentContent = response
        }
        this.lastSyncTime = Date.now()
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async deleteContent(id) {
      this.loading = true
      this.error = null
      try {
        await apiClient.content.delete(id)
        this.contents = this.contents.filter(c => c.id !== id)
        if (this.currentContent?.id === id) {
          this.currentContent = null
        }
        this.lastSyncTime = Date.now()
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async syncFromServer(since = null) {
      if (!this.syncEnabled) return

      this.loading = true
      this.error = null
      try {
        const params = since ? { since } : {}
        const response = await apiClient.contentSync.sync(params)

        if (response.contents) {
          const serverContents = response.contents
          const localChanges = this.contents.filter(c =>
            c._localOnly && !serverContents.find(sc => sc.id === c.id)
          )

          this.contents = [...localChanges, ...serverContents]
        }

        this.lastSyncTime = Date.now()
        storage.setItem('content_last_sync', this.lastSyncTime)

        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async broadcastUpdate(contentId, eventType) {
      try {
        await apiClient.contentSync.broadcast({ contentId, eventType })
      } catch (error) {
        console.error('Broadcast failed:', error)
      }
    },

    startAutoSync(intervalMs = null) {
      if (intervalMs) {
        this.syncInterval = intervalMs
      }

      this.syncFromServer(this.lastSyncTime)

      const intervalId = setInterval(() => {
        if (this.syncEnabled) {
          this.syncFromServer(this.lastSyncTime)
        }
      }, this.syncInterval)

      return intervalId
    },

    stopAutoSync(intervalId) {
      if (intervalId) {
        clearInterval(intervalId)
      }
      this.syncEnabled = false
    },

    setSyncEnabled(enabled) {
      this.syncEnabled = enabled
    },

    clearError() {
      this.error = null
    },

    clearAll() {
      this.contents = []
      this.currentContent = null
      this.loading = false
      this.error = null
      this.lastSyncTime = null
    }
  }
})

import apiClient from './api'
import { storage } from './storage'

class ContentSyncManager {
  constructor() {
    this.syncTargets = new Map()
    this.listeners = new Map()
    this.wsConnection = null
    this.reconnectAttempts = 0
    this.maxReconnectAttempts = 5
    this.reconnectDelay = 3000
    this.pendingSyncQueue = []
    this.isOnline = navigator.onLine
    this.syncStrategy = 'merge'
  }

  setSyncStrategy(strategy) {
    this.syncStrategy = strategy
  }

  registerTarget(targetId, targetInfo) {
    this.syncTargets.set(targetId, {
      ...targetInfo,
      registeredAt: Date.now(),
      lastSync: null,
      status: 'active'
    })
    storage.setItem(`sync_target_${targetId}`, targetInfo)
  }

  unregisterTarget(targetId) {
    this.syncTargets.delete(targetId)
    storage.removeItem(`sync_target_${targetId}`)
  }

  async syncContent(targetId, options = {}) {
    const target = this.syncTargets.get(targetId)
    if (!target) {
      throw new Error(`Sync target ${targetId} not registered`)
    }

    try {
      const result = await apiClient.contentSync.sync({
        targetId,
        ...options
      })

      target.lastSync = Date.now()
      this.notifyListeners('sync', { targetId, result })

      return result
    } catch (error) {
      this.notifyListeners('error', { targetId, error })
      throw error
    }
  }

  async broadcastUpdate(contentId, eventType) {
    try {
      const result = await apiClient.contentSync.broadcast({ contentId, eventType })
      this.notifyListeners('broadcast', { contentId, eventType, result })
      return result
    } catch (error) {
      this.notifyListeners('error', { error })
      throw error
    }
  }

  async fullSync(targetId = null) {
    const targets = targetId
      ? [this.syncTargets.get(targetId)].filter(Boolean)
      : Array.from(this.syncTargets.values())

    const results = []
    for (const target of targets) {
      if (target) {
        try {
          const result = await this.syncContent(target.id, { forceFullSync: true })
          results.push({ targetId: target.id, success: true, result })
        } catch (error) {
          results.push({ targetId: target.id, success: false, error: error.message })
        }
      }
    }

    return results
  }

  addListener(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType).add(callback)

    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  notifyListeners(eventType, data) {
    this.listeners.get(eventType)?.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Listener error:', error)
      }
    })
  }

  connectWebSocket(url) {
    if (this.wsConnection?.readyState === WebSocket.OPEN) {
      return
    }

    try {
      this.wsConnection = new WebSocket(url)

      this.wsConnection.onopen = () => {
        console.log('WebSocket connected')
        this.reconnectAttempts = 0
        this.notifyListeners('connected', {})
        this.processPendingSync()
      }

      this.wsConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data)
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      }

      this.wsConnection.onerror = (error) => {
        console.error('WebSocket error:', error)
        this.notifyListeners('error', { error })
      }

      this.wsConnection.onclose = () => {
        console.log('WebSocket closed')
        this.notifyListeners('disconnected', {})
        this.attemptReconnect()
      }
    } catch (error) {
      console.error('WebSocket connection error:', error)
    }
  }

  handleWebSocketMessage(data) {
    const { type, payload } = data

    switch (type) {
      case 'content_updated':
        this.notifyListeners('contentUpdated', payload)
        break
      case 'content_created':
        this.notifyListeners('contentCreated', payload)
        break
      case 'content_deleted':
        this.notifyListeners('contentDeleted', payload)
        break
      case 'sync_response':
        this.notifyListeners('syncResponse', payload)
        break
      default:
        console.log('Unknown message type:', type)
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('Max reconnection attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1)

    setTimeout(() => {
      console.log(`Reconnection attempt ${this.reconnectAttempts}`)
      this.reconnectAttempts
    }, delay)
  }

  disconnectWebSocket() {
    if (this.wsConnection) {
      this.wsConnection.close()
      this.wsConnection = null
    }
  }

  queueSync(syncData) {
    this.pendingSyncQueue.push({
      ...syncData,
      queuedAt: Date.now()
    })

    if (this.isOnline) {
      this.processPendingSync()
    }
  }

  async processPendingSync() {
    if (this.pendingSyncQueue.length === 0) return

    const queue = [...this.pendingSyncQueue]
    this.pendingSyncQueue = []

    for (const item of queue) {
      try {
        await this.syncContent(item.targetId, item.options)
      } catch (error) {
        this.pendingSyncQueue.push(item)
      }
    }
  }

  setOnlineStatus(isOnline) {
    const wasOffline = !this.isOnline
    this.isOnline = isOnline

    if (wasOffline && isOnline) {
      this.notifyListeners('online', {})
      this.processPendingSync()
    } else if (!isOnline) {
      this.notifyListeners('offline', {})
    }
  }

  resolveConflict(localContent, serverContent, strategy = null) {
    const resolutionStrategy = strategy || this.syncStrategy

    switch (resolutionStrategy) {
      case 'local_wins':
        return { resolved: localContent, source: 'local' }
      case 'server_wins':
        return { resolved: serverContent, source: 'server' }
      case 'merge':
        return this.mergeContents(localContent, serverContent)
      case 'latest_wins':
        return new Date(localContent.updatedAt) > new Date(serverContent.updatedAt)
          ? { resolved: localContent, source: 'local' }
          : { resolved: serverContent, source: 'server' }
      default:
        return { resolved: serverContent, source: 'server' }
    }
  }

  mergeContents(local, server) {
    const merged = {
      ...server,
      ...local,
      tags: this.mergeArrays(local.tags, server.tags),
      metadata: { ...server.metadata, ...local.metadata }
    }
    return { resolved: merged, source: 'merged' }
  }

  mergeArrays(localArray, serverArray) {
    if (!Array.isArray(localArray)) return serverArray || []
    if (!Array.isArray(serverArray)) return localArray

    const map = new Map()
    ;[...serverArray, ...localArray].forEach(item => {
      if (item.id) {
        map.set(item.id, { ...map.get(item.id), ...item })
      }
    })
    return Array.from(map.values())
  }

  getSyncStatus(targetId = null) {
    if (targetId) {
      const target = this.syncTargets.get(targetId)
      return target ? {
        targetId,
        status: target.status,
        lastSync: target.lastSync,
        registeredAt: target.registeredAt
      } : null
    }

    const status = {}
    for (const [id, target] of this.syncTargets) {
      status[id] = {
        status: target.status,
        lastSync: target.lastSync,
        registeredAt: target.registeredAt
      }
    }
    return status
  }

  cleanup() {
    this.disconnectWebSocket()
    this.listeners.clear()
    this.pendingSyncQueue = []
  }
}

export const contentSyncManager = new ContentSyncManager()

export function setupNetworkListeners() {
  window.addEventListener('online', () => {
    contentSyncManager.setOnlineStatus(true)
  })

  window.addEventListener('offline', () => {
    contentSyncManager.setOnlineStatus(false)
  })
}

export default contentSyncManager

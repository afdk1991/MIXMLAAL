/**
 * 用户状态管理
 * 版本: v1.0.0.0
 * 说明: 管理用户信息和登录状态
 */

import { defineStore } from 'pinia';

// 用户状态
export const useUserStore = defineStore('user', {
  state: () => ({
    // 用户信息
    user: null,
    // 认证令牌
    token: null,
    // 用户偏好设置
    preferences: {
      theme: 'light',
      language: 'zh-CN',
      notifications: true,
      location: true
    },
    // 登录状态
    isLoggedIn: false,
    // 加载状态
    loading: false,
    // 错误信息
    error: null
  }),
  getters: {
    // 获取用户角色
    userRole: (state) => state.user?.role || 'user',
    // 获取用户ID
    userId: (state) => state.user?.userId,
    // 获取用户昵称
    userNickname: (state) => state.user?.nickname || '用户'
  },
  actions: {
    // 设置令牌
    setToken(token) {
      this.token = token;
      if (token) {
        localStorage.setItem('access_token', token);
        this.isLoggedIn = true;
      } else {
        localStorage.removeItem('access_token');
        this.isLoggedIn = false;
      }
    },
    // 登录
    async login(credentials) {
      try {
        this.loading = true;
        this.error = null;
        
        // 这里应该调用登录API
        // 模拟登录成功
        const response = {
          token: 'mock-token-' + Date.now(),
          user: {
            userId: 1001,
            phone: '157****3367',
            nickname: '测试用户',
            avatar: 'https://via.placeholder.com/150',
            email: 'test@example.com',
            role: 'user',
            level: 1,
            points: 0,
            balance: 0,
            createdAt: new Date().toISOString()
          }
        };
        
        this.setToken(response.token);
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      } catch (error) {
        this.error = error.message || '登录失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 登出
    logout() {
      this.setToken(null);
      this.user = null;
      localStorage.removeItem('user');
      localStorage.removeItem('user_preferences');
    },
    // 加载用户信息
    async loadUser() {
      try {
        const token = localStorage.getItem('access_token');
        const user = localStorage.getItem('user');
        const preferences = localStorage.getItem('user_preferences');

        if (token) {
          this.setToken(token);
        } else {
          return;
        }

        if (user) {
          this.user = JSON.parse(user);
        }

        if (preferences) {
          this.preferences = JSON.parse(preferences);
        }

        // 这里可以调用API获取最新用户信息
        // await this.loadUserProfile();
      } catch (error) {
        this.logout();
      }
    },
    // 加载用户详情
    async loadUserProfile() {
      try {
        this.loading = true;
        
        // 这里应该调用用户详情API
        // 模拟获取用户详情
        const response = {
          user: {
            userId: 1001,
            phone: '157****3367',
            nickname: '测试用户',
            avatar: 'https://via.placeholder.com/150',
            email: 'test@example.com',
            gender: 'male',
            birthday: '1990-01-01',
            level: 1,
            points: 100,
            balance: 50,
            createdAt: new Date().toISOString()
          }
        };
        
        this.user = response.user;
        localStorage.setItem('user', JSON.stringify(response.user));
        
        return response;
      } catch (error) {
        this.error = error.message || '获取用户信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 更新用户信息
    async updateUserProfile(data) {
      try {
        this.loading = true;
        
        // 这里应该调用更新用户信息API
        // 模拟更新成功
        const updatedUser = {
          ...this.user,
          ...data
        };
        
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return updatedUser;
      } catch (error) {
        this.error = error.message || '更新用户信息失败';
        throw error;
      } finally {
        this.loading = false;
      }
    },
    // 保存用户偏好设置
    savePreferences(preferences) {
      this.preferences = { ...this.preferences, ...preferences };
      localStorage.setItem('user_preferences', JSON.stringify(this.preferences));
    }
  }
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useUserStore } from '@/store/user';

describe('User Store', () => {
  let userStore;

  beforeEach(() => {
    // 创建Pinia实例
    const pinia = createPinia();
    setActivePinia(pinia);
    userStore = useUserStore();
  });

  it('initializes with default state', () => {
    expect(userStore.user).toBeNull();
    expect(userStore.isLoggedIn).toBe(false);
    expect(userStore.isLoading).toBe(false);
    expect(userStore.error).toBeNull();
    expect(userStore.token).toBeNull();
  });

  it('sets user data correctly', () => {
    const userData = {
      userId: '123',
      phone: '13800138000',
      nickname: 'Test User',
      avatar: 'test-avatar.jpg',
      userType: 1
    };
    userStore.setUser(userData);
    expect(userStore.user).toEqual(userData);
    expect(userStore.isLoggedIn).toBe(true);
  });

  it('sets token correctly', () => {
    const token = 'test-token';
    userStore.setToken(token);
    expect(userStore.token).toBe(token);
  });

  it('sets error correctly', () => {
    const error = 'Test error';
    userStore.setError(error);
    expect(userStore.error).toBe(error);
  });

  it('sets loading state correctly', () => {
    userStore.setLoading(true);
    expect(userStore.isLoading).toBe(true);
    userStore.setLoading(false);
    expect(userStore.isLoading).toBe(false);
  });

  it('logs in successfully', async () => {
    // 模拟fetch返回成功
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: {
            user: {
              userId: '123',
              phone: '13800138000',
              nickname: 'Test User'
            },
            token: 'test-token',
            refreshToken: 'test-refresh-token'
          }
        })
      })
    );

    const loginData = {
      phone: '13800138000',
      password: 'password123'
    };

    const result = await userStore.login(loginData);
    expect(result).toBe(true);
    expect(userStore.isLoggedIn).toBe(true);
    expect(userStore.token).toBe('test-token');
  });

  it('fails to login with invalid credentials', async () => {
    // 模拟fetch返回失败
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({
          status: 'error',
          message: 'Invalid credentials'
        })
      })
    );

    const loginData = {
      phone: '13800138000',
      password: 'wrong-password'
    };

    const result = await userStore.login(loginData);
    expect(result).toBe(false);
    expect(userStore.isLoggedIn).toBe(false);
    expect(userStore.error).toBe('Invalid credentials');
  });

  it('logs out successfully', () => {
    // 先设置用户和token
    userStore.setUser({ userId: '123', phone: '13800138000' });
    userStore.setToken('test-token');
    
    // 模拟localStorage
    global.localStorage.removeItem = vi.fn();
    
    userStore.logout();
    expect(userStore.user).toBeNull();
    expect(userStore.token).toBeNull();
    expect(userStore.isLoggedIn).toBe(false);
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('user');
    expect(global.localStorage.removeItem).toHaveBeenCalledWith('token');
  });

  it('loads user from localStorage', () => {
    const userData = { userId: '123', phone: '13800138000' };
    const token = 'test-token';
    
    // 模拟localStorage
    global.localStorage.getItem = vi.fn((key) => {
      if (key === 'user') return JSON.stringify(userData);
      if (key === 'token') return token;
      return null;
    });
    
    userStore.loadUser();
    expect(userStore.user).toEqual(userData);
    expect(userStore.token).toBe(token);
    expect(userStore.isLoggedIn).toBe(true);
  });

  it('updates user profile successfully', async () => {
    // 模拟fetch返回成功
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          data: {
            userId: '123',
            phone: '13800138000',
            nickname: 'Updated User',
            avatar: 'updated-avatar.jpg'
          }
        })
      })
    );

    // 先设置用户和token
    userStore.setUser({ userId: '123', phone: '13800138000' });
    userStore.setToken('test-token');

    const profileData = {
      nickname: 'Updated User',
      avatar: 'updated-avatar.jpg'
    };

    const result = await userStore.updateProfile(profileData);
    expect(result).toBe(true);
    expect(userStore.user.nickname).toBe('Updated User');
  });

  it('changes password successfully', async () => {
    // 模拟fetch返回成功
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          message: '密码修改成功'
        })
      })
    );

    // 先设置用户和token
    userStore.setUser({ userId: '123', phone: '13800138000' });
    userStore.setToken('test-token');

    const passwordData = {
      oldPassword: 'old-password',
      newPassword: 'new-password'
    };

    const result = await userStore.changePassword(passwordData);
    expect(result).toBe(true);
  });

  it('resets password successfully', async () => {
    // 模拟fetch返回成功
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          status: 'success',
          message: '密码重置成功'
        })
      })
    );

    const resetData = {
      phone: '13800138000',
      code: '123456',
      newPassword: 'new-password'
    };

    const result = await userStore.resetPassword(resetData);
    expect(result).toBe(true);
  });
});
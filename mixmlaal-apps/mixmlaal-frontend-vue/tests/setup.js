/**
 * 测试设置文件
 * 版本: v1.0.0.0
 * 说明: 测试环境的全局设置
 */

import { vi } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';

// 创建Pinia实例
const pinia = createPinia();
setActivePinia(pinia);

// 模拟全局对象
vi.stubGlobal('localStorage', {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
});

// 模拟window.location
vi.stubGlobal('window', {
  location: {
    href: 'http://localhost:8080',
    pathname: '/',
    search: '',
    hash: ''
  },
  scrollTo: vi.fn()
});

// 模拟document
vi.stubGlobal('document', {
  title: 'MIXMLAAL',
  querySelector: vi.fn(),
  querySelectorAll: vi.fn(),
  createElement: vi.fn(),
  body: {
    appendChild: vi.fn(),
    removeChild: vi.fn()
  }
});

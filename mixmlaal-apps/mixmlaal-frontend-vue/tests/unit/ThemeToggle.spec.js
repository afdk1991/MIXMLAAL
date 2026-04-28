import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import ThemeToggle from '@/components/ThemeToggle.vue';

// 模拟localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

describe('ThemeToggle Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly', () => {
    const wrapper = mount(ThemeToggle);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('button').exists()).toBe(true);
  });

  it('displays moon icon for light theme', () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    const wrapper = mount(ThemeToggle);
    expect(wrapper.find('.fa-moon-o').exists()).toBe(true);
  });

  it('displays sun icon for dark theme', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    const wrapper = mount(ThemeToggle);
    expect(wrapper.find('.fa-sun-o').exists()).toBe(true);
  });

  it('toggles theme when clicked', async () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    const wrapper = mount(ThemeToggle);
    
    // 初始状态是浅色主题
    expect(wrapper.find('.fa-moon-o').exists()).toBe(true);
    
    // 点击切换到深色主题
    await wrapper.find('button').trigger('click');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    
    // 再次点击切换回浅色主题
    await wrapper.find('button').trigger('click');
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'light');
  });

  it('sets correct title for light theme', () => {
    mockLocalStorage.getItem.mockReturnValue('light');
    const wrapper = mount(ThemeToggle);
    expect(wrapper.find('button').attributes('title')).toBe('切换到深色模式');
  });

  it('sets correct title for dark theme', () => {
    mockLocalStorage.getItem.mockReturnValue('dark');
    const wrapper = mount(ThemeToggle);
    expect(wrapper.find('button').attributes('title')).toBe('切换到浅色模式');
  });
});

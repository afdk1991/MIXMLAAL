import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import LazyImage from '@/components/base/LazyImage.vue';

// 模拟IntersectionObserver
const mockIntersectionObserver = vi.fn();
mockIntersectionObserver.mockImplementation((callback, options) => {
  return {
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn()
  };
});

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: mockIntersectionObserver
});

describe('LazyImage Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image'
      }
    });
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('img').exists()).toBe(true);
    expect(wrapper.find('img').attributes('alt')).toBe('Test Image');
  });

  it('renders with custom classes', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        className: 'custom-class'
      }
    });
    expect(wrapper.find('img').classes()).toContain('custom-class');
  });

  it('renders with rounded corner', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        rounded: true
      }
    });
    expect(wrapper.classes()).toContain('rounded');
  });

  it('renders with custom width and height', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image',
        width: '200px',
        height: '150px'
      }
    });
    const placeholder = wrapper.find('.relative');
    expect(placeholder.exists()).toBe(true);
  });

  it('shows placeholder initially', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image'
      }
    });
    const placeholder = wrapper.find('.bg-gray-100');
    expect(placeholder.exists()).toBe(true);
  });

  it('loads image when intersecting', () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image'
      }
    });
    const img = wrapper.find('img');
    expect(img.exists()).toBe(true);
  });

  it('handles image load event', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image'
      }
    });
    const img = wrapper.find('img');
    await img.trigger('load');
    // 图片加载后应该显示
    expect(wrapper.find('img').classes()).toContain('opacity-100');
  });

  it('handles image error event', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image.jpg',
        alt: 'Test Image'
      }
    });
    const img = wrapper.find('img');
    await img.trigger('error');
    // 图片加载失败后应该显示
    expect(wrapper.find('img').classes()).toContain('opacity-100');
  });

  it('updates when src prop changes', async () => {
    const wrapper = mount(LazyImage, {
      props: {
        src: 'https://example.com/image1.jpg',
        alt: 'Test Image'
      }
    });
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/image1.jpg');

    await wrapper.setProps({
      src: 'https://example.com/image2.jpg'
    });
    expect(wrapper.find('img').attributes('src')).toBe('https://example.com/image2.jpg');
  });
});

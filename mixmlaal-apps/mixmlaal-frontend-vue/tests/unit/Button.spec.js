import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Button from '@/components/base/Button.vue';

describe('Button Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Button);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('btn');
    expect(wrapper.classes()).toContain('btn-primary');
    expect(wrapper.classes()).toContain('btn-md');
  });

  it('renders correctly with different variants', () => {
    const variants = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
    variants.forEach(variant => {
      const wrapper = mount(Button, {
        props: { variant }
      });
      expect(wrapper.classes()).toContain(`btn-${variant}`);
    });
  });

  it('renders correctly with different sizes', () => {
    const sizes = ['sm', 'md', 'lg', 'xl'];
    sizes.forEach(size => {
      const wrapper = mount(Button, {
        props: { size }
      });
      expect(wrapper.classes()).toContain(`btn-${size}`);
    });
  });

  it('renders correctly with disabled prop', () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    });
    expect(wrapper.classes()).toContain('btn-disabled');
    expect(wrapper.attributes('disabled')).toBe('');
  });

  it('renders correctly with loading prop', () => {
    const wrapper = mount(Button, {
      props: { loading: true }
    });
    expect(wrapper.classes()).toContain('btn-loading');
    expect(wrapper.find('.btn-loading-spinner').exists()).toBe(true);
  });

  it('renders correctly with icon prop', () => {
    const wrapper = mount(Button, {
      props: { icon: 'fa-search' }
    });
    expect(wrapper.find('.btn-icon').exists()).toBe(true);
  });

  it('renders slot content correctly', () => {
    const slotContent = 'Click Me';
    const wrapper = mount(Button, {
      slots: {
        default: slotContent
      }
    });
    expect(wrapper.text()).toContain(slotContent);
  });

  it('emits click event when clicked', async () => {
    const wrapper = mount(Button);
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeTruthy();
  });

  it('does not emit click event when disabled', async () => {
    const wrapper = mount(Button, {
      props: { disabled: true }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });

  it('does not emit click event when loading', async () => {
    const wrapper = mount(Button, {
      props: { loading: true }
    });
    await wrapper.trigger('click');
    expect(wrapper.emitted('click')).toBeFalsy();
  });
});
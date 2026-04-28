import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Card from '@/components/base/Card.vue';

describe('Card Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Card);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.classes()).toContain('card');
    expect(wrapper.classes()).toContain('card-default');
  });

  it('renders correctly with different variants', () => {
    const variants = ['default', 'primary', 'secondary', 'success', 'danger', 'warning', 'info'];
    variants.forEach(variant => {
      const wrapper = mount(Card, {
        props: { variant }
      });
      expect(wrapper.classes()).toContain(`card-${variant}`);
    });
  });

  it('renders correctly with title slot', () => {
    const title = 'Card Title';
    const wrapper = mount(Card, {
      slots: {
        title
      }
    });
    expect(wrapper.find('.card-header').exists()).toBe(true);
    expect(wrapper.find('.card-header').text()).toBe(title);
  });

  it('renders correctly with body slot', () => {
    const body = 'Card Body Content';
    const wrapper = mount(Card, {
      slots: {
        default: body
      }
    });
    expect(wrapper.find('.card-body').exists()).toBe(true);
    expect(wrapper.find('.card-body').text()).toBe(body);
  });

  it('renders correctly with footer slot', () => {
    const footer = 'Card Footer Content';
    const wrapper = mount(Card, {
      slots: {
        footer
      }
    });
    expect(wrapper.find('.card-footer').exists()).toBe(true);
    expect(wrapper.find('.card-footer').text()).toBe(footer);
  });

  it('renders correctly with all slots', () => {
    const title = 'Card Title';
    const body = 'Card Body Content';
    const footer = 'Card Footer Content';
    const wrapper = mount(Card, {
      slots: {
        title,
        default: body,
        footer
      }
    });
    expect(wrapper.find('.card-header').exists()).toBe(true);
    expect(wrapper.find('.card-body').exists()).toBe(true);
    expect(wrapper.find('.card-footer').exists()).toBe(true);
    expect(wrapper.find('.card-header').text()).toBe(title);
    expect(wrapper.find('.card-body').text()).toBe(body);
    expect(wrapper.find('.card-footer').text()).toBe(footer);
  });

  it('renders correctly with no header when no title slot', () => {
    const wrapper = mount(Card);
    expect(wrapper.find('.card-header').exists()).toBe(false);
  });

  it('renders correctly with no footer when no footer slot', () => {
    const wrapper = mount(Card);
    expect(wrapper.find('.card-footer').exists()).toBe(false);
  });

  it('applies custom classes correctly', () => {
    const customClass = 'custom-card';
    const wrapper = mount(Card, {
      props: {
        class: customClass
      }
    });
    expect(wrapper.classes()).toContain(customClass);
  });
});
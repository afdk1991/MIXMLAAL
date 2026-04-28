import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import Input from '@/components/base/Input.vue';

describe('Input Component', () => {
  it('renders correctly with default props', () => {
    const wrapper = mount(Input);
    expect(wrapper.exists()).toBe(true);
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('renders correctly with different types', () => {
    const types = ['text', 'password', 'email', 'number', 'tel', 'url'];
    types.forEach(type => {
      const wrapper = mount(Input, {
        props: { type }
      });
      expect(wrapper.find('input').attributes('type')).toBe(type);
    });
  });

  it('renders correctly with placeholder', () => {
    const placeholder = 'Enter your name';
    const wrapper = mount(Input, {
      props: { placeholder }
    });
    expect(wrapper.find('input').attributes('placeholder')).toBe(placeholder);
  });

  it('renders correctly with value', () => {
    const value = 'test value';
    const wrapper = mount(Input, {
      props: { modelValue: value }
    });
    expect(wrapper.find('input').element.value).toBe(value);
  });

  it('renders correctly with label', () => {
    const label = 'Name';
    const wrapper = mount(Input, {
      props: { label }
    });
    expect(wrapper.find('label').exists()).toBe(true);
    expect(wrapper.find('label').text()).toBe(label);
  });

  it('renders correctly with error message', () => {
    const error = 'This field is required';
    const wrapper = mount(Input, {
      props: { error }
    });
    expect(wrapper.find('.input-error').exists()).toBe(true);
    expect(wrapper.find('.input-error').text()).toBe(error);
  });

  it('renders correctly with prefix icon', () => {
    const prefix = 'fa-user';
    const wrapper = mount(Input, {
      props: { prefix }
    });
    expect(wrapper.find('.input-prefix').exists()).toBe(true);
  });

  it('renders correctly with suffix icon', () => {
    const suffix = 'fa-search';
    const wrapper = mount(Input, {
      props: { suffix }
    });
    expect(wrapper.find('.input-suffix').exists()).toBe(true);
  });

  it('renders correctly with disabled prop', () => {
    const wrapper = mount(Input, {
      props: { disabled: true }
    });
    expect(wrapper.find('input').attributes('disabled')).toBe('');
  });

  it('renders correctly with readonly prop', () => {
    const wrapper = mount(Input, {
      props: { readonly: true }
    });
    expect(wrapper.find('input').attributes('readonly')).toBe('');
  });

  it('emits update:modelValue event when input changes', async () => {
    const wrapper = mount(Input);
    const input = wrapper.find('input');
    const testValue = 'test';
    await input.setValue(testValue);
    expect(wrapper.emitted('update:modelValue')).toBeTruthy();
    expect(wrapper.emitted('update:modelValue')[0][0]).toBe(testValue);
  });

  it('emits blur event when input blurs', async () => {
    const wrapper = mount(Input);
    const input = wrapper.find('input');
    await input.trigger('blur');
    expect(wrapper.emitted('blur')).toBeTruthy();
  });

  it('emits focus event when input focuses', async () => {
    const wrapper = mount(Input);
    const input = wrapper.find('input');
    await input.trigger('focus');
    expect(wrapper.emitted('focus')).toBeTruthy();
  });

  it('emits keyup event when key is pressed', async () => {
    const wrapper = mount(Input);
    const input = wrapper.find('input');
    await input.trigger('keyup', { key: 'Enter' });
    expect(wrapper.emitted('keyup')).toBeTruthy();
  });
});
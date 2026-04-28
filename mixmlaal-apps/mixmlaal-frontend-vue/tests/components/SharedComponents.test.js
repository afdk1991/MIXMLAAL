/**
 * 共享组件测试
 * 版本: v1.0.0.0
 * 说明: 测试共享组件的功能
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from '@shared/components/StatCard.vue';
import DataTable from '@shared/components/DataTable.vue';
import Modal from '@shared/components/Modal.vue';

// 测试StatCard组件
describe('StatCard Component', () => {
  it('should render correctly with props', () => {
    const props = {
      title: '测试标题',
      value: '123',
      icon: 'home',
      color: 'bg-blue-500',
      change: '+10%',
      changeType: 'positive'
    };

    const wrapper = mount(StatCard, { props });

    expect(wrapper.find('.stat-card').exists()).toBe(true);
    expect(wrapper.find('.stat-title').text()).toBe(props.title);
    expect(wrapper.find('.stat-value').text()).toBe(props.value);
    expect(wrapper.find('.stat-change').text()).toBe(props.change);
  });

  it('should render without optional props', () => {
    const props = {
      title: '测试标题',
      value: '123',
      icon: 'home'
    };

    const wrapper = mount(StatCard, { props });

    expect(wrapper.find('.stat-card').exists()).toBe(true);
    expect(wrapper.find('.stat-change').exists()).toBe(false);
  });
});

// 测试DataTable组件
describe('DataTable Component', () => {
  const mockColumns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: '名称' },
    { key: 'status', label: '状态' }
  ];

  const mockData = [
    { id: 1, name: '测试1', status: 'active' },
    { id: 2, name: '测试2', status: 'inactive' }
  ];

  it('should render table with data', () => {
    const props = {
      columns: mockColumns,
      data: mockData
    };

    const wrapper = mount(DataTable, { props });

    expect(wrapper.find('.data-table').exists()).toBe(true);
    expect(wrapper.find('.table-header').exists()).toBe(true);
    expect(wrapper.find('.table-body').exists()).toBe(true);
    expect(wrapper.findAll('.table-row').length).toBe(mockData.length);
  });

  it('should emit row click event', async () => {
    const props = {
      columns: mockColumns,
      data: mockData
    };

    const wrapper = mount(DataTable, { props });

    await wrapper.find('.table-row').trigger('click');
    expect(wrapper.emitted('row-click')).toBeTruthy();
  });

  it('should render empty state when no data', () => {
    const props = {
      columns: mockColumns,
      data: []
    };

    const wrapper = mount(DataTable, { props });

    expect(wrapper.find('.data-table').exists()).toBe(true);
    expect(wrapper.find('.table-body').text()).toContain('暂无数据');
  });
});

// 测试Modal组件
describe('Modal Component', () => {
  it('should render modal when visible', () => {
    const props = {
      title: '测试模态框',
      visible: true
    };

    const wrapper = mount(Modal, { 
      props,
      slots: {
        default: '<div>模态框内容</div>'
      }
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(true);
    expect(wrapper.find('.modal-content').exists()).toBe(true);
    expect(wrapper.find('.modal-title').text()).toBe(props.title);
  });

  it('should not render modal when not visible', () => {
    const props = {
      title: '测试模态框',
      visible: false
    };

    const wrapper = mount(Modal, { 
      props,
      slots: {
        default: '<div>模态框内容</div>'
      }
    });

    expect(wrapper.find('.modal-overlay').exists()).toBe(false);
  });

  it('should emit close event when close button is clicked', async () => {
    const props = {
      title: '测试模态框',
      visible: true
    };

    const wrapper = mount(Modal, { 
      props,
      slots: {
        default: '<div>模态框内容</div>'
      }
    });

    await wrapper.find('.modal-close').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });

  it('should emit close event when overlay is clicked', async () => {
    const props = {
      title: '测试模态框',
      visible: true
    };

    const wrapper = mount(Modal, { 
      props,
      slots: {
        default: '<div>模态框内容</div>'
      }
    });

    await wrapper.find('.modal-overlay').trigger('click');
    expect(wrapper.emitted('close')).toBeTruthy();
  });
});

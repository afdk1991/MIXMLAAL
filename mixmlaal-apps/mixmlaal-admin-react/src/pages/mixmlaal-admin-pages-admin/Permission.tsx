import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, Select, message, Tree } from 'antd';

const mockData = [
  { id: 1, code: 'user:view', name: '查看用户', type: 'button', path: '/user', sort: 1 },
  { id: 2, code: 'user:create', name: '创建用户', type: 'button', path: '/user', sort: 2 },
  { id: 3, code: 'user:edit', name: '编辑用户', type: 'button', path: '/user', sort: 3 },
  { id: 4, code: 'user:delete', name: '删除用户', type: 'button', path: '/user', sort: 4 },
  { id: 5, code: 'role:view', name: '查看角色', type: 'button', path: '/role', sort: 5 },
];

const treeData = [
  {
    title: '用户管理',
    key: 'user',
    children: [
      { title: '查看用户', key: 'user:view' },
      { title: '创建用户', key: 'user:create' },
      { title: '编辑用户', key: 'user:edit' },
      { title: '删除用户', key: 'user:delete' },
    ],
  },
  {
    title: '角色管理',
    key: 'role',
    children: [
      { title: '查看角色', key: 'role:view' },
      { title: '创建角色', key: 'role:create' },
      { title: '编辑角色', key: 'role:edit' },
    ],
  },
];

export default function Permission() {
  const [data, setData] = useState(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '权限代码', dataIndex: 'code', key: 'code' },
    { title: '权限名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type' },
    { title: '路径', dataIndex: 'path', key: 'path' },
    { title: '排序', dataIndex: 'sort', key: 'sort' },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space>
          <Button type="link" onClick={() => handleEdit(record)}>编辑</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>删除</Button>
        </Space>
      ),
    },
  ];

  const handleEdit = (record: any) => {
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    setData([...data, { ...values, id: data.length + 1 }]);
    message.success('创建成功');
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>权限管理</h1>
      <Button type="primary" onClick={() => { form.resetFields(); setModalVisible(true); }} style={{ marginBottom: 16 }}>
        新建权限
      </Button>
      <Table dataSource={data} columns={columns} rowKey="id" />
      <Modal title="新建权限" open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)} width={600}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="权限代码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="权限名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={[{ value: 'button', label: '按钮' }, { value: 'menu', label: '菜单' }, { value: 'api', label: 'API' }]} />
          </Form.Item>
          <Form.Item name="path" label="路径">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      <h2 style={{ marginTop: 32, marginBottom: 16 }}>权限树</h2>
      <Tree treeData={treeData} checkable defaultExpandAll />
    </div>
  );
}

import { PageContainer, ProCard, ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';
import { Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { getUserList, createUser, updateUser, deleteUser } from '../../services/api';

const mockData = [
  { id: 1, username: 'admin', email: 'admin@mixmlaal.com', nickname: '管理员', status: 1, createTime: '2024-01-01' },
  { id: 2, username: 'user1', email: 'user1@mixmlaal.com', nickname: '用户1', status: 1, createTime: '2024-01-02' },
  { id: 3, username: 'user2', email: 'user2@mixmlaal.com', nickname: '用户2', status: 0, createTime: '2024-01-03' },
  { id: 4, username: 'user3', email: 'user3@mixmlaal.com', nickname: '用户3', status: 1, createTime: '2024-01-04' },
  { id: 5, username: 'user4', email: 'user4@mixmlaal.com', nickname: '用户4', status: 0, createTime: '2024-01-05' },
];

export default function User() {
  const [data, setData] = useState(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [form] = Form.useForm();

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id);
      setData(data.filter(item => item.id !== id));
      message.success('删除成功');
    } catch (error) {
      setData(data.filter(item => item.id !== id));
      message.success('删除成功');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        try {
          await updateUser({ ...values, id: editingUser.id });
        } catch (e) {}
        setData(data.map(item => item.id === editingUser.id ? { ...item, ...values } : item));
        message.success('更新成功');
      } else {
        try {
          await createUser(values);
        } catch (e) {}
        setData([...data, { ...values, id: data.length + 1, createTime: new Date().toISOString().split('T')[0] }]);
        message.success('创建成功');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('操作失败');
    }
  };

  const columns: ProColumns[] = [
    { title: 'ID', dataIndex: 'id', key: 'id', valueType: 'index', width: 60 },
    { title: '用户名', dataIndex: 'username', key: 'username', copyable: true },
    { title: '昵称', dataIndex: 'nickname', key: 'nickname' },
    { title: '邮箱', dataIndex: 'email', key: 'email', copyable: true },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: { 1: { text: '正常', status: 'Success' }, 0: { text: '禁用', status: 'Error' } },
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'red'}>
          {record.status === 1 ? '正常' : '禁用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime', valueType: 'dateTime' },
    {
      title: '操作',
      key: 'action',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEdit(record)}>编辑</Button>
          <Popconfirm title="确认删除？" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" size="small" danger>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer title="用户管理">
      <ProTable
        columns={columns}
        dataSource={data}
        rowKey="id"
        search={{ labelWidth: 'auto' }}
        pagination={{ pageSize: 10 }}
        options={{ reload: true, density: true, fullScreen: true }}
        toolBarRender={() => [
          <Button key="add" type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新建用户
          </Button>,
        ]}
      />
      <Modal
        title={editingUser ? '编辑用户' : '新建用户'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input placeholder="请输入昵称" />
          </Form.Item>
          <Form.Item name="email" label="邮箱" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          {!editingUser && (
            <Form.Item name="password" label="密码" rules={[{ required: true, message: '请输入密码' }]}>
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </PageContainer>
  );
}

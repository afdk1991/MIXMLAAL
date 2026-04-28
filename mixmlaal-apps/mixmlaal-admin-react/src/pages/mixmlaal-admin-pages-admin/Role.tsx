import { useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message } from 'antd';

const mockData = [
  { id: 1, code: 'admin', name: '管理员', description: '系统管理员', status: 1, createTime: '2024-01-01' },
  { id: 2, code: 'user', name: '普通用户', description: '普通用户角色', status: 1, createTime: '2024-01-02' },
  { id: 3, code: 'guest', name: '访客', description: '访客角色', status: 0, createTime: '2024-01-03' },
];

export default function Role() {
  const [data, setData] = useState(mockData);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form] = Form.useForm();

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '角色代码', dataIndex: 'code', key: 'code' },
    { title: '角色名称', dataIndex: 'name', key: 'name' },
    { title: '描述', dataIndex: 'description', key: 'description' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (v: number) => v === 1 ? '正常' : '禁用' },
    { title: '创建时间', dataIndex: 'createTime', key: 'createTime' },
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
    setEditingRole(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = (id: number) => {
    setData(data.filter(item => item.id !== id));
    message.success('删除成功');
  };

  const handleSubmit = async () => {
    const values = await form.validateFields();
    if (editingRole) {
      setData(data.map(item => item.id === editingRole.id ? { ...item, ...values } : item));
      message.success('更新成功');
    } else {
      setData([...data, { ...values, id: data.length + 1, createTime: new Date().toISOString().split('T')[0] }]);
      message.success('创建成功');
    }
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>角色管理</h1>
      <Button type="primary" onClick={() => { setEditingRole(null); form.resetFields(); setModalVisible(true); }} style={{ marginBottom: 16 }}>
        新建角色
      </Button>
      <Table dataSource={data} columns={columns} rowKey="id" />
      <Modal title={editingRole ? '编辑角色' : '新建角色'} open={modalVisible} onOk={handleSubmit} onCancel={() => setModalVisible(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="角色代码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="角色名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

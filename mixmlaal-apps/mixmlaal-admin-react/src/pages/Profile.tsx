import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic,Descriptions, Avatar, Tag, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const mockUserInfo = {
  id: 1,
  username: 'admin',
  nickname: '管理员',
  email: 'admin@mixmlaal.com',
  phone: '138****8888',
  avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif',
  role: '系统管理员',
  department: '技术部',
  createTime: '2024-01-01 10:00:00',
  lastLogin: '2024-01-15 14:30:00',
  status: 'active',
};

export default function Profile() {
  const [userInfo] = useState(mockUserInfo);

  return (
    <PageContainer title="个人中心">
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={8}>
          <Card bordered={false}>
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <Avatar size={120} src={userInfo.avatar} icon={<UserOutlined />} />
              <h2 style={{ marginTop: 16, marginBottom: 8 }}>{userInfo.nickname}</h2>
              <Tag color="blue">{userInfo.role}</Tag>
              <Divider />
              <Descriptions column={1} size="small">
                <Descriptions.Item label="部门">{userInfo.department}</Descriptions.Item>
                <Descriptions.Item label="注册时间">
                  <ClockCircleOutlined /> {userInfo.createTime}
                </Descriptions.Item>
                <Descriptions.Item label="最后登录">
                  <ClockCircleOutlined /> {userInfo.lastLogin}
                </Descriptions.Item>
              </Descriptions>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={16}>
          <Card title="基本信息" bordered={false} style={{ marginBottom: 16 }}>
            <Descriptions column={{ xs: 1, sm: 2 }}>
              <Descriptions.Item label="用户名">{userInfo.username}</Descriptions.Item>
              <Descriptions.Item label="昵称">{userInfo.nickname}</Descriptions.Item>
              <Descriptions.Item label="邮箱">
                <MailOutlined /> {userInfo.email}
              </Descriptions.Item>
              <Descriptions.Item label="手机号">
                <PhoneOutlined /> {userInfo.phone}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag color={userInfo.status === 'active' ? 'green' : 'red'}>
                  {userInfo.status === 'active' ? '正常' : '禁用'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="角色">{userInfo.role}</Descriptions.Item>
            </Descriptions>
          </Card>

          <Card title="账号统计" bordered={false}>
            <Row gutter={16}>
              <Col span={8}>
                <Statistic title="登录次数" value={156} suffix="次" />
              </Col>
              <Col span={8}>
                <Statistic title="操作记录" value={428} suffix="条" />
              </Col>
              <Col span={8}>
                <Statistic title="积分" value={12580} suffix="分" />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

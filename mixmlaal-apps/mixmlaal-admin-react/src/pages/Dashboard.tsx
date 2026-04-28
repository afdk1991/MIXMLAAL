import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, List, Tag, Progress } from 'antd';
import { UserOutlined, ShoppingCartOutlined, DollarOutlined, RiseOutlined, TeamOutlined, SafetyOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';

const statisticsData = {
  totalUsers: 12580,
  todayUsers: 156,
  totalOrders: 42850,
  todayOrders: 328,
  totalRevenue: 1256800,
  todayRevenue: 28560,
  userGrowth: 12.5,
  orderGrowth: 8.3,
};

const recentActivities = [
  { id: 1, user: 'admin', action: '登录系统', time: '2024-01-15 14:30:00', type: 'login' },
  { id: 2, user: 'user001', action: '创建订单 #12345', time: '2024-01-15 14:25:00', type: 'order' },
  { id: 3, user: 'user002', action: '完成支付 ¥128.00', time: '2024-01-15 14:20:00', type: 'payment' },
  { id: 4, user: 'user003', action: '更新个人资料', time: '2024-01-15 14:15:00', type: 'profile' },
  { id: 5, user: 'admin', action: '添加新用户 user004', time: '2024-01-15 14:10:00', type: 'admin' },
];

const systemHealth = {
  cpu: 35,
  memory: 62,
  disk: 48,
  network: 28,
};

export default function Dashboard() {
  const [stats] = useState(statisticsData);

  return (
    <PageContainer title="仪表盘">
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="总用户数"
              value={stats.totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix="人"
            />
            <div style={{ marginTop: 8 }}>
              <RiseOutlined style={{ color: '#52c41a' }} /> {stats.userGrowth}% 较上月
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="今日新增"
              value={stats.todayUsers}
              prefix={<TeamOutlined style={{ color: '#722ed1' }} />}
              suffix="人"
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="总订单数"
              value={stats.totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#fa8c16' }} />}
              suffix="单"
            />
            <div style={{ marginTop: 8 }}>
              <RiseOutlined style={{ color: '#52c41a' }} /> {stats.orderGrowth}% 较上月
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false} hoverable>
            <Statistic
              title="总收入"
              value={stats.totalRevenue}
              prefix={<DollarOutlined style={{ color: '#13c2c2' }} />}
              precision={2}
              suffix="元"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="最近活动" bordered={false}>
            <List
              dataSource={recentActivities}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <Tag color={
                        item.type === 'login' ? 'blue' :
                        item.type === 'order' ? 'green' :
                        item.type === 'payment' ? 'orange' :
                        item.type === 'admin' ? 'purple' : 'default'
                      }>
                        {item.type.toUpperCase()}
                      </Tag>
                    }
                    title={<span>{item.user} <span style={{ color: '#666' }}>{item.action}</span></span>}
                    description={item.time}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="系统健康状态" bordered={false}>
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>CPU 使用率</span>
                <span>{systemHealth.cpu}%</span>
              </div>
              <Progress percent={systemHealth.cpu} strokeColor="#1890ff" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>内存使用</span>
                <span>{systemHealth.memory}%</span>
              </div>
              <Progress percent={systemHealth.memory} strokeColor="#722ed1" />
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>磁盘使用</span>
                <span>{systemHealth.disk}%</span>
              </div>
              <Progress percent={systemHealth.disk} strokeColor="#fa8c16" />
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span>网络负载</span>
                <span>{systemHealth.network}%</span>
              </div>
              <Progress percent={systemHealth.network} strokeColor="#13c2c2" />
            </div>
          </Card>

          <Card title="安全概览" bordered={false} style={{ marginTop: 16 }}>
            <Row gutter={16}>
              <Col span={12}>
                <Statistic title="安全评分" value={98} suffix="/100" valueStyle={{ color: '#52c41a' }} />
              </Col>
              <Col span={12}>
                <SafetyOutlined style={{ fontSize: 48, color: '#52c41a', display: 'block', textAlign: 'center' }} />
              </Col>
            </Row>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666' }}>
              系统安全状态良好，无异常报告
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="系统信息" bordered={false}>
            <Row gutter={16}>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>v1.0.0</div>
                  <div style={{ color: '#666' }}>系统版本</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>React 18</div>
                  <div style={{ color: '#666' }}>前端框架</div>
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>正常运行</div>
                  <div style={{ color: '#666' }}>运行状态</div>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

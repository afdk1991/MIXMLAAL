import { PageContainer } from '@ant-design/pro-components';
import { Card, Row, Col, Statistic, Table, Progress, Tag, DatePicker, Select } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, UserOutlined, ShoppingCartOutlined, DollarOutlined } from '@ant-design/icons';
import { useState } from 'react';

const { RangePicker } = DatePicker;

const mockChartData = {
  labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
  users: [1200, 1450, 1680, 1920, 2100, 2350, 2580, 2890, 3120, 3350, 3580, 3890],
  orders: [4500, 5200, 5800, 6400, 7100, 7800, 8500, 9200, 9900, 10600, 11300, 12000],
  revenue: [125000, 142000, 158000, 175000, 192000, 210000, 228000, 246000, 265000, 284000, 303000, 325000],
};

const topProducts = [
  { id: 1, name: 'iPhone 15 Pro', sales: 1256, revenue: 12560000, growth: 15.8 },
  { id: 2, name: 'MacBook Pro 14', sales: 892, revenue: 17840000, growth: 12.3 },
  { id: 3, name: 'iPad Air', sales: 756, revenue: 3780000, growth: -2.5 },
  { id: 4, name: 'AirPods Pro', sales: 2134, revenue: 3201000, growth: 25.6 },
  { id: 5, name: 'Apple Watch S9', sales: 623, revenue: 3740000, growth: 8.9 },
];

const topRegions = [
  { region: '华东地区', users: 45678, orders: 123456, revenue: 45678900, percentage: 35 },
  { region: '华南地区', users: 38901, orders: 98765, revenue: 38901200, percentage: 28 },
  { region: '华北地区', users: 31245, orders: 78901, revenue: 31245500, percentage: 22 },
  { region: '西南地区', users: 15678, orders: 45678, revenue: 15678500, percentage: 10 },
  { region: '东北地区', users: 8923, orders: 23456, revenue: 8923400, percentage: 5 },
];

const columns = [
  { title: '排名', dataIndex: 'id', key: 'id', render: (v: number) => v <= 3 ? <Tag color={v === 1 ? 'gold' : v === 2 ? 'silver' : 'bronze'}>{v}</Tag> : v },
  { title: '商品名称', dataIndex: 'name', key: 'name' },
  { title: '销量', dataIndex: 'sales', key: 'sales', sorter: (a: any, b: any) => a.sales - b.sales },
  { title: '销售额', dataIndex: 'revenue', key: 'revenue', render: (v: number) => `¥${(v / 10000).toFixed(2)}万` },
  {
    title: '增长率',
    dataIndex: 'growth',
    key: 'growth',
    render: (v: number) => (
      <span style={{ color: v >= 0 ? '#52c41a' : '#ff4d4f' }}>
        {v >= 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(v)}%
      </span>
    ),
    sorter: (a: any, b: any) => a.growth - b.growth,
  },
];

export default function Statistics() {
  const [dateRange, setDateRange] = useState<string>('year');
  const [chartData] = useState(mockChartData);

  const totalUsers = chartData.users.reduce((a, b) => a + b, 0);
  const totalOrders = chartData.orders.reduce((a, b) => a + b, 0);
  const totalRevenue = chartData.revenue.reduce((a, b) => a + b, 0);

  const maxValue = Math.max(...chartData.users);

  return (
    <PageContainer title="数据统计">
      <Card bordered={false} style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <span style={{ marginRight: 8 }}>时间范围：</span>
            <Select
              value={dateRange}
              onChange={setDateRange}
              options={[
                { value: 'week', label: '最近一周' },
                { value: 'month', label: '最近一月' },
                { value: 'year', label: '最近一年' },
              ]}
              style={{ width: 120 }}
            />
          </div>
          <RangePicker />
        </div>
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="年度用户增长"
              value={totalUsers}
              prefix={<UserOutlined style={{ color: '#1890ff' }} />}
              suffix="人"
            />
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              <ArrowUpOutlined /> 12.5% 较去年
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="年度订单总量"
              value={totalOrders}
              prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
              suffix="单"
            />
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              <ArrowUpOutlined /> 8.3% 较去年
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="年度总收入"
              value={totalRevenue}
              prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
              precision={2}
              suffix="元"
            />
            <div style={{ marginTop: 8, color: '#52c41a' }}>
              <ArrowUpOutlined /> 15.8% 较去年
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} lg={6}>
          <Card bordered={false}>
            <Statistic
              title="平均客单价"
              value={(totalRevenue / totalOrders).toFixed(2)}
              precision={2}
              suffix="元"
            />
            <div style={{ marginTop: 8, color: '#ff4d4f' }}>
              <ArrowDownOutlined /> 2.1% 较去年
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="用户增长趋势" bordered={false}>
            <div style={{ height: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', padding: '20px 0' }}>
              {chartData.users.map((value, index) => (
                <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                  <div style={{
                    width: 40,
                    height: (value / maxValue) * 220,
                    background: 'linear-gradient(180deg, #1890ff 0%, #69c0ff 100%)',
                    borderRadius: '4px 4px 0 0',
                    transition: 'height 0.3s',
                  }} />
                  <span style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{chartData.labels[index]}</span>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="订单统计" bordered={false}>
            <Table
              dataSource={topProducts}
              columns={columns}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col span={24}>
          <Card title="区域销售分布" bordered={false}>
            <Row gutter={16}>
              {topRegions.map((item) => (
                <Col key={item.region} xs={24} sm={12} lg={6}>
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span>{item.region}</span>
                      <span style={{ color: '#1890ff' }}>{item.percentage}%</span>
                    </div>
                    <Progress percent={item.percentage} strokeColor="#1890ff" showInfo={false} />
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                      用户: {(item.users / 10000).toFixed(1)}万 | 订单: {(item.orders / 10000).toFixed(1)}万 | 销售额: ¥{(item.revenue / 100000000).toFixed(2)}亿
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>
      </Row>
    </PageContainer>
  );
}

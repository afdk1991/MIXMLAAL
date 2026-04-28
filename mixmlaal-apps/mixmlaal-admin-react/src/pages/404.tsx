export default () => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '100px 0',
      background: '#f0f2f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ fontSize: 120, margin: 0, color: '#d9d9d9' }}>404</h1>
      <h2 style={{ color: '#666', marginBottom: 24 }}>抱歉，您访问的页面不存在</h2>
      <a href="/" style={{ color: '#1890ff', fontSize: 16 }}>返回首页</a>
    </div>
  );
};

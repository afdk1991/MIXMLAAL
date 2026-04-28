import { useState, useEffect } from 'react';
import { history } from '@umijs/max';
import { message } from 'antd';
import { getUserInfo } from '../services/user';

export default function Login() {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const { data } = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      }).then(res => res.json());

      if (data?.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        message.success('登录成功');
        history.push('/dashboard');
      }
    } catch (error) {
      message.error('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <div style={{ width: 400, padding: 24, background: '#fff', borderRadius: 8 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>MIXMLAAL Admin</h1>
        <form onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.target as HTMLFormElement);
          handleSubmit({
            username: formData.get('username') as string,
            password: formData.get('password') as string,
          });
        }}>
          <input name="username" placeholder="用户名" style={{ width: '100%', marginBottom: 16, padding: '8px 12px' }} required />
          <input name="password" type="password" placeholder="密码" style={{ width: '100%', marginBottom: 16, padding: '8px 12px' }} required />
          <button type="submit" disabled={loading} style={{ width: '100%', padding: '8px 12px', background: '#1890ff', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? '登录中...' : '登录'}
          </button>
        </form>
      </div>
    </div>
  );
}

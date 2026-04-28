import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// 响应拦截器
api.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response) {
      // 处理401错误
      if (error.response.status === 401) {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        window.location.href = '/login'
      }
      return Promise.reject(new Error(error.response.data.error || '请求失败'))
    }
    return Promise.reject(new Error('网络错误'))
  }
)

const authApi = {
  async login(email, password) {
    return api.post('/auth/login', { email, password })
  },

  async register(username, email, password) {
    return api.post('/auth/register', { username, email, password })
  },

  async resetPassword(email, newPassword) {
    return api.post('/auth/reset-password', { email, newPassword })
  }
}

export default authApi
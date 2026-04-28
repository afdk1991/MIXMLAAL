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

const userApi = {
  async getProfile() {
    return api.get('/users/me')
  },

  async updateProfile(data) {
    return api.put('/users/me', data)
  },

  async getAddresses() {
    return api.get('/users/me/addresses')
  },

  async addAddress(data) {
    return api.post('/users/me/addresses', data)
  },

  async updateAddress(id, data) {
    return api.put(`/users/me/addresses/${id}`, data)
  },

  async deleteAddress(id) {
    return api.delete(`/users/me/addresses/${id}`)
  },

  async setDefaultAddress(id) {
    return api.put(`/users/me/addresses/${id}/default`)
  }
}

export default userApi
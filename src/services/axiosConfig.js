import axios from 'axios'

// 設定基礎 URL - 用於管理員 API
axios.defaults.baseURL = 'http://localhost:3000'

// 設定請求攔截器
axios.interceptors.request.use(
  config => {
    // 從 localStorage 獲取 token
    const adminToken = localStorage.getItem('adminToken')
    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// 設定回應攔截器
axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response) {
      // 處理 401 錯誤
      if (error.response.status === 401) {
        // 清除本地存儲的 token
        localStorage.removeItem('adminToken')
        // 重定向到登入頁面
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

export default axios 
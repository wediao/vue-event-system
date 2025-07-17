import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'
import './services/axiosConfig'

// 全局配置
window.global = window;
if (typeof global === 'undefined') {
  window.global = window;
}

// 創建應用實例
const app = createApp(App)

// 註冊全局錯誤處理器
app.config.errorHandler = (err, vm, info) => {
  console.error('全局錯誤：', err)
  console.error('錯誤來源：', info)
  
  // 在開發環境中顯示更詳細的錯誤信息
  if (process.env.NODE_ENV === 'development') {
    console.error('Vue 實例：', vm)
    console.error('錯誤堆疊：', err.stack)
  }
}

// 註冊全局性能監控
if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

// 使用插件
const pinia = createPinia()
app.use(pinia)

// 註冊路由
app.use(router)

// 初始化 auth store
const authStore = useAuthStore()
authStore.initializeAuth()

// 註冊 Toast

// 等待 DOM 準備好後再掛載應用
document.addEventListener('DOMContentLoaded', () => {
app.mount('#app')
})

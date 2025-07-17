import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { useAuthStore } from './stores/auth'
import './services/axiosConfig'

import Toast, { POSITION } from 'vue-toastification'
import 'vue-toastification/dist/index.css'

// 全局配置
window.global = window;
if (typeof global === 'undefined') {
  window.global = window;
}

const app = createApp(App)

app.config.errorHandler = (err, vm, info) => {
  console.error('全局錯誤：', err)
  console.error('錯誤來源：', info)
  if (process.env.NODE_ENV === 'development') {
    console.error('Vue 實例：', vm)
    console.error('錯誤堆疊：', err.stack)
  }
}

if (process.env.NODE_ENV === 'development') {
  app.config.performance = true
}

const pinia = createPinia()
app.use(pinia)

app.use(router)

// ✅ 加入 Toast 插件
app.use(Toast, {
  position: POSITION.TOP_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true
})

const authStore = useAuthStore()
authStore.initializeAuth()

document.addEventListener('DOMContentLoaded', () => {
  app.mount('#app')
})

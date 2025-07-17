import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import Toast from 'vue-toastification'
import 'vue-toastification/dist/index.css'

if (import.meta.env.DEV) {
  // 只在本地開發時自動清除
  localStorage.removeItem('adminToken')
  localStorage.removeItem('userToken')
}

const app = createApp(App)

app.use(router)
app.use(createPinia())
app.use(Toast)

app.mount('#app')
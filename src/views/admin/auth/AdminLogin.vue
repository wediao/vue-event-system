<template>
  <div class="admin-login">
    <div class="login-card">
      <div class="login-header">
        <div class="logo">👥</div>
        <h1>會員登入</h1>
      </div>

      <div class="login-tabs">
        <button 
          :class="['tab-btn', { active: loginType === 'user' }]"
          @click="loginType = 'user'"
        >
          使用者登入
        </button>
        <button 
          :class="['tab-btn', { active: loginType === 'admin' }]"
          @click="loginType = 'admin'"
        >
          管理員登入
        </button>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>帳號</label>
          <input 
            type="text" 
            v-model="form.username"
            required
            :placeholder="loginType === 'admin' ? '請輸入管理員帳號' : '請輸入使用者帳號'"
            autocomplete="username"
          >
        </div>

        <div class="form-group">
          <label>密碼</label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'" 
              v-model="form.password"
              required
              placeholder="請輸入密碼"
              autocomplete="current-password"
            >
            <button 
              type="button" 
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
        </div>

        <div class="form-error" v-if="error">
          {{ error }}
        </div>

        <button 
          type="submit" 
          class="btn-login"
          :disabled="isLoading"
        >
          {{ isLoading ? '登入中...' : '登入' }}
        </button>
      </form>

      <div class="demo-info">
        <p>測試帳號：</p>
        <template v-if="loginType === 'admin'">
          <code>
            管理員帳號：admin<br>
            管理員密碼：admin123
          </code>
        </template>
        <template v-else>
          <code>
            使用者帳號：user<br>
            使用者密碼：user123
          </code>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const loginType = ref('user') // 預設為使用者登入
const form = ref({
  username: '',
  password: ''
})

const showPassword = ref(false)
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  error.value = ''
  isLoading.value = true

  try {
    // 在實際應用中，這裡應該調用後端 API
    // 目前使用模擬的登入邏輯
    if (loginType.value === 'admin') {
      if (form.value.username === 'admin' && form.value.password === 'admin123') {
        authStore.login('admin')
        toast.success('管理員登入成功')
        router.push('/admin')
      } else {
        error.value = '管理員帳號或密碼錯誤'
        toast.error('登入失敗')
      }
    } else {
      if (form.value.username === 'user' && form.value.password === 'user123') {
        authStore.login('user')
        toast.success('登入成功')
        router.push('/events')
      } else {
        error.value = '帳號或密碼錯誤'
        toast.error('登入失敗')
      }
    }
  } catch (err) {
    error.value = '登入失敗，請稍後再試'
    toast.error('登入失敗')
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  background: #f5f5f5;
  padding: 20px;
}

.login-card {
  background: white;
  border-radius: 8px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.login-header {
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  font-size: 48px;
  margin-bottom: 10px;
}

h1 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.login-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 30px;
  padding: 4px;
  background: #f5f5f5;
  border-radius: 8px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  background: none;
  color: #666;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: white;
  color: #6200ee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.login-form {
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 20px;
}

.form-error {
  color: #dc3545;
  margin-bottom: 15px;
  font-size: 0.9em;
}

.btn-login {
  width: 100%;
  padding: 12px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn-login:hover {
  background: #5000c9;
}

.btn-login:disabled {
  background: #b794f6;
  cursor: not-allowed;
}

.demo-info {
  margin-top: 20px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  font-size: 0.9em;
}

.demo-info p {
  margin: 0 0 10px 0;
  color: #666;
}

code {
  display: block;
  padding: 10px;
  background: #eee;
  border-radius: 4px;
  color: #333;
}
</style> 
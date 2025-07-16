<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>會員登入</h1>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label>帳號</label>
          <input 
            type="text" 
            v-model="form.username"
            required
            placeholder="請輸入帳號"
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

        <div class="form-options">
          <label class="remember-me">
            <input 
              type="checkbox"
              v-model="form.rememberMe"
            >
            <span>記住我</span>
          </label>
          <a href="#" class="forgot-password" @click.prevent="handleForgotPassword">
            忘記密碼？
          </a>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ isLoading ? '登入中...' : '登入' }}
          </button>
          <button 
            type="button" 
            class="btn btn-outline"
            @click="handleRegister"
          >
            註冊新帳號
          </button>
        </div>

        <!-- 測試帳號提示 -->
        <div class="test-accounts">
          <p class="divider">測試帳號</p>
          <div class="account-info">
            <p>管理員：admin / admin123</p>
            <p>經理：manager / manager123</p>
            <p>工作人員：staff / staff123</p>
            <p>一般用戶：user / user123</p>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const toast = useToast()

const form = reactive({
  username: '',
  password: '',
  rememberMe: false
})

const showPassword = ref(false)
const isLoading = ref(false)

// 處理登入
const handleLogin = async () => {
  try {
    isLoading.value = true
    
    // 測試帳號驗證
    const testAccounts = {
      admin: { password: 'admin123', role: authStore.ROLES.ADMIN },
      manager: { password: 'manager123', role: authStore.ROLES.MANAGER },
      staff: { password: 'staff123', role: authStore.ROLES.STAFF },
      user: { password: 'user123', role: authStore.ROLES.USER }
    }
    
    const account = testAccounts[form.username]
    
    if (account && account.password === form.password) {
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // 設置登入狀態
      authStore.login(account.role, {
        username: form.username,
        displayName: form.username.charAt(0).toUpperCase() + form.username.slice(1),
        lastLogin: new Date().toISOString()
      })
      
      // 顯示成功訊息
      toast.success('登入成功！')
      
      // 根據用戶角色決定重定向路徑
      const rolePaths = {
        [authStore.ROLES.ADMIN]: '/admin',
        [authStore.ROLES.MANAGER]: '/admin/events',
        [authStore.ROLES.STAFF]: '/admin/events',
        [authStore.ROLES.USER]: '/user/profile'
      }
      
      const defaultPath = rolePaths[account.role]
      const redirectPath = route.query.redirect || defaultPath
      
      // 檢查重定向路徑是否合法
      if (!authStore.hasPermission('manage_all') && redirectPath.startsWith('/admin')) {
        // 如果用戶沒有管理權限但試圖訪問管理員頁面，重定向到對應的預設頁面
        router.push(defaultPath)
      } else {
        router.push(redirectPath)
      }
    } else {
      toast.error('帳號或密碼錯誤')
    }
  } catch (error) {
    console.error('登入錯誤：', error)
    toast.error('登入失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// 處理註冊
const handleRegister = () => {
  router.push('/register')
}

// 處理忘記密碼
const handleForgotPassword = () => {
  router.push('/forgot-password')
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: var(--background-light);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: var(--text-secondary);
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 2px rgba(142, 68, 173, 0.1);
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  font-size: 1.25rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.forgot-password {
  color: var(--primary-color);
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--secondary-color);
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background: var(--background-light);
}

.test-accounts {
  text-align: center;
}

.divider {
  position: relative;
  text-align: center;
  margin: 1rem 0;
  color: var(--text-secondary);
}

.divider::before,
.divider::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background: var(--border-color);
}

.divider::before {
  left: 0;
}

.divider::after {
  right: 0;
}

.account-info {
  background: var(--background-light);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.account-info p {
  margin: 0.5rem 0;
  color: var(--text-secondary);
  font-family: monospace;
}

@media (max-width: 480px) {
  .login-container {
    padding: 1.5rem;
  }

  .form-options {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
}
</style> 
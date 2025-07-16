<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-header">
        <h1>會員註冊</h1>
      </div>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label>帳號 <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="form.username"
            required
            placeholder="請輸入帳號"
            :class="{ 'error': errors.username }"
          >
          <span class="error-message" v-if="errors.username">{{ errors.username }}</span>
          <small class="helper-text">帳號長度需在 4-20 個字元之間，只能包含英文字母、數字和底線</small>
        </div>

        <div class="form-group">
          <label>密碼 <span class="required">*</span></label>
          <div class="password-input">
            <input 
              :type="showPassword ? 'text' : 'password'"
              v-model="form.password"
              required
              placeholder="請輸入密碼"
              :class="{ 'error': errors.password }"
            >
            <button 
              type="button"
              class="toggle-password"
              @click="showPassword = !showPassword"
            >
              {{ showPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.password">{{ errors.password }}</span>
          <small class="helper-text">密碼長度需在 8-20 個字元之間，需包含大小寫字母、數字</small>
        </div>

        <div class="form-group">
          <label>確認密碼 <span class="required">*</span></label>
          <div class="password-input">
            <input 
              :type="showConfirmPassword ? 'text' : 'password'"
              v-model="form.confirmPassword"
              required
              placeholder="請再次輸入密碼"
              :class="{ 'error': errors.confirmPassword }"
            >
            <button 
              type="button"
              class="toggle-password"
              @click="showConfirmPassword = !showConfirmPassword"
            >
              {{ showConfirmPassword ? '👁️' : '👁️‍🗨️' }}
            </button>
          </div>
          <span class="error-message" v-if="errors.confirmPassword">{{ errors.confirmPassword }}</span>
        </div>

        <div class="form-group">
          <label>電子郵件 <span class="required">*</span></label>
          <input 
            type="email" 
            v-model="form.email"
            required
            placeholder="請輸入電子郵件"
            :class="{ 'error': errors.email }"
          >
          <span class="error-message" v-if="errors.email">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label>姓名 <span class="required">*</span></label>
          <input 
            type="text" 
            v-model="form.name"
            required
            placeholder="請輸入姓名"
            :class="{ 'error': errors.name }"
          >
          <span class="error-message" v-if="errors.name">{{ errors.name }}</span>
        </div>

        <div class="form-group">
          <label>手機號碼 <span class="required">*</span></label>
          <input 
            type="tel" 
            v-model="form.phone"
            required
            placeholder="請輸入手機號碼"
            :class="{ 'error': errors.phone }"
          >
          <span class="error-message" v-if="errors.phone">{{ errors.phone }}</span>
        </div>

        <div class="form-group terms">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="form.agreeToTerms"
              required
              :class="{ 'error': errors.agreeToTerms }"
            >
            <span>我已閱讀並同意<a href="#" @click.prevent="showTerms">服務條款與隱私權政策</a></span>
          </label>
          <span class="error-message" v-if="errors.agreeToTerms">{{ errors.agreeToTerms }}</span>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="isLoading"
          >
            {{ isLoading ? '註冊中...' : '註冊' }}
          </button>
          <button 
            type="button" 
            class="btn btn-outline"
            @click="goToLogin"
          >
            返回登入
          </button>
        </div>
      </form>
    </div>

    <!-- 服務條款彈窗 -->
    <div v-if="showTermsModal" class="modal" @click="closeTerms">
      <div class="modal-content" @click.stop>
        <h2>服務條款與隱私權政策</h2>
        <div class="terms-content">
          <h3>服務條款</h3>
          <p>1. 會員須提供真實、正確且完整的個人資料。</p>
          <p>2. 會員須妥善保管帳號密碼，不得轉讓或出借給他人使用。</p>
          <p>3. 會員不得利用本服務從事任何違法或不當行為。</p>
          <p>4. 本公司保留修改服務內容及條款的權利。</p>

          <h3>隱私權政策</h3>
          <p>1. 蒐集目的：會員管理、活動報名、通知與聯繫。</p>
          <p>2. 資料範圍：帳號、密碼、姓名、電子郵件、手機號碼等。</p>
          <p>3. 利用方式：僅供本網站相關服務使用。</p>
          <p>4. 資料保護：採用適當的安全措施保護會員資料。</p>
          <p>5. 您有權查詢、閱覽、更正或刪除個人資料。</p>
        </div>
        <button class="btn btn-primary" @click="closeTerms">我已了解</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const toast = useToast()
const authStore = useAuthStore()

const form = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  name: '',
  phone: '',
  agreeToTerms: false
})

const errors = reactive({
  username: '',
  password: '',
  confirmPassword: '',
  email: '',
  name: '',
  phone: '',
  agreeToTerms: ''
})

const showPassword = ref(false)
const showConfirmPassword = ref(false)
const isLoading = ref(false)
const showTermsModal = ref(false)

// 表單驗證
const validateForm = () => {
  let isValid = true
  
  // 重置錯誤訊息
  Object.keys(errors).forEach(key => {
    errors[key] = ''
  })

  // 帳號驗證
  if (!form.username) {
    errors.username = '請輸入帳號'
    isValid = false
  } else if (!/^[a-zA-Z0-9_]{4,20}$/.test(form.username)) {
    errors.username = '帳號格式不正確'
    isValid = false
  }

  // 密碼驗證
  if (!form.password) {
    errors.password = '請輸入密碼'
    isValid = false
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,20}$/.test(form.password)) {
    errors.password = '密碼格式不正確'
    isValid = false
  }

  // 確認密碼驗證
  if (!form.confirmPassword) {
    errors.confirmPassword = '請再次輸入密碼'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = '兩次輸入的密碼不一致'
    isValid = false
  }

  // 電子郵件驗證
  if (!form.email) {
    errors.email = '請輸入電子郵件'
    isValid = false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = '電子郵件格式不正確'
    isValid = false
  }

  // 姓名驗證
  if (!form.name) {
    errors.name = '請輸入姓名'
    isValid = false
  } else if (form.name.length < 2) {
    errors.name = '姓名至少需要2個字'
    isValid = false
  }

  // 手機號碼驗證
  if (!form.phone) {
    errors.phone = '請輸入手機號碼'
    isValid = false
  } else if (!/^09\d{8}$/.test(form.phone)) {
    errors.phone = '手機號碼格式不正確'
    isValid = false
  }

  // 服務條款驗證
  if (!form.agreeToTerms) {
    errors.agreeToTerms = '請同意服務條款與隱私權政策'
    isValid = false
  }

  return isValid
}

// 處理註冊
const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  isLoading.value = true

  try {
    // 這裡應該調用後端 API 進行註冊
    // 目前先模擬註冊成功
    await new Promise(resolve => setTimeout(resolve, 1000))

    // 註冊成功後自動登入
    authStore.login(authStore.ROLES.USER, {
      username: form.username,
      displayName: form.name,
      email: form.email,
      phone: form.phone,
      lastLogin: new Date().toISOString()
    })

    toast.success('註冊成功！')
    router.push('/user/profile')
  } catch (error) {
    console.error('註冊錯誤：', error)
    toast.error('註冊失敗，請稍後再試')
  } finally {
    isLoading.value = false
  }
}

// 前往登入頁
const goToLogin = () => {
  router.push('/login')
}

// 顯示服務條款
const showTerms = () => {
  showTermsModal.value = true
}

// 關閉服務條款
const closeTerms = () => {
  showTermsModal.value = false
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: var(--background-light);
  padding: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.register-container {
  max-width: 500px;
  width: 100%;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.register-header {
  text-align: center;
  margin-bottom: 2rem;
}

.register-header h1 {
  color: var(--text-primary);
  font-size: 1.75rem;
  margin: 0;
}

.register-form {
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
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.required {
  color: var(--error-color);
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

.form-group input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 0.875rem;
}

.helper-text {
  color: var(--text-secondary);
  font-size: 0.875rem;
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

.terms {
  margin-top: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: 1.25rem;
  height: 1.25rem;
}

.checkbox-label a {
  color: var(--primary-color);
  text-decoration: none;
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-primary:hover {
  background: var(--primary-dark);
}

.btn-primary:disabled {
  background: var(--disabled-color);
  cursor: not-allowed;
}

.btn-outline {
  background: transparent;
  border: 1px solid var(--primary-color);
  color: var(--primary-color);
}

.btn-outline:hover {
  background: var(--primary-light);
}

/* 彈窗樣式 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-content {
  margin: 1.5rem 0;
}

.terms-content h3 {
  color: var(--text-primary);
  margin: 1rem 0 0.5rem;
}

.terms-content p {
  color: var(--text-secondary);
  margin: 0.5rem 0;
  line-height: 1.5;
}
</style> 
<template>
  <div class="registration-container">
    <div v-if="loading" class="loading">
      <div class="spinner"></div>
      <p>載入中...</p>
    </div>
    
    <div v-else-if="error" class="error-message">
      {{ error }}
    </div>
    
    <div v-else class="registration-content">
      <h1>{{ event.name }}</h1>
      
      <div class="event-info">
        <p class="description">{{ event.description }}</p>
        <p class="time-info">
          開放搶購時間：
          <strong>{{ formatDateTime(event.registrationStartTime) }}</strong>
        </p>
        <p class="capacity-info">
          活動名額：<strong>{{ event.capacity }}</strong> 人
        </p>
      </div>

      <form @submit.prevent="handleSubmit" class="registration-form">
        <div class="form-group">
          <label for="name">姓名 <span class="required">*</span></label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            required
            :disabled="isSubmitting"
            placeholder="請輸入真實姓名"
            minlength="2"
            maxlength="20"
          >
          <small class="form-text">請填寫身分證件上的真實姓名</small>
        </div>

        <div class="form-group">
          <label for="idNumber">身分證字號 <span class="required">*</span></label>
          <input
            id="idNumber"
            v-model="formData.idNumber"
            type="text"
            required
            :disabled="isSubmitting"
            placeholder="A123456789"
            pattern="[A-Z][12][0-9]{8}"
            maxlength="10"
            @input="debouncedIdCheck(formData.idNumber)"
          >
          <small class="form-text">請填寫正確的身分證字號，用於身分驗證</small>
          <div v-if="duplicateCheckStatus.idNumber.checking" class="checking-status">
            檢查中...
          </div>
          <div v-if="duplicateCheckStatus.idNumber.isDuplicate" class="duplicate-status" style="color: red;">
            {{ duplicateCheckStatus.idNumber.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="email">電子郵件 <span class="required">*</span></label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            :disabled="isSubmitting"
            placeholder="example@email.com"
            @input="debouncedEmailCheck(formData.email)"
          >
          <small class="form-text">活動通知及序號將寄送至此信箱</small>
          <!-- 最近使用的郵件列表 -->
          <div v-if="recentEmails.length > 0" class="recent-emails">
            <div class="recent-emails-title">最近使用的郵件：</div>
            <div 
              v-for="email in recentEmails" 
              :key="email"
              class="recent-email-item"
              @click="selectRecentEmail(email)"
            >
              {{ email }}
            </div>
          </div>
          <div v-if="duplicateCheckStatus.email.checking" class="checking-status">
            檢查中...
          </div>
          <div v-if="duplicateCheckStatus.email.isDuplicate" class="duplicate-status" style="color: red;">
            {{ duplicateCheckStatus.email.message }}
          </div>
        </div>

        <div class="form-group">
          <label for="phone">手機號碼 <span class="required">*</span></label>
          <input
            id="phone"
            v-model="formData.phone"
            type="tel"
            required
            :disabled="isSubmitting"
            placeholder="0912345678"
            pattern="09[0-9]{8}"
            maxlength="10"
          >
          <small class="form-text">請填寫正確的手機號碼，用於活動通知</small>
        </div>

        <div class="form-group">
          <label for="birthdate">出生日期 <span class="required">*</span></label>
          <input
            id="birthdate"
            v-model="formData.birthdate"
            type="date"
            required
            :disabled="isSubmitting"
            :max="maxBirthdate"
          >
          <small class="form-text">必須年滿 12 歲才能參加活動</small>
        </div>

        <div class="form-group">
          <label for="gender">性別</label>
          <select
            id="gender"
            v-model="formData.gender"
            :disabled="isSubmitting"
          >
            <option value="">請選擇</option>
            <option value="male">男</option>
            <option value="female">女</option>
            <option value="other">其他</option>
          </select>
        </div>

        <div class="form-group">
          <label for="address">通訊地址 <span class="required">*</span></label>
          <input
            id="address"
            v-model="formData.address"
            type="text"
            required
            :disabled="isSubmitting"
            placeholder="請輸入完整通訊地址"
            minlength="10"
          >
          <small class="form-text">請填寫完整通訊地址，至少10個字</small>
        </div>

        <div class="form-group terms">
          <label class="checkbox-label">
            <input
              type="checkbox"
              v-model="formData.agreeTerms"
              required
              :disabled="isSubmitting"
            >
            <span>我已閱讀並同意<a href="#" @click.prevent="showTerms">活動條款與規定</a></span>
          </label>
        </div>

        <div class="form-actions">
          <button 
            type="submit" 
            :disabled="isSubmitting || !formData.agreeTerms"
            class="submit-button"
          >
            {{ isSubmitting ? '處理中...' : '確認登記' }}
          </button>

          <!-- 測試按鈕 -->
          <button 
            type="button"
            @click="fillTestData"
            class="test-button"
            :disabled="isSubmitting"
          >
            填入測試資料
          </button>

          <!-- 清除儲存按鈕 -->
          <button 
            type="button"
            @click="clearSavedData"
            class="clear-saved-button"
            :disabled="isSubmitting"
          >
            清除儲存資料
          </button>
        </div>
      </form>

      <!-- 登記成功對話框 -->
      <div v-if="showSuccessDialog" class="success-dialog">
        <div class="dialog-content">
          <h2>登記成功！</h2>
          <p class="registration-code">
            您的登記序號：
            <strong>{{ registrationCode }}</strong>
          </p>
          <p class="time-reminder">
            請於 {{ formatDateTime(event.registrationStartTime) }} 開始搶購
          </p>
          <div class="dialog-buttons">
            <button @click="copyRegistrationCode" class="copy-button">
              複製序號
            </button>
            <button @click="closeDialog" class="close-button">
              關閉
            </button>
          </div>
        </div>
      </div>

      <!-- 條款對話框 -->
      <div v-if="showTermsModal" class="terms-modal">
        <div class="terms-content">
          <h2>活動條款與規定</h2>
          <div class="terms-text">
            <h3>一、活動規則</h3>
            <p>1. 每人限報名一次，重複報名將被取消資格。</p>
            <p>2. 報名序號不得轉讓或交易，違者將取消參與資格。</p>
            <p>3. 活動當天請攜帶身分證件核對身分。</p>
            
            <h3>二、購票規則</h3>
            <p>1. 每個序號限購買4張票券。</p>
            <p>2. 請在開放時間內完成購票，逾時序號將失效。</p>
            <p>3. 購票成功後不得退換。</p>

            <h3>三、注意事項</h3>
            <p>1. 未滿12歲需由家長陪同參加。</p>
            <p>2. 活動若因不可抗力因素延期或取消，將另行公告。</p>
            <p>3. 主辦單位保留修改活動內容之權利。</p>
          </div>
          <button @click="closeTerms" class="close-terms">
            關閉
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import { registrationService } from '../services/registrationService'

const route = useRoute()
const router = useRouter()
const toast = useToast()

// 狀態管理
const event = ref(null)
const loading = ref(true)
const error = ref(null)
const isSubmitting = ref(false)
const showSuccessDialog = ref(false)
const showTermsModal = ref(false)
const registrationCode = ref('')
const duplicateCheckStatus = ref({
  email: { checking: false, isDuplicate: false, message: '' },
  idNumber: { checking: false, isDuplicate: false, message: '' }
})

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  
  const date = new Date(dateTime)
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  const formattedDate = date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  
  const formattedTime = date.toLocaleTimeString('zh-TW', {
    hour: '2-digit',
    minute: '2-digit'
  })
  
  if (diffDays === 0) {
    return `今天 ${formattedTime}`
  } else if (diffDays === 1) {
    return `明天 ${formattedTime}`
  } else if (diffDays > 1 && diffDays <= 7) {
    return `${diffDays}天後 ${formattedTime}`
  } else {
    return `${formattedDate} ${formattedTime}`
  }
}

// 實時重複檢查
const checkDuplicateRealtime = async (field, value) => {
  if (!value || !event.value) return
  
  duplicateCheckStatus.value[field].checking = true
  duplicateCheckStatus.value[field].isDuplicate = false
  duplicateCheckStatus.value[field].message = ''
  
  try {
    const checkData = { eventId: route.params.eventId }
    checkData[field] = value
    
    const duplicateCheck = await registrationService.checkDuplicate(
      route.params.eventId,
      field === 'email' ? value : formData.value.email,
      field === 'idNumber' ? value : formData.value.idNumber
    )
    
    if (duplicateCheck.isDuplicate && duplicateCheck.duplicateReason === field) {
      duplicateCheckStatus.value[field].isDuplicate = true
      duplicateCheckStatus.value[field].message = 
        field === 'email' ? '此電子郵件已經報名過此活動' : '此身分證號碼已經報名過此活動'
    }
  } catch (error) {
    console.error('實時重複檢查失敗：', error)
  } finally {
    duplicateCheckStatus.value[field].checking = false
  }
}

// 防抖函數
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// 創建防抖的檢查函數
const debouncedEmailCheck = debounce((value) => checkDuplicateRealtime('email', value), 500)
const debouncedIdCheck = debounce((value) => checkDuplicateRealtime('idNumber', value), 500)

const recentEmails = ref([])

// 表單資料
const formData = ref({
  name: '',
  idNumber: '',
  email: '',
  phone: '',
  birthdate: '',
  gender: '',
  address: '',
  agreeTerms: false
})

// 計算最大出生日期（12歲限制）
const maxBirthdate = computed(() => {
  const date = new Date()
  date.setFullYear(date.getFullYear() - 12)
  return date.toISOString().split('T')[0]
})

// 載入活動資訊
const loadEventDetails = async () => {
  try {
    const response = await axios.get(`/api/public/events/${route.params.eventId}`)
    if (response.data.success) {
      event.value = response.data.data
    } else {
      error.value = response.data.message || '無法載入活動資訊'
    }
  } catch (err) {
    console.error('載入活動資訊失敗：', err)
    error.value = '無法載入活動資訊，請稍後再試'
  } finally {
    loading.value = false
  }
}

// 驗證身分證字號
const validateIdNumber = (id) => {
  if (!id) return false
  
  // 基本格式檢查
  const pattern = /^[A-Z][12][0-9]{8}$/
  if (!pattern.test(id)) return false
  
  // 英文字母對應數字
  const letters = 'ABCDEFGHJKLMNPQRSTUVXYWZIO'
  const letterValue = letters.indexOf(id[0]) + 10
  
  // 計算檢查碼
  const n1 = Math.floor(letterValue / 10)
  const n2 = letterValue % 10
  const digits = [...String(n1) + String(n2) + id.slice(1)].map(Number)
  
  const weights = [1, 9, 8, 7, 6, 5, 4, 3, 2, 1, 1]
  const sum = digits.reduce((acc, curr, idx) => acc + curr * weights[idx], 0)
  
  return sum % 10 === 0
}

// 驗證表單
const validateForm = () => {
  // 姓名驗證
  if (formData.value.name.length < 2 || formData.value.name.length > 20) {
    toast.error('姓名長度必須在2-20個字之間')
    return false
  }

  // 身分證字號驗證
  if (!validateIdNumber(formData.value.idNumber)) {
    toast.error('請輸入有效的身分證字號')
    return false
  }

  // 檢查身分證號碼是否重複
  if (duplicateCheckStatus.value.idNumber.isDuplicate) {
    toast.error('此身分證號碼已經報名過此活動')
    return false
  }

  // 手機號碼驗證
  if (!/^09[0-9]{8}$/.test(formData.value.phone)) {
    toast.error('請輸入有效的手機號碼')
    return false
  }

  // 電子郵件驗證
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.value.email)) {
    toast.error('請輸入有效的電子郵件地址')
    return false
  }

  // 檢查電子郵件是否重複
  if (duplicateCheckStatus.value.email.isDuplicate) {
    toast.error('此電子郵件已經報名過此活動')
    return false
  }

  // 地址驗證
  if (formData.value.address.length < 10) {
    toast.error('通訊地址至少需要10個字')
    return false
  }

  // 年齡驗證
  const birthDate = new Date(formData.value.birthdate)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (age < 12 || (age === 12 && monthDiff < 0)) {
    toast.error('參加者必須年滿12歲')
    return false
  }

  // 條款同意驗證
  if (!formData.value.agreeTerms) {
    toast.error('請同意活動條款與個人資料保護政策')
    return false
  }

  return true
}

// 生成註冊碼
const generateRegistrationCode = () => {
  const timestamp = Date.now().toString(36)
  const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `TY${timestamp}${randomStr}`
}

// 處理表單提交
const handleSubmit = async () => {
  try {
    isSubmitting.value = true
    error.value = null

    // 驗證表單
    if (!validateForm()) {
      return
    }

    // 儲存表單資料
    registrationService.saveFormData(formData.value)

    // 檢查是否重複報名
    try {
      const duplicateCheck = await registrationService.checkDuplicate(
        route.params.eventId,
        formData.value.email,
        formData.value.idNumber
      )
      
      if (duplicateCheck.isDuplicate) {
        if (duplicateCheck.duplicateReason === 'email') {
          error.value = '此電子郵件已經報名過此活動'
        } else if (duplicateCheck.duplicateReason === 'idNumber') {
          error.value = '此身分證號碼已經報名過此活動'
        } else {
          error.value = '您已經報名過此活動'
        }
        return
      }
    } catch (error) {
      console.error('檢查重複報名失敗：', error)
      error.value = '系統錯誤，請稍後再試'
      return
    }

    // 生成註冊碼並進行報名
    const registrationCode = generateRegistrationCode()
    const registrationResult = await registrationService.register(
      route.params.eventId,
      registrationCode,
      formData.value
    )

    if (registrationResult.success) {
      // 發送確認郵件
      await registrationService.sendConfirmationEmail({
        to_name: formData.value.name,
        to_email: formData.value.email,
        event_name: event.value.name,
        registration_code: registrationCode,
        sale_start_time: event.value.registrationStartTime
      })

      // 儲存最近使用的郵件
      registrationService.saveRecentEmail(formData.value.email)
      
      // 儲存成功資料到 localStorage 供成功頁面使用
      const successData = {
        event: event.value,
        registrationCode: registrationCode,
        formData: formData.value
      }
      localStorage.setItem('registrationResult', JSON.stringify(successData))
      
      // 導向成功頁面
      router.push(`/registration-success/${registrationResult.id}`)
    } else {
      error.value = registrationResult.message || '登記失敗，請稍後再試'
    }
  } catch (error) {
    console.error('提交表單失敗：', error)
    error.value = error.message || '系統錯誤，請稍後再試'
  } finally {
    isSubmitting.value = false
  }
}

// 填入測試資料
const fillTestData = () => {
  formData.value = {
    name: '宋文琱',
    idNumber: 'A123456789',
    email: 'j236985325@gmail.com',
    phone: '0931128891',
    birthdate: '1990-01-01',
    gender: 'male',
    address: '台北市信義區信義路五段7號',
    agreeTerms: true
  }
}

// 清除儲存的資料
const clearSavedData = () => {
  registrationService.clearSavedData()
  formData.value = {
    name: '',
    idNumber: '',
    email: '',
    phone: '',
    birthdate: '',
    gender: '',
    address: '',
    agreeTerms: false
  }
  recentEmails.value = []
  toast.success('已清除所有儲存的資料')
}

// 載入初始資料
onMounted(async () => {
  // 載入活動資訊
  await loadEventDetails()
  
  // 載入儲存的表單資料
  const savedData = registrationService.loadFormData()
  if (savedData) {
    Object.assign(formData.value, savedData)
  }
  
  // 載入最近使用的郵件
  recentEmails.value = registrationService.loadRecentEmails()
})
</script>

<style scoped>
.registration-container {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding: 2rem 1rem;
}

.registration-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 2rem;
}

.event-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.description {
  color: #4a5568;
  margin-bottom: 1rem;
}

.time-info, .capacity-info {
  color: #2d3748;
  margin: 0.5rem 0;
}

.time-info strong, .capacity-info strong {
  color: #4a5568;
}

.registration-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

.required {
  color: #e53e3e;
  margin-left: 0.25rem;
}

input, select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.2s;
}

input:focus, select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.form-text {
  display: block;
  margin-top: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
}

.terms {
  margin: 2rem 0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
}

.checkbox-label a {
  color: #4299e1;
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}

.submit-button {
  background: #4299e1;
  color: white;
  padding: 0.75rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover:not(:disabled) {
  background: #3182ce;
}

.submit-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.test-button, .clear-saved-button {
  background: #718096;
  color: white;
  padding: 0.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.test-button:hover:not(:disabled),
.clear-saved-button:hover:not(:disabled) {
  background: #4a5568;
}

.success-dialog, .terms-modal {
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

.dialog-content, .terms-content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  text-align: center;
}

.registration-code {
  margin: 1.5rem 0;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 4px;
}

.registration-code strong {
  color: #2b6cb0;
  font-size: 1.25rem;
}

.time-reminder {
  color: #4a5568;
  margin-bottom: 1.5rem;
}

.dialog-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.copy-button, .close-button {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.copy-button {
  background: #4299e1;
  color: white;
}

.close-button {
  background: #e2e8f0;
  color: #4a5568;
}

.copy-button:hover {
  background: #3182ce;
}

.close-button:hover {
  background: #cbd5e0;
}

.terms-content {
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-text {
  text-align: left;
  margin: 1.5rem 0;
}

.terms-text h3 {
  color: #2d3748;
  margin: 1.5rem 0 1rem;
}

.terms-text p {
  color: #4a5568;
  margin: 0.5rem 0;
  line-height: 1.6;
}

.close-terms {
  background: #4299e1;
  color: white;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  margin-top: 1.5rem;
}

.close-terms:hover {
  background: #3182ce;
}

.recent-emails {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background: #f7fafc;
  border-radius: 4px;
}

.recent-emails-title {
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.recent-email-item {
  padding: 0.25rem 0.5rem;
  color: #4299e1;
  cursor: pointer;
  border-radius: 2px;
  transition: background-color 0.2s;
}

.recent-email-item:hover {
  background: #ebf8ff;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-left-color: #4299e1;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-message {
  text-align: center;
  color: #e53e3e;
  padding: 2rem;
}

.checking-status {
  font-size: 0.875rem;
  color: #4a5568;
  margin-top: 0.5rem;
}

.duplicate-status {
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

@media (max-width: 640px) {
  .registration-container {
    padding: 1rem 0.5rem;
  }

  .registration-content {
    padding: 1.5rem;
  }

  .dialog-content, .terms-content {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .dialog-buttons {
    flex-direction: column;
  }
}
</style> 
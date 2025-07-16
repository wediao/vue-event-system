<template>
  
  <div class="signup-container">
    <!-- 頂部導航 -->
    <!-- <nav class="navbar">
      <div class="navbar-brand">
        <img src="../assets/penguin-glasses.png" alt="企鵝吉祥物" class="mascot-logo">
        <div class="brand-text">
          <span class="brand-name">桃園機場捷運</span>
          <span class="brand-slogan">企鵝陪你一起搭捷運</span>
    </div>
    </div>
    </nav> -->

    <div class="content-wrapper">
      <!-- 活動資訊卡片 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
    </div>
    
      <div v-else-if="event" class="signup-content">
        <div class="event-info-card">
        <img :src="event.image" :alt="event.name" class="event-image">
          <div class="event-details">
          <h1>{{ event.name }}</h1>
            <div class="event-meta">
              <div class="meta-item">
                <span class="icon">📅</span>
                <span>活動日期：{{ formatDate(event.eventDate) }}</span>
              </div>
              <div class="meta-item">
                <span class="icon">📍</span>
                <span>活動地點：{{ event.location }}</span>
              </div>
              <div class="meta-item">
                <span class="icon">👥</span>
                <span>剩餘名額：{{ event.remainingSpots }} 位</span>
              </div>
              <div class="meta-item">
                <span class="icon">💰</span>
                <span>活動費用：NT$ {{ event.price }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- 報名表單 -->
        <div class="signup-form-container">
          <h2>報名資料</h2>
          <form @submit.prevent="handleSubmit" class="signup-form">
            <!-- 員工資料 -->
            <div class="form-section">
              <h3>員工資料</h3>
              <div class="form-group">
                <label class="form-label required">員工姓名</label>
                <input 
                  v-model="formData.employeeName"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.employeeName }"
                  placeholder="請輸入員工姓名"
                  required
                >
                <span v-if="errors.employeeName" class="error-message">{{ errors.employeeName }}</span>
      </div>

        <div class="form-group">
                <label class="form-label required">員工編號</label>
          <input
                  v-model="formData.employeeId"
            type="text"
                  class="form-input"
                  :class="{ 'error': errors.employeeId }"
                  placeholder="請輸入員工編號"
            required
          >
                <span v-if="errors.employeeId" class="error-message">{{ errors.employeeId }}</span>
        </div>

        <div class="form-group">
                <label class="form-label required">所屬單位</label>
                <select 
                  v-model="formData.department"
                  class="form-input"
                  :class="{ 'error': errors.department }"
            required
                >
                  <option value="">請選擇所屬單位</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
                <span v-if="errors.department" class="error-message">{{ errors.department }}</span>
        </div>

        <div class="form-group">
                <label class="form-label required">參加者姓名</label>
                <input 
                  v-model="formData.participantName"
                  type="text"
                  class="form-input"
                  :class="{ 'error': errors.participantName }"
                  :placeholder="isFirstPhase ? '第一階段限員工本人參加' : '可填寫眷屬姓名'"
                  required
                >
                <span v-if="errors.participantName" class="error-message">{{ errors.participantName }}</span>
                <span class="helper-text" v-if="isFirstPhase">
                  第一階段報名限員工，參加者姓名須等於員工姓名
                </span>
                <span class="helper-text" v-else>
                  第二階段開放眷屬報名，參加者可為眷屬
                </span>
              </div>
            </div>

            <div class="form-section">
              <h3>聯絡資料</h3>
              <div class="form-group">
                <label class="form-label required">聯絡電話</label>
          <input
            v-model="formData.phone"
            type="tel"
                  class="form-input"
                  :class="{ 'error': errors.phone }"
                  placeholder="請輸入手機號碼"
            required
          >
                <span v-if="errors.phone" class="error-message">{{ errors.phone }}</span>
        </div>

              <div class="form-group">
                <label class="form-label required">電子郵件</label>
                <input 
                  v-model="formData.email"
                  type="email"
                  class="form-input"
                  :class="{ 'error': errors.email }"
                  placeholder="請輸入電子郵件"
                  required
                >
                <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
              </div>
            </div>

            <div class="form-section">
              <h3>活動場次</h3>
              <div class="form-group">
                <label class="form-label required">選擇場次</label>
                <div class="session-options">
                  <div v-for="session in availableSessions" 
                       :key="session.id" 
                       class="session-option"
                       :class="{ 'selected': formData.sessionId === session.id }">
            <input
                      type="radio" 
                      :id="session.id" 
                      v-model="formData.sessionId" 
                      :value="session.id"
                      required
                    >
                    <label :for="session.id" class="session-label">
                      <div class="session-info">
                        <div class="session-date">{{ session.date }}</div>
                        <div class="session-teams">{{ session.teams }}</div>
                        <div class="session-status" :class="getSessionStatusClass(session)">
                          剩餘名額：{{ session.remainingSpots }}/{{ session.totalSpots }}
                        </div>
                      </div>
                    </label>
                  </div>
                </div>
                <span v-if="errors.sessionId" class="error-message">{{ errors.sessionId }}</span>
              </div>
            </div>

            <!-- 交通資訊 -->
            <div class="form-section">
              <h3>交通資訊</h3>
              <div class="form-group">
                <label class="form-label required">搭乘站點</label>
            <select
                  v-model="formData.station"
                  class="form-input"
                  :class="{ 'error': errors.station }"
                  required
                >
                  <option value="">請選擇搭乘站點</option>
                  <option v-for="station in stations" :key="station.id" :value="station.id">
                    {{ station.name }}
              </option>
            </select>
                <span v-if="errors.station" class="error-message">{{ errors.station }}</span>
              </div>

              <div class="form-group">
                <label class="form-label">是否需要接駁車服務</label>
                <div class="radio-group">
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      v-model="formData.needsShuttle" 
                      :value="true"
                    > 是
                  </label>
                  <label class="radio-label">
                    <input 
                      type="radio" 
                      v-model="formData.needsShuttle" 
                      :value="false"
                    > 否
                  </label>
                </div>
              </div>
            </div>

            <!-- 其他資訊 -->
            <div class="form-section">
              <h3>其他資訊</h3>
              <div class="form-group">
                <CheckboxComponent
                  v-model="formData.dietaryRestrictions"
                  label="特殊飲食需求"
                  is-group
                  group-label="請選擇您的特殊飲食需求："
                  :options="dietaryOptions"
                  horizontal
                  help-text="可以選擇多個選項"
                />
              </div>

              <div class="form-group">
                <label class="form-label">備註事項</label>
            <textarea
                  v-model="formData.notes"
                  class="form-input"
              rows="4"
                  placeholder="如有其他需求請在此說明"
            ></textarea>
          </div>
        </div>

            <!-- 同意條款 -->
            <div class="form-section terms-section">
              <div class="form-group">
                <CheckboxComponent
                  v-model="formData.agreeToTerms"
                  label="我已閱讀並同意活動條款與個人資料保護政策"
                  required
                  :error-message="errors.agreeToTerms"
                  help-text="點擊查看詳細條款內容"
                  @change="clearTermsError"
                />
                <div class="terms-link">
                  <a href="#" @click.prevent="showTerms" class="terms-link-text">
                    📋 查看活動條款與個人資料保護政策
                  </a>
                </div>
              </div>
        </div>

            <!-- 提交按鈕 -->
        <div class="form-actions">
          <button 
            type="submit" 
                class="btn btn-primary submit-btn"
                :disabled="isSubmitting"
          >
                <span v-if="isSubmitting">報名中...</span>
            <span v-else>確認報名</span>
        </button>
              <button 
                type="button" 
                class="btn btn-secondary"
                @click="goBack"
              >
                返回活動頁面
              </button>
            </div>
          </form>
            </div>
          </div>

      <div v-else class="error-message-container">
        <h2>找不到活動資訊</h2>
        <p>該活動可能已結束或不存在</p>
        <router-link to="/events" class="btn btn-primary">
          返回活動列表
      </router-link>
      </div>
    </div>

    <!-- 條款彈窗 -->
    <div v-if="showTermsModal" class="modal-overlay" @click="closeTerms">
      <div class="modal-content" @click.stop>
        <h2>活動條款與個人資料保護政策</h2>
        <div class="terms-content">
          <h3>活動條款</h3>
          <p>1. 報名者須提供真實、正確且完整的個人資料。</p>
          <p>2. 活動報名完成後，將收到確認電子郵件。</p>
          <p>3. 活動當天請攜帶身分證明文件核對身分。</p>
          <p>4. 如需取消報名，請至少於活動前3天告知。</p>
          <p>5. 主辦單位保留活動異動及更改之權利。</p>

          <h3>個人資料保護政策</h3>
          <p>1. 蒐集目的：活動報名、聯繫及相關服務使用。</p>
          <p>2. 資料範圍：姓名、身分證字號、聯絡方式等報名所需資料。</p>
          <p>3. 利用方式：僅供本活動相關作業使用。</p>
          <p>4. 保存期限：活動結束後一年內銷毀。</p>
          <p>5. 您有權查詢、閱覽、補充、更正或刪除個人資料。</p>
        </div>
        <button class="btn btn-primary" @click="closeTerms">我已了解</button>
      </div>
    </div>
    </div>
  </template>
  
  <script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../firebase'
import CheckboxComponent from '../components/CheckboxComponent.vue'

const route = useRoute()
const router = useRouter()

// 狀態管理
const loading = ref(true)
const event = ref(null)
const isSubmitting = ref(false)
const showTermsModal = ref(false)

// 表單數據
const formData = reactive({
  employeeName: '',
  employeeId: '',
  department: '',
  participantName: '',
  phone: '',
  email: '',
  sessionId: '',
  station: '',
  needsShuttle: false,
  dietaryRestrictions: [],
  notes: '',
  agreeToTerms: false
})

// 錯誤訊息
const errors = reactive({
  employeeName: '',
  employeeId: '',
  department: '',
  participantName: '',
  phone: '',
  email: '',
  sessionId: '',
  station: '',
  agreeToTerms: ''
})

// 捷運站點列表
const stations = [
  { id: 'A1', name: '台北車站' },
  { id: 'A2', name: '三重' },
  { id: 'A3', name: '新北產業園區' },
  { id: 'A4', name: '新莊副都心' },
  { id: 'A5', name: '泰山' },
  { id: 'A6', name: '泰山貴和' },
  { id: 'A7', name: '體育大學' },
  { id: 'A8', name: '長庚醫院' },
  { id: 'A9', name: '林口' },
  { id: 'A10', name: '山鼻' },
  { id: 'A11', name: '坑口' },
  { id: 'A12', name: '機場第一航廈' },
  { id: 'A13', name: '機場第二航廈' },
  { id: 'A14', name: '機場旅館' },
  { id: 'A14a', name: '機場第三航廈' },
  { id: 'A15', name: '大園' },
  { id: 'A16', name: '橫山' },
  { id: 'A17', name: '領航' },
  { id: 'A18', name: '高鐵桃園站' },
  { id: 'A19', name: '桃園體育園區' },
  { id: 'A20', name: '興南' },
  { id: 'A21', name: '環北' }
]

// 部門列表
const departments = [
  { id: 'dept1', name: '總經理室' },
  { id: 'dept2', name: '人力資源處' },
  { id: 'dept3', name: '財務處' },
  { id: 'dept4', name: '營運處' },
  { id: 'dept5', name: '工務處' },
  { id: 'dept6', name: '維修處' },
  { id: 'dept7', name: '安全處' },
  { id: 'dept8', name: '資訊處' },
  { id: 'dept9', name: '企劃處' }
]

// 飲食選項
const dietaryOptions = [
  { value: 'vegetarian', label: '素食' },
  { value: 'halal', label: '清真' },
  { value: 'no-seafood', label: '不吃海鮮' },
  { value: 'no-spicy', label: '不吃辣' },
  { value: 'no-pork', label: '不吃豬肉' },
  { value: 'no-beef', label: '不吃牛肉' }
]

// 活動場次
const availableSessions = [
  {
    id: 'session1',
    date: '2024-07-16 (星期三) 18:35',
    teams: '樂天桃猿 VS 中信兄弟',
    totalSpots: 100,
    remainingSpots: 45
  },
  {
    id: 'session2',
    date: '2024-08-22 (星期五) 18:35',
    teams: '樂天桃猿 VS 統一獅',
    totalSpots: 100,
    remainingSpots: 78
  }
]

const isFirstPhase = ref(true) // 控制是否為第一階段報名

// 日期格式化
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 表單驗證
const validateForm = () => {
  let isValid = true
  errors.employeeName = ''
  errors.employeeId = ''
  errors.department = ''
  errors.participantName = ''
  errors.phone = ''
  errors.email = ''
  errors.sessionId = ''
  errors.station = ''
  errors.agreeToTerms = ''

  // 員工姓名驗證
  if (!formData.employeeName.trim()) {
    errors.employeeName = '請輸入員工姓名'
    isValid = false
  }

  // 員工編號驗證
  if (!formData.employeeId.trim()) {
    errors.employeeId = '請輸入員工編號'
    isValid = false
  }

  // 部門驗證
  if (!formData.department) {
    errors.department = '請選擇所屬單位'
    isValid = false
  }

  // 參加者姓名驗證
  if (!formData.participantName.trim()) {
    errors.participantName = '請輸入參加者姓名'
    isValid = false
  } else if (isFirstPhase && formData.participantName !== formData.employeeName) {
    errors.participantName = '第一階段報名僅限員工本人參加'
    isValid = false
  }

  // 電話驗證
  const phonePattern = /^09\d{8}$/
  if (!phonePattern.test(formData.phone)) {
    errors.phone = '請輸入有效的手機號碼'
    isValid = false
  }

  // 電子郵件驗證
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailPattern.test(formData.email)) {
    errors.email = '請輸入有效的電子郵件'
    isValid = false
  }

  // 場次驗證
  if (!formData.sessionId) {
    errors.sessionId = '請選擇活動場次'
    isValid = false
  }

  // 站點驗證
  if (!formData.station) {
    errors.station = '請選擇搭乘站點'
    isValid = false
  }

  // 條款同意驗證
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = '請同意活動條款與個人資料保護政策'
    isValid = false
  }

  return isValid
}

// 獲取活動資訊
const fetchEvent = async () => {
  try {
    const docRef = doc(db, 'events', route.params.eventId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      event.value = {
        id: docSnap.id,
        ...docSnap.data()
      }
    }
  } catch (error) {
    console.error('Error fetching event:', error)
    } finally {
      loading.value = false
    }
  }

// 提交表單
const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  try {
    // 創建報名記錄
    const registration = {
      eventId: route.params.eventId,
      ...formData,
      status: 'registered',
      registrationDate: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'registrations'), registration)

    // 導向成功頁面
    router.push({
      name: 'RegistrationSuccess',
      params: { registrationId: docRef.id }
    })
  } catch (error) {
    console.error('Error submitting registration:', error)
    alert('報名失敗，請稍後再試')
  } finally {
    isSubmitting.value = false
  }
}

// 返回按鈕
const goBack = () => {
  router.back()
}

// 條款相關
const showTerms = () => {
  showTermsModal.value = true
}

const closeTerms = () => {
  showTermsModal.value = false
}

// 清除條款錯誤
const clearTermsError = () => {
  errors.agreeToTerms = ''
}

const getSessionStatusClass = (session) => {
  const ratio = session.remainingSpots / session.totalSpots
  if (ratio > 0.5) return 'status-good'
  if (ratio > 0.2) return 'status-warning'
  return 'status-critical'
}

// 生命週期
onMounted(() => {
  fetchEvent()
})
  </script>
  
  <style scoped>
.signup-container {
  min-height: 100vh;
  background-color: var(--background-light);
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.signup-content {
  display: grid;
  gap: 30px;
}

/* 活動資訊卡片 */
.event-info-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.event-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
}

.event-details {
  padding: 20px;
}

.event-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

/* 表單樣式 */
.signup-form-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-label.required::after {
  content: '*';
  color: var(--error-color);
  margin-left: 4px;
}

.form-input {
    width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  border-color: var(--primary-color);
  outline: none;
}

.form-input.error {
  border-color: var(--error-color);
}

.error-message {
  color: var(--error-color);
  font-size: 14px;
  margin-top: 4px;
}

/* 單選和複選框樣式 */
.radio-group,
.checkbox-group {
  display: flex;
  gap: 20px;
}

.radio-label,
.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

/* 按鈕樣式 */
.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.submit-btn {
  flex: 1;
}

.btn {
  padding: 12px 24px;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: var(--primary-color);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: var(--secondary-color);
}

.btn-secondary {
  background-color: #f5f5f5;
  color: var(--text-primary);
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* 條款彈窗 */
.modal-overlay {
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
  border-radius: 8px;
  padding: 30px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.terms-content {
  margin: 20px 0;
}

.terms-content h3 {
  margin: 20px 0 10px;
}

/* 錯誤狀態 */
.error-message-container {
  text-align: center;
  padding: 40px;
}

.error-mascot {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .event-meta {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .radio-group,
  .checkbox-group {
    flex-direction: column;
    gap: 10px;
  }
}

.helper-text {
  font-size: 0.9rem;
  color: #666;
  margin-top: 4px;
}

.session-options {
  display: grid;
  gap: 1rem;
  margin-top: 0.5rem;
}

.session-option {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.session-option:hover {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.05);
}

.session-option.selected {
  border-color: var(--primary-color);
  background: rgba(var(--primary-color-rgb), 0.1);
}

.session-option input[type="radio"] {
  display: none;
}

.session-label {
  cursor: pointer;
  display: block;
}

.session-info {
  display: grid;
  gap: 0.5rem;
}

.session-date {
  font-weight: 500;
  color: var(--text-primary);
}

.session-teams {
  font-size: 1.1rem;
  color: var(--text-primary);
}

.session-status {
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 4px;
  display: inline-block;
}

.status-good {
  background-color: #e8f5e9;
  color: #2e7d32;
}

.status-warning {
  background-color: #fff3e0;
  color: #ef6c00;
}

.status-critical {
  background-color: #ffebee;
  color: #c62828;
}

/* 條款鏈接樣式 */
.terms-link {
  margin-top: 0.5rem;
  padding-left: 1.75rem; /* 對齊 checkbox 文字 */
}

.terms-link-text {
  color: var(--primary-color);
  text-decoration: none;
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  transition: color 0.2s ease;
}

.terms-link-text:hover {
  color: var(--secondary-color);
  text-decoration: underline;
}

@media (max-width: 768px) {
  .session-options {
    grid-template-columns: 1fr;
  }
  
  .terms-link {
    padding-left: 0;
  }
  }
  </style>
  
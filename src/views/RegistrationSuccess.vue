<template>
  <div class="registration-success">
    <div class="success-container">
      <!-- 成功圖示 -->
      <div class="success-icon">
        <div class="checkmark">✓</div>
      </div>

      <!-- 成功訊息 -->
      <div class="success-message">
        <h1>登記成功！</h1>
        <p class="subtitle">您已成功完成活動預先登記</p>
      </div>

      <!-- 活動資訊 -->
      <div v-if="event" class="event-info">
        <h2>{{ event.name }}</h2>
        <div class="event-details">
          <div class="detail-item">
            <span class="label">活動時間：</span>
            <span class="value">{{ formatDateTime(event.eventStartTime) }}</span>
          </div>
          <div class="detail-item">
            <span class="label">活動地點：</span>
            <span class="value">{{ event.location }}</span>
          </div>
        </div>
      </div>

      <!-- 序號資訊 -->
      <div class="registration-code-section">
        <h3>您的登記序號</h3>
        <div class="code-display">
          <span class="code-text">{{ registrationCode }}</span>
          <button @click="copyCode" class="copy-button" :class="{ 'copied': isCopied }">
            {{ isCopied ? '已複製' : '複製' }}
          </button>
        </div>
        <p class="code-note">
          ⚠️ 請妥善保管此序號，搶購時需要使用
        </p>
      </div>

      <!-- 搶購資訊 -->
      <div class="purchase-info">
        <h3>搶購資訊</h3>
        <div class="purchase-details">
          <div class="time-info">
            <div class="time-label">🚀 搶購開始時間</div>
            <div class="time-value">{{ formatDateTime(event?.registrationStartTime) }}</div>
            <div class="countdown" v-if="countdown">
              <span class="countdown-label">距離開始還有：</span>
              <span class="countdown-value">{{ countdown }}</span>
            </div>
          </div>
          
          <div class="purchase-rules">
            <h4>搶購規則</h4>
            <ul>
              <li>每個序號限購 4 張票券</li>
              <li>請準時在搶購時間開始後進行購買</li>
              <li>票券數量有限，先到先得</li>
              <li>序號僅限本人使用，不得轉讓</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 提醒設定 -->
      <div class="reminder-section">
        <h3>提醒設定</h3>
        <div class="reminder-options">
          <CheckboxComponent
            v-model="reminderSettings.email"
            label="電子郵件提醒"
            help-text="搶購開始前 30 分鐘發送提醒"
          />
          <CheckboxComponent
            v-model="reminderSettings.sms"
            label="簡訊提醒"
            help-text="搶購開始前 10 分鐘發送提醒"
          />
        </div>
        <button @click="saveReminders" class="save-reminders-btn">
          儲存提醒設定
        </button>
      </div>

      <!-- 操作按鈕 -->
      <div class="action-buttons">
        <button @click="goToPurchase" class="btn btn-primary">
          前往搶購頁面
        </button>
        <button @click="goToEvents" class="btn btn-secondary">
          返回活動列表
        </button>
        <button @click="goToQuery" class="btn btn-outline">
          查詢序號狀態
        </button>
      </div>

      <!-- 客服資訊 -->
      <div class="support-info">
        <h4>需要協助？</h4>
        <div class="support-contacts">
          <div class="contact-item">
            <span class="contact-type">📧 客服信箱：</span>
            <span class="contact-value">support@tymetro.com</span>
          </div>
          <div class="contact-item">
            <span class="contact-type">📞 客服電話：</span>
            <span class="contact-value">02-1234-5678</span>
          </div>
          <div class="contact-item">
            <span class="contact-type">🕒 服務時間：</span>
            <span class="contact-value">週一至週五 09:00-18:00</span>
          </div>
        </div>
      </div>

      <!-- 重要提醒 -->
      <div class="important-notes">
        <h4>重要提醒</h4>
        <div class="notes-content">
          <div class="note-item">
            <span class="note-icon">🔐</span>
            <span class="note-text">序號為個人專用，請勿分享給他人</span>
          </div>
          <div class="note-item">
            <span class="note-icon">⏰</span>
            <span class="note-text">請準時參與搶購，逾時序號將失效</span>
          </div>
          <div class="note-item">
            <span class="note-icon">📱</span>
            <span class="note-text">建議使用穩定的網路環境進行搶購</span>
          </div>
          <div class="note-item">
            <span class="note-icon">💳</span>
            <span class="note-text">請準備好付款方式，加快購買流程</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import CheckboxComponent from '../components/CheckboxComponent.vue'

const route = useRoute()
const router = useRouter()

// 狀態管理
const event = ref(null)
const registrationCode = ref('')
const countdown = ref('')
const isCopied = ref(false)
const countdownInterval = ref(null)

// 提醒設定
const reminderSettings = reactive({
  email: true,
  sms: false
})

// 從路由參數或 localStorage 獲取資料
onMounted(() => {
  loadRegistrationData()
  startCountdown()
})

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})

// 載入登記資料
const loadRegistrationData = () => {
  // 從 localStorage 或 API 獲取資料
  const savedData = localStorage.getItem('registrationResult')
  if (savedData) {
    const data = JSON.parse(savedData)
    event.value = data.event
    registrationCode.value = data.registrationCode
  } else {
    // 如果沒有資料，重新導向到活動列表
    router.push('/events')
  }
}

// 開始倒數計時
const startCountdown = () => {
  if (!event.value?.registrationStartTime) return
  
  const updateCountdown = () => {
    const now = new Date()
    const saleStart = new Date(event.value.registrationStartTime)
    const diff = saleStart - now
    
    if (diff <= 0) {
      countdown.value = '搶購已開始！'
      if (countdownInterval.value) {
        clearInterval(countdownInterval.value)
      }
      return
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    let countdownText = ''
    if (days > 0) countdownText += `${days}天 `
    if (hours > 0) countdownText += `${hours}小時 `
    if (minutes > 0) countdownText += `${minutes}分鐘 `
    countdownText += `${seconds}秒`
    
    countdown.value = countdownText
  }
  
  updateCountdown()
  countdownInterval.value = setInterval(updateCountdown, 1000)
}

// 複製序號
const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(registrationCode.value)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  } catch (err) {
    console.error('複製失敗:', err)
    // 降級處理
    const textArea = document.createElement('textarea')
    textArea.value = registrationCode.value
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2000)
  }
}

// 儲存提醒設定
const saveReminders = () => {
  // 這裡可以調用 API 儲存提醒設定
  console.log('儲存提醒設定:', reminderSettings)
  alert('提醒設定已儲存！')
}

// 導航方法
const goToPurchase = () => {
  router.push(`/purchase/${event.value.id}`)
}

const goToEvents = () => {
  router.push('/events')
}

const goToQuery = () => {
  router.push('/query-result')
}

// 格式化時間
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
</script>

<style scoped>
.registration-success {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem 1rem;
}

.success-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.success-icon {
  background: linear-gradient(135deg, #4CAF50, #45a049);
  padding: 3rem;
  text-align: center;
}

.checkmark {
  width: 80px;
  height: 80px;
  background: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  font-size: 2.5rem;
  color: #4CAF50;
  font-weight: bold;
}

.success-message {
  text-align: center;
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.success-message h1 {
  color: #2d3748;
  margin-bottom: 0.5rem;
  font-size: 2rem;
}

.subtitle {
  color: #718096;
  font-size: 1.1rem;
}

.event-info {
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.event-info h2 {
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
}

.event-details {
  display: grid;
  gap: 0.5rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.label {
  font-weight: 500;
  color: #4a5568;
  min-width: 100px;
}

.value {
  color: #2d3748;
}

.registration-code-section {
  padding: 2rem;
  text-align: center;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.registration-code-section h3 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.code-display {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.code-text {
  font-family: 'Courier New', monospace;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2b6cb0;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  letter-spacing: 2px;
}

.copy-button {
  padding: 0.75rem 1.5rem;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.copy-button:hover {
  background: #3182ce;
}

.copy-button.copied {
  background: #38a169;
}

.code-note {
  color: #e53e3e;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.purchase-info {
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.purchase-info h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.time-info {
  background: #e6fffa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  text-align: center;
}

.time-label {
  font-size: 1.1rem;
  color: #2d3748;
  margin-bottom: 0.5rem;
}

.time-value {
  font-size: 1.3rem;
  font-weight: bold;
  color: #2b6cb0;
  margin-bottom: 1rem;
}

.countdown {
  background: #fed7d7;
  padding: 0.75rem;
  border-radius: 6px;
  display: inline-block;
}

.countdown-label {
  color: #742a2a;
  margin-right: 0.5rem;
}

.countdown-value {
  font-weight: bold;
  color: #c53030;
}

.purchase-rules h4 {
  color: #2d3748;
  margin-bottom: 1rem;
}

.purchase-rules ul {
  list-style: none;
  padding: 0;
}

.purchase-rules li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  color: #4a5568;
}

.purchase-rules li:before {
  content: "✓ ";
  color: #38a169;
  font-weight: bold;
  margin-right: 0.5rem;
}

.reminder-section {
  padding: 2rem;
  border-bottom: 1px solid #f0f0f0;
}

.reminder-section h3 {
  color: #2d3748;
  margin-bottom: 1.5rem;
}

.reminder-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.save-reminders-btn {
  padding: 0.75rem 1.5rem;
  background: #38a169;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: background 0.2s;
}

.save-reminders-btn:hover {
  background: #2f855a;
}

.action-buttons {
  padding: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  border-bottom: 1px solid #f0f0f0;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  text-decoration: none;
  display: inline-block;
  border: none;
}

.btn-primary {
  background: #4299e1;
  color: white;
}

.btn-primary:hover {
  background: #3182ce;
}

.btn-secondary {
  background: #718096;
  color: white;
}

.btn-secondary:hover {
  background: #4a5568;
}

.btn-outline {
  background: transparent;
  color: #4299e1;
  border: 2px solid #4299e1;
}

.btn-outline:hover {
  background: #4299e1;
  color: white;
}

.support-info {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #f0f0f0;
}

.support-info h4 {
  color: #2d3748;
  margin-bottom: 1rem;
  text-align: center;
}

.support-contacts {
  display: grid;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
}

.contact-type {
  font-weight: 500;
  min-width: 100px;
}

.important-notes {
  padding: 2rem;
}

.important-notes h4 {
  color: #2d3748;
  margin-bottom: 1.5rem;
  text-align: center;
}

.notes-content {
  display: grid;
  gap: 1rem;
}

.note-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: #fffbeb;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
}

.note-icon {
  font-size: 1.2rem;
  flex-shrink: 0;
}

.note-text {
  color: #92400e;
  font-weight: 500;
}

@media (max-width: 768px) {
  .registration-success {
    padding: 1rem 0.5rem;
  }
  
  .success-container {
    border-radius: 8px;
  }
  
  .success-icon {
    padding: 2rem;
  }
  
  .checkmark {
    width: 60px;
    height: 60px;
    font-size: 2rem;
  }
  
  .success-message h1 {
    font-size: 1.5rem;
  }
  
  .code-display {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .code-text {
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn {
    text-align: center;
  }
}
</style> 
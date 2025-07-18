<template>
  <div class="purchase-container">
    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-content">
        <div class="loading-spinner large"></div>
        <p>載入活動資訊中...</p>
      </div>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-overlay">
      <div class="error-content">
        <div class="error-icon">⚠️</div>
        <h2>載入失敗</h2>
        <p>{{ error }}</p>
        <div class="error-actions">
          <button @click="loadEvent" class="retry-button">重新載入</button>
          <router-link to="/events" class="back-button">返回活動列表</router-link>
        </div>
      </div>
    </div>

    <!-- 主要內容 -->
    <div v-else>
      <!-- 頁面標題 -->
      <div class="page-header">
        <h1>🎫 活動搶購</h1>
        <div class="breadcrumb">
          <router-link to="/events">活動列表</router-link>
          <span>></span>
          <router-link :to="`/event/${route.params.eventId}`">活動詳情</router-link>
          <span>></span>
          <span>搶購頁面</span>
        </div>
      </div>

      <div class="content">
        <!-- 活動資訊卡片 -->
        <div v-if="event" class="event-card">
          <div class="event-header">
            <div class="event-title">
              <h1>{{ event.name }}</h1>
              <div class="event-status-badge" :class="eventStatus">
                <span class="status-dot"></span>
                {{ statusText }}
              </div>
            </div>
            <div class="event-countdown" v-if="countdown">
              <div class="countdown-label">
                <template v-if="eventStatus === 'upcoming'">距離開始</template>
                <template v-else>距離結束</template>
              </div>
              <div class="countdown-value">{{ countdown }}</div>
            </div>
          </div>
          
          <div class="event-details">
            <div class="detail-item">
              <span class="label">活動描述</span>
        <p class="description">{{ event.description }}</p>
            </div>
            <div class="detail-row">
              <div class="detail-item">
                <span class="label">🗓️ 活動時間</span>
                <span class="value">{{ formatDateTime(event.eventStartTime) }}</span>
              </div>
              <div class="detail-item">
                <span class="label">👥 活動容量</span>
                <span class="value">{{ event.capacity }} 人</span>
              </div>
              <div class="detail-item">
                <span class="label">📍 活動地點</span>
                <span class="value">台中洲際棒球場</span>
              </div>
            </div>
          </div>
      </div>

        <!-- 進度指示器 -->
        <div class="progress-indicator">
          <div class="step" :class="{ active: !isVerified, completed: isVerified }">
            <div class="step-number">1</div>
            <div class="step-label">驗證序號</div>
          </div>
          <div class="step-line" :class="{ completed: isVerified }"></div>
          <div class="step" :class="{ active: isVerified && !showSuccess, completed: showSuccess }">
            <div class="step-number">2</div>
            <div class="step-label">選擇票券</div>
          </div>
          <div class="step-line" :class="{ completed: showSuccess }"></div>
          <div class="step" :class="{ active: showSuccess, completed: showSuccess }">
            <div class="step-number">3</div>
            <div class="step-label">完成購買</div>
          </div>
        </div>

        <!-- 序號驗證區 -->
        <div class="verification-section" v-if="!isVerified">
          <div class="section-header">
            <h2>🔐 序號驗證</h2>
            <p>請輸入您在預先登記時獲得的序號</p>
          </div>
          
          <div class="verification-card">
            <div class="input-group">
              <div class="input-wrapper">
                <input 
                  type="text" 
                  v-model="registrationCode"
                  placeholder="請輸入序號 (例如：TYmd4testcode123)"
                  :disabled="isVerifying"
                  @keyup.enter="verifyCode"
                  class="code-input"
                  maxlength="20"
                  autocomplete="off"
                  autocapitalize="off"
                  spellcheck="false"
                >
                <div class="input-hint">
                  <span class="hint-icon">💡</span>
                  序號格式：TY + 8位以上英數字組合
                </div>
              </div>
              <button 
                @click="verifyCode"
                :disabled="!registrationCode || isVerifying || eventStatus !== 'active'"
                class="verify-button"
              >
                <span v-if="isVerifying" class="loading-spinner"></span>
                {{ isVerifying ? '驗證中...' : '驗證序號' }}
              </button>
              
              <!-- 測試按鈕 -->
              <button 
                @click="fillTestCode"
                :disabled="isVerifying"
                class="test-button"
                type="button"
              >
                填入測試序號
              </button>
            </div>
            
            <div class="verification-tips">
              <h4>📝 溫馨提醒</h4>
              <ul>
                <li>序號僅限本人使用，不得轉讓</li>
                <li>每個序號限購 4 張票券</li>
                <li>請確保在搶購時間內完成購買</li>
                <li>如遇問題請聯繫客服：02-1234-5678</li>
              </ul>
          </div>
        </div>
      </div>

        <!-- 用戶資訊顯示 -->
        <div v-if="isVerified && userInfo" class="user-info-section">
          <div class="section-header">
            <h3>👤 購買者資訊</h3>
          </div>
          <div class="user-info-card">
            <div class="user-detail">
              <span class="label">姓名</span>
              <span class="value">{{ userInfo.name }}</span>
        </div>
            <div class="user-detail">
              <span class="label">電子郵件</span>
              <span class="value">{{ userInfo.email }}</span>
            </div>
            <div class="user-detail">
              <span class="label">序號</span>
              <span class="value code">{{ registrationCode }}</span>
            </div>
        </div>
        </div>

        <!-- 票券選擇區 -->
        <div v-if="isVerified" class="ticket-selection-section">
          <div class="section-header">
            <h2>🎫 票券選擇</h2>
            <p>請選擇您要購買的票券數量</p>
          </div>
          
          <div class="ticket-grid">
            <div class="ticket-card">
              <div class="ticket-image">
                <div class="ticket-icon">🎟️</div>
              </div>
              <div class="ticket-info">
                <div class="ticket-header">
                  <h3 class="ticket-name">內野座席</h3>
                  <div class="ticket-price">NT$ 500</div>
                </div>
                <div class="ticket-description">
                  <p>絕佳視野位置，可近距離觀賞比賽</p>
                  <div class="ticket-features">
                    <span class="feature">✓ 有遮蔽座位</span>
                    <span class="feature">✓ 最佳觀賞角度</span>
                    <span class="feature">✓ 現場活動優先</span>
                  </div>
                </div>
                
                <div class="quantity-selector">
                  <label class="quantity-label">選擇數量</label>
                  <div class="quantity-controls">
                    <button 
                      @click="decreaseQuantity" 
                      :disabled="quantity <= 0"
                      class="quantity-btn"
                    >
                      -
                    </button>
                    <div class="quantity-display">{{ quantity }}</div>
                    <button 
                      @click="increaseQuantity" 
                      :disabled="quantity >= 4"
                      class="quantity-btn"
                    >
                      +
                    </button>
                  </div>
                  <div class="quantity-hint">
                    <span class="hint-icon">⚠️</span>
                    每人限購 4 張
                  </div>
                </div>
          </div>
        </div>
      </div>

          <!-- 購買摘要 -->
          <div class="purchase-summary">
            <div class="summary-header">
              <h3>📋 購買摘要</h3>
            </div>
            <div class="summary-content">
              <div class="summary-row">
                <span class="label">票券類型</span>
                <span class="value">內野座席</span>
              </div>
              <div class="summary-row">
                <span class="label">票券數量</span>
                <span class="value">{{ quantity }} 張</span>
              </div>
              <div class="summary-row">
                <span class="label">單價</span>
                <span class="value">NT$ 500</span>
              </div>
              <div class="summary-row total">
                <span class="label">總金額</span>
                <span class="value">NT$ {{ totalAmount }}</span>
              </div>
            </div>
            
            <div class="purchase-actions">
            <button 
                @click="submitPurchase"
                :disabled="!canPurchase || isSubmitting"
                class="purchase-button"
              >
                <span v-if="isSubmitting" class="loading-spinner"></span>
                {{ isSubmitting ? '處理中...' : `確認購買 (NT$ ${totalAmount})` }}
      </button>
              <div class="purchase-note">
                <span class="note-icon">🔒</span>
                採用安全加密付款，您的資料受到完整保護
              </div>
            </div>
          </div>
        </div>

        <!-- 購買成功訊息 -->
        <div v-if="showSuccess" class="success-section">
          <div class="success-animation">
            <div class="success-icon">✅</div>
          <h2>購買成功！</h2>
            <p class="success-message">恭喜您成功購買票券，相關資訊已發送至您的電子郵件</p>
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="label">訂單編號</span>
              <span class="value order-number">{{ orderNumber }}</span>
            </div>
            <div class="detail-row">
              <span class="label">購買時間</span>
              <span class="value">{{ formatDateTime(new Date()) }}</span>
            </div>
            <div class="detail-row">
              <span class="label">票券數量</span>
              <span class="value">{{ quantity }} 張</span>
            </div>
            <div class="detail-row">
              <span class="label">總金額</span>
              <span class="value">NT$ {{ totalAmount }}</span>
            </div>
          </div>
          
          <div class="success-actions">
            <button @click="goToOrders" class="primary-button">
              查看我的訂單
            </button>
            <button @click="downloadTicket" class="secondary-button">
              下載電子票券
            </button>
            <router-link to="/events" class="text-button">
              返回活動列表
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { countdownService } from '../services/countdownService'
import axios from 'axios'

const route = useRoute()
const router = useRouter()
    const toast = useToast()

// 狀態管理
const event = ref(null)
const registrationCode = ref('')
const isVerifying = ref(false)
const isVerified = ref(false)
const isSubmitting = ref(false)
const quantity = ref(0)
const showSuccess = ref(false)
    const orderNumber = ref('')
const userInfo = ref(null)
const countdown = ref('')
const loading = ref(true)
const error = ref(null)

// 安全機制
const submitAttempts = ref(0)
const maxSubmitAttempts = 3
const lastSubmitTime = ref(0)
const submitCooldown = 5000 // 5秒冷卻時間
const verifyAttempts = ref(0)
const maxVerifyAttempts = 5

// 計算屬性
const totalAmount = computed(() => quantity.value * 500)
const canPurchase = computed(() => {
  return quantity.value > 0 && 
         eventStatus.value === 'active' && 
         !isSubmitting.value &&
         submitAttempts.value < maxSubmitAttempts &&
         (Date.now() - lastSubmitTime.value) > submitCooldown
})

const eventStatus = computed(() => {
  if (!event.value) return 'inactive'
  const now = new Date()
  const start = new Date(event.value.registrationStartTime)
  const end = new Date(event.value.registrationEndTime)
  
  if (now < start) return 'upcoming'
  if (now > end) return 'ended'
  return 'active'
})

const statusText = computed(() => {
  switch (eventStatus.value) {
    case 'upcoming':
      return '尚未開始'
    case 'active':
      return '搶購中'
    case 'ended':
      return '已結束'
    default:
      return '未知狀態'
  }
})

// 輸入驗證
const validateRegistrationCode = (code) => {
  if (!code || typeof code !== 'string') return false
  
  // 移除空格和轉換大寫
  const cleanCode = code.trim().toUpperCase()
  
  // 檢查格式：TY開頭 + 至少8位英數字（允許更靈活的長度）
  const pattern = /^TY[A-Z0-9]{8,}$/
  return pattern.test(cleanCode)
}

const sanitizeInput = (input) => {
  if (!input) return ''
  return input.trim().replace(/[<>'"]/g, '')
}

// 載入活動資訊
const loadEvent = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get(`/api/public/events/${route.params.eventId}`)
    
    if (response.data.success) {
      event.value = response.data.data
      
      // 驗證活動資料完整性
      if (!event.value.name || !event.value.registrationStartTime || !event.value.registrationEndTime) {
        throw new Error('活動資料不完整')
      }
      
      // 啟動倒數計時
      await countdownService.syncServerTime()
      countdownService.startCountdown([event.value])
      
      // 設定倒數計時顯示
      startCountdown()
    } else {
      error.value = response.data.message || '載入活動資訊失敗'
    }
      } catch (err) {
        console.error('載入活動資訊失敗：', err)
    
    if (err.response?.status === 404) {
      error.value = '找不到此活動，可能已被刪除或不存在'
    } else if (err.response?.status === 500) {
      error.value = '伺服器錯誤，請稍後再試'
    } else {
      error.value = '載入活動資訊失敗，請檢查網路連接'
    }
    
    toast.error(error.value)
      } finally {
        loading.value = false
      }
    }

// 驗證序號
const verifyCode = async () => {
  // 檢查驗證次數限制
  if (verifyAttempts.value >= maxVerifyAttempts) {
    toast.error('驗證次數過多，請稍後再試')
    return
  }
  
  const cleanCode = sanitizeInput(registrationCode.value)
  
  if (!cleanCode) {
    toast.error('請輸入序號')
    return
  }
  
  // 驗證序號格式
  if (!validateRegistrationCode(cleanCode)) {
    toast.error('序號格式不正確，請檢查後重新輸入')
    verifyAttempts.value++
    return
  }
  
  // 檢查活動狀態
  if (eventStatus.value !== 'active') {
    toast.error('目前不在搶購時間內，無法驗證序號')
    return
  }
  
  try {
    isVerifying.value = true
    error.value = null
    verifyAttempts.value++
    
    const response = await axios.post('/api/validate-code', {
      eventId: route.params.eventId,
      registrationCode: cleanCode
    }, {
      timeout: 10000 // 10秒超時
    })
    
    if (response.data.success) {
      isVerified.value = true
      userInfo.value = response.data.data
      registrationCode.value = cleanCode // 使用清理後的序號
      toast.success('序號驗證成功！')
      
      // 重置驗證次數
      verifyAttempts.value = 0
      
      // 自動滾動到票券選擇區
      setTimeout(() => {
        const ticketSection = document.querySelector('.ticket-selection-section')
        if (ticketSection) {
          ticketSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 500)
    }
  } catch (err) {
    console.error('驗證序號失敗：', err)
    
    let errorMessage = '序號驗證失敗'
    
    if (err.response?.status === 400) {
      errorMessage = err.response.data.message || '序號無效或已被使用'
    } else if (err.response?.status === 404) {
      errorMessage = '找不到此序號，請檢查是否輸入正確'
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = '驗證超時，請稍後再試'
    } else if (err.response?.status === 500) {
      errorMessage = '伺服器錯誤，請稍後再試'
    }
    
    error.value = errorMessage
    toast.error(errorMessage)
    
    // 如果達到最大嘗試次數，提供額外提示
    if (verifyAttempts.value >= maxVerifyAttempts) {
      toast.error('驗證次數過多，請聯繫客服或稍後再試')
    }
  } finally {
    isVerifying.value = false
  }
}

// 填入測試序號
const fillTestCode = () => {
  registrationCode.value = 'TYmd4testcode123'
  toast.success('已填入測試序號')
}

// 增減數量
const increaseQuantity = () => {
  if (quantity.value < 4) {
    quantity.value++
  } else {
    toast.warning('每人最多只能購買 4 張票券')
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 0) {
    quantity.value--
  }
}

// 提交購買
const submitPurchase = async () => {
  // 安全檢查
  if (!canPurchase.value) {
    if (quantity.value <= 0) {
      toast.error('請先選擇票券數量')
    } else if (eventStatus.value !== 'active') {
      toast.error('目前不在搶購時間內')
    } else if (submitAttempts.value >= maxSubmitAttempts) {
      toast.error('提交次數過多，請稍後再試')
    } else if ((Date.now() - lastSubmitTime.value) <= submitCooldown) {
      toast.error('請稍後再試，避免重複提交')
    }
    return
  }
  
  // 雙重確認
  if (!confirm(`確認購買 ${quantity.value} 張票券，總金額 NT$ ${totalAmount.value} 嗎？`)) {
    return
  }
  
  try {
    isSubmitting.value = true
    error.value = null
    submitAttempts.value++
    lastSubmitTime.value = Date.now()
    
    const response = await axios.post('/api/purchase', {
      eventId: route.params.eventId,
      registrationCode: registrationCode.value,
      quantity: quantity.value,
      timestamp: Date.now() // 防止重放攻擊
    }, {
      timeout: 15000 // 15秒超時
    })
    
    if (response.data.success) {
        orderNumber.value = response.data.orderNumber
      showSuccess.value = true
        toast.success('購買成功！')
      
      // 重置提交次數
      submitAttempts.value = 0
      
      // 發送購買確認郵件
      try {
        await axios.post('/api/send-email', {
          to_name: userInfo.value.name,
          to_email: userInfo.value.email,
          event_name: event.value.name,
          registration_code: registrationCode.value,
          sale_start_time: event.value.registrationStartTime,
          order_number: orderNumber.value,
          quantity: quantity.value,
          total_amount: totalAmount.value
        })
      } catch (emailError) {
        console.error('發送確認郵件失敗：', emailError)
        // 不影響購買流程，只是提醒用戶
        toast.warning('購買成功，但確認郵件發送失敗，請聯繫客服')
      }
      
      // 自動滾動到成功區域
      setTimeout(() => {
        const successSection = document.querySelector('.success-section')
        if (successSection) {
          successSection.scrollIntoView({ behavior: 'smooth' })
        }
      }, 500)
    }
      } catch (err) {
    console.error('購買失敗：', err)
    
    let errorMessage = '購買失敗，請稍後再試'
    
    if (err.response?.status === 400) {
      errorMessage = err.response.data.message || '購買資料有誤'
    } else if (err.response?.status === 409) {
      errorMessage = '票券已售完或序號已被使用'
    } else if (err.code === 'ECONNABORTED') {
      errorMessage = '購買超時，請稍後再試'
    } else if (err.response?.status === 500) {
      errorMessage = '伺服器錯誤，請稍後再試'
    }
    
    error.value = errorMessage
    toast.error(errorMessage)
    
    // 如果達到最大嘗試次數，提供額外提示
    if (submitAttempts.value >= maxSubmitAttempts) {
      toast.error('提交次數過多，請聯繫客服或稍後再試')
    }
  } finally {
    isSubmitting.value = false
  }
}

// 倒數計時
let countdownTimer = null
const startCountdown = () => {
  const updateCountdown = () => {
    if (!event.value) return
    
    const now = countdownService.getCurrentServerTime()
    let targetTime
    let isUrgent = false
    
    if (eventStatus.value === 'upcoming') {
      targetTime = new Date(event.value.registrationStartTime).getTime()
    } else if (eventStatus.value === 'active') {
      targetTime = new Date(event.value.registrationEndTime).getTime()
      // 如果剩餘時間少於10分鐘，標記為緊急
      isUrgent = (targetTime - now) <= 10 * 60 * 1000
    } else {
      countdown.value = ''
      return
    }
    
    const diff = targetTime - now
    
    if (diff <= 0) {
      countdown.value = ''
      // 重新載入活動資訊以更新狀態
      loadEvent()
      return
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)
    
    let countdownText = ''
    
    if (days > 0) {
      countdownText += `${days}天 `
    }
    if (hours > 0 || days > 0) {
      countdownText += `${hours}小時 `
    }
    if (minutes > 0 || hours > 0 || days > 0) {
      countdownText += `${minutes}分鐘 `
    }
    
    // 如果剩餘時間少於1小時，顯示秒數
    if (diff < 60 * 60 * 1000) {
      countdownText += `${seconds}秒`
    }
    
    countdown.value = countdownText.trim()
    
    // 如果是緊急狀態，添加視覺提示
    if (isUrgent) {
      const countdownElement = document.querySelector('.event-countdown')
      if (countdownElement) {
        countdownElement.classList.add('urgent')
      }
    }
    
    // 在最後30秒時每秒提醒一次
    if (diff <= 30000 && diff > 0) {
      if (seconds <= 10) {
        toast.warning(`搶購即將結束！剩餘 ${seconds} 秒`)
      }
    }
  }
  
  // 立即執行一次
  updateCountdown()
  
  // 清理舊的計時器
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  // 設定新的計時器
  countdownTimer = setInterval(updateCountdown, 1000)
}

// 格式化時間
    const formatDateTime = (dateString) => {
  if (!dateString) return '時間待定'
  
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '時間待定'
    }
    
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // 基本時間格式
    const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Taipei'
    }
    const timeStr = new Intl.DateTimeFormat('zh-TW', timeOptions).format(date)
    
    // 完整日期格式
    const dateOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Taipei'
    }
    const fullDateStr = new Intl.DateTimeFormat('zh-TW', dateOptions).format(date)
    
    // 人性化顯示
    if (diffDays === 0) {
      return `今天 ${timeStr}`
    } else if (diffDays === 1) {
      return `明天 ${timeStr}`
    } else if (diffDays === 2) {
      return `後天 ${timeStr}`
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays}天後 ${timeStr}`
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前 ${timeStr}`
    } else {
      return `${fullDateStr} ${timeStr}`
    }
  } catch (error) {
    console.error('格式化時間失敗：', error)
    return '時間待定'
  }
}

// 查看訂單
const goToOrders = () => {
  router.push('/user/orders')
}

// 下載票券
const downloadTicket = () => {
  if (!orderNumber.value) {
    toast.error('找不到訂單資訊')
    return
  }
  
  try {
    // 生成票券內容
    const ticketContent = `
桃園機場捷運活動票券
==================

活動名稱：${event.value.name}
活動時間：${formatDateTime(event.value.eventStartTime)}
活動地點：台中洲際棒球場

訂單編號：${orderNumber.value}
購買者：${userInfo.value.name}
票券數量：${quantity.value} 張
座位類型：內野座席
總金額：NT$ ${totalAmount.value}

注意事項：
- 請準時到場
- 票券不得轉讓
- 如有問題請聯繫客服

客服電話：02-1234-5678
購買時間：${formatDateTime(new Date())}

此票券為電子票券，請妥善保存
    `
    
    // 創建下載連結
    const blob = new Blob([ticketContent], { type: 'text/plain;charset=utf-8' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `票券_${orderNumber.value}.txt`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast.success('票券下載成功！')
  } catch (error) {
    console.error('下載票券失敗：', error)
    toast.error('下載票券失敗，請稍後再試')
  }
}

// 鍵盤快捷鍵
const handleKeydown = (event) => {
  if (event.key === 'Enter' && !isVerified.value && registrationCode.value && !isVerifying.value) {
    verifyCode()
  }
  
  // ESC 鍵清除錯誤狀態
  if (event.key === 'Escape' && error.value) {
    error.value = null
  }
}

// 頁面可見性變化處理
const handleVisibilityChange = () => {
  if (document.hidden) {
    // 頁面隱藏時暫停倒數計時
    if (countdownTimer) {
      clearInterval(countdownTimer)
    }
  } else {
    // 頁面顯示時重新開始倒數計時
    if (event.value) {
      startCountdown()
    }
  }
}

// 生命週期
onMounted(() => {
  loadEvent()
  document.addEventListener('keydown', handleKeydown)
  document.addEventListener('visibilitychange', handleVisibilityChange)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('visibilitychange', handleVisibilityChange)
  
  if (countdownTimer) {
    clearInterval(countdownTimer)
  }
  
  countdownService.stopCountdown()
})
</script>

<style scoped>
.purchase-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  position: relative;
}

/* 載入狀態樣式 */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-content {
  text-align: center;
  padding: 2rem;
}

.loading-content p {
  margin-top: 1rem;
  font-size: 1.1rem;
  color: #666;
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  display: inline-block;
}

.loading-spinner.large {
  width: 50px;
  height: 50px;
  border-width: 4px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 錯誤狀態樣式 */
.error-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-content {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 90%;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-content h2 {
  color: #dc3545;
  margin-bottom: 1rem;
  font-size: 1.8rem;
}

.error-content p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.retry-button, .back-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.retry-button {
  background: #007bff;
  color: white;
}

.retry-button:hover {
  background: #0056b3;
}

.back-button {
  background: #6c757d;
  color: white;
}

.back-button:hover {
  background: #5a6268;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.breadcrumb {
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
}

.breadcrumb a {
  color: #007bff;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

.breadcrumb span {
  margin: 0 0.5rem;
}

.content {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.event-card {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 10px;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.event-title {
  display: flex;
  align-items: center;
}

.event-title h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.event-status-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9rem;
  color: white;
}

.event-status-badge.upcoming {
  background-color: #ffc107;
}

.event-status-badge.active {
  background-color: #28a745;
}

.event-status-badge.ended {
  background-color: #dc3545;
}

.event-status-badge .status-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 0.5rem;
}

.event-countdown {
  display: flex;
  align-items: center;
  background: #e9ecef;
  padding: 0.8rem 1.5rem;
  border-radius: 20px;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
}

.countdown-label {
  margin-right: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.countdown-value {
  color: #007bff;
}

.event-countdown.urgent {
  background-color: #ff6b6b !important;
  color: white !important;
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(255, 107, 107, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
  }
}

.event-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.detail-item {
  margin-bottom: 0.8rem;
}

.detail-item .label {
  font-weight: bold;
  color: #555;
  margin-bottom: 0.3rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-indicator {
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  position: relative;
}

.progress-indicator::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: -1;
}

.step {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 1;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e0e0e0;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
}

.step.active .step-number {
  background-color: #007bff;
}

.step.completed .step-number {
  background-color: #28a745;
}

.step-label {
  font-size: 0.9rem;
  color: #666;
}

.step-line {
  position: absolute;
  top: 20px;
  width: 100%;
  height: 2px;
  background-color: #e0e0e0;
  z-index: -1;
}

.step-line.completed {
  background-color: #007bff;
}

.verification-section, .user-info-section, .ticket-selection-section, .purchase-summary, .success-section {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.6rem;
  color: #333;
  margin-bottom: 0.8rem;
}

.section-header p {
  font-size: 1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.verification-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
}

.input-wrapper {
  flex: 1;
  position: relative;
  width: 100%;
}

.code-input {
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  box-sizing: border-box;
}

.code-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.input-hint {
  position: absolute;
  bottom: -25px;
  left: 0;
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.3rem;
  width: 100%;
  word-wrap: break-word;
  white-space: nowrap;
}

.hint-icon {
  font-size: 0.9rem;
}

.verify-button {
  padding: 0.8rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-weight: bold;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.verify-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.test-button {
  padding: 0.8rem 1.5rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  width: 100%;
  box-sizing: border-box;
}

.test-button:hover {
  background: #218838;
}

.test-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.loading-spinner {
  border: 2px solid #f3f3f3;
  border-top: 2px solid #007bff;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.verification-tips {
  background: #f0f0f0;
  padding: 1.5rem;
  border-radius: 6px;
  margin-top: 1rem;
}

.verification-tips h4 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 0.8rem;
}

.verification-tips ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.verification-tips li {
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: #555;
}

.user-info-section {
  margin-top: 2rem;
}

.user-info-card {
  background: #f0f0f0;
  padding: 1.5rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.user-detail {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.user-detail .label {
  font-weight: bold;
  color: #555;
}

.user-detail .value {
  font-weight: bold;
  color: #333;
}

.user-detail .code {
  font-size: 0.9rem;
  color: #007bff;
}

.ticket-selection-section {
  margin-top: 2rem;
}

.ticket-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
}

.ticket-card {
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
}

.ticket-image {
  width: 100%;
  height: 150px;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
}

.ticket-icon {
  font-size: 4rem;
  color: #007bff;
}

.ticket-info {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.ticket-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.ticket-name {
  font-size: 1.3rem;
  font-weight: bold;
  color: #333;
}

.ticket-price {
  font-size: 1.2rem;
  font-weight: bold;
  color: #28a745;
}

.ticket-description {
  font-size: 0.9rem;
  color: #666;
  line-height: 1.4;
}

.ticket-features {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.feature {
  font-size: 0.8rem;
  color: #007bff;
  background-color: #e0f7fa;
  padding: 0.3rem 0.7rem;
  border-radius: 5px;
  border: 1px solid #b2ebf2;
}

.quantity-selector {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.quantity-label {
  font-weight: bold;
  color: #555;
}

.quantity-controls {
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #f8f9fa;
  color: #333;
  font-size: 1.2rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #e9ecef;
}

.quantity-btn:disabled {
  background-color: #f8f9fa;
  color: #888;
  cursor: not-allowed;
}

.quantity-display {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.1rem;
  font-weight: bold;
  color: #333;
  border-left: 1px solid #ddd;
  border-right: 1px solid #ddd;
}

.quantity-hint {
  font-size: 0.8rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.purchase-summary {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px dashed #ccc;
}

.summary-header h3 {
  font-size: 1.4rem;
  color: #333;
  margin-bottom: 1rem;
}

.summary-content {
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-row .label {
  font-weight: bold;
  color: #555;
}

.summary-row .value {
  font-weight: bold;
  color: #333;
}

.summary-row.total .label {
  color: #dc3545;
}

.summary-row.total .value {
  color: #dc3545;
}

.purchase-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.purchase-button {
  padding: 1rem 2rem;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.purchase-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.purchase-note {
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-top: 0.8rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.success-section {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.success-animation {
  margin-bottom: 1.5rem;
}

.success-icon {
  font-size: 5rem;
  color: #28a745;
  margin-bottom: 0.8rem;
}

.success-message {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 1.5rem;
}

.order-details {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.order-details .detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-details .label {
  font-weight: bold;
  color: #555;
}

.order-details .value {
  font-weight: bold;
  color: #333;
}

.order-details .order-number {
  color: #007bff;
}

.success-actions {
  margin-top: 2rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.primary-button, .secondary-button, .text-button {
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 1rem;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.primary-button {
  background: #28a745;
  color: white;
}

.primary-button:hover:not(:disabled) {
  background: #218838;
}

.primary-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.secondary-button {
  background: #6c757d;
  color: white;
}

.secondary-button:hover:not(:disabled) {
  background: #5a6268;
}

.secondary-button:disabled {
  background: #ccc;
  cursor: not-allowed;
  color: #888;
}

.text-button {
  color: #007bff;
  text-decoration: underline;
}

.text-button:hover {
  color: #0056b3;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .purchase-container {
    padding: 1rem;
    max-width: 100%;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .breadcrumb {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .breadcrumb span {
    display: none;
  }
  
  .content {
    padding: 1.5rem;
  }
  
  .event-card {
    padding: 1.5rem;
  }
  
  .event-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .event-title {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .event-title h1 {
    font-size: 1.5rem;
  }
  
  .event-countdown {
    font-size: 1rem;
    padding: 0.6rem 1rem;
  }
  
  .detail-row {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .progress-indicator {
    flex-direction: column;
    gap: 1rem;
  }
  
  .progress-indicator::before {
    display: none;
  }
  
  .step {
    flex-direction: row;
    gap: 1rem;
  }
  
  .step-number {
    width: 30px;
    height: 30px;
    font-size: 1rem;
    margin-bottom: 0;
  }
  
  .step-line {
    display: none;
  }
  
  .verification-section,
  .user-info-section,
  .ticket-selection-section,
  .purchase-summary,
  .success-section {
    padding: 1.5rem;
  }
  
  .input-group {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  
  .input-wrapper {
    width: 100%;
    margin-bottom: 1rem;
  }
  
  .input-hint {
    position: static;
    margin-top: 0.5rem;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .verify-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }
  
  .test-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  .verification-tips {
    padding: 1rem;
  }
  
  .verification-tips h4 {
    font-size: 1rem;
  }
  
  .verification-tips li {
    font-size: 0.85rem;
  }
  
  .user-info-card {
    padding: 1rem;
  }
  
  .user-detail {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
  }
  
  .ticket-grid {
    grid-template-columns: 1fr;
  }
  
  .ticket-card {
    flex-direction: column;
  }
  
  .ticket-image {
    height: 120px;
  }
  
  .ticket-icon {
    font-size: 3rem;
  }
  
  .ticket-info {
    padding: 1rem;
  }
  
  .ticket-header {
    flex-direction: column;
    gap: 0.5rem;
    align-items: flex-start;
  }
  
  .ticket-name {
    font-size: 1.2rem;
  }
  
  .ticket-price {
    font-size: 1.1rem;
  }
  
  .ticket-features {
    flex-direction: column;
    gap: 0.3rem;
  }
  
  .feature {
    font-size: 0.75rem;
    padding: 0.2rem 0.5rem;
  }
  
  .quantity-controls {
    justify-content: center;
  }
  
  .quantity-btn {
    width: 50px;
    height: 50px;
    font-size: 1.4rem;
  }
  
  .quantity-display {
    width: 60px;
    height: 50px;
    font-size: 1.3rem;
  }
  
  .summary-content {
    gap: 1rem;
  }
  
  .summary-row {
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .summary-row:last-child {
    border-bottom: none;
  }
  
  .summary-row.total {
    font-size: 1.1rem;
    padding: 1rem 0;
    border-top: 2px solid #ddd;
  }
  
  .purchase-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.2rem;
  }
  
  .purchase-note {
    font-size: 0.85rem;
    text-align: center;
  }
  
  .success-section {
    padding: 2rem 1rem;
  }
  
  .success-icon {
    font-size: 4rem;
  }
  
  .success-section h2 {
    font-size: 1.5rem;
  }
  
  .success-message {
    font-size: 1rem;
  }
  
  .order-details {
    padding: 1rem;
  }
  
  .order-details .detail-row {
    flex-direction: column;
    gap: 0.3rem;
    align-items: flex-start;
    padding: 0.5rem 0;
    border-bottom: 1px solid #eee;
  }
  
  .order-details .detail-row:last-child {
    border-bottom: none;
  }
  
  .success-actions {
    flex-direction: column;
    gap: 0.8rem;
  }
  
  .primary-button,
  .secondary-button {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
  }
  
  .text-button {
    padding: 0.8rem;
    font-size: 1rem;
  }
}

/* 超小屏幕優化 */
@media (max-width: 480px) {
  .purchase-container {
    padding: 0.5rem;
  }
  
  .page-header h1 {
    font-size: 1.8rem;
  }
  
  .content {
    padding: 1rem;
  }
  
  .event-card {
    padding: 1rem;
  }
  
  .event-title h1 {
    font-size: 1.3rem;
  }
  
  .event-countdown {
    font-size: 0.9rem;
    padding: 0.5rem 0.8rem;
  }
  
  .verification-section,
  .user-info-section,
  .ticket-selection-section,
  .purchase-summary,
  .success-section {
    padding: 1rem;
  }
  
  .section-header h2 {
    font-size: 1.4rem;
  }
  
  .section-header p {
    font-size: 0.9rem;
  }
  
  .code-input {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
    width: 100%;
    box-sizing: border-box;
  }
  
  .input-hint {
    position: static;
    margin-top: 0.5rem;
    font-size: 0.75rem;
    white-space: normal;
    word-wrap: break-word;
  }
  
  .verify-button {
    padding: 0.8rem;
    font-size: 1rem;
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .test-button {
    padding: 0.8rem;
    font-size: 1rem;
    width: 100%;
  }
  
  .verification-tips {
    padding: 0.8rem;
  }
  
  .verification-tips h4 {
    font-size: 0.95rem;
  }
  
  .verification-tips li {
    font-size: 0.8rem;
  }
  
  .user-info-card {
    padding: 0.8rem;
  }
  
  .ticket-image {
    height: 100px;
  }
  
  .ticket-icon {
    font-size: 2.5rem;
  }
  
  .ticket-info {
    padding: 0.8rem;
  }
  
  .ticket-name {
    font-size: 1.1rem;
  }
  
  .ticket-price {
    font-size: 1rem;
  }
  
  .ticket-description {
    font-size: 0.85rem;
  }
  
  .feature {
    font-size: 0.7rem;
    padding: 0.15rem 0.4rem;
  }
  
  .quantity-btn {
    width: 45px;
    height: 45px;
    font-size: 1.2rem;
  }
  
  .quantity-display {
    width: 50px;
    height: 45px;
    font-size: 1.1rem;
  }
  
  .purchase-button {
    padding: 0.8rem;
    font-size: 1.1rem;
  }
  
  .success-icon {
    font-size: 3.5rem;
  }
  
  .success-section h2 {
    font-size: 1.3rem;
  }
  
  .success-message {
    font-size: 0.9rem;
  }
  
  .order-details {
    padding: 0.8rem;
  }
  
  .primary-button,
  .secondary-button {
    padding: 0.8rem;
    font-size: 1rem;
  }
  
  .text-button {
    padding: 0.6rem;
    font-size: 0.9rem;
  }
}

/* 觸控設備優化 */
@media (hover: none) and (pointer: coarse) {
  .quantity-btn,
  .verify-button,
  .purchase-button,
  .primary-button,
  .secondary-button {
    min-height: 44px;
    min-width: 44px;
  }
  
  .code-input {
    min-height: 44px;
    font-size: 16px; /* 防止 iOS 縮放 */
  }
  
  .ticket-card {
    border-width: 2px;
  }
  
  .ticket-card:hover {
    border-color: #007bff;
  }
}

/* 高對比度模式支援 */
@media (prefers-contrast: high) {
  .event-status-badge {
    border: 2px solid currentColor;
  }
  
  .step-number {
    border: 2px solid currentColor;
  }
  
  .ticket-card {
    border-width: 2px;
  }
  
  .purchase-button,
  .verify-button,
  .primary-button,
  .secondary-button {
    border: 2px solid currentColor;
  }
}

/* 深色模式支援 */
@media (prefers-color-scheme: dark) {
  .purchase-container {
    background-color: #2d3748;
    color: #e2e8f0;
  }
  
  .content {
    background-color: #4a5568;
    color: #e2e8f0;
  }
  
  .event-card {
    background-color: #2d3748;
  }
  
  .verification-section,
  .user-info-section,
  .ticket-selection-section,
  .purchase-summary,
  .success-section {
    background-color: #2d3748;
    color: #e2e8f0;
  }
  
  .ticket-card {
    background-color: #4a5568;
    border-color: #718096;
  }
  
  .code-input {
    background-color: #4a5568;
    border-color: #718096;
    color: #e2e8f0;
  }
  
  .verification-tips,
  .user-info-card,
  .order-details {
    background-color: #4a5568;
  }
}

/* 動畫效果 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.3s ease;
}

.slide-enter-from {
  transform: translateY(20px);
  opacity: 0;
}

.slide-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}
</style> 
<template>
  <div class="event-detail-container">
    <div class="content">
      <div class="navigation-bar">
        <router-link to="/events" class="back-button">
          <span class="back-icon">←</span> 返回活動列表
        </router-link>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <router-link to="/events" class="retry-button">返回活動列表</router-link>
      </div>

      <div v-else-if="event" class="event-content">
        <div class="event-header">
          <h1>{{ event.name }}</h1>
          <div class="event-status" :class="eventStatus.status">
            {{ eventStatus.text }}
            <span v-if="countdown" class="countdown">
              <template v-if="countdown.type === 'start'">
                (距離開賣：{{ countdown.display }})
              </template>
              <template v-else>
                (距離結束：{{ countdown.display }})
              </template>
            </span>
          </div>
        </div>

        <div class="event-info">
          <div class="info-section">
            <h3>📅 報名時間</h3>
            <p><span class="time-label">🚀 報名開始：</span>{{ formatDate(event.registrationStartTime) }}</p>
            <p><span class="time-label">⏰ 報名截止：</span>{{ formatDate(event.registrationEndTime) }}</p>
          </div>

          <div class="info-section">
            <h3>活動說明</h3>
            <p>{{ event.description }}</p>
          </div>

          <div class="info-section">
            <h3>活動容量</h3>
            <p>總容量：{{ event.capacity }} 人</p>
          </div>
        </div>

        <div class="action-section">
          <button 
            @click="handleRegister" 
            class="register-button"
            :disabled="eventStatus.status !== 'active'"
            :class="{ 
              'inactive': eventStatus.status !== 'active'
            }"
          >
            {{ eventStatus.status === 'active' ? '立即登記' : '尚未開放' }}
          </button>
          <button 
            @click="handlePurchase" 
            class="purchase-button"
            :disabled="eventStatus.status !== 'active'"
            :class="{ 
              'inactive': eventStatus.status !== 'active'
            }"
          >
            {{ eventStatus.status === 'active' ? '🎫 前往搶購' : '搶購未開放' }}
          </button>
          <p v-if="eventStatus.status !== 'active'" class="notice">
            {{ eventStatus.status === 'upcoming' ? '報名尚未開始' :
               eventStatus.status === 'ended' ? '活動已結束' : '' }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useToast } from 'vue-toastification'
import { countdownService } from '../services/countdownService'
import axios from '../services/axiosConfig'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const toast = useToast()

const event = ref(null)
const loading = ref(true)
const error = ref(null)
const isRegistered = ref(false)
const countdown = computed(() => countdownService.countdowns.value[event.value?.id])

// 活動狀態計算
const eventStatus = computed(() => {
  if (!event.value) return { status: 'inactive', text: '未開始' }
  return countdownService.getEventStatus(event.value)
})

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) {
      return '日期待定'
    }
    
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // 格式化基本時間
    const timeOptions = {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Taipei'
    }
    const timeStr = new Intl.DateTimeFormat('zh-TW', timeOptions).format(date)
    
    // 格式化完整日期
    const dateOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: 'Asia/Taipei'
    }
    const fullDateStr = new Intl.DateTimeFormat('zh-TW', dateOptions).format(date)
    
    // 人性化相對時間
    if (diffDays === 0) {
      return `今天 ${timeStr}`
    } else if (diffDays === 1) {
      return `明天 ${timeStr}`
    } else if (diffDays === 2) {
      return `後天 ${timeStr}`
    } else if (diffDays > 0 && diffDays <= 7) {
      return `${diffDays}天後 (${fullDateStr}) ${timeStr}`
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前 (${fullDateStr}) ${timeStr}`
    } else {
      return `${fullDateStr} ${timeStr}`
    }
  } catch (error) {
    console.error('格式化日期時發生錯誤：', error)
    return '日期待定'
  }
}

const handleRegister = () => {
  // 檢查活動狀態
  if (eventStatus.value.status !== 'active') {
    toast.warning('目前不在報名時段')
    return
  }
  
  // 跳轉到活動註冊頁面
  router.push(`/register/${event.value.id}`)
}

const handlePurchase = () => {
  // 檢查活動狀態
  if (eventStatus.value.status !== 'active') {
    toast.warning('目前不在報名時段')
    return
  }
  
  // 跳轉到活動註冊頁面
  router.push(`/purchase/${event.value.id}`)
}

onMounted(async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get(`/api/public/events/${route.params.eventId}`)
    
    if (!response.data.success || !response.data.data) {
      throw new Error('無法載入活動資訊')
    }
    
    event.value = response.data.data
    
    // 同步伺服器時間並啟動倒數計時
    await countdownService.syncServerTime()
    countdownService.startCountdown([event.value])
    
    // 檢查是否已經報名
    if (authStore.isAuthenticated && event.value) {
      try {
        const checkResponse = await axios.get(`/api/registrations/check/${event.value.id}`)
        isRegistered.value = checkResponse.data.isRegistered
      } catch (err) {
        console.error('檢查報名狀態失敗：', err)
      }
    }
  } catch (err) {
    error.value = err.message || '無法載入活動資訊'
    console.error('載入活動失敗：', err)
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  countdownService.stopCountdown()
})
</script>

<style scoped>
.event-detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.navigation-bar {
  margin-bottom: 2rem;
}

.back-button {
  display: inline-flex;
  align-items: center;
  color: #666;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.back-button:hover {
  color: #1a73e8;
}

.back-icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.loading-container, .error-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.retry-button {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #1a73e8;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #1557b0;
}

.event-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.event-header {
  padding: 2rem;
  background: #f8f9fa;
  border-bottom: 1px solid #eee;
}

.event-header h1 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 2rem;
  line-height: 1.3;
}

.event-status {
  display: inline-block;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.event-status.active {
  background-color: #4caf50;
  color: white;
}

.event-status.upcoming {
  background-color: #2196f3;
  color: white;
}

.event-status.ended {
  background-color: #9e9e9e;
  color: white;
}

.countdown {
  font-size: 0.9em;
  color: #fff;
  background: rgba(0, 0, 0, 0.1);
  padding: 0.4em 0.8em;
  border-radius: 4px;
  display: inline-block;
  margin-left: 0.8em;
  box-sizing: border-box;
}

.event-info {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h3 {
  color: #333;
  margin: 0 0 1rem;
  font-size: 1.2rem;
  line-height: 1.3;
}

.info-section p {
  color: #666;
  margin: 0.5rem 0;
  line-height: 1.5;
  font-size: 1rem;
}

.time-label {
  font-weight: 600;
  color: #1a73e8;
  margin-right: 0.5rem;
}

.action-section {
  padding: 2rem;
  background: #f8f9fa;
  border-top: 1px solid #eee;
  text-align: center;
}

.register-button, .purchase-button {
  padding: 1rem 2rem;
  font-size: 1.1rem;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem; /* Added margin-bottom for spacing */
}

.register-button {
  background-color: #2196f3;
}

.register-button:hover:not(:disabled) {
  background-color: #1976d2;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.purchase-button {
  background-color: #4caf50;
}

.purchase-button:hover:not(:disabled) {
  background-color: #43a047;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.register-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.purchase-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.register-button.inactive {
  background-color: #9e9e9e;
}

.purchase-button.inactive {
  background-color: #9e9e9e;
}

.notice {
  margin-top: 1rem;
  color: #666;
  font-size: 1rem;
}
</style> 
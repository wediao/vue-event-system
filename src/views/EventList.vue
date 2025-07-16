<template>
  <div class="event-list-container">
    <div class="content">
      <!-- 新增：輪播區塊 -->
      <div v-if="!loading && !error && events.length > 0" class="carousel-container">
        <div class="carousel">
          <div class="carousel-inner" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="event in events.slice(0, 3)" :key="event.id" class="carousel-slide">
              <img :src="event.image" :alt="event.name" class="carousel-image">
              <div class="carousel-overlay">
                <div class="carousel-info">
                  <h2>{{ event.name }}</h2>
                  <p>{{ event.description }}</p>
                  <div class="carousel-details">
                    <div class="carousel-time">
                      <div class="time-item">
                        <span class="icon">📅</span>
                        <span>{{ formatDateTime(event.registrationStartTime) }}</span>
                      </div>
                      <div v-if="countdown[event.id]" class="carousel-countdown">
                        <span class="icon">⏰</span>
                        <span v-if="countdown[event.id].type === 'start'">
                          距離開賣：{{ countdown[event.id].display }}
                        </span>
                        <span v-else>
                          本輪剩餘：{{ countdown[event.id].display }}
                        </span>
                      </div>
                    </div>
                    <router-link :to="'/event/' + event.id" class="carousel-btn">
                      立即報名
                    </router-link>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button class="carousel-control prev" @click="prevSlide" :disabled="currentSlide === 0">
            &#10094;
          </button>
          <button class="carousel-control next" @click="nextSlide" :disabled="currentSlide === Math.min(events.length, 3) - 1">
            &#10095;
          </button>
          <div class="carousel-dots">
            <button 
              v-for="index in Math.min(events.length, 3)" 
              :key="index - 1"
              class="dot"
              :class="{ active: currentSlide === index - 1 }"
              @click="goToSlide(index - 1)"
            ></button>
          </div>
        </div>
      </div>

      <div class="page-header">
        <h1>活動總覽</h1>
        <p class="subtitle">探索精彩活動，立即報名參加</p>
      </div>
    
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <p>載入中...</p>
      </div>
      
      <div v-else-if="error" class="error-state">
        <div class="error-icon">⚠️</div>
        <p>{{ error }}</p>
        <button @click="loadEvents" class="retry-button">重新載入</button>
      </div>
      
      <div v-else-if="events.length === 0" class="empty-state">
        <div class="empty-icon">📅</div>
        <p>目前沒有活動</p>
      </div>
      
      <div v-else class="events-grid">
        <div v-for="event in events" 
             :key="event.id" 
             class="event-card"
             @mouseover="hoveredEvent = event.id"
             @mouseleave="hoveredEvent = null">
          <div class="event-image-container">
            <img :src="event.image" :alt="event.name" class="event-image">
            <div class="event-overlay" v-show="hoveredEvent === event.id">
              <router-link :to="{ name: 'EventDetail', params: { eventId: event.id }}" class="overlay-btn">
                查看詳情
              </router-link>
            </div>
          </div>
          <div class="event-content">
            <h2>{{ event.name }}</h2>
            <p class="event-description">{{ event.description }}</p>
            <div class="event-info">
              <div class="info-item">
                <span class="icon">🚀</span>
                <span>報名開始：{{ formatDateTime(event.registrationStartTime) }}</span>
              </div>
              <div class="info-item">
                <span class="icon">⏰</span>
                <span>報名截止：{{ formatDateTime(event.registrationEndTime) }}</span>
              </div>
              <div class="info-item">
                <span class="icon">👥</span>
                <span>剩餘名額：{{ event.capacity }}</span>
              </div>
              <div v-if="countdown[event.id]" class="countdown">
                <span class="icon">⏰</span>
                <span v-if="countdown[event.id].type === 'start'">
                  距離開賣：{{ countdown[event.id].display }}
                </span>
                <span v-else>
                  本輪剩餘：{{ countdown[event.id].display }}
                </span>
              </div>
            </div>
            <div class="event-status" :class="getEventStatus(event)">
              {{ getStatusText(getEventStatus(event)) }}
            </div>
            <div class="action-buttons">
              <router-link 
                :to="{ name: 'EventDetail', params: { eventId: event.id }}" 
                class="btn btn-detail"
              >
                查看詳情
              </router-link>
              <router-link 
                v-if="getEventStatus(event) === 'registration'" 
                :to="{ name: 'EventRegistration', params: { eventId: event.id }}" 
                class="btn btn-register"
              >
                立即報名
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { countdownService } from '../services/countdownService'

const events = ref([])
const toast = useToast()
const loading = ref(true)
const hoveredEvent = ref(null)
const error = ref(null)
const countdown = countdownService.countdowns  // 使用倒數計時服務的狀態

// 修改：輪播相關的 ref 和方法
const currentSlide = ref(0)
const slideInterval = ref(null)

const nextSlide = () => {
  if (!events.value || events.value.length === 0) return
  currentSlide.value = (currentSlide.value + 1) % Math.min(events.value.length, 3)
}

const prevSlide = () => {
  if (!events.value || events.value.length === 0) return
  currentSlide.value = (currentSlide.value - 1 + Math.min(events.value.length, 3)) % Math.min(events.value.length, 3)
}

const goToSlide = (index) => {
  if (!events.value || events.value.length === 0) return
  currentSlide.value = index
}

// 修改：開始輪播
const startCarousel = () => {
  // 先清除可能存在的舊計時器
  if (slideInterval.value) {
    clearInterval(slideInterval.value)
  }
  
  // 設置新的計時器
  slideInterval.value = setInterval(() => {
    if (events.value && events.value.length > 0) {
      nextSlide()
    }
  }, 5000) // 每5秒切換一次
}

const loadEvents = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await axios.get('/api/public/events')
    
    if (response.data.success) {
      // 將物件轉換為陣列並添加預設圖片
      events.value = Object.values(response.data.data).map(event => ({
        ...event,
        image: event.image || `https://picsum.photos/800/400?random=${event.id}`
      }))
      
      // 同步伺服器時間並啟動倒數計時
      await countdownService.syncServerTime()
      countdownService.startCountdown(events.value)
    } else {
      error.value = response.data.message || '載入活動列表失敗'
      toast.error(error.value)
    }
  } catch (err) {
    console.error('載入活動列表失敗：', err)
    error.value = err.response?.data?.message || '無法連接到伺服器，請檢查網路連線'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

// 修改：人性化時間顯示
const formatDateTime = (dateString) => {
  try {
    const date = new Date(dateString)
    // 檢查是否為有效日期
    if (isNaN(date.getTime())) {
      console.error('無效的日期格式：', dateString)
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
    
    // 格式化日期
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
      return `${diffDays}天後 ${timeStr}`
    } else if (diffDays < 0 && diffDays >= -7) {
      return `${Math.abs(diffDays)}天前 ${timeStr}`
    } else {
      return `${fullDateStr} ${timeStr}`
    }
  } catch (error) {
    console.error('格式化日期時發生錯誤：', error)
    return '日期待定'
  }
}

// 修改：取得活動狀態
const getEventStatus = (event) => {
  return countdownService.getEventStatus(event)
}

// 新增：取得狀態文字
const getStatusText = (status) => {
  switch (status) {
    case 'upcoming': return '即將開始'
    case 'registration': return '報名中'
    case 'ended': return '已結束'
    default: return ''
  }
}

// 修改：組件掛載時的初始化
onMounted(() => {
  loadEvents()
  startCarousel()
})

// 修改：組件卸載時的清理
onUnmounted(() => {
  countdownService.stopCountdown()
  if (slideInterval.value) {
    clearInterval(slideInterval.value)
  }
})

</script>

<style scoped>
.event-list-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.content {
  width: 100%;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
}

.carousel-container {
  margin-bottom: 3rem;
  width: 100%;
  height: 500px;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.carousel {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-inner {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.carousel-slide {
  flex: 0 0 100%;
  position: relative;
  overflow: hidden;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0, 0, 0, 0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: 2rem;
  box-sizing: border-box;
}

.carousel-info {
  width: 100%;
  color: white;
}

.carousel-info h2 {
  font-size: 2.5rem;
  margin: 0 0 1rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}

.carousel-info p {
  font-size: 1.2rem;
  margin: 0 0 1.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.carousel-details {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.carousel-time {
  flex: 1;
}

.time-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  font-size: 1.1rem;
}

.time-item .icon {
  margin-right: 0.5rem;
}

.carousel-countdown {
  display: inline-block;
  background: rgba(255, 64, 129, 0.2);
  padding: 0.8rem 1.2rem;
  border-radius: 8px;
  font-size: 1.2rem;
  color: #fff;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
}

.carousel-btn {
  padding: 1rem 2rem;
  background: #ff4081;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: bold;
  font-size: 1.2rem;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.2);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.carousel-btn:hover {
  background: #f50057;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.carousel-control {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  backdrop-filter: blur(4px);
  transition: all 0.3s ease;
  z-index: 10;
}

.carousel-control:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-50%) scale(1.1);
}

.carousel-control.prev {
  left: 20px;
}

.carousel-control.next {
  right: 20px;
}

.carousel-control:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.carousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  z-index: 10;
}

.dot {
  width: 12px;
  height: 12px;
  border: 2px solid white;
  background: transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 0;
}

.dot:hover {
  background: rgba(255, 255, 255, 0.5);
}

.dot.active {
  background: white;
  transform: scale(1.2);
}

.events-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.event-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  position: relative;
  display: flex;
  flex-direction: column;
}

.event-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.event-image-container {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 aspect ratio */
  overflow: hidden;
}

.event-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.event-card:hover .event-overlay {
  opacity: 1;
}

.overlay-btn {
  padding: 0.8rem 1.5rem;
  background: white;
  color: #333;
  text-decoration: none;
  border-radius: 4px;
  font-weight: bold;
  transition: background 0.3s;
}

.overlay-btn:hover {
  background: #f0f0f0;
}

.event-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.event-content h2 {
  margin: 0 0 1rem;
  color: #333;
  font-size: 1.5rem;
  line-height: 1.3;
}

.event-description {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  flex: 1;
}

.event-info {
  margin-bottom: 1.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.8rem;
  color: #555;
  font-size: 1rem;
}

.icon {
  margin-right: 0.5rem;
  font-size: 1.2rem;
}

.countdown {
  font-size: 1.1em;
  color: #ff4081;
  background: rgba(255, 64, 129, 0.1);
  padding: 0.8em 1em;
  border-radius: 8px;
  display: inline-block;
  margin-top: 0.5em;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.event-status {
  display: inline-block;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  font-weight: bold;
  margin-bottom: 1rem;
  width: 100%;
  text-align: center;
  box-sizing: border-box;
}

.event-status.registration {
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

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 0.8rem;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  font-size: 1rem;
}

.btn-detail {
  background-color: #f5f5f5;
  color: #333;
}

.btn-detail:hover {
  background-color: #e0e0e0;
  transform: translateY(-2px);
}

.btn-register {
  background-color: #4caf50;
  color: white;
}

.btn-register:hover {
  background-color: #43a047;
  transform: translateY(-2px);
}

.loading-container {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
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

.error-state {
  text-align: center;
  padding: 3rem;
}

.error-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #f44336;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.retry-button:hover {
  background-color: #1976d2;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #666;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}
</style> 
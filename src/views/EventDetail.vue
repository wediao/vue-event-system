<template>
  <div class="event-detail">
    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>
    
    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">⚠️</div>
      <p class="error-message">{{ error }}</p>
    </div>
    
    <!-- 活動內容 -->
    <div v-else-if="event" class="event-container">
      <!-- 活動標題區塊 -->
      <div class="event-header">
        <div class="event-image">
          <img :src="event.image || `https://picsum.photos/800/400?random=${event.id}`" :alt="event.name">
          <div class="event-status-badge">
            <span class="status-text">{{ getEventStatus() }}</span>
          </div>
        </div>
        <div class="event-title">
          <h1>{{ event.name }}</h1>
          <p class="event-description">{{ event.description }}</p>
        </div>
      </div>
      
      <!-- 活動資訊卡片 -->
      <div class="event-info-cards">
        <div class="info-card">
          <div class="card-icon">🚀</div>
          <div class="card-content">
            <h3>報名開始</h3>
            <p>{{ formatDateTime(event.registrationStartTime) }}</p>
          </div>
        </div>
        
        <div class="info-card">
          <div class="card-icon">⏰</div>
          <div class="card-content">
            <h3>報名截止</h3>
            <p>{{ formatDateTime(event.registrationEndTime) }}</p>
          </div>
        </div>
        
        <div class="info-card">
          <div class="card-icon">👥</div>
          <div class="card-content">
            <h3>活動名額</h3>
            <p>{{ event.capacity }} 人</p>
          </div>
        </div>
      </div>
      
      <!-- 操作按鈕 -->
      <div class="event-actions">
        <router-link :to="`/register/${event.id}`" class="register-btn">
          立即報名
        </router-link>
        <button @click="shareEvent" class="share-btn">
          分享活動
        </button>
      </div>
    </div>
    
    <!-- 無活動狀態 -->
    <div v-else class="empty-container">
      <div class="empty-icon">📅</div>
      <p>查無此活動</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import axios from '../services/axiosConfig'

const route = useRoute()
const event = ref(null)
const loading = ref(true)
const error = ref(null)

const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  const date = new Date(dateTime)
  return date.toLocaleString('zh-TW', { 
    year: 'numeric', 
    month: '2-digit', 
    day: '2-digit', 
    hour: '2-digit', 
    minute: '2-digit' 
  })
}

const getEventStatus = () => {
  if (!event.value) return '未知'
  const now = new Date()
  const startTime = new Date(event.value.registrationStartTime)
  const endTime = new Date(event.value.registrationEndTime)
  
  if (now < startTime) return '即將開始'
  if (now > endTime) return '已結束'
  return '報名中'
}

const shareEvent = () => {
  if (navigator.share) {
    navigator.share({
      title: event.value.name,
      text: event.value.description,
      url: window.location.href
    })
  } else {
    // 複製連結到剪貼簿
    navigator.clipboard.writeText(window.location.href)
    alert('活動連結已複製到剪貼簿！')
  }
}

onMounted(async () => {
  try {
    const eventId = route.params.eventId || route.params.id
    const response = await axios.get(`/api/public/events/${eventId}`)
    if (response.data.success) {
      event.value = response.data.data
    } else {
      error.value = response.data.message || '無法載入活動資訊'
    }
  } catch (err) {
    error.value = '無法載入活動資訊，請稍後再試'
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.event-detail {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  padding: 20px;
}

/* 載入中狀態 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  border-top: 3px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 錯誤狀態 */
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.error-message {
  font-size: 1.2rem;
  text-align: center;
}

/* 活動容器 */
.event-container {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

/* 活動標題區塊 */
.event-header {
  position: relative;
}

.event-image {
  position: relative;
  height: 400px;
  overflow: hidden;
}

.event-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.event-status-badge {
  position: absolute;
  top: 20px;
  right: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 0.9rem;
  font-weight: 500;
}

.event-title {
  padding: 30px;
  text-align: center;
}

.event-title h1 {
  font-size: 2.5rem;
  color: #333;
  margin-bottom: 20px;
  font-weight: 700;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.event-description {
  font-size: 1.2rem;
  color: #666;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 資訊卡片 */
.event-info-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  padding: 30px;
  background: #f8f9fa;
}

.info-card {
  background: white;
  padding: 25px;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 15px;
  transition: transform 0.3s ease;
  min-width: 0;
  overflow: hidden;
}

.info-card:hover {
  transform: translateY(-5px);
}

.card-icon {
  font-size: 2.5rem;
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.card-content {
  flex: 1;
  min-width: 0;
}

.card-content h3 {
  font-size: 1.1rem;
  color: #333;
  margin-bottom: 8px;
  font-weight: 600;
}

.card-content p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

/* 操作按鈕 */
.event-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  padding: 40px;
}

.register-btn {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: white;
  padding: 15px 40px;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
}

.register-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 25px rgba(255, 215, 0, 0.4);
}

.share-btn {
  background: white;
  color: #FFA500;
  padding: 15px 40px;
  border: 2px solid #FFA500;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.share-btn:hover {
  background: #FFA500;
  color: white;
  transform: translateY(-2px);
}

/* 無活動狀態 */
.empty-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  color: white;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .event-detail {
    padding: 10px;
  }
  
  .event-title h1 {
    font-size: 2rem;
  }
  
  .event-info-cards {
    grid-template-columns: 1fr;
    padding: 20px;
  }
  
  .event-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .register-btn, .share-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style>

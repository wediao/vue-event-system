<template>
  <div class="event-management-list">
    <div class="section-header">
      <div class="icon-title">
        <div class="icon">📅</div>
        <h2>活動管理</h2>
      </div>
      <button @click="showCreateForm = true" class="btn-add">
        <span>➕</span> 新增活動
      </button>
    </div>

    <!-- 載入中狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 活動列表 -->
    <div class="events-grid" v-else-if="events.length">
      <div v-for="event in events" :key="event.id" class="event-card">
        <div class="event-header">
          <h3>{{ event.name }}</h3>
          <span :class="['status-badge', getStatusClass(event)]">
            {{ getStatusText(event) }}
          </span>
        </div>
        <div class="event-info">
        <p class="event-description">{{ event.description }}</p>
          <div class="event-time">
            <p>開始時間：{{ formatDateTime(event.registrationStartTime) }}</p>
            <p>結束時間：{{ formatDateTime(event.registrationEndTime) }}</p>
          </div>
        </div>
        <div class="event-actions">
          <router-link 
            :to="`/admin/events/${event.id}`" 
            class="btn-edit"
          >
            管理活動
          </router-link>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <p>尚未建立任何活動</p>
      <button @click="showCreateForm = true" class="btn-primary">
        建立第一個活動
      </button>
    </div>

    <!-- 新增活動表單 -->
    <div v-if="showCreateForm" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>新增活動</h3>
          <button @click="closeForm" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <EventForm 
            @submit="handleSubmit"
            @cancel="closeForm"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import EventForm from './components/EventForm.vue'

const router = useRouter()
const toast = useToast()

const events = ref([])
const loading = ref(true)
const showCreateForm = ref(false)

// 載入活動列表
const loadEvents = async () => {
  try {
    loading.value = true
    console.log('開始載入活動列表')
    
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/events')
    console.log('收到回應：', response.status, response.statusText)
    
    if (response.data.success) {
      events.value = response.data.data || []
      console.log('活動列表載入成功：', events.value)
    } else {
      throw new Error(response.data.message || '載入失敗')
    }
  } catch (error) {
    console.error('載入活動失敗：', error)
    toast.error(error.response?.data?.message || error.message || '載入活動列表失敗')
  } finally {
    loading.value = false
  }
}

// 建立新活動
const handleSubmit = async (formData) => {
  try {
    console.log('準備建立活動：', formData)
    
    const response = await axios.post('/api/events', formData)
    console.log('收到回應：', response.status, response.statusText)
    
    if (response.data.success) {
      toast.success('活動建立成功')
    showCreateForm.value = false
      await loadEvents()
    } else {
      throw new Error(response.data.message || '建立失敗')
    }
  } catch (error) {
    console.error('建立活動失敗：', error)
    toast.error(error.response?.data?.message || error.message || '建立活動失敗')
  }
}

// 關閉表單
const closeForm = () => {
  showCreateForm.value = false
}

// 格式化日期時間
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  return date.toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).replace(/\//g, '-')
}

// 獲取狀態文字
const getStatusText = (event) => {
  const now = new Date().getTime()
  const startTime = new Date(event.registrationStartTime).getTime()
  const endTime = new Date(event.registrationEndTime).getTime()

  if (now < startTime) {
    return '即將開始'
  } else if (now >= startTime && now <= endTime) {
    return '報名中'
  } else {
    return '已結束'
  }
}

// 獲取狀態樣式
const getStatusClass = (event) => {
  const now = new Date().getTime()
  const startTime = new Date(event.registrationStartTime).getTime()
  const endTime = new Date(event.registrationEndTime).getTime()

  if (now < startTime) {
    return 'upcoming'
  } else if (now >= startTime && now <= endTime) {
    return 'active'
  } else {
    return 'ended'
  }
}

onMounted(() => {
  loadEvents()
})
</script>

<style scoped>
.event-management-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.icon-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 24px;
}

h2 {
  margin: 0;
  color: #333;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover {
  background: #5000c9;
}

.loading-state {
  text-align: center;
  padding: 40px;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6200ee;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.events-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.event-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 15px;
}

.event-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.2em;
}

.event-info {
  margin-bottom: 15px;
}

.event-description {
  color: #666;
  margin: 0 0 10px;
  line-height: 1.5;
}

.event-time {
  font-size: 0.9em;
  color: #666;
}

.event-time p {
  margin: 5px 0;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  font-weight: 500;
}

.status-badge.upcoming {
  background: #2196f3;
  color: white;
}

.status-badge.active {
  background: #4caf50;
  color: white;
}

.status-badge.ended {
  background: #9e9e9e;
  color: white;
}

.event-actions {
  margin-top: 15px;
  display: flex;
  justify-content: flex-end;
}

.btn-edit {
  padding: 8px 16px;
  background: #6200ee;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 500;
}

.btn-edit:hover {
  background: #5000c9;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.empty-state p {
  color: #666;
  margin-bottom: 20px;
}

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

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #666;
}

.modal-body {
  padding: 20px;
}
</style> 
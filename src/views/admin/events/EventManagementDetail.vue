<template>
  <div class="event-management-detail">
    <div class="header">
      <div class="title">
        <div class="icon">⚙️</div>
        <h1>活動管理</h1>
      </div>
    </div>

    <!-- 載入狀態 -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 錯誤狀態 -->
    <div v-else-if="error" class="error-state">
      <div class="error-icon">❌</div>
      <p>{{ error }}</p>
      <button @click="loadEvent" class="btn-retry">重試</button>
    </div>

    <!-- 主要內容 -->
    <div v-else-if="event">
      <div class="tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'basic' }]"
          @click="activeTab = 'basic'"
        >
          基本資訊
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'fields' }]"
          @click="activeTab = 'fields'"
        >
          表單欄位
        </button>
      </div>

      <div class="tab-content">
        <!-- 基本資訊頁籤 -->
        <div v-if="activeTab === 'basic'" class="manage-section">
          <h2>編輯活動資訊</h2>
          <form @submit.prevent="updateEvent">
            <div class="form-group">
              <label>活動名稱</label>
              <input 
                type="text" 
                v-model="eventForm.name"
                required
              >
            </div>

            <div class="form-group">
              <label>活動描述</label>
              <textarea 
                v-model="eventForm.description"
                rows="4"
              ></textarea>
            </div>

            <div class="form-group">
              <label>活動容量</label>
              <input 
                type="number" 
                v-model="eventForm.capacity"
                min="1"
                required
              >
            </div>

            <div class="form-group">
              <label>報名開始時間</label>
              <input 
                type="datetime-local" 
                v-model="eventForm.registrationStartTime"
                required
              >
            </div>

            <div class="form-group">
              <label>報名結束時間</label>
              <input 
                type="datetime-local" 
                v-model="eventForm.registrationEndTime"
                required
              >
            </div>

            <div class="form-group">
              <label>活動狀態</label>
              <select v-model="eventForm.status">
                <option value="draft">草稿</option>
                <option value="published">已發布</option>
                <option value="closed">已結束</option>
              </select>
            </div>

            <div class="form-actions">
              <button type="button" @click="$router.go(-1)" class="btn-secondary">
                返回
              </button>
              <button type="submit" class="btn-primary" :disabled="updating">
                {{ updating ? '更新中...' : '更新活動' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 表單欄位頁籤 -->
        <div v-if="activeTab === 'fields'" class="manage-section">
          <FormFieldManager />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import axios from 'axios'
import FormFieldManager from './components/FormFieldManager.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const activeTab = ref('basic')
const loading = ref(true)
const updating = ref(false)
const error = ref('')
const event = ref(null)

const eventForm = ref({
  name: '',
  description: '',
  capacity: 0,
  registrationStartTime: '',
  registrationEndTime: '',
  status: 'draft'
})

// 載入活動資料
const loadEvent = async () => {
  try {
    loading.value = true
    error.value = ''
    
    const eventId = route.params.id
    if (!eventId) {
      throw new Error('活動 ID 不存在')
    }

    // 正確的 API 調用 - 不會產生 :1 的錯誤
    const response = await axios.get(`/api/events/${eventId}`)
    
    if (response.data.success) {
      event.value = response.data.data
      // 填充表單資料
      eventForm.value = {
        name: event.value.name || '',
        description: event.value.description || '',
        capacity: event.value.capacity || 0,
        registrationStartTime: formatDateTimeForInput(event.value.registrationStartTime),
        registrationEndTime: formatDateTimeForInput(event.value.registrationEndTime),
        status: event.value.status || 'draft'
      }
    } else {
      throw new Error(response.data.message || '載入活動失敗')
    }
  } catch (err) {
    console.error('載入活動失敗：', err)
    error.value = err.response?.data?.message || err.message || '載入活動失敗'
  } finally {
    loading.value = false
  }
}

// 更新活動
const updateEvent = async () => {
  try {
    updating.value = true
    
    const eventId = route.params.id
    const response = await axios.put(`/api/events/${eventId}`, eventForm.value)
    
    if (response.data.success) {
      toast.success('活動更新成功')
      await loadEvent() // 重新載入資料
    } else {
      throw new Error(response.data.message || '更新失敗')
    }
  } catch (err) {
    console.error('更新活動失敗：', err)
    toast.error(err.response?.data?.message || err.message || '更新活動失敗')
  } finally {
    updating.value = false
  }
}

// 格式化日期時間為輸入框格式
const formatDateTimeForInput = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

onMounted(() => {
  loadEvent()
})
</script>

<style scoped>
.event-management-detail {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.icon {
  font-size: 24px;
}

h1, h2 {
  margin: 0;
  color: #333;
}

.loading-state, .error-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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

.error-icon {
  font-size: 48px;
  margin-bottom: 20px;
}

.btn-retry {
  padding: 8px 16px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.tab-button {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  color: #666;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.tab-button:hover {
  background: #f0f0f0;
}

.tab-button.active {
  background: #6200ee;
  color: white;
}

.manage-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
}

.btn-primary {
  background: #6200ee;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #5000c9;
}

.btn-primary:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e5e5e5;
}
</style> 
<template>
  <form @submit.prevent="handleSubmit" class="event-form">
    <!-- 活動基本資訊 -->
    <div class="form-section">
      <h3>活動基本資訊</h3>
      
      <div class="form-group">
        <label>活動名稱</label>
        <input 
          type="text" 
          v-model="form.name"
          required
          placeholder="請輸入活動名稱"
        >
      </div>

      <div class="form-group">
        <label>活動描述</label>
        <textarea 
          v-model="form.description"
          required
          placeholder="請輸入活動描述"
        ></textarea>
      </div>

      <div class="form-group">
        <label>活動容量</label>
        <input 
          type="number" 
          v-model="form.capacity"
          required
          min="1"
          placeholder="請輸入活動容量"
        >
      </div>
    </div>

    <!-- 時間設定 -->
    <div class="form-section">
      <h3>時間設定</h3>
      
      <div class="time-settings">
        <!-- 報名時間 -->
        <div class="time-group">
          <h4>報名時間</h4>
      <div class="form-group">
            <label>開始時間</label>
        <input 
              type="datetime-local" 
              v-model="form.registrationStartTime"
          required
              :min="minDateTime"
        >
      </div>

      <div class="form-group">
            <label>結束時間</label>
        <input 
              type="datetime-local" 
              v-model="form.registrationEndTime"
          required
              :min="form.registrationStartTime || minDateTime"
        >
          </div>
      </div>

        <!-- 倒數計時設定 -->
        <div class="time-group">
          <h4>倒數計時設定</h4>
      <div class="form-group">
            <div class="countdown-settings">
              <div class="countdown-option">
                <input 
                  type="radio" 
                  v-model="form.countdownType"
                  value="auto"
                  id="countdown-auto"
                >
                <label for="countdown-auto">自動（報名開始前顯示）</label>
              </div>
              <div class="countdown-option">
        <input 
                  type="radio" 
                  v-model="form.countdownType"
                  value="custom"
                  id="countdown-custom"
                >
                <label for="countdown-custom">自訂時間</label>
              </div>
      </div>

            <div v-if="form.countdownType === 'custom'" class="custom-countdown">
              <label>倒數開始時間</label>
        <input 
                type="datetime-local" 
                v-model="form.countdownStartTime"
                :min="minDateTime"
                :max="form.registrationStartTime"
          required
        >
              <p class="helper-text">倒數開始時間必須早於報名開始時間</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 時間設定確認 -->
    <div class="form-section time-confirmation">
      <h3>時間設定確認</h3>
      <div class="confirmation-list">
        <div class="confirmation-item" :class="{ 'has-error': !isTimeValid }">
          <h4>時間順序確認</h4>
          <ul>
            <li>
              <span class="label">倒數開始：</span>
              <span v-if="form.countdownType === 'custom'">
                {{ formatDateTime(form.countdownStartTime) }}
              </span>
              <span v-else>自動（報名開始前）</span>
            </li>
            <li>
              <span class="label">報名開始：</span>
              {{ formatDateTime(form.registrationStartTime) }}
            </li>
            <li>
              <span class="label">報名結束：</span>
              {{ formatDateTime(form.registrationEndTime) }}
            </li>
          </ul>
        </div>

        <div class="confirmation-item" :class="{ 'has-error': !isDurationValid }">
          <h4>時間長度確認</h4>
          <ul>
            <li>
              <span class="label">報名時間：</span>
              {{ formatDuration(getRegistrationDuration()) }}
              <span class="requirement">（至少 15 分鐘）</span>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn-secondary">
        取消
      </button>
      <button type="submit" class="btn-primary">
        {{ isEdit ? '更新活動' : '建立活動' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits, computed } from 'vue'
import { useToast } from 'vue-toastification'

const toast = useToast()

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 設定最小日期時間為當前時間
const minDateTime = computed(() => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hours = String(now.getHours()).padStart(2, '0')
  const minutes = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
})

// 格式化日期時間
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}/${month}/${day} ${hours}:${minutes}`
}

// 預設表單資料
const getDefaultFormData = () => {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  // 設定預設時間
  const registrationStart = new Date(tomorrow)
  registrationStart.setHours(22, 0, 0, 0)
  
  const registrationEnd = new Date(tomorrow)
  registrationEnd.setDate(registrationEnd.getDate() + 1)  // 設定為後一天
  registrationEnd.setHours(12, 0, 0, 0)

  return {
    name: '2024中信兄弟主場日活動',
    description: '2024年中信兄弟主場日特別活動，包含限量商品、球員見面會等精彩活動！',
    capacity: 100,
    registrationStartTime: `${registrationStart.getFullYear()}-${String(registrationStart.getMonth() + 1).padStart(2, '0')}-${String(registrationStart.getDate()).padStart(2, '0')}T${String(registrationStart.getHours()).padStart(2, '0')}:${String(registrationStart.getMinutes()).padStart(2, '0')}`,
    registrationEndTime: `${registrationEnd.getFullYear()}-${String(registrationEnd.getMonth() + 1).padStart(2, '0')}-${String(registrationEnd.getDate()).padStart(2, '0')}T${String(registrationEnd.getHours()).padStart(2, '0')}:${String(registrationEnd.getMinutes()).padStart(2, '0')}`,
    countdownType: 'auto',
    countdownStartTime: null
  }
}

// 初始化表單資料
const form = ref(props.initialData.id ? props.initialData : getDefaultFormData())

// 格式化時間間隔
const formatDuration = (milliseconds) => {
  if (!milliseconds || milliseconds < 0) return '時間設定有誤'
  const hours = Math.floor(milliseconds / (1000 * 60 * 60))
  const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
  
  let result = []
  if (hours > 0) result.push(`${hours} 小時`)
  if (minutes > 0) result.push(`${minutes} 分鐘`)
  return result.join(' ')
}

// 計算報名時間長度
const getRegistrationDuration = () => {
  const start = new Date(form.value.registrationStartTime)
  const end = new Date(form.value.registrationEndTime)
  return isNaN(start) || isNaN(end) ? 0 : end - start
}

// 驗證時間是否有效
const isTimeValid = computed(() => {
  const registrationEnd = new Date(form.value.registrationEndTime)
  const registrationStart = new Date(form.value.registrationStartTime)

  return !isNaN(registrationStart) && 
         !isNaN(registrationEnd) && 
         registrationStart < registrationEnd
})

const isDurationValid = computed(() => {
  const minRegistrationDuration = 15 * 60 * 1000 // 15 分鐘
  return getRegistrationDuration() >= minRegistrationDuration
})

const handleSubmit = () => {
  // 驗證所有時間
  const registrationStart = new Date(form.value.registrationStartTime)
  const registrationEnd = new Date(form.value.registrationEndTime)
  const now = new Date()

  // 驗證時間順序
  if (registrationStart < now) {
    toast.error('報名開始時間不能早於現在')
    return
  }

  if (registrationEnd <= registrationStart) {
    toast.error('報名結束時間必須晚於開始時間')
    return
  }

  // 驗證時間間隔
  const registrationDuration = registrationEnd - registrationStart

  if (registrationDuration < 15 * 60 * 1000) {
    toast.error('報名時間至少需要15分鐘')
    return
  }

  // 如果是自訂倒數時間，需要額外驗證
  if (form.value.countdownType === 'custom' && form.value.countdownStartTime) {
    const countdownStart = new Date(form.value.countdownStartTime)
    if (countdownStart >= registrationStart) {
      toast.error('倒數開始時間必須早於報名開始時間')
      return
    }
  }

  // 提交表單
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.event-form {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.form-section h3 {
  margin: 0 0 20px 0;
  color: #333;
  font-size: 1.1em;
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
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
}

.form-group input[type="number"] {
  width: 120px;
}

.form-group input[type="datetime-local"] {
  width: auto;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #6200ee;
  color: white;
}

.btn-primary:hover {
  background: #5000c9;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e5e5e5;
}

.countdown-settings {
  margin-top: 10px;
  display: flex;
  gap: 20px;
}

.countdown-option {
  display: flex;
  align-items: center;
  gap: 8px;
}

.countdown-option input[type="radio"] {
  width: auto;
}

.custom-countdown {
  margin-top: 15px;
}

.helper-text {
  margin-top: 5px;
  font-size: 0.9em;
  color: #666;
}

.time-settings {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.time-group {
  padding: 1rem;
  background: white;
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.time-group h4 {
  margin: 0 0 1rem 0;
  color: #2563eb;
  font-size: 1em;
  font-weight: 600;
}

.countdown-settings {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.countdown-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-countdown {
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.helper-text {
  margin: 0.5rem 0 0;
  font-size: 0.875rem;
  color: #6b7280;
}

.time-confirmation {
  margin-top: 2rem;
  background: #f8fafc;
}

.confirmation-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.confirmation-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.confirmation-item h4 {
  color: #1e40af;
  margin: 0 0 1rem 0;
  font-size: 1em;
  font-weight: 600;
}

.confirmation-item ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.confirmation-item li {
  display: flex;
  align-items: baseline;
  padding: 0.5rem 0;
  border-bottom: 1px dashed #e2e8f0;
}

.confirmation-item li:last-child {
  border-bottom: none;
}

.confirmation-item .label {
  min-width: 140px;
  color: #4b5563;
  font-weight: 500;
}

.confirmation-item .requirement {
  margin-left: 0.5rem;
  color: #6b7280;
  font-size: 0.875rem;
}

.has-error {
  border-color: #ef4444;
  background: #fef2f2;
}

.has-error h4 {
  color: #dc2626;
}
</style> 
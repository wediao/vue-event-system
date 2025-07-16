<template>
  <div class="data-verification">
    <div class="verification-header">
      <h1>資料查核專區</h1>
      <div class="header-actions">
        <button @click="refreshData" class="btn btn-secondary" :disabled="loading">
          <i class="icon">🔄</i>
          重新整理
        </button>
        <button @click="exportData" class="btn btn-primary">
          <i class="icon">📥</i>
          匯出資料
        </button>
      </div>
    </div>

    <!-- 統計卡片 -->
    <div class="stats-cards">
      <div class="stats-card">
        <div class="stats-icon">👥</div>
        <div class="stats-content">
          <h3>總註冊數</h3>
          <p class="stats-number">{{ stats.totalRegistrations || 0 }}</p>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">📅</div>
        <div class="stats-content">
          <h3>活動數量</h3>
          <p class="stats-number">{{ stats.totalEvents || 0 }}</p>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">⚠️</div>
        <div class="stats-content">
          <h3>重複資料</h3>
          <p class="stats-number">{{ duplicateStats.totalDuplicates || 0 }}</p>
        </div>
      </div>
      <div class="stats-card">
        <div class="stats-icon">📊</div>
        <div class="stats-content">
          <h3>平均報名率</h3>
          <p class="stats-number">{{ stats.averageRegistrationsPerEvent || 0 }}%</p>
        </div>
      </div>
    </div>

    <!-- 功能選單 -->
    <div class="function-tabs">
      <button 
        v-for="tab in tabs" 
        :key="tab.id"
        @click="activeTab = tab.id"
        :class="['tab-button', { active: activeTab === tab.id }]"
      >
        <i class="icon">{{ tab.icon }}</i>
        {{ tab.name }}
      </button>
    </div>

    <!-- 註冊資料列表 -->
    <div v-if="activeTab === 'registrations'" class="tab-content">
      <div class="search-filters">
        <div class="search-group">
          <input
            v-model="searchQuery"
            @input="debouncedSearch"
            type="text"
            placeholder="搜尋姓名、電子郵件、手機號碼、身分證號碼或序號..."
            class="search-input"
          >
          <button @click="clearSearch" class="btn btn-secondary">清除</button>
        </div>
        
        <div class="filter-group">
          <select v-model="selectedEvent" @change="filterData" class="filter-select">
            <option value="">所有活動</option>
            <option v-for="event in events" :key="event.id" :value="event.id">
              {{ event.name }}
            </option>
          </select>
        </div>
      </div>

      <div class="registrations-table">
        <div v-if="loading" class="loading">
          <div class="spinner"></div>
          <p>載入中...</p>
        </div>
        
        <div v-else-if="error" class="error">
          {{ error }}
        </div>
        
        <div v-else>
          <table class="data-table">
            <thead>
              <tr>
                <th>序號</th>
                <th>活動名稱</th>
                <th>姓名</th>
                <th>身分證號碼</th>
                <th>電子郵件</th>
                <th>手機號碼</th>
                <th>註冊時間</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="registration in registrations" :key="registration.registrationCode">
                <td>{{ registration.registrationCode }}</td>
                <td>{{ registration.eventName }}</td>
                <td>{{ registration.userData.name }}</td>
                <td>{{ registration.userData.idNumber }}</td>
                <td>{{ registration.userData.email }}</td>
                <td>{{ registration.userData.phone }}</td>
                <td>{{ formatDateTime(registration.registrationTime) }}</td>
                <td>
                  <button 
                    @click="viewDetail(registration)" 
                    class="btn btn-sm btn-primary"
                  >
                    查看
                  </button>
                  <button 
                    @click="deleteRegistration(registration.registrationCode)" 
                    class="btn btn-sm btn-danger"
                  >
                    刪除
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <!-- 分頁 -->
          <div class="pagination">
            <button 
              @click="changePage(pagination.currentPage - 1)"
              :disabled="pagination.currentPage <= 1"
              class="btn btn-secondary"
            >
              上一頁
            </button>
            
            <span class="page-info">
              第 {{ pagination.currentPage }} 頁，共 {{ pagination.totalPages }} 頁
              （共 {{ pagination.totalItems }} 筆資料）
            </span>
            
            <button 
              @click="changePage(pagination.currentPage + 1)"
              :disabled="pagination.currentPage >= pagination.totalPages"
              class="btn btn-secondary"
            >
              下一頁
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 重複資料檢測 -->
    <div v-if="activeTab === 'duplicates'" class="tab-content">
      <div class="duplicates-header">
        <h2>重複資料檢測</h2>
        <button @click="checkDuplicates" class="btn btn-primary" :disabled="checkingDuplicates">
          <i class="icon">🔍</i>
          {{ checkingDuplicates ? '檢測中...' : '重新檢測' }}
        </button>
      </div>
      
      <div v-if="duplicates.length === 0" class="no-duplicates">
        <div class="success-icon">✅</div>
        <h3>沒有發現重複資料</h3>
        <p>所有註冊資料都是唯一的</p>
      </div>
      
      <div v-else class="duplicates-list">
        <div v-for="duplicate in duplicates" :key="`${duplicate.type}-${duplicate.value}`" class="duplicate-group">
          <div class="duplicate-header">
            <h3>
              <span class="duplicate-type">{{ duplicate.type === 'email' ? '電子郵件' : '身分證號碼' }}</span>
              重複：{{ duplicate.value }}
            </h3>
            <span class="duplicate-count">{{ duplicate.count }} 筆記錄</span>
          </div>
          
          <div class="duplicate-records">
            <div v-for="record in duplicate.registrations" :key="record.registrationCode" class="duplicate-record">
              <div class="record-info">
                <strong>{{ record.userData.name }}</strong>
                <span class="event-name">{{ record.eventName }}</span>
                <span class="registration-code">{{ record.registrationCode }}</span>
              </div>
              <div class="record-time">
                {{ formatDateTime(record.registrationTime) }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 統計圖表 -->
    <div v-if="activeTab === 'statistics'" class="tab-content">
      <div class="statistics-content">
        <h2>註冊統計</h2>
        
        <!-- 活動統計 -->
        <div class="chart-section">
          <h3>各活動註冊統計</h3>
          <div class="event-stats">
            <div v-for="eventStat in eventStats" :key="eventStat.eventName" class="event-stat-item">
              <div class="event-name">{{ eventStat.eventName }}</div>
              <div class="event-progress">
                <div class="progress-bar">
                  <div 
                    class="progress-fill" 
                    :style="{ width: eventStat.registrationRate + '%' }"
                  ></div>
                </div>
                <span class="progress-text">
                  {{ eventStat.registrations }} / {{ eventStat.capacity }} 
                  ({{ eventStat.registrationRate }}%)
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 每日統計 -->
        <div class="chart-section">
          <h3>最近 7 天註冊統計</h3>
          <div class="daily-stats">
            <div v-for="dayStat in dailyStats" :key="dayStat.date" class="day-stat-item">
              <div class="day-date">{{ formatDate(dayStat.date) }}</div>
              <div class="day-count">{{ dayStat.count }}</div>
              <div class="day-bar">
                <div 
                  class="day-bar-fill" 
                  :style="{ height: (dayStat.count / maxDailyCount * 100) + '%' }"
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 詳細資料彈窗 -->
    <div v-if="showDetailModal" class="modal-overlay" @click="closeDetailModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>註冊資料詳情</h2>
          <button @click="closeDetailModal" class="close-button">×</button>
        </div>
        
        <div class="modal-body">
          <div v-if="selectedRegistration" class="detail-info">
            <div class="info-group">
              <label>註冊序號：</label>
              <span>{{ selectedRegistration.registrationCode }}</span>
            </div>
            <div class="info-group">
              <label>活動名稱：</label>
              <span>{{ selectedRegistration.eventName }}</span>
            </div>
            <div class="info-group">
              <label>姓名：</label>
              <span>{{ selectedRegistration.userData.name }}</span>
            </div>
            <div class="info-group">
              <label>身分證號碼：</label>
              <span>{{ selectedRegistration.userData.idNumber }}</span>
            </div>
            <div class="info-group">
              <label>電子郵件：</label>
              <span>{{ selectedRegistration.userData.email }}</span>
            </div>
            <div class="info-group">
              <label>手機號碼：</label>
              <span>{{ selectedRegistration.userData.phone }}</span>
            </div>
            <div class="info-group">
              <label>出生日期：</label>
              <span>{{ selectedRegistration.userData.birthdate || '未填寫' }}</span>
            </div>
            <div class="info-group">
              <label>性別：</label>
              <span>{{ selectedRegistration.userData.gender === 'male' ? '男' : selectedRegistration.userData.gender === 'female' ? '女' : '未填寫' }}</span>
            </div>
            <div class="info-group">
              <label>地址：</label>
              <span>{{ selectedRegistration.userData.address || '未填寫' }}</span>
            </div>
            <div class="info-group">
              <label>註冊時間：</label>
              <span>{{ formatDateTime(selectedRegistration.registrationTime) }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button @click="closeDetailModal" class="btn btn-secondary">關閉</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useToast } from 'vue-toastification'
import axios from 'axios'

const toast = useToast()

// 狀態管理
const loading = ref(false)
const error = ref(null)
const activeTab = ref('registrations')
const checkingDuplicates = ref(false)

// 資料
const registrations = ref([])
const events = ref([])
const duplicates = ref([])
const stats = ref({})
const duplicateStats = ref({})
const eventStats = ref([])
const dailyStats = ref([])
const pagination = ref({
  currentPage: 1,
  totalPages: 1,
  totalItems: 0,
  itemsPerPage: 20
})

// 搜尋和篩選
const searchQuery = ref('')
const selectedEvent = ref('')

// 彈窗
const showDetailModal = ref(false)
const selectedRegistration = ref(null)

// 選單配置
const tabs = [
  { id: 'registrations', name: '註冊資料', icon: '📋' },
  { id: 'duplicates', name: '重複檢測', icon: '⚠️' },
  { id: 'statistics', name: '統計圖表', icon: '📊' }
]

// 計算屬性
const maxDailyCount = computed(() => {
  return Math.max(...dailyStats.value.map(d => d.count), 1)
})

// 防抖搜尋
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

const debouncedSearch = debounce(() => {
  loadRegistrations()
}, 300)

// 格式化日期時間
const formatDateTime = (dateTime) => {
  if (!dateTime) return ''
  return new Date(dateTime).toLocaleString('zh-TW')
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('zh-TW', { month: 'short', day: 'numeric' })
}

// API 調用
const loadRegistrations = async (page = 1) => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page,
      limit: pagination.value.itemsPerPage
    }
    
    if (searchQuery.value) {
      params.search = searchQuery.value
    }
    
    if (selectedEvent.value) {
      params.eventId = selectedEvent.value
    }
    
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/registrations', {
      params
    })
    
    if (response.data.success) {
      registrations.value = response.data.data
      pagination.value = response.data.pagination
    }
  } catch (err) {
    error.value = err.response?.data?.message || '載入註冊資料失敗'
    toast.error(error.value)
  } finally {
    loading.value = false
  }
}

const loadEvents = async () => {
  try {
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/events')
    
    if (response.data.success) {
      events.value = response.data.data
    }
  } catch (err) {
    console.error('載入活動列表失敗：', err)
  }
}

const loadStats = async () => {
  try {
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/registrations/stats')
    
    if (response.data.success) {
      stats.value = response.data.data.summary
      eventStats.value = response.data.data.eventStats
      dailyStats.value = response.data.data.dailyStats
    }
  } catch (err) {
    console.error('載入統計資料失敗：', err)
  }
}

const checkDuplicates = async () => {
  try {
    checkingDuplicates.value = true
    
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/registrations/duplicates')
    
    if (response.data.success) {
      duplicates.value = response.data.data
      duplicateStats.value = response.data.summary
    }
  } catch (err) {
    toast.error('檢測重複資料失敗')
    console.error('檢測重複資料失敗：', err)
  } finally {
    checkingDuplicates.value = false
  }
}

const exportData = async () => {
  try {
    const params = {}
    
    if (selectedEvent.value) {
      params.eventId = selectedEvent.value
    }
    
    params.format = 'csv'
    
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    const response = await axios.get('/api/admin/registrations/export', {
      params,
      responseType: 'blob'
    })
    
    // 創建下載連結
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `registrations_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    window.URL.revokeObjectURL(url)
    
    toast.success('資料匯出成功')
  } catch (err) {
    toast.error('匯出資料失敗')
    console.error('匯出資料失敗：', err)
  }
}

const deleteRegistration = async (registrationCode) => {
  if (!confirm('確定要刪除此註冊資料嗎？此操作無法復原。')) {
    return
  }
  
  try {
    // 移除手動設定的假 Authorization，讓 axios 攔截器自動處理
    await axios.delete(`/api/admin/registrations/${registrationCode}`)
    
    toast.success('註冊資料已刪除')
    loadRegistrations(pagination.value.currentPage)
    loadStats()
  } catch (err) {
    toast.error('刪除註冊資料失敗')
    console.error('刪除註冊資料失敗：', err)
  }
}

// 事件處理
const refreshData = async () => {
  await Promise.all([
    loadRegistrations(),
    loadEvents(),
    loadStats(),
    checkDuplicates()
  ])
}

const clearSearch = () => {
  searchQuery.value = ''
  loadRegistrations()
}

const filterData = () => {
  loadRegistrations()
}

const changePage = (page) => {
  if (page >= 1 && page <= pagination.value.totalPages) {
    loadRegistrations(page)
  }
}

const viewDetail = (registration) => {
  selectedRegistration.value = registration
  showDetailModal.value = true
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedRegistration.value = null
}

// 初始化
onMounted(() => {
  refreshData()
})
</script>

<style scoped>
.data-verification {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.verification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.verification-header h1 {
  color: #2d3748;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stats-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stats-icon {
  font-size: 2.5rem;
  opacity: 0.8;
}

.stats-content h3 {
  margin: 0 0 0.5rem 0;
  color: #4a5568;
  font-size: 0.9rem;
}

.stats-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2d3748;
  margin: 0;
}

.function-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  border-bottom: 1px solid #e2e8f0;
}

.tab-button {
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: #4a5568;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tab-button:hover {
  color: #2d3748;
  background: #f7fafc;
}

.tab-button.active {
  color: #1a73e8;
  border-bottom-color: #1a73e8;
}

.tab-content {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-group {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  min-width: 300px;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
}

.filter-group {
  display: flex;
  gap: 0.5rem;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
  min-width: 200px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 2rem;
}

.data-table th,
.data-table td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
}

.data-table th {
  background: #f7fafc;
  font-weight: 600;
  color: #4a5568;
}

.data-table tr:hover {
  background: #f7fafc;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
}

.page-info {
  color: #4a5568;
}

.duplicates-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.no-duplicates {
  text-align: center;
  padding: 3rem;
  color: #4a5568;
}

.success-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.duplicate-group {
  margin-bottom: 2rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.duplicate-header {
  background: #fed7d7;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.duplicate-type {
  background: #e53e3e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  margin-right: 0.5rem;
}

.duplicate-count {
  background: #e53e3e;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
}

.duplicate-records {
  padding: 1rem;
}

.duplicate-record {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.record-info {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.event-name {
  color: #4a5568;
  font-size: 0.9rem;
}

.registration-code {
  background: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #4a5568;
}

.record-time {
  color: #718096;
  font-size: 0.9rem;
}

.event-stats {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.event-stat-item {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.event-name {
  min-width: 200px;
  font-weight: 500;
}

.event-progress {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 20px;
  background: #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: #1a73e8;
  transition: width 0.3s ease;
}

.progress-text {
  min-width: 120px;
  font-size: 0.9rem;
  color: #4a5568;
}

.daily-stats {
  display: flex;
  gap: 1rem;
  align-items: end;
  height: 200px;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
}

.day-stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.day-date {
  font-size: 0.8rem;
  color: #4a5568;
}

.day-count {
  font-weight: bold;
  color: #2d3748;
}

.day-bar {
  width: 30px;
  height: 100px;
  background: #e2e8f0;
  border-radius: 4px;
  position: relative;
  overflow: hidden;
}

.day-bar-fill {
  position: absolute;
  bottom: 0;
  width: 100%;
  background: #1a73e8;
  transition: height 0.3s ease;
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

.modal-content {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #718096;
}

.modal-body {
  padding: 1.5rem;
}

.detail-info {
  display: grid;
  gap: 1rem;
}

.info-group {
  display: flex;
  gap: 1rem;
}

.info-group label {
  font-weight: 500;
  color: #4a5568;
  min-width: 120px;
}

.info-group span {
  color: #2d3748;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #1a73e8;
  color: white;
}

.btn-primary:hover {
  background: #1557b0;
}

.btn-secondary {
  background: #e2e8f0;
  color: #4a5568;
}

.btn-secondary:hover {
  background: #cbd5e0;
}

.btn-danger {
  background: #e53e3e;
  color: white;
}

.btn-danger:hover {
  background: #c53030;
}

.btn-sm {
  padding: 0.25rem 0.5rem;
  font-size: 0.8rem;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  text-align: center;
  padding: 3rem;
  color: #4a5568;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #1a73e8;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  text-align: center;
  padding: 3rem;
  color: #e53e3e;
}

.icon {
  font-size: 1rem;
}

.chart-section {
  margin-bottom: 3rem;
}

.chart-section h3 {
  margin-bottom: 1.5rem;
  color: #2d3748;
}

@media (max-width: 768px) {
  .data-verification {
    padding: 1rem;
  }
  
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .search-filters {
    flex-direction: column;
  }
  
  .search-group {
    min-width: auto;
  }
  
  .data-table {
    font-size: 0.9rem;
  }
  
  .data-table th,
  .data-table td {
    padding: 0.5rem;
  }
  
  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
  
  .daily-stats {
    height: 150px;
  }
  
  .day-bar {
    width: 20px;
    height: 80px;
  }
}
</style> 
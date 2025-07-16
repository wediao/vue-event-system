<template>
  <div class="dashboard">
    <header class="content-header">
      <h2>儀表板</h2>
      <div class="header-actions">
        <span class="current-time">{{ currentTime }}</span>
      </div>
    </header>

    <!-- 統計卡片 -->
    <section class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon events">📅</div>
          <div class="stat-content">
            <h3>活動總數</h3>
            <p class="stat-value">{{ stats.totalEvents }}</p>
            <p class="stat-change" :class="{ increase: stats.eventChange > 0 }">
              {{ stats.eventChange > 0 ? '+' : '' }}{{ stats.eventChange }}%
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon tickets">🎟️</div>
          <div class="stat-content">
            <h3>票券銷售</h3>
            <p class="stat-value">{{ stats.ticketsSold }}</p>
            <p class="stat-change" :class="{ increase: stats.ticketChange > 0 }">
              {{ stats.ticketChange > 0 ? '+' : '' }}{{ stats.ticketChange }}%
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon users">👥</div>
          <div class="stat-content">
            <h3>註冊用戶</h3>
            <p class="stat-value">{{ stats.totalUsers }}</p>
            <p class="stat-change" :class="{ increase: stats.userChange > 0 }">
              {{ stats.userChange > 0 ? '+' : '' }}{{ stats.userChange }}%
            </p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon revenue">💰</div>
          <div class="stat-content">
            <h3>總收入</h3>
            <p class="stat-value">NT$ {{ formatNumber(stats.totalRevenue) }}</p>
            <p class="stat-change" :class="{ increase: stats.revenueChange > 0 }">
              {{ stats.revenueChange > 0 ? '+' : '' }}{{ stats.revenueChange }}%
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- 圖表區域 -->
    <section class="charts-section">
      <div class="chart-container">
        <h3>近期活動統計</h3>
        <div class="chart-placeholder">
          圖表區域（需整合圖表庫）
        </div>
      </div>
    </section>

    <!-- 最新活動列表 -->
    <section class="recent-section">
      <div class="section-header">
        <h3>最新活動</h3>
        <router-link to="/admin/events" class="btn-view-all">
          查看全部
        </router-link>
      </div>

      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>活動名稱</th>
              <th>開始時間</th>
              <th>票種</th>
              <th>銷售狀態</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="event in recentEvents" :key="event.id">
              <td>{{ event.name }}</td>
              <td>{{ formatDate(event.startTime) }}</td>
              <td>{{ event.ticketTypes }}</td>
              <td>
                <span :class="['status-badge', event.status]">
                  {{ getStatusText(event.status) }}
                </span>
              </td>
              <td>
                <button 
                  class="btn-action"
                  @click="viewEventDetails(event.id)"
                >
                  查看
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentTime = ref('')

// 更新當前時間
const updateTime = () => {
  currentTime.value = new Date().toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

let timeInterval
onMounted(() => {
  updateTime()
  timeInterval = setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timeInterval) {
    clearInterval(timeInterval)
  }
})

// 統計數據
const stats = ref({
  totalEvents: 24,
  eventChange: 8,
  ticketsSold: 1234,
  ticketChange: 15,
  totalUsers: 856,
  userChange: 12,
  totalRevenue: 1234567,
  revenueChange: 23
})

// 最新活動
const recentEvents = ref([
  {
    id: 1,
    name: '中信兄弟主場日',
    startTime: '2024-07-16T14:00:00',
    ticketTypes: '內野席、外野席',
    status: 'upcoming'
  },
  {
    id: 2,
    name: '統一獅主場日',
    startTime: '2024-08-22T14:00:00',
    ticketTypes: '內野席、外野席',
    status: 'onsale'
  },
  {
    id: 3,
    name: '樂天桃猿主場日',
    startTime: '2024-09-15T14:00:00',
    ticketTypes: '內野席、外野席',
    status: 'draft'
  }
])

// 格式化數字
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

// 格式化日期
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 取得狀態文字
const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'upcoming': '即將開賣',
    'onsale': '熱賣中',
    'soldout': '已售完',
    'closed': '已結束'
  }
  return statusMap[status] || status
}

// 查看活動詳情
const viewEventDetails = (eventId) => {
  router.push(`/admin/events/${eventId}`)
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.content-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.content-header h2 {
  margin: 0;
  color: #333;
}

.current-time {
  color: #666;
  font-size: 0.9em;
}

.stats-section {
  margin-bottom: 40px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
}

.stat-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  font-size: 24px;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
}

.stat-content {
  flex: 1;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  font-size: 0.9em;
  color: #666;
}

.stat-value {
  margin: 0;
  font-size: 1.5em;
  font-weight: 600;
  color: #333;
}

.stat-change {
  margin: 5px 0 0 0;
  font-size: 0.9em;
  color: #dc3545;
}

.stat-change.increase {
  color: #28a745;
}

.charts-section {
  margin-bottom: 40px;
}

.chart-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-container h3 {
  margin: 0 0 20px 0;
  color: #333;
}

.chart-placeholder {
  height: 300px;
  background: #f8f9fa;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
}

.recent-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  color: #333;
}

.btn-view-all {
  color: #6200ee;
  text-decoration: none;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #e0e0e0;
}

.data-table th {
  font-weight: 500;
  color: #666;
  background: #f8f9fa;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status-badge.draft {
  background: #f0f0f0;
  color: #666;
}

.status-badge.upcoming {
  background: #e3f2fd;
  color: #1976d2;
}

.status-badge.onsale {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.soldout {
  background: #fce4ec;
  color: #c2185b;
}

.status-badge.closed {
  background: #f5f5f5;
  color: #333;
}

.btn-action {
  padding: 4px 12px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
}

.btn-action:hover {
  background: #5000c9;
}

@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
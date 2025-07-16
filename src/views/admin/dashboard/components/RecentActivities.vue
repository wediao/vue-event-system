<template>
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
          <tr v-for="event in events" :key="event.id">
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
                @click="$emit('view', event.id)"
              >
                查看
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
defineProps({
  events: {
    type: Array,
    required: true
  }
})

const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getStatusText = (status) => {
  const statusMap = {
    'draft': '草稿',
    'upcoming': '即將開始',
    'ongoing': '進行中',
    'ended': '已結束'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.recent-section {
  margin-top: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.btn-view-all {
  color: #6200ee;
  text-decoration: none;
  font-size: 14px;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.btn-action {
  padding: 4px 12px;
  border: 1px solid #6200ee;
  background: transparent;
  color: #6200ee;
  border-radius: 4px;
  cursor: pointer;
}

.btn-action:hover {
  background: rgba(98, 0, 238, 0.1);
}
</style> 
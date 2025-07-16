<template>
  <div class="report-dashboard">
    <h1>活動報表</h1>
    <div class="report-content">
      <div class="report-card">
        <h3>活動統計</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">總活動數</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">進行中活動</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已結束活動</span>
            <span class="stat-value">0</span>
          </div>
        </div>
      </div>
      
      <div class="report-card">
        <h3>報名統計</h3>
        <div class="stat-grid">
          <div class="stat-item">
            <span class="stat-label">總報名人數</span>
            <span class="stat-value">0</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">平均報名率</span>
            <span class="stat-value">0%</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// 後續可以加入資料讀取和統計邏輯
</script>

<style scoped>
.report-dashboard {
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  color: #333;
}

.report-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.report-card {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.report-card h3 {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 1.1em;
}

.stat-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-label {
  font-size: 0.9em;
  color: #666;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 1.8em;
  font-weight: 600;
  color: #333;
}
</style> 
<template>
  <div class="query-result">
  <div class="query-container">
      <header class="page-header">
        <h1>查詢搶購結果</h1>
      </header>

    <!-- 查詢表單 -->
      <section class="query-section" v-if="!showResult">
        <form @submit.prevent="submitQuery" class="query-form">
          <div class="form-group">
            <label>序號</label>
            <input 
              type="text" 
              v-model="registrationNumber"
              required
              placeholder="請輸入預先登記的序號"
              pattern="TY[A-Z0-9]{6}[A-Z0-9]{6}"
              :disabled="isSubmitting"
            >
          </div>
          <div class="form-group">
            <label>身分證字號</label>
              <input
                type="text"
              v-model="idNumber"
                required
              placeholder="請輸入身分證字號"
              pattern="[A-Z][12]\d{8}"
              :disabled="isSubmitting"
            >
          </div>
              <button 
                type="submit" 
            class="btn btn-primary"
            :disabled="isSubmitting"
          >
            {{ isSubmitting ? '查詢中...' : '查詢' }}
              </button>
        </form>
      </section>

    <!-- 查詢結果 -->
      <section class="result-section" v-if="showResult">
        <div class="result-content" :class="{ success: queryResult.success }">
          <div class="result-header">
            <div class="result-icon">
              {{ queryResult.success ? '✓' : '✕' }}
            </div>
            <h2>{{ queryResult.success ? '搶購成功' : '搶購失敗' }}</h2>
            <p class="result-message">{{ queryResult.message }}</p>
        </div>

          <div class="order-details" v-if="queryResult.success">
            <h3>訂單詳情</h3>
            <div class="detail-item">
              <span class="label">活動名稱</span>
              <span class="value">{{ queryResult.eventName }}</span>
                </div>
            <div class="detail-item">
              <span class="label">活動時間</span>
              <span class="value">{{ formatDate(queryResult.eventTime) }}</span>
              </div>
            <div class="detail-item">
              <span class="label">票券類型</span>
              <span class="value">{{ queryResult.ticketType }}</span>
              </div>
            <div class="detail-item">
              <span class="label">票券數量</span>
              <span class="value">{{ queryResult.quantity }} 張</span>
              </div>
            <div class="detail-item">
              <span class="label">總金額</span>
              <span class="value">NT$ {{ queryResult.totalAmount }}</span>
            </div>
            <div class="detail-item">
              <span class="label">付款狀態</span>
              <span class="value status" :class="queryResult.paymentStatus">
                {{ getPaymentStatusText(queryResult.paymentStatus) }}
              </span>
            </div>
          </div>

          <div class="result-actions">
            <button 
              v-if="queryResult.success" 
              class="btn btn-primary"
              @click="downloadTicket"
            >
              下載票券
            </button>
            <button 
              class="btn btn-outline"
              @click="newQuery"
            >
              重新查詢
            </button>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

// 表單資料
const registrationNumber = ref('')
const idNumber = ref('')
const isSubmitting = ref(false)
const showResult = ref(false)

// 查詢結果
const queryResult = ref({
  success: false,
  message: '',
  eventName: '',
  eventTime: '',
  ticketType: '',
  quantity: 0,
  totalAmount: 0,
  paymentStatus: ''
})

// 提交查詢
const submitQuery = async () => {
  try {
    isSubmitting.value = true
    
    // TODO: 調用API進行查詢
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 模擬成功結果
    queryResult.value = {
      success: true,
      message: '您已成功搶購票券',
      eventName: '中信兄弟主場日',
      eventTime: '2024-07-16T14:00:00',
      ticketType: '內野座席',
      quantity: 2,
      totalAmount: 1000,
      paymentStatus: 'paid'
    }
    
    showResult.value = true
  } catch (error) {
    queryResult.value = {
      success: false,
      message: '查無此訂單，請確認序號與身分證字號是否正確。'
    }
    showResult.value = true
  } finally {
    isSubmitting.value = false
  }
}

// 下載票券
const downloadTicket = () => {
  // TODO: 實作票券下載功能
  alert('票券下載功能開發中')
}

// 重新查詢
const newQuery = () => {
  showResult.value = false
  registrationNumber.value = ''
  idNumber.value = ''
  queryResult.value = {
    success: false,
    message: '',
    eventName: '',
    eventTime: '',
    ticketType: '',
    quantity: 0,
    totalAmount: 0,
    paymentStatus: ''
  }
}

// 工具函數
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const getPaymentStatusText = (status) => {
  const statusMap = {
    'paid': '已付款',
    'pending': '待付款',
    'failed': '付款失敗'
  }
  return statusMap[status] || status
}
</script>

<style scoped>
.query-result {
  min-height: 100vh;
  background: #f8f4ff;
  padding: 2rem;
}

.query-container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.page-header {
  text-align: center;
  margin-bottom: 2rem;
}

.page-header h1 {
  color: #333;
  margin: 0;
  font-size: 1.75rem;
}

/* 查詢表單 */
.query-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: #666;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  border-color: #8e44ad;
  outline: none;
  box-shadow: 0 0 0 2px rgba(142, 68, 173, 0.1);
}

/* 查詢結果 */
.result-content {
  text-align: center;
}

.result-header {
  margin-bottom: 2rem;
}

.result-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 1rem;
  background: #8e44ad;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
}

.result-content.success .result-icon {
  background: #4caf50;
}

.result-message {
  color: #666;
  margin-top: 0.5rem;
}

/* 訂單詳情 */
.order-details {
  text-align: left;
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f4ff;
  border-radius: 8px;
}

.order-details h3 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #e0e0e0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-item .label {
  color: #666;
}

.detail-item .value {
  color: #333;
  font-weight: 500;
}

.detail-item .status {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.875rem;
}

.detail-item .status.paid {
  background: #e8f5e9;
  color: #2e7d32;
}

.detail-item .status.pending {
  background: #fff3e0;
  color: #e65100;
}

.detail-item .status.failed {
  background: #ffebee;
  color: #c62828;
}

/* 按鈕 */
.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  width: 100%;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #8e44ad;
  color: white;
  margin-bottom: 1rem;
}

.btn-primary:hover:not(:disabled) {
  background: #6c3483;
}

.btn-outline {
  background: transparent;
  border: 1px solid #8e44ad;
  color: #8e44ad;
}

.btn-outline:hover {
  background: #f8f4ff;
}

.result-actions {
  margin-top: 2rem;
}

@media (max-width: 768px) {
  .query-result {
    padding: 1rem;
  }

  .query-container {
    padding: 1rem;
  }
}
</style> 
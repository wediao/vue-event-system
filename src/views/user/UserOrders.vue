<template>
  <div class="orders-page">
    <h1>我的訂單</h1>
    
    <div class="orders-list" v-if="orders.length > 0">
      <div v-for="order in orders" :key="order.id" class="order-card">
        <div class="order-header">
          <span class="order-number">訂單編號：{{ order.orderNumber }}</span>
          <span class="order-status" :class="order.status">{{ getStatusText(order.status) }}</span>
        </div>
        
        <div class="order-content">
          <div class="event-info">
            <h3>{{ order.eventName }}</h3>
            <p class="event-time">{{ order.eventDate }} {{ order.eventTime }}</p>
            <p class="event-location">{{ order.location }}</p>
          </div>
          
          <div class="ticket-info">
            <div class="info-row">
              <span>購票數量：</span>
              <span>{{ order.quantity }} 張</span>
            </div>
            <div class="info-row">
              <span>訂單金額：</span>
              <span>NT$ {{ order.totalAmount }}</span>
            </div>
            <div class="info-row">
              <span>購買時間：</span>
              <span>{{ formatDate(order.purchaseDate) }}</span>
            </div>
          </div>
        </div>
        
        <div class="order-actions">
          <button 
            class="btn-download" 
            v-if="order.status === 'success'"
            @click="downloadTicket(order)"
          >
            下載票券
          </button>
          <button 
            class="btn-cancel" 
            v-if="order.status === 'pending'"
            @click="cancelOrder(order.id)"
          >
            取消訂單
          </button>
        </div>
      </div>
    </div>
    
    <div class="empty-state" v-else>
      <img src="@/assets/empty-box.svg" alt="無訂單" class="empty-icon">
      <p>目前沒有訂單記錄</p>
      <router-link to="/" class="btn-browse">瀏覽活動</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 模擬訂單數據
const orders = ref([
  {
    id: 1,
    orderNumber: 'ORD202403150001',
    status: 'success',
    eventName: '五月天 好好好想見到你',
    eventDate: '2024/05/20',
    eventTime: '19:00',
    location: '桃園國際棒球場',
    quantity: 2,
    totalAmount: 5200,
    purchaseDate: new Date('2024-03-15T10:30:00')
  },
  {
    id: 2,
    orderNumber: 'ORD202403150002',
    status: 'pending',
    eventName: '2024 電競嘉年華',
    eventDate: '2024/06/15',
    eventTime: '10:00',
    location: '南港展覽館',
    quantity: 1,
    totalAmount: 1200,
    purchaseDate: new Date('2024-03-15T14:20:00')
  }
])

// 格式化日期
const formatDate = (date) => {
  return new Date(date).toLocaleString('zh-TW', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// 獲取狀態文字
const getStatusText = (status) => {
  const statusMap = {
    'success': '購票成功',
    'pending': '處理中',
    'failed': '購票失敗',
    'cancelled': '已取消'
  }
  return statusMap[status] || status
}

// 下載票券
const downloadTicket = (order) => {
  // 實作下載票券邏輯
  console.log('下載票券', order.orderNumber)
}

// 取消訂單
const cancelOrder = async (orderId) => {
  if (confirm('確定要取消此訂單嗎？')) {
    // 實作取消訂單邏輯
    console.log('取消訂單', orderId)
  }
}
</script>

<style scoped>
.orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

h1 {
  margin-bottom: 2rem;
  color: #333;
}

.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.order-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.order-number {
  font-family: monospace;
  color: #666;
}

.order-status {
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  font-size: 0.9rem;
}

.order-status.success {
  background: #4CAF50;
  color: white;
}

.order-status.pending {
  background: #FFC107;
  color: #333;
}

.order-status.failed {
  background: #f44336;
  color: white;
}

.order-status.cancelled {
  background: #9E9E9E;
  color: white;
}

.order-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.event-info h3 {
  margin: 0 0 0.5rem 0;
  color: #333;
}

.event-time,
.event-location {
  color: #666;
  margin: 0.25rem 0;
}

.ticket-info {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin: 0.5rem 0;
  color: #333;
}

.order-actions {
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-download,
.btn-cancel {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background 0.3s ease;
}

.btn-download {
  background: #2196F3;
  color: white;
}

.btn-download:hover {
  background: #1976D2;
}

.btn-cancel {
  background: #f44336;
  color: white;
}

.btn-cancel:hover {
  background: #d32f2f;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
}

.empty-icon {
  width: 120px;
  margin-bottom: 1.5rem;
  opacity: 0.5;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-browse {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.btn-browse:hover {
  background: #388E3C;
}

@media (max-width: 768px) {
  .orders-page {
    padding: 1rem;
  }

  .order-content {
    grid-template-columns: 1fr;
    gap: 1rem;
  }

  .order-actions {
    flex-direction: column;
  }

  .btn-download,
  .btn-cancel {
    width: 100%;
  }
}
</style>
 
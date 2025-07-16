<template>
  <div class="admin-ticket-management">
    <div class="section-header">
      <div class="icon-title">
        <div class="icon">🎟️</div>
        <h2>票券管理</h2>
      </div>
    </div>

    <!-- 快速設定票種 -->
    <div class="quick-create">
      <h3>快速設定票種</h3>
      <form @submit.prevent="createTicket">
        <div class="form-group">
          <label>票種名稱</label>
          <input 
            type="text" 
            v-model="form.name"
            placeholder="請輸入票種名稱"
            required
          >
        </div>

        <div class="form-group">
          <label>票價</label>
          <input 
            type="number" 
            v-model="form.price"
            placeholder="請輸入票價"
            required
          >
        </div>

        <div class="form-group">
          <label>數量</label>
          <input 
            type="number" 
            v-model="form.quantity"
            placeholder="請輸入數量"
            required
          >
        </div>

        <button type="submit" class="btn-create">建立票種</button>
      </form>
    </div>

    <!-- 管理票券 -->
    <div class="manage-section">
      <div class="manage-header">
        <div class="icon-title">
          <div class="chart-icon">📊</div>
          <h3>管理票券</h3>
        </div>
        <p>編輯和更新票券資訊</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const form = ref({
  name: '',
  price: '',
  quantity: ''
})

const createTicket = () => {
  // TODO: 實作建立票種邏輯
  console.log('Creating ticket:', form.value)
}
</script>

<style scoped>
.admin-ticket-management {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.section-header {
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.btn-create {
  width: 100%;
  padding: 12px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.manage-section {
  margin-top: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.manage-header {
  color: #666;
}

.manage-header p {
  margin: 5px 0 0 34px;
  font-size: 14px;
}
</style> 
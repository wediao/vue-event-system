<template>
  <div class="system-settings">
    <h1>系統設定</h1>
    
    <div class="settings-section">
      <h2>基本設定</h2>
      <div class="setting-group">
        <div class="setting-item">
          <label>系統名稱</label>
          <input type="text" v-model="settings.systemName" placeholder="輸入系統名稱" />
        </div>
        
        <div class="setting-item">
          <label>管理員郵箱</label>
          <input type="email" v-model="settings.adminEmail" placeholder="輸入管理員郵箱" />
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>通知設定</h2>
      <div class="setting-group">
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.emailNotification" />
            啟用郵件通知
          </label>
        </div>
        
        <div class="setting-item">
          <label class="checkbox-label">
            <input type="checkbox" v-model="settings.smsNotification" />
            啟用簡訊通知
          </label>
        </div>
      </div>
    </div>
    
    <div class="settings-section">
      <h2>安全設定</h2>
      <div class="setting-group">
        <div class="setting-item">
          <label>登入嘗試次數限制</label>
          <input type="number" v-model="settings.loginAttempts" min="1" max="10" />
        </div>
        
        <div class="setting-item">
          <label>密碼有效期（天）</label>
          <input type="number" v-model="settings.passwordExpiry" min="30" max="180" />
        </div>
      </div>
    </div>
    
    <div class="button-group">
      <button class="btn-save" @click="saveSettings">儲存設定</button>
      <button class="btn-reset" @click="resetSettings">重置設定</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const settings = ref({
  systemName: '',
  adminEmail: '',
  emailNotification: true,
  smsNotification: false,
  loginAttempts: 5,
  passwordExpiry: 90
})

const saveSettings = () => {
  // 實作儲存設定的邏輯
  console.log('儲存設定:', settings.value)
}

const resetSettings = () => {
  // 實作重置設定的邏輯
  console.log('重置設定')
}
</script>

<style scoped>
.system-settings {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h1 {
  margin-bottom: 30px;
  color: #333;
}

.settings-section {
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

h2 {
  margin: 0 0 20px 0;
  color: #666;
  font-size: 1.1em;
}

.setting-group {
  display: grid;
  gap: 15px;
}

.setting-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #666;
  font-size: 0.9em;
}

input[type="text"],
input[type="email"],
input[type="number"] {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.button-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn-save,
.btn-reset {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1em;
  transition: background-color 0.3s;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:hover {
  background: #45a049;
}

.btn-reset {
  background: #f5f5f5;
  color: #666;
}

.btn-reset:hover {
  background: #e0e0e0;
}
</style> 
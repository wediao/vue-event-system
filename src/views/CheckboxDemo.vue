<template>
  <div class="checkbox-demo">
    <div class="demo-container">
      <h1>Checkbox 組件示例</h1>
      
      <!-- 基本 Checkbox -->
      <section class="demo-section">
        <h2>基本 Checkbox</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>單一選擇</h3>
            <CheckboxComponent
              v-model="singleCheck"
              label="我同意服務條款"
              help-text="請仔細閱讀相關條款"
            />
            <p class="result">選中狀態: {{ singleCheck }}</p>
          </div>

          <div class="demo-item">
            <h3>必填項目</h3>
            <CheckboxComponent
              v-model="requiredCheck"
              label="我已閱讀並同意隱私權政策"
              required
              :error-message="requiredError"
            />
            <button @click="validateRequired" class="btn-validate">驗證必填</button>
          </div>

          <div class="demo-item">
            <h3>禁用狀態</h3>
            <CheckboxComponent
              v-model="disabledCheck"
              label="此選項已禁用"
              disabled
            />
          </div>
        </div>
      </section>

      <!-- 不同尺寸 -->
      <section class="demo-section">
        <h2>不同尺寸</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>小型</h3>
            <CheckboxComponent
              v-model="sizeSmall"
              label="小型 checkbox"
              size="small"
            />
          </div>

          <div class="demo-item">
            <h3>中型（預設）</h3>
            <CheckboxComponent
              v-model="sizeMedium"
              label="中型 checkbox"
              size="medium"
            />
          </div>

          <div class="demo-item">
            <h3>大型</h3>
            <CheckboxComponent
              v-model="sizeLarge"
              label="大型 checkbox"
              size="large"
            />
          </div>
        </div>
      </section>

      <!-- 不同主題 -->
      <section class="demo-section">
        <h2>不同主題顏色</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>預設主題</h3>
            <CheckboxComponent
              v-model="themeDefault"
              label="預設藍色主題"
              theme="default"
            />
          </div>

          <div class="demo-item">
            <h3>成功主題</h3>
            <CheckboxComponent
              v-model="themeSuccess"
              label="成功綠色主題"
              theme="success"
            />
          </div>

          <div class="demo-item">
            <h3>警告主題</h3>
            <CheckboxComponent
              v-model="themeWarning"
              label="警告橙色主題"
              theme="warning"
            />
          </div>

          <div class="demo-item">
            <h3>危險主題</h3>
            <CheckboxComponent
              v-model="themeDanger"
              label="危險紅色主題"
              theme="danger"
            />
          </div>
        </div>
      </section>

      <!-- 群組 Checkbox -->
      <section class="demo-section">
        <h2>群組 Checkbox</h2>
        <div class="demo-grid">
          <div class="demo-item">
            <h3>垂直排列</h3>
            <CheckboxComponent
              v-model="dietaryOptions"
              label="飲食偏好"
              is-group
              group-label="請選擇您的飲食偏好："
              :options="dietaryChoices"
              help-text="可以選擇多個選項"
            />
            <p class="result">選擇結果: {{ dietaryOptions }}</p>
          </div>

          <div class="demo-item">
            <h3>水平排列</h3>
            <CheckboxComponent
              v-model="hobbies"
              label="興趣愛好"
              is-group
              group-label="請選擇您的興趣愛好："
              :options="hobbyChoices"
              horizontal
            />
            <p class="result">選擇結果: {{ hobbies }}</p>
          </div>
        </div>
      </section>

      <!-- 實際應用場景 -->
      <section class="demo-section">
        <h2>實際應用場景</h2>
        
        <!-- 活動報名表單 -->
        <div class="demo-item">
          <h3>活動報名表單</h3>
          <form @submit.prevent="submitRegistration" class="registration-form">
            <div class="form-group">
              <label>姓名</label>
              <input v-model="registration.name" type="text" required>
            </div>

            <div class="form-group">
              <label>電子郵件</label>
              <input v-model="registration.email" type="email" required>
            </div>

            <CheckboxComponent
              v-model="registration.dietaryRestrictions"
              label="特殊飲食需求"
              is-group
              group-label="請選擇您的特殊飲食需求："
              :options="dietaryRestrictions"
              horizontal
            />

            <CheckboxComponent
              v-model="registration.notifications"
              label="通知設定"
              is-group
              group-label="您希望接收哪些通知："
              :options="notificationOptions"
            />

            <CheckboxComponent
              v-model="registration.needsTransport"
              label="我需要接駁車服務"
              help-text="免費提供接駁車服務"
            />

            <CheckboxComponent
              v-model="registration.agreeTerms"
              label="我已閱讀並同意活動條款與個人資料保護政策"
              required
              :error-message="termsError"
            />

            <button type="submit" class="btn-submit">提交報名</button>
          </form>
        </div>

        <!-- 系統設定 -->
        <div class="demo-item">
          <h3>系統設定</h3>
          <div class="settings-form">
            <CheckboxComponent
              v-model="settings.notifications"
              label="通知設定"
              is-group
              group-label="啟用通知："
              :options="systemNotifications"
            />

            <CheckboxComponent
              v-model="settings.privacy"
              label="隱私設定"
              is-group
              group-label="隱私選項："
              :options="privacyOptions"
            />

            <CheckboxComponent
              v-model="settings.autoSave"
              label="自動儲存"
              help-text="每 5 分鐘自動儲存一次"
            />

            <CheckboxComponent
              v-model="settings.darkMode"
              label="深色模式"
              help-text="啟用深色主題"
            />

            <button @click="saveSettings" class="btn-save">儲存設定</button>
          </div>
        </div>
      </section>

      <!-- 動態 Checkbox -->
      <section class="demo-section">
        <h2>動態 Checkbox</h2>
        <div class="demo-item">
          <h3>動態新增選項</h3>
          <CheckboxComponent
            v-model="dynamicSelections"
            label="動態選項"
            is-group
            group-label="可用選項："
            :options="dynamicOptions"
          />
          
          <div class="dynamic-controls">
            <input 
              v-model="newOptionText" 
              placeholder="輸入新選項" 
              @keyup.enter="addOption"
            >
            <button @click="addOption" class="btn-add">新增選項</button>
            <button @click="clearOptions" class="btn-clear">清除所有</button>
          </div>
          
          <p class="result">選擇結果: {{ dynamicSelections }}</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CheckboxComponent from '../components/CheckboxComponent.vue'

// 基本 checkbox 狀態
const singleCheck = ref(false)
const requiredCheck = ref(false)
const requiredError = ref('')
const disabledCheck = ref(true)

// 尺寸示例
const sizeSmall = ref(false)
const sizeMedium = ref(false)
const sizeLarge = ref(false)

// 主題示例
const themeDefault = ref(false)
const themeSuccess = ref(false)
const themeWarning = ref(false)
const themeDanger = ref(false)

// 群組 checkbox 狀態
const dietaryOptions = ref([])
const hobbies = ref([])

// 選項數據
const dietaryChoices = [
  { value: 'vegetarian', label: '素食' },
  { value: 'vegan', label: '純素' },
  { value: 'halal', label: '清真' },
  { value: 'kosher', label: '猶太潔食' },
  { value: 'gluten-free', label: '無麩質' }
]

const hobbyChoices = [
  { value: 'reading', label: '閱讀' },
  { value: 'music', label: '音樂' },
  { value: 'sports', label: '運動' },
  { value: 'travel', label: '旅遊' },
  { value: 'cooking', label: '烹飪' }
]

// 實際應用場景
const registration = reactive({
  name: '',
  email: '',
  dietaryRestrictions: [],
  notifications: [],
  needsTransport: false,
  agreeTerms: false
})

const settings = reactive({
  notifications: [],
  privacy: [],
  autoSave: false,
  darkMode: false
})

const termsError = ref('')

// 應用場景選項
const dietaryRestrictions = [
  { value: 'vegetarian', label: '素食' },
  { value: 'halal', label: '清真' },
  { value: 'no-seafood', label: '不吃海鮮' },
  { value: 'no-spicy', label: '不吃辣' }
]

const notificationOptions = [
  { value: 'email', label: '電子郵件通知' },
  { value: 'sms', label: '簡訊通知' },
  { value: 'push', label: '推播通知' }
]

const systemNotifications = [
  { value: 'email', label: '電子郵件通知' },
  { value: 'desktop', label: '桌面通知' },
  { value: 'mobile', label: '手機通知' }
]

const privacyOptions = [
  { value: 'public-profile', label: '公開個人資料' },
  { value: 'show-activity', label: '顯示活動狀態' },
  { value: 'allow-search', label: '允許搜尋' }
]

// 動態 checkbox
const dynamicSelections = ref([])
const dynamicOptions = ref([
  { value: 'option1', label: '選項 1' },
  { value: 'option2', label: '選項 2' }
])
const newOptionText = ref('')

// 方法
const validateRequired = () => {
  if (!requiredCheck.value) {
    requiredError.value = '此為必填項目'
  } else {
    requiredError.value = ''
  }
}

const submitRegistration = () => {
  if (!registration.agreeTerms) {
    termsError.value = '請同意活動條款與個人資料保護政策'
    return
  }
  termsError.value = ''
  
  console.log('報名資料:', registration)
  alert('報名成功！')
}

const saveSettings = () => {
  console.log('系統設定:', settings)
  alert('設定已儲存！')
}

const addOption = () => {
  if (newOptionText.value.trim()) {
    const newValue = `option${Date.now()}`
    dynamicOptions.value.push({
      value: newValue,
      label: newOptionText.value.trim()
    })
    newOptionText.value = ''
  }
}

const clearOptions = () => {
  dynamicOptions.value = []
  dynamicSelections.value = []
}
</script>

<style scoped>
.checkbox-demo {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem 0;
}

.demo-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

h1 {
  text-align: center;
  color: #2d3748;
  margin-bottom: 3rem;
}

.demo-section {
  background: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.demo-section h2 {
  color: #4a5568;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

.demo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.demo-item {
  background: #f7fafc;
  border-radius: 6px;
  padding: 1.5rem;
  border: 1px solid #e2e8f0;
}

.demo-item h3 {
  color: #2d3748;
  margin-bottom: 1rem;
  font-size: 1.125rem;
}

.result {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #edf2f7;
  border-radius: 4px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #4a5568;
}

.btn-validate,
.btn-submit,
.btn-save,
.btn-add,
.btn-clear {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: background-color 0.2s;
}

.btn-validate {
  background: #4299e1;
  color: white;
  margin-top: 1rem;
}

.btn-validate:hover {
  background: #3182ce;
}

.btn-submit,
.btn-save {
  background: #38a169;
  color: white;
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
}

.btn-submit:hover,
.btn-save:hover {
  background: #2f855a;
}

.btn-add {
  background: #4299e1;
  color: white;
  margin-left: 0.5rem;
}

.btn-add:hover {
  background: #3182ce;
}

.btn-clear {
  background: #e53e3e;
  color: white;
  margin-left: 0.5rem;
}

.btn-clear:hover {
  background: #c53030;
}

.registration-form,
.settings-form {
  max-width: 600px;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #4a5568;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
}

.dynamic-controls {
  display: flex;
  align-items: center;
  margin-top: 1rem;
  gap: 0.5rem;
}

.dynamic-controls input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
}

@media (max-width: 768px) {
  .demo-grid {
    grid-template-columns: 1fr;
  }
  
  .demo-container {
    padding: 0 0.5rem;
  }
  
  .demo-section {
    padding: 1rem;
  }
  
  .dynamic-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .dynamic-controls input {
    margin-bottom: 0.5rem;
  }
}
</style> 
# Checkbox 組件使用指南

## 概述

本專案提供了一個功能完整的 Checkbox 組件，支援單一選擇、多選群組、不同樣式主題和尺寸。

## 組件位置

- **組件檔案**: `src/components/CheckboxComponent.vue`
- **示例頁面**: `src/views/CheckboxDemo.vue`
- **訪問路徑**: `http://localhost:5173/checkbox-demo`

## 基本用法

### 1. 單一 Checkbox

```vue
<template>
  <CheckboxComponent
    v-model="isChecked"
    label="我同意服務條款"
    help-text="請仔細閱讀相關條款"
  />
</template>

<script setup>
import { ref } from 'vue'
import CheckboxComponent from '@/components/CheckboxComponent.vue'

const isChecked = ref(false)
</script>
```

### 2. 必填 Checkbox

```vue
<template>
  <CheckboxComponent
    v-model="agreeTerms"
    label="我已閱讀並同意隱私權政策"
    required
    :error-message="errorMessage"
  />
</template>

<script setup>
import { ref } from 'vue'

const agreeTerms = ref(false)
const errorMessage = ref('')

const validate = () => {
  if (!agreeTerms.value) {
    errorMessage.value = '此為必填項目'
  } else {
    errorMessage.value = ''
  }
}
</script>
```

### 3. 群組 Checkbox（垂直排列）

```vue
<template>
  <CheckboxComponent
    v-model="selectedOptions"
    label="飲食偏好"
    is-group
    group-label="請選擇您的飲食偏好："
    :options="dietaryOptions"
    help-text="可以選擇多個選項"
  />
</template>

<script setup>
import { ref } from 'vue'

const selectedOptions = ref([])
const dietaryOptions = [
  { value: 'vegetarian', label: '素食' },
  { value: 'halal', label: '清真' },
  { value: 'no-seafood', label: '不吃海鮮' }
]
</script>
```

### 4. 群組 Checkbox（水平排列）

```vue
<template>
  <CheckboxComponent
    v-model="hobbies"
    label="興趣愛好"
    is-group
    group-label="請選擇您的興趣愛好："
    :options="hobbyOptions"
    horizontal
  />
</template>

<script setup>
import { ref } from 'vue'

const hobbies = ref([])
const hobbyOptions = [
  { value: 'reading', label: '閱讀' },
  { value: 'music', label: '音樂' },
  { value: 'sports', label: '運動' }
]
</script>
```

## 屬性說明

### 單一 Checkbox 屬性

| 屬性名 | 類型 | 預設值 | 說明 |
|--------|------|--------|------|
| `modelValue` | Boolean/Array | `false` | 綁定值 |
| `value` | String/Number/Boolean | `true` | checkbox 的值 |
| `label` | String | - | 標籤文字（必填） |
| `disabled` | Boolean | `false` | 是否禁用 |
| `required` | Boolean | `false` | 是否必填 |

### 群組 Checkbox 屬性

| 屬性名 | 類型 | 預設值 | 說明 |
|--------|------|--------|------|
| `isGroup` | Boolean | `false` | 是否為群組模式 |
| `groupLabel` | String | `''` | 群組標題 |
| `options` | Array | `[]` | 選項列表 |
| `horizontal` | Boolean | `false` | 是否水平排列 |

### 通用屬性

| 屬性名 | 類型 | 預設值 | 說明 |
|--------|------|--------|------|
| `errorMessage` | String | `''` | 錯誤訊息 |
| `helpText` | String | `''` | 說明文字 |
| `theme` | String | `'default'` | 主題色彩 |
| `size` | String | `'medium'` | 尺寸大小 |

### Options 格式

```javascript
const options = [
  { 
    value: 'option1',      // 選項值
    label: '選項 1',       // 顯示文字
    disabled: false        // 是否禁用（可選）
  },
  { 
    value: 'option2', 
    label: '選項 2' 
  }
]
```

## 主題和尺寸

### 主題選項

- `default`: 預設藍色主題
- `success`: 成功綠色主題
- `warning`: 警告橙色主題
- `danger`: 危險紅色主題

```vue
<CheckboxComponent
  v-model="checked"
  label="成功主題"
  theme="success"
/>
```

### 尺寸選項

- `small`: 小型
- `medium`: 中型（預設）
- `large`: 大型

```vue
<CheckboxComponent
  v-model="checked"
  label="大型 checkbox"
  size="large"
/>
```

## 事件

### @change

當 checkbox 狀態改變時觸發

```vue
<CheckboxComponent
  v-model="checked"
  label="選項"
  @change="handleChange"
/>

<script setup>
const handleChange = (value) => {
  console.log('新值:', value)
}
</script>
```

## 實際應用範例

### 活動報名表單

```vue
<template>
  <form @submit.prevent="submitForm">
    <!-- 基本資料 -->
    <div class="form-group">
      <label>姓名</label>
      <input v-model="form.name" type="text" required>
    </div>

    <!-- 特殊需求 -->
    <CheckboxComponent
      v-model="form.dietaryRestrictions"
      label="特殊飲食需求"
      is-group
      group-label="請選擇您的特殊飲食需求："
      :options="dietaryOptions"
      horizontal
    />

    <!-- 通知設定 -->
    <CheckboxComponent
      v-model="form.notifications"
      label="通知設定"
      is-group
      group-label="您希望接收哪些通知："
      :options="notificationOptions"
    />

    <!-- 接駁車 -->
    <CheckboxComponent
      v-model="form.needsTransport"
      label="我需要接駁車服務"
      help-text="免費提供接駁車服務"
    />

    <!-- 同意條款 -->
    <CheckboxComponent
      v-model="form.agreeTerms"
      label="我已閱讀並同意活動條款"
      required
      :error-message="termsError"
    />

    <button type="submit">提交報名</button>
  </form>
</template>

<script setup>
import { ref, reactive } from 'vue'
import CheckboxComponent from '@/components/CheckboxComponent.vue'

const form = reactive({
  name: '',
  dietaryRestrictions: [],
  notifications: [],
  needsTransport: false,
  agreeTerms: false
})

const termsError = ref('')

const dietaryOptions = [
  { value: 'vegetarian', label: '素食' },
  { value: 'halal', label: '清真' },
  { value: 'no-seafood', label: '不吃海鮮' }
]

const notificationOptions = [
  { value: 'email', label: '電子郵件通知' },
  { value: 'sms', label: '簡訊通知' },
  { value: 'push', label: '推播通知' }
]

const submitForm = () => {
  if (!form.agreeTerms) {
    termsError.value = '請同意活動條款'
    return
  }
  
  console.log('表單資料:', form)
  // 處理提交邏輯
}
</script>
```

### 系統設定

```vue
<template>
  <div class="settings">
    <h2>系統設定</h2>
    
    <!-- 通知設定 -->
    <CheckboxComponent
      v-model="settings.notifications"
      label="通知設定"
      is-group
      group-label="啟用通知："
      :options="notificationTypes"
    />

    <!-- 隱私設定 -->
    <CheckboxComponent
      v-model="settings.privacy"
      label="隱私設定"
      is-group
      group-label="隱私選項："
      :options="privacyOptions"
    />

    <!-- 功能開關 -->
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

    <button @click="saveSettings">儲存設定</button>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import CheckboxComponent from '@/components/CheckboxComponent.vue'

const settings = reactive({
  notifications: [],
  privacy: [],
  autoSave: false,
  darkMode: false
})

const notificationTypes = [
  { value: 'email', label: '電子郵件通知' },
  { value: 'desktop', label: '桌面通知' },
  { value: 'mobile', label: '手機通知' }
]

const privacyOptions = [
  { value: 'public-profile', label: '公開個人資料' },
  { value: 'show-activity', label: '顯示活動狀態' },
  { value: 'allow-search', label: '允許搜尋' }
]

const saveSettings = () => {
  console.log('儲存設定:', settings)
  // 處理儲存邏輯
}
</script>
```

## 樣式自訂

### CSS 變數

組件使用 CSS 變數，可以輕鬆自訂樣式：

```css
:root {
  --primary-color: #4299e1;
  --error-color: #e53e3e;
  --text-primary: #2d3748;
  --text-secondary: #718096;
}
```

### 自訂樣式

```css
/* 自訂 checkbox 樣式 */
.my-checkbox .checkbox-custom {
  border-radius: 50%; /* 圓形 checkbox */
}

.my-checkbox .checkbox-input:checked + .checkbox-custom {
  background: linear-gradient(45deg, #667eea 0%, #764ba2 100%);
}
```

## 最佳實踐

1. **標籤清晰**: 使用簡潔明確的標籤文字
2. **錯誤處理**: 適當提供錯誤訊息和說明文字
3. **群組使用**: 相關選項使用群組模式
4. **響應式設計**: 在小螢幕上考慮使用垂直排列
5. **無障礙設計**: 組件已內建無障礙支援

## 故障排除

### 常見問題

1. **v-model 不更新**
   - 確認使用正確的數據類型（Boolean 或 Array）
   - 檢查 options 格式是否正確

2. **樣式不顯示**
   - 確認 CSS 變數已定義
   - 檢查是否有樣式衝突

3. **群組模式選項不顯示**
   - 確認 `isGroup` 設為 `true`
   - 檢查 `options` 陣列格式

### 調試技巧

```vue
<!-- 顯示當前值進行調試 -->
<p>當前值: {{ JSON.stringify(selectedValue) }}</p>
<CheckboxComponent v-model="selectedValue" ... />
```

## 更新記錄

- **v1.0.0**: 初始版本，支援基本功能
- **v1.1.0**: 新增群組模式和主題支援
- **v1.2.0**: 新增尺寸選項和無障礙改進

## 貢獻

如需改進或新增功能，請：

1. 修改 `src/components/CheckboxComponent.vue`
2. 更新 `src/views/CheckboxDemo.vue` 中的示例
3. 更新本文件

---

*最後更新: 2024年12月* 
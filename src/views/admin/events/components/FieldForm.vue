<template>
  <form @submit.prevent="handleSubmit" class="field-form">
    <div class="form-group">
      <label>欄位名稱 <span class="required">*</span></label>
      <input 
        type="text" 
        v-model="form.field_name"
        required
        placeholder="例如：name, email, phone"
        pattern="[a-zA-Z][a-zA-Z0-9_]*"
        title="欄位名稱必須以字母開頭，只能包含字母、數字和底線"
      >
      <small class="help-text">用於程式識別的欄位名稱，必須唯一</small>
    </div>

    <div class="form-group">
      <label>顯示標籤 <span class="required">*</span></label>
      <input 
        type="text" 
        v-model="form.field_label"
        required
        placeholder="例如：姓名、電子郵件、電話號碼"
      >
      <small class="help-text">使用者看到的欄位標籤</small>
    </div>

    <div class="form-group">
      <label>欄位類型 <span class="required">*</span></label>
      <select v-model="form.field_element" required>
        <option value="">請選擇欄位類型</option>
        <option value="input">輸入框</option>
        <option value="textarea">文字區域</option>
        <option value="select">下拉選單</option>
      </select>
    </div>

    <div v-if="form.field_element === 'input'" class="form-group">
      <label>輸入類型 <span class="required">*</span></label>
      <select v-model="form.field_input_type" required>
        <option value="">請選擇輸入類型</option>
        <option value="text">文字</option>
        <option value="email">電子郵件</option>
        <option value="tel">電話號碼</option>
        <option value="number">數字</option>
        <option value="date">日期</option>
        <option value="password">密碼</option>
      </select>
    </div>

    <div v-if="form.field_element === 'select'" class="form-group">
      <label>選項值 <span class="required">*</span></label>
      <textarea 
        v-model="form.field_element_value"
        required
        placeholder="請輸入選項，每行一個或用逗號分隔&#10;例如：&#10;選項1&#10;選項2&#10;選項3"
        rows="4"
      ></textarea>
      <small class="help-text">每行一個選項，或用逗號分隔</small>
    </div>

    <div class="form-group">
      <label>佔位符文字</label>
      <input 
        type="text" 
        v-model="form.placeholder"
        placeholder="例如：請輸入您的姓名"
      >
      <small class="help-text">輸入框中的提示文字</small>
    </div>

    <div class="form-group">
      <label class="checkbox-label">
        <input 
          type="checkbox" 
          v-model="form.required"
        >
        必填欄位
      </label>
    </div>

    <div class="form-actions">
      <button type="button" @click="$emit('cancel')" class="btn-secondary">
        取消
      </button>
      <button type="submit" class="btn-primary">
        {{ isEdit ? '更新欄位' : '建立欄位' }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, defineProps, defineEmits } from 'vue'

const props = defineProps({
  initialData: {
    type: Object,
    default: () => ({})
  },
  isEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['submit', 'cancel'])

// 預設表單資料
const getDefaultFormData = () => ({
  field_name: '',
  field_label: '',
  field_element: '',
  field_input_type: '',
  field_element_value: '',
  placeholder: '',
  required: false
})

// 初始化表單資料
const form = ref(props.initialData.id ? { ...props.initialData } : getDefaultFormData())

const handleSubmit = () => {
  // 基本驗證
  if (!form.value.field_name || !form.value.field_label || !form.value.field_element) {
    return
  }

  // 如果是輸入框，需要輸入類型
  if (form.value.field_element === 'input' && !form.value.field_input_type) {
    return
  }

  // 如果是下拉選單，需要選項值
  if (form.value.field_element === 'select' && !form.value.field_element_value) {
    return
  }

  // 提交表單
  emit('submit', { ...form.value })
}
</script>

<style scoped>
.field-form {
  padding: 20px;
  background: white;
  border-radius: 8px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

.required {
  color: #dc3545;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #6200ee;
  box-shadow: 0 0 0 2px rgba(98, 0, 238, 0.1);
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.help-text {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.form-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.btn-primary,
.btn-secondary {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary {
  background: #6200ee;
  color: white;
}

.btn-primary:hover {
  background: #5000c9;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
}

.btn-secondary:hover {
  background: #e5e5e5;
}
</style> 
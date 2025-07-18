<template>
  <div class="checkbox-wrapper" :class="{ 'checkbox-group': isGroup }">
    <!-- 單一 checkbox -->
    <label v-if="!isGroup" class="checkbox-label" :class="{ 'disabled': disabled }">
      <input
        type="checkbox"
        :value="value"
        :checked="isChecked"
        :disabled="disabled"
        :required="required"
        @change="handleChange"
        class="checkbox-input"
      >
      <span class="checkbox-custom"></span>
      <span class="checkbox-text">{{ label }}</span>
    </label>

    <!-- 多選 checkbox 群組 -->
    <div v-else class="checkbox-group-container">
      <div class="checkbox-group-label" v-if="groupLabel">{{ groupLabel }}</div>
      <div class="checkbox-options" :class="{ 'horizontal': horizontal }">
        <label 
          v-for="option in options" 
          :key="option.value"
          class="checkbox-label"
          :class="{ 'disabled': disabled || option.disabled }"
        >
          <input
            type="checkbox"
            :value="option.value"
            :checked="modelValue.includes(option.value)"
            :disabled="disabled || option.disabled"
            @change="handleGroupChange(option.value)"
            class="checkbox-input"
          >
          <span class="checkbox-custom"></span>
          <span class="checkbox-text">{{ option.label }}</span>
        </label>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <div v-if="errorMessage" class="error-message">
      {{ errorMessage }}
    </div>

    <!-- 說明文字 -->
    <div v-if="helpText" class="help-text">
      {{ helpText }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// Props
const props = defineProps({
  // 單一 checkbox 屬性
  modelValue: {
    type: [Boolean, Array],
    default: false
  },
  value: {
    type: [String, Number, Boolean],
    default: true
  },
  label: {
    type: String,
    required: true
  },
  disabled: {
    type: Boolean,
    default: false
  },
  required: {
    type: Boolean,
    default: false
  },
  
  // 群組 checkbox 屬性
  isGroup: {
    type: Boolean,
    default: false
  },
  groupLabel: {
    type: String,
    default: ''
  },
  options: {
    type: Array,
    default: () => []
  },
  horizontal: {
    type: Boolean,
    default: false
  },
  
  // 通用屬性
  errorMessage: {
    type: String,
    default: ''
  },
  helpText: {
    type: String,
    default: ''
  },
  
  // 樣式主題
  theme: {
    type: String,
    default: 'default', // default, primary, success, warning, danger
    validator: (value) => ['default', 'primary', 'success', 'warning', 'danger'].includes(value)
  },
  size: {
    type: String,
    default: 'medium', // small, medium, large
    validator: (value) => ['small', 'medium', 'large'].includes(value)
  }
})

// Emits
const emit = defineEmits(['update:modelValue', 'change'])

// 計算屬性
const isChecked = computed(() => {
  if (props.isGroup) {
    return false
  }
  return props.modelValue === props.value || props.modelValue === true
})

// 方法
const handleChange = (event) => {
  const checked = event.target.checked
  let newValue
  
  if (props.value === true) {
    newValue = checked
  } else {
    newValue = checked ? props.value : false
  }
  
  emit('update:modelValue', newValue)
  emit('change', newValue)
}

const handleGroupChange = (optionValue) => {
  const currentValue = Array.isArray(props.modelValue) ? [...props.modelValue] : []
  const index = currentValue.indexOf(optionValue)
  
  if (index > -1) {
    currentValue.splice(index, 1)
  } else {
    currentValue.push(optionValue)
  }
  
  emit('update:modelValue', currentValue)
  emit('change', currentValue)
}
</script>

<style scoped>
.checkbox-wrapper {
  margin-bottom: 1rem;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1.5;
  transition: all 0.2s ease;
}

.checkbox-label:hover:not(.disabled) {
  color: var(--primary-color, #4299e1);
}

.checkbox-label.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.checkbox-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.checkbox-custom {
  position: relative;
  width: 1.25rem;
  height: 1.25rem;
  border: 2px solid #e2e8f0;
  border-radius: 0.25rem;
  background: white;
  transition: all 0.2s ease;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.checkbox-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0.25rem;
  height: 0.5rem;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: translate(-50%, -65%) rotate(45deg);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.checkbox-input:checked + .checkbox-custom {
  background: #4299e1;
  border-color: #4299e1;
}

.checkbox-input:checked + .checkbox-custom::after {
  opacity: 1;
}

/* 確保打勾符號正確顯示的備用樣式 */
.checkbox-input:checked + .checkbox-custom::before {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
  line-height: 1;
  display: none; /* 默認隱藏，當 ::after 不工作時可以啟用 */
}

/* 如果瀏覽器不支援複雜的 CSS，使用簡單的文字符號 */
@supports not (transform: rotate(45deg)) {
  .checkbox-custom::after {
    display: none;
  }
  
  .checkbox-input:checked + .checkbox-custom::before {
    display: block;
  }
}

.checkbox-input:focus + .checkbox-custom {
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.1);
  outline: none;
}

.checkbox-text {
  flex: 1;
  user-select: none;
}

/* 群組樣式 */
.checkbox-group-container {
  width: 100%;
}

.checkbox-group-label {
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: var(--text-primary, #2d3748);
}

.checkbox-options {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.checkbox-options.horizontal {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
}

/* 錯誤訊息 */
.error-message {
  color: var(--error-color, #e53e3e);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.checkbox-wrapper:has(.error-message) .checkbox-custom {
  border-color: var(--error-color, #e53e3e);
}

/* 說明文字 */
.help-text {
  color: var(--text-secondary, #718096);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

/* 尺寸變化 */
.checkbox-wrapper.size-small .checkbox-custom {
  width: 1rem;
  height: 1rem;
}

.checkbox-wrapper.size-small .checkbox-custom::after {
  width: 0.2rem;
  height: 0.4rem;
  transform: translate(-50%, -65%) rotate(45deg);
}

.checkbox-wrapper.size-small .checkbox-text {
  font-size: 0.875rem;
}

.checkbox-wrapper.size-large .checkbox-custom {
  width: 1.5rem;
  height: 1.5rem;
}

.checkbox-wrapper.size-large .checkbox-custom::after {
  width: 0.3rem;
  height: 0.6rem;
  transform: translate(-50%, -65%) rotate(45deg);
}

.checkbox-wrapper.size-large .checkbox-text {
  font-size: 1.125rem;
}

/* 主題顏色 */
.checkbox-wrapper.theme-success .checkbox-input:checked + .checkbox-custom {
  background: #38a169;
  border-color: #38a169;
}

.checkbox-wrapper.theme-warning .checkbox-input:checked + .checkbox-custom {
  background: #d69e2e;
  border-color: #d69e2e;
}

.checkbox-wrapper.theme-danger .checkbox-input:checked + .checkbox-custom {
  background: #e53e3e;
  border-color: #e53e3e;
}

/* 響應式設計 */
@media (max-width: 768px) {
  .checkbox-options.horizontal {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .checkbox-label {
    font-size: 0.875rem;
  }
  
  .checkbox-custom {
    width: 1.125rem;
    height: 1.125rem;
  }
}
</style>
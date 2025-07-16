<template>
  <div class="form-field-manager">
    <div class="header">
      <h2>表單欄位管理</h2>
      <button @click="showAddField = true" class="btn-add">
        <span>➕</span> 新增欄位
      </button>
    </div>

    <!-- 載入狀態 -->
    <div v-if="isLoading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>載入中...</p>
    </div>

    <!-- 欄位列表 -->
    <div class="field-list" v-else-if="fields.length">
      <div v-for="field in fields" :key="field.id" class="field-item">
        <div class="field-info">
          <div class="field-header">
            <h3>{{ field.field_label }}</h3>
            <div class="field-actions">
              <button @click="editField(field)" class="btn-icon">✏️</button>
              <button @click="confirmDelete(field)" class="btn-icon">🗑️</button>
            </div>
          </div>
          <div class="field-details">
            <span class="tag">{{ field.field_name }}</span>
            <span class="tag">{{ field.field_element }}</span>
            <span class="tag" v-if="field.field_input_type">{{ field.field_input_type }}</span>
          </div>
        </div>
        
        <!-- 預覽區域 -->
        <div class="field-preview">
          <label>{{ field.field_label }}</label>
          <component 
            :is="getFieldComponent(field)"
            v-bind="getFieldProps(field)"
            disabled
          />
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">📝</div>
      <p>尚未建立任何欄位</p>
      <button @click="showAddField = true" class="btn-primary">
        建立第一個欄位
      </button>
    </div>

    <!-- 新增/編輯欄位對話框 -->
    <div v-if="showAddField || editingField" class="modal-overlay">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ editingField ? '編輯欄位' : '新增欄位' }}</h3>
          <button @click="closeModal" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <FieldForm
            :initial-data="editingField"
            :is-edit="!!editingField"
            @submit="handleFormSubmit"
            @cancel="closeModal"
          />
        </div>
      </div>
    </div>

    <!-- 刪除確認對話框 -->
    <div v-if="showDeleteConfirm" class="modal-overlay">
      <div class="modal confirm-modal">
        <div class="modal-header">
          <h3>確認刪除</h3>
          <button @click="showDeleteConfirm = false" class="btn-close">✕</button>
        </div>
        <div class="modal-body">
          <p>確定要刪除欄位「{{ fieldToDelete?.field_label }}」嗎？</p>
          <p class="warning">此操作無法復原。</p>
          <div class="confirm-actions">
            <button @click="showDeleteConfirm = false" class="btn-secondary">取消</button>
            <button @click="deleteField" class="btn-danger">確認刪除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import FieldForm from '@/views/admin/events/components/FieldForm.vue'
import { formFieldService } from '@/services/formFieldService'

const toast = useToast()
const fields = ref([])
const showAddField = ref(false)
const editingField = ref(null)
const showDeleteConfirm = ref(false)
const fieldToDelete = ref(null)
const isLoading = ref(false)

// 載入所有欄位
const loadFields = async () => {
  try {
    isLoading.value = true
    const response = await formFieldService.getFields()
    fields.value = response.data || []
  } catch (error) {
    console.error('載入欄位失敗:', error)
    toast.error('載入欄位失敗')
    fields.value = []
  } finally {
    isLoading.value = false
  }
}

// 處理表單提交
const handleFormSubmit = async (formData) => {
  try {
    isLoading.value = true
    
    if (editingField.value) {
      // 更新現有欄位
      const response = await formFieldService.updateField(editingField.value.id, formData)
      if (response.success) {
        toast.success('欄位更新成功')
        await loadFields() // 重新載入欄位列表
      } else {
        toast.error(response.message || '更新欄位失敗')
        return
      }
    } else {
      // 新增欄位
      const response = await formFieldService.createField(formData)
      if (response.success) {
        toast.success('欄位建立成功')
        await loadFields() // 重新載入欄位列表
      } else {
        toast.error(response.message || '建立欄位失敗')
        return
      }
    }
    
    closeModal()
  } catch (error) {
    console.error('處理表單失敗:', error)
    const errorMessage = error.message || (editingField.value ? '更新欄位失敗' : '建立欄位失敗')
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
  }
}

// 編輯欄位
const editField = (field) => {
  editingField.value = { ...field }
  showAddField.value = false
}

// 確認刪除
const confirmDelete = (field) => {
  fieldToDelete.value = field
  showDeleteConfirm.value = true
}

// 執行刪除
const deleteField = async () => {
  try {
    isLoading.value = true
    const response = await formFieldService.deleteField(fieldToDelete.value.id)
    if (response) {
      toast.success('欄位刪除成功')
      await loadFields() // 重新載入欄位列表
    } else {
      toast.error('刪除欄位失敗')
    }
  } catch (error) {
    console.error('刪除欄位失敗:', error)
    const errorMessage = error.message || '刪除欄位失敗'
    toast.error(errorMessage)
  } finally {
    isLoading.value = false
    showDeleteConfirm.value = false
    fieldToDelete.value = null
  }
}

// 關閉模態框
const closeModal = () => {
  showAddField.value = false
  editingField.value = null
}

// 載入初始資料
onMounted(() => {
  loadFields()
})

// 根據欄位類型獲取對應的元件
const getFieldComponent = (field) => {
  switch (field.field_element) {
    case 'select':
      return 'select'
    case 'textarea':
      return 'textarea'
    default:
      return 'input'
  }
}

// 獲取欄位屬性
const getFieldProps = (field) => {
  const props = {
    placeholder: field.placeholder,
    class: 'preview-input'
  }

  if (field.field_element === 'input') {
    props.type = field.field_input_type || 'text'
  }

  if (field.field_element === 'select' && field.field_element_value) {
    props.children = field.field_element_value.split(',').map(option => ({
      tag: 'option',
      value: option.trim(),
      text: option.trim()
    }))
  }

  return props
}
</script>

<style scoped>
.form-field-manager {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.header h2 {
  margin: 0;
  color: #333;
}

.btn-add {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-add:hover {
  background: #5000c9;
}

.loading-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #6200ee;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.field-list {
  display: grid;
  gap: 20px;
}

.field-item {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.field-header h3 {
  margin: 0;
  color: #333;
}

.field-actions {
  display: flex;
  gap: 8px;
}

.btn-icon {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2em;
  padding: 4px;
  border-radius: 4px;
}

.btn-icon:hover {
  background: #f0f0f0;
}

.field-details {
  display: flex;
  gap: 8px;
  margin-bottom: 15px;
}

.tag {
  background: #f0f0f0;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  color: #666;
}

.field-preview {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
}

.field-preview label {
  display: block;
  margin-bottom: 8px;
  color: #666;
}

.preview-input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
}

.empty-state {
  text-align: center;
  padding: 40px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 3em;
  margin-bottom: 20px;
}

.btn-primary {
  padding: 12px 24px;
  background: #6200ee;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.btn-primary:hover {
  background: #5000c9;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
}

.confirm-modal {
  max-width: 400px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  padding: 4px;
  color: #666;
}

.modal-body {
  padding: 20px;
}

.warning {
  color: #dc3545;
  font-size: 0.9em;
}

.confirm-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-secondary {
  background: #f5f5f5;
  color: #333;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary:hover {
  background: #e5e5e5;
}

.btn-danger {
  background: #dc3545;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-danger:hover {
  background: #c82333;
}
</style> 
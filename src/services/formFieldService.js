import axios from 'axios'

const API_URL = '/api/form-fields'

export const formFieldService = {
  // 獲取所有表單欄位
  async getFields() {
    try {
      const response = await axios.get(API_URL)
      return response.data
    } catch (error) {
      console.error('獲取表單欄位失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '獲取表單欄位失敗')
    }
  },

  // 獲取單個表單欄位
  async getField(id) {
    try {
      const response = await axios.get(`${API_URL}/${id}`)
      return response.data
    } catch (error) {
      console.error('獲取表單欄位失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '獲取表單欄位失敗')
    }
  },

  // 創建新表單欄位
  async createField(fieldData) {
    try {
      const response = await axios.post(API_URL, fieldData)
      return response.data
    } catch (error) {
      console.error('創建表單欄位失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '創建表單欄位失敗')
    }
  },

  // 更新表單欄位
  async updateField(id, fieldData) {
    try {
      const response = await axios.put(`${API_URL}/${id}`, fieldData)
      return response.data
    } catch (error) {
      console.error('更新表單欄位失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '更新表單欄位失敗')
    }
  },

  // 刪除表單欄位
  async deleteField(id) {
    try {
      await axios.delete(`${API_URL}/${id}`)
      return true
    } catch (error) {
      console.error('刪除表單欄位失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '刪除表單欄位失敗')
    }
  },

  // 批量更新欄位順序
  async updateFieldsOrder(fieldsOrder) {
    try {
      const response = await axios.put(`${API_URL}/order`, fieldsOrder)
      return response.data
    } catch (error) {
      console.error('更新欄位順序失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '更新欄位順序失敗')
    }
  },

  // 驗證欄位名稱是否唯一
  async validateFieldName(fieldName, excludeId = null) {
    try {
      const response = await axios.post(`${API_URL}/validate`, {
        field_name: fieldName,
        exclude_id: excludeId
      })
      return response.data
    } catch (error) {
      console.error('驗證欄位名稱失敗:', error.response?.data || error.message)
      throw new Error(error.response?.data?.message || '驗證欄位名稱失敗')
    }
  }
} 
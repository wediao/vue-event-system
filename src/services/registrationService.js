import axios from './axiosConfig'

const API_BASE_URL = '/api'  // 使用相對路徑，讓 axios 處理基礎 URL

export const registrationService = {
  /**
   * 檢查是否重複報名
   * @param {string} eventId - 活動ID
   * @param {string} email - 電子郵件
   * @param {string} idNumber - 身分證號碼
   * @returns {Promise<Object>} - 重複報名檢查結果
   */
  async checkDuplicate(eventId, email, idNumber = null) {
    try {
      const response = await axios.post(`${API_BASE_URL}/events/check-duplicate`, {
        eventId,
        email,
        idNumber
      })
      return {
        isDuplicate: response.data.isDuplicate,
        duplicateReason: response.data.duplicateReason
      }
    } catch (error) {
      console.error('檢查重複報名失敗：', error)
      throw new Error(error.response?.data?.message || '檢查重複報名失敗')
    }
  },

  /**
   * 註冊活動
   * @param {string} eventId - 活動ID
   * @param {string} registrationCode - 註冊碼
   * @param {Object} userData - 用戶資料
   * @returns {Promise<Object>} - 註冊結果
   */
  async register(eventId, registrationCode, userData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/register`, {
        eventId,
        registrationCode,
        userData
      })
      return response.data
    } catch (error) {
      console.error('註冊失敗：', error)
      throw new Error(error.response?.data?.message || '註冊失敗')
    }
  },

  /**
   * 發送確認郵件
   * @param {Object} emailData - 郵件資料
   * @returns {Promise<Object>} - 發送結果
   */
  async sendConfirmationEmail(emailData) {
    try {
      const response = await axios.post(`${API_BASE_URL}/send-email`, emailData)
      return response.data
    } catch (error) {
      console.error('發送確認郵件失敗：', error)
      throw new Error(error.response?.data?.message || '發送確認郵件失敗')
    }
  },

  /**
   * 儲存表單資料到 localStorage
   * @param {Object} formData - 表單資料
   */
  saveFormData(formData) {
    const dataToSave = { ...formData }
    delete dataToSave.agreeTerms
    localStorage.setItem('registrationFormData', JSON.stringify(dataToSave))
  },

  /**
   * 從 localStorage 載入表單資料
   * @returns {Object|null} - 表單資料
   */
  loadFormData() {
    try {
      const savedData = localStorage.getItem('registrationFormData')
      return savedData ? JSON.parse(savedData) : null
    } catch (error) {
      console.error('載入表單資料失敗：', error)
      return null
    }
  },

  /**
   * 儲存最近使用的郵件
   * @param {string} email - 電子郵件
   */
  saveRecentEmail(email) {
    if (!email) return
    
    try {
      let emails = JSON.parse(localStorage.getItem('recentEmails') || '[]')
      emails = [email, ...emails.filter(e => e !== email)].slice(0, 5)
      localStorage.setItem('recentEmails', JSON.stringify(emails))
      return emails
    } catch (error) {
      console.error('儲存最近郵件失敗：', error)
      return []
    }
  },

  /**
   * 載入最近使用的郵件
   * @returns {Array<string>} - 郵件列表
   */
  loadRecentEmails() {
    try {
      return JSON.parse(localStorage.getItem('recentEmails') || '[]')
    } catch (error) {
      console.error('載入最近郵件失敗：', error)
      return []
    }
  },

  /**
   * 清除所有儲存的資料
   */
  clearSavedData() {
    localStorage.removeItem('registrationFormData')
    localStorage.removeItem('recentEmails')
  }
} 
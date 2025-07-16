import { ref } from 'vue'

export class CountdownService {
  constructor() {
    this.serverTimeOffset = 0
    this.countdowns = ref({})
    this.timer = null
    this.retryCount = 0
    this.maxRetries = 3
    this.retryInterval = 2000 // 2 秒
    this.isInitialized = false
    
    // 時間相關的常量
    this.UPDATE_INTERVAL = 1000 // 更新間隔：1秒
  }

  /**
   * 同步伺服器時間
   */
  async syncServerTime() {
    try {
      const startTime = Date.now()
      const response = await fetch('/api/time')
      const endTime = Date.now()
      const roundTripTime = endTime - startTime
      
      if (!response.ok) {
        throw new Error('無法同步伺服器時間')
      }
      
      const data = await response.json()
      const serverTime = new Date(data.time).getTime()
      
      // 計算時間偏移，考慮網路延遲
      this.serverTimeOffset = serverTime - (startTime + roundTripTime / 2)
      this.isInitialized = true
      this.retryCount = 0
      
      return true
    } catch (error) {
      console.error('同步伺服器時間失敗：', error)
      
      if (this.retryCount < this.maxRetries) {
        this.retryCount++
        console.log(`重試同步時間 (${this.retryCount}/${this.maxRetries})...`)
        await new Promise(resolve => setTimeout(resolve, this.retryInterval))
        return this.syncServerTime()
      }
      
      // 如果重試次數用完，使用本地時間
      console.warn('無法同步伺服器時間，使用本地時間')
      this.serverTimeOffset = 0
      this.isInitialized = true
      return false
    }
  }

  /**
   * 獲取當前伺服器時間
   */
  getCurrentServerTime() {
    return Date.now() + this.serverTimeOffset
  }

  /**
   * 計算倒數時間
   */
  calculateCountdown(targetTime) {
    const now = this.getCurrentServerTime()
    const diff = targetTime - now

    if (diff <= 0) {
      return null
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return {
      total: diff,
      days,
      hours,
      minutes,
      seconds,
      display: days > 0 
        ? `${days}天${hours}小時${minutes}分`
        : hours > 0
        ? `${hours}小時${minutes}分${seconds}秒`
        : `${minutes}分${seconds}秒`
    }
  }

  /**
   * 獲取活動狀態
   */
  getEventStatus(event) {
    if (!event || !event.registrationStartTime || !event.registrationEndTime) {
      return { status: 'invalid', text: '無效的活動' }
    }

    const now = this.getCurrentServerTime()
    const startTime = new Date(event.registrationStartTime).getTime()
    const endTime = new Date(event.registrationEndTime).getTime()

    if (now < startTime) {
      return { status: 'upcoming', text: '即將開始' }
    } else if (now >= startTime && now <= endTime) {
      return { status: 'active', text: '報名中' }
    } else {
      return { status: 'ended', text: '已結束' }
    }
  }

  /**
   * 開始倒數計時
   */
  async startCountdown(events) {
    if (!this.isInitialized) {
      await this.syncServerTime()
    }
    
    if (this.timer) {
      clearInterval(this.timer)
    }

    const updateCountdowns = () => {
      events.forEach(event => {
        const now = this.getCurrentServerTime()
        const startTime = new Date(event.registrationStartTime).getTime()
        const endTime = new Date(event.registrationEndTime).getTime()
        const countdownStartTime = event.countdownType === 'custom' && event.countdownStartTime ? 
          new Date(event.countdownStartTime).getTime() : startTime

        if (now < startTime) {
          // 只在倒數開始時間之後才顯示倒數
          if (now >= countdownStartTime) {
          const countdown = this.calculateCountdown(startTime)
          if (countdown) {
            this.countdowns.value[event.id] = {
              ...countdown,
              type: 'start'
            }
            }
          } else {
            delete this.countdowns.value[event.id]
          }
        } else if (now >= startTime && now <= endTime) {
          const countdown = this.calculateCountdown(endTime)
          if (countdown) {
            this.countdowns.value[event.id] = {
              ...countdown,
              type: 'end'
            }
          } else {
            delete this.countdowns.value[event.id]
          }
        } else {
          delete this.countdowns.value[event.id]
        }
      })
    }

    // 立即執行一次更新
    updateCountdowns()
    
    // 設定定時更新
    this.timer = setInterval(updateCountdowns, this.UPDATE_INTERVAL)
  }

  /**
   * 停止倒數計時
   */
  stopCountdown() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
    this.countdowns.value = {}
  }
}

// 導出單例
export const countdownService = new CountdownService() 
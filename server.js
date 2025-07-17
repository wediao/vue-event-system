const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const path = require('path')
const fs = require('fs')
const nodemailer = require('nodemailer')
const compression = require('compression')
const { v4: uuidv4 } = require('uuid')

// 載入環境變數
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3000
const NODE_ENV = process.env.NODE_ENV || 'development'

// 修正 CORS 設定（移除重複行）
app.use(cors({
  origin: NODE_ENV === 'production' 
    ? ['https://vue-event-system.onrender.com'] 
    : ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// 生產環境下提供靜態檔案服務
if (NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'dist')))
}

// 錯誤處理中間件
app.use((err, req, res, next) => {
  console.error('錯誤：', err.stack)
  res.status(500).json({
    success: false,
    message: '系統錯誤，請稍後再試'
  })
})

// 管理員身份驗證中間件
const adminAuth = (req, res, next) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: '未提供身份驗證'
    })
  }
  
  const token = authHeader.split(' ')[1]
  
  try {
    // 這裡使用簡單的 token 驗證方式
    // 在實際應用中，應該使用更安全的方法，如 JWT
    const decodedToken = Buffer.from(token, 'base64').toString('utf-8')
    if (!decodedToken.startsWith('admin-')) {
      throw new Error('無效的 token')
    }
    
    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: '無效的身份驗證'
    })
  }
}

// 資料檔案路徑
const DATA_DIR = path.join(__dirname, 'data')
const EVENTS_FILE = path.join(DATA_DIR, 'events.json')
const REGISTRATIONS_FILE = path.join(DATA_DIR, 'registrations.json')

// 確保資料目錄存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR)
}

// 從檔案載入資料
const loadData = () => {
  try {
    if (fs.existsSync(EVENTS_FILE)) {
      const eventsData = JSON.parse(fs.readFileSync(EVENTS_FILE, 'utf8'))
      events.clear()
      if (Array.isArray(eventsData)) {
        eventsData.forEach(event => events.set(event.id, event))
      } else {
      Object.entries(eventsData).forEach(([key, value]) => events.set(key, value))
      }
    } else {
      // 如果檔案不存在，建立空檔案
      fs.writeFileSync(EVENTS_FILE, JSON.stringify([], null, 2))
    }
    
    if (fs.existsSync(REGISTRATIONS_FILE)) {
      const registrationsData = JSON.parse(fs.readFileSync(REGISTRATIONS_FILE, 'utf8'))
      registrations.clear()
      if (Array.isArray(registrationsData)) {
        registrationsData.forEach(reg => registrations.set(reg.registrationCode, reg))
      } else {
      Object.entries(registrationsData).forEach(([key, value]) => registrations.set(key, value))
      }
    } else {
      // 如果檔案不存在，建立空檔案
      fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify([], null, 2))
    }
  } catch (error) {
    console.error('載入資料失敗：', error)
  }
}

// 儲存資料到檔案
const saveData = () => {
  try {
    const eventsData = Array.from(events.values())
    const registrationsData = Array.from(registrations.values())
    
    fs.writeFileSync(EVENTS_FILE, JSON.stringify(eventsData, null, 2))
    fs.writeFileSync(REGISTRATIONS_FILE, JSON.stringify(registrationsData, null, 2))
  } catch (error) {
    console.error('儲存資料失敗：', error)
  }
}

// 模擬資料庫
const registrations = new Map()
const events = new Map()

// 表單欄位資料
const formFields = new Map()

// 載入資料
loadData()

// 環境變量配置
const SMTP_CONFIG = {
  service: 'gmail',
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // 使用 STARTTLS
  auth: {
    user: process.env.SMTP_USER || 'your-email@gmail.com',
    pass: process.env.SMTP_PASS || 'your-app-password' // 需要使用應用程式密碼
  },
  tls: {
    rejectUnauthorized: false // 允許自簽名憑證
  },
  pool: true,
  maxConnections: 5,
  maxMessages: 100,
  debug: true, // 開啟除錯模式
  logger: true // 開啟日誌
}

// 創建 SMTP 傳輸器
const transporter = nodemailer.createTransport(SMTP_CONFIG)

// 驗證 SMTP 連接
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP 連接錯誤：', error)
  } else {
    console.log('SMTP 伺服器已就緒')
  }
})

// 前台 - 獲取活動列表（無需身份驗證）
app.get('/api/public/events', (req, res) => {
  try {
    const eventList = Array.from(events.values())
      .filter(event => {
        const now = new Date()
        const endTime = new Date(event.registrationEndTime)
        return endTime > now  // 只返回未結束的活動
      })
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json({
      success: true,
      data: eventList
    })
  } catch (error) {
    console.error('獲取活動列表失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 後台 - 獲取活動列表（需要管理員身份驗證）
app.get('/api/admin/events', adminAuth, (req, res) => {
  try {
    const eventList = Array.from(events.values())
    
    // 按照創建時間排序（新的在前）
    eventList.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    
    res.json({
      success: true,
      data: eventList
    })
  } catch (error) {
    console.error('獲取活動列表失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 前台 - 不需登入也可查看活動詳情
app.get('/api/public/events/:id', (req, res) => {
  try {
    const eventId = req.params.id
    const event = events.get(eventId)
    
    if (!event) {
      return res.status(404).json({ 
        success: false, 
        message: '活動不存在' 
      })
    }
    
    res.json({ 
      success: true, 
      data: event 
    })
  } catch (error) {
    console.error('前台載入活動失敗：', error)
    res.status(500).json({ 
      success: false, 
      message: '系統錯誤' 
    })
  }
})

// 後台 - 獲取單個活動 (需要身份驗證)
app.get('/api/events/:id', adminAuth, (req, res) => {
  try {
    const eventId = req.params.id
    const event = events.get(eventId)
    
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '活動不存在'
      })
    }
    
    res.json({
      success: true,
      data: event
    })
  } catch (error) {
    console.error('獲取活動詳情失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 建立新活動 - 添加身份驗證
app.post('/api/events', adminAuth, (req, res) => {
  try {
    const eventData = req.body
    console.log('收到建立活動請求：', JSON.stringify(eventData, null, 2))
    
    const eventId = uuidv4()
    
    // 驗證必要欄位
    if (!eventData.name || !eventData.description || !eventData.capacity || 
        !eventData.registrationStartTime || !eventData.registrationEndTime) {
      console.log('缺少必要欄位，收到的資料：', eventData)
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位（活動名稱、描述、容量、報名時間）'
      })
    }

    // 驗證容量
    if (isNaN(eventData.capacity) || eventData.capacity < 1) {
      return res.status(400).json({
        success: false,
        message: '活動容量必須大於0'
      })
    }
    
    // 驗證時間格式
    const registrationStart = new Date(eventData.registrationStartTime)
    const registrationEnd = new Date(eventData.registrationEndTime)
    const now = new Date()
    
    if ([registrationStart, registrationEnd].some(date => isNaN(date.getTime()))) {
      console.log('時間格式無效：', eventData)
      return res.status(400).json({
        success: false,
        message: '時間格式無效'
      })
    }
    
    // 驗證時間順序
    if (registrationStart < now) {
      return res.status(400).json({
        success: false,
        message: '報名開始時間必須晚於現在'
      })
    }
    
    if (registrationEnd <= registrationStart) {
      return res.status(400).json({
        success: false,
        message: '報名結束時間必須晚於開始時間'
      })
    }

    // 驗證報名時間長度
    const registrationDuration = registrationEnd - registrationStart
    if (registrationDuration < 15 * 60 * 1000) { // 15分鐘
      return res.status(400).json({
        success: false,
        message: '報名時間至少需要15分鐘'
      })
    }
    
    // 建立新活動
    const newEvent = {
      id: eventId,
      ...eventData,
      capacity: parseInt(eventData.capacity),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    events.set(eventId, newEvent)
    
    // 儲存到檔案
    saveData()
    console.log('活動儲存成功')
    
    res.json({
      success: true,
      data: newEvent
    })
  } catch (error) {
    console.error('建立活動失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 更新活動 - 添加身份驗證
app.put('/api/events/:id', adminAuth, (req, res) => {
  try {
    const eventId = req.params.id
    const updateData = req.body
    console.log('收到更新活動請求：', eventId, JSON.stringify(updateData, null, 2))
    
    const existingEvent = events.get(eventId)
    if (!existingEvent) {
      return res.status(404).json({
        success: false,
        message: '活動不存在'
      })
    }

    // 驗證必要欄位
    if (!updateData.name || !updateData.description || !updateData.capacity || 
        !updateData.registrationStartTime || !updateData.registrationEndTime) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位'
      })
    }

    // 驗證容量
    if (isNaN(updateData.capacity) || updateData.capacity < 1) {
      return res.status(400).json({
        success: false,
        message: '活動容量必須大於0'
      })
    }
    
    // 驗證時間格式
    const registrationStart = new Date(updateData.registrationStartTime)
    const registrationEnd = new Date(updateData.registrationEndTime)
    
    if ([registrationStart, registrationEnd].some(date => isNaN(date.getTime()))) {
      return res.status(400).json({
        success: false,
        message: '時間格式無效'
      })
    }
    
    // 驗證時間順序
    if (registrationEnd <= registrationStart) {
      return res.status(400).json({
        success: false,
        message: '報名結束時間必須晚於開始時間'
      })
    }

    // 驗證報名時間長度
    const registrationDuration = registrationEnd - registrationStart
    if (registrationDuration < 15 * 60 * 1000) { // 15分鐘
      return res.status(400).json({
        success: false,
        message: '報名時間至少需要15分鐘'
      })
    }
    
    // 更新活動資料
    const updatedEvent = {
      ...existingEvent,
      ...updateData,
      capacity: parseInt(updateData.capacity),
      updatedAt: new Date().toISOString()
    }
    
    events.set(eventId, updatedEvent)
    
    // 儲存到檔案
    saveData()
    console.log('活動更新成功')
    
    res.json({
      success: true,
      data: updatedEvent
    })
  } catch (error) {
    console.error('更新活動失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 活動註冊端點
app.post('/api/register', (req, res) => {
  const { eventId, registrationCode, userData } = req.body
  console.log('收到註冊請求：', req.body)

  const event = events.get(eventId)
  if (!event) {
    console.log('活動不存在：', eventId)
    return res.status(404).json({ error: '活動不存在' })
  }
  console.log('找到活動：', event)

  // 檢查是否重複報名 - 同時檢查 email 和身分證號碼
  const existingRegistrations = Array.from(registrations.values())
  const duplicateByEmail = existingRegistrations.find(reg => 
    reg.eventId === eventId && reg.userData.email === userData.email
  )
  const duplicateByIdNumber = existingRegistrations.find(reg => 
    reg.eventId === eventId && reg.userData.idNumber === userData.idNumber
  )

  if (duplicateByEmail) {
    console.log('重複報名 - 相同 email：', userData.email)
    return res.status(400).json({ error: '此電子郵件已經報名過此活動' })
  }

  if (duplicateByIdNumber) {
    console.log('重複報名 - 相同身分證號碼：', userData.idNumber)
    return res.status(400).json({ error: '此身分證號碼已經報名過此活動' })
  }

  // 檢查註冊碼是否已存在
  if (registrations.has(registrationCode)) {
    console.log('註冊碼已存在：', registrationCode)
    return res.status(400).json({ error: '註冊碼已存在，請重新嘗試' })
  }

  // 儲存報名資訊
  registrations.set(registrationCode, {
    eventId,
    registrationCode,
    userData,
    registrationTime: new Date().toISOString()
  })
  
  // 儲存資料到檔案
  saveData()

  console.log('註冊成功：', registrationCode)
  res.json({ success: true, registrationCode })
})

// 郵件發送端點
app.post('/api/send-email', async (req, res) => {
  try {
    const { to_name, to_email, event_name, registration_code, sale_start_time } = req.body
    
    console.log('收到郵件發送請求：', {
      to_name,
      to_email,
      event_name,
      registration_code,
      sale_start_time
    })

    // 驗證必要資料
    if (!to_email || !event_name || !registration_code || !sale_start_time) {
      return res.status(400).json({
        success: false,
        message: '缺少必要資料'
      })
    }

    // 檢查是否為測試模式
    const isTestMode = process.env.NODE_ENV === 'development' || !process.env.SMTP_USER || process.env.SMTP_USER === 'your-email@gmail.com'
    
    if (isTestMode) {
      // 測試模式：模擬郵件發送
      console.log('🧪 測試模式：模擬郵件發送')
      console.log('📧 模擬郵件內容：', {
        收件人: `${to_name} <${to_email}>`,
        主旨: `【桃園機場捷運】${event_name} 活動登記成功`,
        序號: registration_code,
        開放時間: new Date(sale_start_time).toLocaleString('zh-TW')
      })
      
      // 模擬延遲
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return res.json({
        success: true,
        message: '郵件發送成功（測試模式）',
        testMode: true
      })
    }

    // 準備郵件內容
    const mailOptions = {
      from: `桃園機場捷運活動系統 <${process.env.SMTP_USER}>`,
      to: to_email,
      subject: `【桃園機場捷運】${event_name} 活動登記成功`,
      text: `親愛的 ${to_name}：

感謝您登記參加「${event_name}」活動！

您的登記序號為：${registration_code}
開放搶購時間：${new Date(sale_start_time).toLocaleString('zh-TW')}

重要提醒：
1. 請於開放搶購時間準時登入系統
2. 使用登記序號進行搶購
3. 逾時未購票將失效

如有任何問題，請聯繫客服中心。

桃園機場捷運活動系統`,
      html: `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">桃園機場捷運</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">活動登記成功通知</p>
        </div>
        
        <div style="background: white; padding: 30px; border: 1px solid #e0e0e0; border-top: none;">
          <h2 style="color: #2c3e50; margin-top: 0;">親愛的 ${to_name}：</h2>
          <p style="color: #555; line-height: 1.6;">感謝您登記參加「<strong>${event_name}</strong>」活動！</p>
          
          <div style="background: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #42b983;">
            <div style="margin-bottom: 15px;">
              <span style="color: #666; font-size: 14px;">您的登記序號</span>
              <div style="font-size: 24px; font-weight: bold; color: #42b983; font-family: monospace; margin-top: 5px;">${registration_code}</div>
            </div>
            <div>
              <span style="color: #666; font-size: 14px;">開放搶購時間</span>
              <div style="font-size: 18px; font-weight: bold; color: #2c3e50; margin-top: 5px;">${new Date(sale_start_time).toLocaleString('zh-TW')}</div>
            </div>
          </div>
          
          <div style="background: #fff3cd; padding: 20px; border-radius: 8px; margin: 25px 0; border-left: 4px solid #ffc107;">
            <h3 style="color: #856404; margin-top: 0; font-size: 16px;">⚠️ 重要提醒</h3>
            <ul style="color: #856404; margin: 0; padding-left: 20px; line-height: 1.8;">
            <li>請於開放搶購時間準時登入系統</li>
            <li>使用登記序號進行搶購</li>
            <li>逾時未購票將失效</li>
              <li>建議使用穩定的網路環境</li>
          </ul>
        </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="http://localhost:5173" style="background: #42b983; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">前往活動頁面</a>
          </div>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px; text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0;">如有任何問題，請聯繫客服中心</p>
          <p style="margin: 5px 0 0 0;">桃園機場捷運活動系統</p>
        </div>
      </div>`
    }

    // 發送郵件
    console.log('📧 正在發送郵件...')
    const info = await transporter.sendMail(mailOptions)
    console.log('✅ 郵件發送成功：', info.messageId)

    res.json({
      success: true,
      message: '郵件發送成功',
      messageId: info.messageId
    })

  } catch (error) {
    console.error('❌ 郵件發送失敗：', error)
    
    // 根據錯誤類型提供不同的回應
    let errorMessage = '郵件發送失敗'
    if (error.code === 'EAUTH') {
      errorMessage = 'SMTP 認證失敗，請檢查帳號密碼設定'
    } else if (error.code === 'ESOCKET' || error.code === 'ECONNECTION') {
      errorMessage = '網路連接失敗，請檢查網路設定'
    } else if (error.code === 'ETIMEDOUT') {
      errorMessage = '連接超時，請稍後再試'
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    })
  }
})

// 檢查重複報名端點
app.post('/api/events/check-duplicate', (req, res) => {
  try {
    const { eventId, email, idNumber } = req.body
    
    // 檢查是否重複報名 - 同時檢查 email 和身分證號碼
    const existingRegistrations = Array.from(registrations.values())
    const duplicateByEmail = existingRegistrations.find(reg => 
      reg.eventId === eventId && reg.userData.email === email
    )
    const duplicateByIdNumber = idNumber ? existingRegistrations.find(reg => 
      reg.eventId === eventId && reg.userData.idNumber === idNumber
    ) : null
    
    let isDuplicate = false
    let duplicateReason = null
    
    if (duplicateByEmail) {
      isDuplicate = true
      duplicateReason = 'email'
    } else if (duplicateByIdNumber) {
      isDuplicate = true
      duplicateReason = 'idNumber'
    }
    
    res.json({
      success: true,
      isDuplicate,
      duplicateReason
    })
  } catch (error) {
    console.error('檢查重複報名失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 檢查註冊狀態端點
app.get('/api/registrations/check/:eventId', (req, res) => {
  try {
    const { eventId } = req.params
    const { authorization } = req.headers
    
    if (!authorization) {
      return res.status(401).json({
        success: false,
        message: '未授權的請求'
      })
    }
    
    // 從 token 中獲取用戶信息（這裡簡化處理，實際應該解析 JWT）
    const token = authorization.split(' ')[1]
    const userEmail = Buffer.from(token, 'base64').toString('utf-8')
    
    // 檢查是否已經報名
    const isRegistered = Array.from(registrations.values())
      .some(reg => reg.eventId === eventId && reg.userData.email === userEmail)
    
    res.json({
      success: true,
      isRegistered
    })
  } catch (error) {
    console.error('檢查註冊狀態失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 驗證序號端點
app.post('/api/validate-code', (req, res) => {
  try {
    const { eventId, registrationCode } = req.body
    
    // 檢查活動是否存在
    const event = events.get(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '活動不存在'
      })
    }
    
    // 檢查序號是否存在
    const registration = registrations.get(registrationCode)
    if (!registration || registration.eventId !== eventId) {
      return res.status(400).json({
        success: false,
        message: '無效的序號'
      })
    }
    
    // 序號有效
    res.json({
      success: true,
      data: {
        name: registration.userData.name,
        email: registration.userData.email
      }
    })
  } catch (error) {
    console.error('驗證序號失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 購票端點
app.post('/api/purchase', (req, res) => {
  try {
    const { eventId, registrationCode, quantity } = req.body
    
    // 檢查活動是否存在
    const event = events.get(eventId)
    if (!event) {
      return res.status(404).json({
        success: false,
        message: '活動不存在'
      })
    }
    
    // 檢查序號是否存在且有效
    const registration = registrations.get(registrationCode)
    if (!registration || registration.eventId !== eventId) {
      return res.status(400).json({
        success: false,
        message: '無效的序號'
      })
    }
    
    // 檢查購買數量
    if (quantity <= 0 || quantity > 4) {
      return res.status(400).json({
        success: false,
        message: '購買數量必須在1-4張之間'
      })
    }
    
    // 生成訂單編號
    const orderNumber = `ORD${Date.now().toString(36).toUpperCase()}`
    
    // 儲存訂單資訊
    const order = {
      orderNumber,
      eventId,
      registrationCode,
      quantity,
      userData: registration.userData,
      purchaseTime: new Date().toISOString(),
      status: 'completed'
    }
    
    // 這裡應該添加訂單儲存的邏輯
    
    // 發送確認郵件
    // 這裡應該添加發送郵件的邏輯
    
    res.json({
      success: true,
      orderNumber
    })
  } catch (error) {
    console.error('購票失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 時間同步端點
app.get('/api/time', (req, res) => {
  res.json({
    success: true,
    time: new Date().toISOString()
  })
})

// 表單欄位 API
app.get('/api/form-fields', (req, res) => {
  try {
    const fieldsList = Array.from(formFields.values())
    res.json({
      success: true,
      data: fieldsList
    })
  } catch (error) {
    console.error('獲取表單欄位失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

app.post('/api/form-fields', adminAuth, (req, res) => {
  try {
    const fieldData = req.body
    const fieldId = uuidv4()
    
    if (!fieldData.field_label || !fieldData.field_name || !fieldData.field_element) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位'
      })
    }
    
    // 檢查欄位名稱是否已存在
    const existingField = Array.from(formFields.values()).find(field => 
      field.field_name === fieldData.field_name
    )
    
    if (existingField) {
      return res.status(400).json({
        success: false,
        message: '欄位名稱已存在'
      })
    }
    
    const newField = {
      id: fieldId,
      ...fieldData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    formFields.set(fieldId, newField)
    saveData()
    
    res.json({
      success: true,
      data: newField
    })
  } catch (error) {
    console.error('創建表單欄位失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 獲取單個表單欄位
app.get('/api/form-fields/:id', (req, res) => {
  try {
    const fieldId = req.params.id
    const field = formFields.get(fieldId)
    
    if (!field) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的表單欄位'
      })
    }
    
    res.json({
      success: true,
      data: field
    })
  } catch (error) {
    console.error('獲取表單欄位失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 更新表單欄位
app.put('/api/form-fields/:id', adminAuth, (req, res) => {
  try {
    const fieldId = req.params.id
    const fieldData = req.body
    const existingField = formFields.get(fieldId)
    
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的表單欄位'
      })
    }
    
    if (!fieldData.field_label || !fieldData.field_name || !fieldData.field_element) {
      return res.status(400).json({
        success: false,
        message: '請填寫所有必要欄位'
      })
    }
    
    // 檢查欄位名稱是否已存在（排除自己）
    const duplicateField = Array.from(formFields.values()).find(field => 
      field.field_name === fieldData.field_name && field.id !== fieldId
    )
    
    if (duplicateField) {
      return res.status(400).json({
        success: false,
        message: '欄位名稱已存在'
      })
    }
    
    const updatedField = {
      ...existingField,
      ...fieldData,
      updatedAt: new Date().toISOString()
    }
    
    formFields.set(fieldId, updatedField)
    saveData()
    
    res.json({
      success: true,
      data: updatedField
    })
  } catch (error) {
    console.error('更新表單欄位失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 刪除表單欄位
app.delete('/api/form-fields/:id', adminAuth, (req, res) => {
  try {
    const fieldId = req.params.id
    const existingField = formFields.get(fieldId)
    
    if (!existingField) {
      return res.status(404).json({
        success: false,
        message: '找不到指定的表單欄位'
      })
    }
    
    formFields.delete(fieldId)
    saveData()
    
    res.json({
      success: true,
      message: '表單欄位已刪除'
    })
  } catch (error) {
    console.error('刪除表單欄位失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 批量更新欄位順序
app.put('/api/form-fields/order', adminAuth, (req, res) => {
  try {
    const fieldsOrder = req.body
    
    if (!Array.isArray(fieldsOrder)) {
      return res.status(400).json({
        success: false,
        message: '無效的欄位順序資料'
      })
    }
    
    // 更新每個欄位的順序
    fieldsOrder.forEach((fieldOrder, index) => {
      const field = formFields.get(fieldOrder.id)
      if (field) {
        field.order = index
        field.updatedAt = new Date().toISOString()
        formFields.set(fieldOrder.id, field)
      }
    })
    
    saveData()
    
    res.json({
      success: true,
      message: '欄位順序已更新'
    })
  } catch (error) {
    console.error('更新欄位順序失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 驗證欄位名稱
app.post('/api/form-fields/validate', adminAuth, (req, res) => {
  try {
    const { field_name, exclude_id } = req.body
    
    if (!field_name) {
      return res.status(400).json({
        success: false,
        message: '請提供欄位名稱'
      })
    }
    
    const existingField = Array.from(formFields.values()).find(field => 
      field.field_name === field_name && field.id !== exclude_id
    )
    
    res.json({
      success: true,
      data: {
        isValid: !existingField,
        message: existingField ? '欄位名稱已存在' : '欄位名稱可用'
      }
    })
  } catch (error) {
    console.error('驗證欄位名稱失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 啟動伺服器前添加測試活動
const testEvent = {
  id: '1752127854994',
  name: '中信兄弟主場日',
  registrationStartTime: '2025-12-31T10:00:00.000Z',
  registrationEndTime: '2026-12-31T10:00:00.000Z',
  description: '2024年中信兄弟主場日特別活動，包含限量商品、球員見面會等精彩活動！',
  capacity: 1000,
  roundDuration: 5 * 60 * 1000, // 5分鐘，以毫秒為單位
  roundCapacity: 100, // 每輪次的容量
  createdAt: new Date().toISOString()
}
// ✅ 只在 events 為空時，才加測試活動
if (events.size === 0) {
events.set(testEvent.id, testEvent)
saveData()
}

// 資料查核專區 API 端點

// 獲取所有註冊資料 - 需要管理員權限
app.get('/api/admin/registrations', adminAuth, (req, res) => {
  try {
    const { eventId, search, page = 1, limit = 20 } = req.query
    
    let registrationList = Array.from(registrations.values())
    
    // 按活動篩選
    if (eventId) {
      registrationList = registrationList.filter(reg => reg.eventId === eventId)
    }
    
    // 搜尋功能
    if (search) {
      const searchLower = search.toLowerCase()
      registrationList = registrationList.filter(reg => 
        reg.userData.name.toLowerCase().includes(searchLower) ||
        reg.userData.email.toLowerCase().includes(searchLower) ||
        reg.userData.phone.includes(search) ||
        reg.userData.idNumber.toLowerCase().includes(searchLower) ||
        reg.registrationCode.toLowerCase().includes(searchLower)
      )
    }
    
    // 排序（最新的在前）
    registrationList.sort((a, b) => new Date(b.registrationTime) - new Date(a.registrationTime))
    
    // 分頁
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const startIndex = (pageNum - 1) * limitNum
    const endIndex = startIndex + limitNum
    const paginatedList = registrationList.slice(startIndex, endIndex)
    
    // 為每個註冊資料添加活動資訊
    const enrichedList = paginatedList.map(reg => {
      const event = events.get(reg.eventId)
      return {
        ...reg,
        eventName: event ? event.name : '未知活動',
        eventStatus: event ? event.status : 'unknown'
      }
    })
    
    res.json({
      success: true,
      data: enrichedList,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(registrationList.length / limitNum),
        totalItems: registrationList.length,
        itemsPerPage: limitNum
      }
    })
  } catch (error) {
    console.error('獲取註冊資料失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 檢測重複資料 - 需要管理員權限
app.get('/api/admin/registrations/duplicates', adminAuth, (req, res) => {
  try {
    const registrationList = Array.from(registrations.values())
    const duplicates = []
    
    // 按 email 分組檢測重複
    const emailGroups = {}
    registrationList.forEach(reg => {
      const email = reg.userData.email
      if (!emailGroups[email]) {
        emailGroups[email] = []
      }
      emailGroups[email].push(reg)
    })
    
    // 找出重複的 email
    Object.entries(emailGroups).forEach(([email, regs]) => {
      if (regs.length > 1) {
        duplicates.push({
          type: 'email',
          value: email,
          count: regs.length,
          registrations: regs.map(reg => ({
            ...reg,
            eventName: events.get(reg.eventId)?.name || '未知活動'
          }))
        })
      }
    })
    
    // 按身分證號碼分組檢測重複
    const idNumberGroups = {}
    registrationList.forEach(reg => {
      const idNumber = reg.userData.idNumber
      if (!idNumberGroups[idNumber]) {
        idNumberGroups[idNumber] = []
      }
      idNumberGroups[idNumber].push(reg)
    })
    
    // 找出重複的身分證號碼
    Object.entries(idNumberGroups).forEach(([idNumber, regs]) => {
      if (regs.length > 1) {
        duplicates.push({
          type: 'idNumber',
          value: idNumber,
          count: regs.length,
          registrations: regs.map(reg => ({
            ...reg,
            eventName: events.get(reg.eventId)?.name || '未知活動'
          }))
        })
      }
    })
    
    res.json({
      success: true,
      data: duplicates,
      summary: {
        totalDuplicates: duplicates.length,
        emailDuplicates: duplicates.filter(d => d.type === 'email').length,
        idNumberDuplicates: duplicates.filter(d => d.type === 'idNumber').length
      }
    })
  } catch (error) {
    console.error('檢測重複資料失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 匯出註冊資料 - 需要管理員權限
app.get('/api/admin/registrations/export', adminAuth, (req, res) => {
  try {
    const { eventId, format = 'json' } = req.query
    
    let registrationList = Array.from(registrations.values())
    
    // 按活動篩選
    if (eventId) {
      registrationList = registrationList.filter(reg => reg.eventId === eventId)
    }
    
    // 為每個註冊資料添加活動資訊
    const exportData = registrationList.map(reg => {
      const event = events.get(reg.eventId)
      return {
        註冊序號: reg.registrationCode,
        活動名稱: event ? event.name : '未知活動',
        姓名: reg.userData.name,
        身分證號碼: reg.userData.idNumber,
        電子郵件: reg.userData.email,
        手機號碼: reg.userData.phone,
        出生日期: reg.userData.birthdate || '',
        性別: reg.userData.gender === 'male' ? '男' : reg.userData.gender === 'female' ? '女' : '',
        地址: reg.userData.address || '',
        註冊時間: new Date(reg.registrationTime).toLocaleString('zh-TW')
      }
    })
    
    if (format === 'csv') {
      // CSV 格式
      const csvHeaders = Object.keys(exportData[0] || {}).join(',')
      const csvRows = exportData.map(row => 
        Object.values(row).map(value => `"${value}"`).join(',')
      )
      const csvContent = [csvHeaders, ...csvRows].join('\n')
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8')
      res.setHeader('Content-Disposition', `attachment; filename="registrations_${new Date().toISOString().split('T')[0]}.csv"`)
      res.send('\uFEFF' + csvContent) // 添加 BOM 以支援中文
    } else {
      // JSON 格式
      res.json({
        success: true,
        data: exportData,
        exportTime: new Date().toISOString(),
        totalRecords: exportData.length
      })
    }
  } catch (error) {
    console.error('匯出註冊資料失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 刪除註冊資料 - 需要管理員權限
app.delete('/api/admin/registrations/:registrationCode', adminAuth, (req, res) => {
  try {
    const { registrationCode } = req.params
    
    if (!registrations.has(registrationCode)) {
      return res.status(404).json({
        success: false,
        message: '找不到此註冊資料'
      })
    }
    
    const registration = registrations.get(registrationCode)
    registrations.delete(registrationCode)
    
    // 儲存到檔案
    saveData()
    
    console.log('刪除註冊資料：', registrationCode)
    
    res.json({
      success: true,
      message: '註冊資料已刪除',
      deletedRegistration: registration
    })
  } catch (error) {
    console.error('刪除註冊資料失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 獲取註冊統計資料 - 需要管理員權限
app.get('/api/admin/registrations/stats', adminAuth, (req, res) => {
  try {
    const registrationList = Array.from(registrations.values())
    const eventList = Array.from(events.values())
    
    // 基本統計
    const totalRegistrations = registrationList.length
    const totalEvents = eventList.length
    
    // 按活動統計
    const eventStats = {}
    eventList.forEach(event => {
      eventStats[event.id] = {
        eventName: event.name,
        capacity: event.capacity,
        registrations: 0,
        registrationRate: 0
      }
    })
    
    registrationList.forEach(reg => {
      if (eventStats[reg.eventId]) {
        eventStats[reg.eventId].registrations++
      }
    })
    
    // 計算註冊率
    Object.values(eventStats).forEach(stat => {
      stat.registrationRate = stat.capacity > 0 ? (stat.registrations / stat.capacity * 100).toFixed(2) : 0
    })
    
    // 按日期統計
    const dateStats = {}
    registrationList.forEach(reg => {
      const date = new Date(reg.registrationTime).toISOString().split('T')[0]
      dateStats[date] = (dateStats[date] || 0) + 1
    })
    
    // 最近 7 天的統計
    const last7Days = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      last7Days.push({
        date: dateStr,
        count: dateStats[dateStr] || 0
      })
    }
    
    res.json({
      success: true,
      data: {
        summary: {
          totalRegistrations,
          totalEvents,
          averageRegistrationsPerEvent: totalEvents > 0 ? (totalRegistrations / totalEvents).toFixed(2) : 0
        },
        eventStats: Object.values(eventStats),
        dailyStats: last7Days,
        allDateStats: dateStats
      }
    })
  } catch (error) {
    console.error('獲取註冊統計失敗：', error)
    res.status(500).json({
      success: false,
      message: '系統錯誤，請稍後再試'
    })
  }
})

// 啟動伺服器
app.listen(PORT, () => {
  console.log(`伺服器運行於 http://localhost:${PORT}`)
})

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，準備關閉伺服器')
  transporter.close()
  process.exit(0)
})

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，準備關閉伺服器')
  transporter.close()
  process.exit(0)
})

// SPA 路由處理 - 所有未匹配的路由都返回 index.html
if (NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'))
  })
}
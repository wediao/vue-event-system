<template>
  <div class="result-container">
    <div class="result-card">
      <h2>報名完成 ✅</h2>
      <div v-if="ticketInfo" class="ticket-info">
        <p class="name">{{ ticketInfo.name }}</p>
        <p class="serial">序號：<strong>{{ ticketInfo.serial }}</strong></p>
        <p class="email">已寄送確認信至：{{ ticketInfo.email }}</p>
      </div>
      <div v-else class="no-info">
        <p>找不到報名資訊</p>
      </div>
      <router-link to="/" class="home-link">
        <button>返回首頁</button>
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import emailjs from '@emailjs/browser'

// EmailJS 配置
const EMAILJS_SERVICE_ID = 'service_lx7y5ng'
const EMAILJS_TEMPLATE_ID = 'template_8goqj4c'
const EMAILJS_PUBLIC_KEY = '-mL8c2UKLiyNbr4H1'

const ticketInfo = ref(null)

// 初始化 EmailJS
onMounted(() => {
  emailjs.init(EMAILJS_PUBLIC_KEY)
})

// 封裝寄信功能
const sendEmail = async (info) => {
  if (!info) {
    console.error('❌ 沒有報名資訊可發送')
    return
  }

  try {
    console.log('✅ 準備發送郵件，報名資訊：', info)

    const templateParams = {
      to_name: info.name,
      to_email: info.email,
      event_name: info.eventName || '活動',
      registration_code: info.serial,
      sale_start_time: info.registrationStartTime || '尚未設定',
      message: `登記成功！

活動名稱：
${info.eventName || '活動'}

登記序號：
${info.serial}

開放搶購時間：
${info.registrationStartTime || '尚未設定'}

重要提醒：
請準時於開放時間登入系統
使用登記序號進行搶購
逾時未購票將失效

桃園機場捷運活動系統`
    }

    console.log('✅ 發送 EmailJS 參數：', templateParams)

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      templateParams,
      EMAILJS_PUBLIC_KEY
    )

    if (response.status === 200) {
      console.log('✅ 郵件發送成功：', response)
    } else {
      throw new Error('郵件發送失敗：' + response.text)
    }

  } catch (error) {
    console.error('❌ EmailJS 錯誤詳情：', {
      message: error.message,
      status: error.status,
      text: error.text,
      details: error
    })
    alert('發送通知信失敗：' + (error.text || error.message || '未知錯誤'))
  }
}

// 頁面載入時讀取 localStorage 並發信
onMounted(() => {
  try {
    const storedInfo = localStorage.getItem('ticketInfo')
    if (storedInfo) {
      ticketInfo.value = JSON.parse(storedInfo)
      console.log('✅ 已讀取報名資訊：', ticketInfo.value)
      sendEmail(ticketInfo.value)
    } else {
      console.warn('⚠️ 找不到報名資訊')
    }
  } catch (error) {
    console.error('❌ 讀取報名資訊失敗：', error)
  }
})
</script>

<style scoped>
.result-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
  background: #f5f5f5;
}
.result-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  text-align: center;
  max-width: 400px;
  width: 100%;
}
h2 {
  font-size: 2rem;
  margin-bottom: 2rem;
  color: #333;
}
.ticket-info {
  margin: 2rem 0;
  padding: 1rem;
  background: #f8f8f8;
  border-radius: 8px;
}
.name {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}
.serial {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #2c3e50;
}
.serial strong {
  color: #42b983;
  letter-spacing: 1px;
}
.email {
  color: #666;
  font-size: 0.9rem;
}
.no-info {
  color: #666;
  margin: 2rem 0;
}
button {
  background: #42b983;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 6px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.3s;
}
button:hover {
  background: #3aa876;
}
.home-link {
  text-decoration: none;
}
</style>
  
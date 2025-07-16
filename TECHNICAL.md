# 活動報名系統技術文檔

## 目錄
1. [專案結構](#專案結構)
2. [核心組件](#核心組件)
3. [資料結構](#資料結構)
4. [Firebase 配置](#Firebase配置)
5. [路由配置](#路由配置)
6. [狀態管理](#狀態管理)

## 專案結構

my-vue-app/
├── src/
│   ├── assets/          # 靜態資源
│   ├── components/      # 共用組件
│   ├── views/          # 頁面組件
│   ├── router/         # 路由配置
│   ├── utils/          # 工具函數
│   ├── firebase.js     # Firebase 配置
│   ├── main.js         # 應用入口
│   └── App.vue         # 根組件
├── public/             # 公共資源
├── index.html          # HTML 模板
├── vite.config.js      # Vite 配置
└── package.json        # 專案配置

## 核心組件

### 1. App.vue (根組件)

<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script setup>
// 根組件配置
</script>

### 2. Home.vue (首頁)

<template>
  <div class="home-container">
    <!-- 頂部橫幅 -->
    <section class="hero-section">
      <div class="hero-content">
        <img src="../assets/penguin-glasses.png" alt="Logo" class="hero-logo">
        <h1>活動報名系統</h1>
        <p class="hero-subtitle">輕鬆報名、即時通知、安心參與</p>
        <router-link to="/events" class="cta-button">
          瀏覽活動
          <span class="arrow">→</span>
        </router-link>
      </div>
    </section>

    <!-- 最新活動列表 -->
    <section class="recent-events-section">
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
      </div>
      <div v-else class="events-grid">
        <div v-for="event in recentEvents" :key="event.id" class="event-card">
          <!-- 活動卡片內容 -->
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

// 數據狀態
const loading = ref(true)
const recentEvents = ref([])

// 獲取最新活動
const fetchRecentEvents = async () => {
  try {
    const q = query(
      collection(db, 'events'),
      orderBy('createdAt', 'desc'),
      limit(6)
    )
    const querySnapshot = await getDocs(q)
    recentEvents.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
  } finally {
    loading.value = false
  }
}

// 生命週期鉤子
onMounted(() => {
  fetchRecentEvents()
})
</script>

### 3. EventList.vue (活動列表)

<template>
  <div class="event-list-container">
    <div class="events-grid">
      <div v-for="event in events" :key="event.id" class="event-card">
        <img :src="event.image" :alt="event.name" class="event-image">
        <div class="event-content">
          <h2>{{ event.name }}</h2>
          <p class="event-description">{{ event.description }}</p>
          <div class="event-status" :class="event.status">
            {{ getStatusText(event.status) }}
          </div>
          <div class="action-buttons">
            <router-link :to="'/event/' + event.id" class="view-detail-btn">
              查看詳情
            </router-link>
            <!-- 條件渲染的按鈕 -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../firebase'

const events = ref([])

// 狀態文字映射
const getStatusText = (status) => {
  const statusMap = {
    'upcoming': '即將開始報名',
    'registration': '報名中',
    'registered': '報名結束',
    'sale': '搶購中',
    'ended': '活動結束'
  }
  return statusMap[status] || status
}

// 獲取活動列表
const fetchEvents = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'events'))
    events.value = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error('Error fetching events:', error)
  }
}

onMounted(() => {
  fetchEvents()
})
</script>

### 4. EventDetail.vue (活動詳情)

<template>
  <div class="event-detail-container">
    <div v-if="loading" class="loading">
      <div class="loading-spinner"></div>
    </div>

    <div v-else-if="event" class="event-detail">
      <div class="event-header">
        <img :src="event.image" :alt="event.name" class="event-banner">
        <div class="event-status-banner" :class="event.status">
          {{ getStatusText(event.status) }}
        </div>
      </div>

      <div class="event-content">
        <h1>{{ event.name }}</h1>
        <div class="event-meta">
          <!-- 活動資訊 -->
        </div>
        <div class="event-description">
          <h2>活動說明</h2>
          <div v-html="event.description"></div>
        </div>
        <!-- 倒數計時和按鈕 -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../firebase'

const route = useRoute()
const event = ref(null)
const loading = ref(true)

// 獲取活動詳情
const fetchEvent = async () => {
  try {
    const docRef = doc(db, 'events', route.params.id)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      event.value = {
        id: docSnap.id,
        ...docSnap.data()
      }
    }
  } catch (error) {
    console.error('Error fetching event:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchEvent()
})
</script>

## 資料結構

### Firebase 集合結構

1. **events 集合**

interface Event {
  id: string;
  name: string;
  description: string;
  image: string;
  eventDate: string;
  registrationStartDate: string;
  registrationEndDate: string;
  saleStartDate: string;
  price: number;
  status: 'upcoming' | 'registration' | 'registered' | 'sale' | 'ended';
  rules: string[];
  createdAt: Timestamp;
}

2. **registrations 集合**

interface Registration {
  id: string;
  eventId: string;
  name: string;
  email: string;
  phone: string;
  serial: string;
  status: 'registered' | 'purchased' | 'cancelled';
  registrationDate: Timestamp;
  purchaseDate?: Timestamp;
}

## Firebase 配置

// src/firebase.js
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

## 路由配置

// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import EventList from '../views/EventList.vue'
import EventDetail from '../views/EventDetail.vue'
import SignUp from '../views/SignUp.vue'
import Purchase from '../views/Purchase.vue'
import QueryResult from '../views/QueryResult.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/events',
    name: 'EventList',
    component: EventList
  },
  {
    path: '/event/:id',
    name: 'EventDetail',
    component: EventDetail
  },
  {
    path: '/signup/:eventId',
    name: 'SignUp',
    component: SignUp
  },
  {
    path: '/purchase/:eventId',
    name: 'Purchase',
    component: Purchase
  },
  {
    path: '/query',
    name: 'QueryResult',
    component: QueryResult
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router

## 共用組件

### 1. LoadingSpinner.vue

<template>
  <div class="loading-spinner"></div>
</template>

<style scoped>
.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #42b983;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>

### 2. StatusBadge.vue

<template>
  <div class="status-badge" :class="status">
    {{ getStatusText(status) }}
  </div>
</template>

<script setup>
const props = defineProps({
  status: {
    type: String,
    required: true
  }
})

const getStatusText = (status) => {
  const statusMap = {
    'upcoming': '即將開始報名',
    'registration': '報名中',
    'registered': '報名結束',
    'sale': '搶購中',
    'ended': '活動結束'
  }
  return statusMap[status] || status
}
</script>

## 工具函數

// src/utils/test-utils.js

// 日期格式化
export const formatDate = (dateString, withTime = false) => {
  if (!dateString) return ''
  
  const date = new Date(dateString)
  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...(withTime && {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  return date.toLocaleDateString('zh-TW', options)
}

// 序號生成
export const generateSerial = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let serial = ''
  for (let i = 0; i < 7; i++) {
    serial += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return serial
}

// 倒數計時計算
export const calculateCountdown = (targetDate) => {
  const now = new Date()
  const target = new Date(targetDate)
  const diff = target - now

  if (diff <= 0) return null

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds }
}

## 樣式指南

所有組件都使用 Scoped CSS，確保樣式不會互相影響。主要的顏色變量：

:root {
  --primary-color: #42b983;
  --secondary-color: #2c3e50;
  --danger-color: #ff4081;
  --warning-color: #f57f17;
  --success-color: #2e7d32;
  --info-color: #1976d2;
  --gray-light: #f5f5f5;
  --gray-dark: #666;
}

## 測試

使用 Vitest 進行單元測試：

// src/views/__tests__/EventDetail.spec.js
import { mount } from '@vue/test-utils'
import { describe, it, expect } from 'vitest'
import EventDetail from '../EventDetail.vue'

describe('EventDetail.vue', () => {
  it('renders loading state', () => {
    const wrapper = mount(EventDetail)
    expect(wrapper.find('.loading-spinner').exists()).toBe(true)
  })

  it('displays event information when loaded', async () => {
    // 測試代碼
  })
}) 
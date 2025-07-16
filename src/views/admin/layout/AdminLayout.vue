<template>
  <div class="admin-page">
    <!-- 頂部導航 -->
    <nav class="admin-nav">
      <router-link to="/admin" class="nav-item" active-class="active" exact>
        儀表板
      </router-link>
      <router-link to="/admin/events" class="nav-item" active-class="active">
        活動管理
      </router-link>
      <router-link to="/admin/data-verification" class="nav-item" active-class="active">
        資料查核
      </router-link>
      <router-link to="/admin/tickets" class="nav-item" active-class="active">
        票券管理
      </router-link>
      <router-link to="/admin/users" class="nav-item" active-class="active">
        用戶管理
      </router-link>
    </nav>

    <!-- 頁面內容 -->
    <div class="admin-content">
      <!-- 側邊欄 -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <h1>管理後台</h1>
        </div>

        <!-- 功能導引 -->
        <div class="guide-section">
          <h2>快速導引</h2>
          <div class="guide-buttons">
            <button 
              v-for="guide in guides" 
              :key="guide.path"
              class="guide-btn"
              :class="{ 'active': currentPath === guide.path }"
              @click="navigateTo(guide.path)"
            >
              <span class="guide-icon">{{ guide.icon }}</span>
              <div class="guide-content">
                <span class="guide-title">{{ guide.title }}</span>
                <span class="guide-desc">{{ guide.description }}</span>
              </div>
            </button>
          </div>
        </div>

        <div class="sidebar-footer">
          <div class="admin-info">
            <span class="admin-name">{{ adminName }}</span>
            <span class="admin-role">系統管理員</span>
          </div>
          <button class="btn-logout" @click="handleLogout">
            登出
          </button>
        </div>
      </aside>

      <!-- 主要內容區 -->
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const adminName = ref('Admin User')

// 當前路徑
const currentPath = computed(() => route.path)

// 導引按鈕配置
const guides = [
  {
    title: '新增活動',
    description: '建立新的活動和設定時間',
    path: '/admin/events',  // 修改路徑，改用活動列表頁的新增按鈕
    icon: '📅'
  },
  {
    title: '活動列表',
    description: '管理和編輯現有活動',
    path: '/admin/events',
    icon: '📋'
  },
  {
    title: '資料查核',
    description: '查看註冊資料和重複檢測',
    path: '/admin/data-verification',
    icon: '🔍'
  },
  {
    title: '票券管理',
    description: '查看和處理票券狀態',
    path: '/admin/tickets',
    icon: '🎫'
  },
  {
    title: '用戶管理',
    description: '管理用戶帳號和權限',
    path: '/admin/users',
    icon: '👥'
  },
  {
    title: '活動報表',
    description: '查看活動數據和分析',
    path: '/admin/reports',
    icon: '📊'
  },
  {
    title: '系統設定',
    description: '管理系統參數和配置',
    path: '/admin/settings',
    icon: '⚙️'
  }
]

// 導航函數
const navigateTo = (path) => {
  router.push(path)
}

const handleLogout = () => {
  // 清除所有身份驗證相關的資訊
  localStorage.removeItem('adminToken')
  localStorage.removeItem('isAuthenticated')
  localStorage.removeItem('userRole')
  localStorage.removeItem('userPermissions')
  
  // 導向登入頁面
  router.push('/admin/login')
}
</script>

<style scoped>
.admin-page {
  min-height: 100vh;
  background-color: #f5f5f5;
}

.admin-nav {
  background: #1a1a1a;
  padding: 0 20px;
  height: 50px;
  display: flex;
  align-items: center;
  gap: 20px;
}

.nav-item {
  color: #fff;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-item:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
  background-color: #6200ee;
}

.admin-content {
  display: flex;
  min-height: calc(100vh - 50px);
}

.sidebar {
  width: 250px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.sidebar-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 30px;
}

.mascot-logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.sidebar-header h1 {
  margin: 0;
  font-size: 1.2em;
  color: #333;
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.admin-info {
  display: flex;
  flex-direction: column;
  margin-bottom: 10px;
}

.admin-name {
  font-weight: 500;
  color: #333;
}

.admin-role {
  font-size: 0.9em;
  color: #666;
}

.btn-logout {
  width: 100%;
  padding: 8px;
  background: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background: #d32f2f;
}

.main-content {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
}

.guide-section {
  margin-bottom: 30px;
}

.guide-section h2 {
  font-size: 1em;
  color: #666;
  margin: 0 0 15px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.guide-buttons {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.guide-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.guide-btn:hover {
  background: #f5f5f5;
  border-color: #d0d0d0;
  transform: translateY(-1px);
}

.guide-btn.active {
  background: #f0f7ff;
  border-color: #6200ee;
}

.guide-icon {
  font-size: 1.5em;
  min-width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.guide-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.guide-title {
  font-weight: 500;
  color: #333;
}

.guide-desc {
  font-size: 0.85em;
  color: #666;
}
</style> 
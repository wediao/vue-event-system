<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="logo">
        <CircularLogo 
          size="small" 
          theme="purple" 
          logo-src="/logo.png" 
          alt-text="TYMetro Logo"
        />
        <span class="logo-text">TYMetro</span>
      </router-link>
    </div>
    
    <div class="nav-links">
      <router-link to="/" class="nav-link">首頁</router-link>
      <router-link to="/events" class="nav-link">活動列表</router-link>
      <div class="nav-dropdown" ref="dropdownRef">
        <span class="nav-link dropdown-trigger" @click="toggleDropdown">🎫 搶購專區</span>
        <div class="dropdown-menu" :class="{ show: showDropdown }">
          <router-link to="/purchase/1752127854994" class="dropdown-item" @click="showDropdown = false">
            🎯 立即搶購
          </router-link>
          <router-link to="/query" class="dropdown-item" @click="showDropdown = false">
            🔍 查詢訂單
          </router-link>
        </div>
      </div>
      <template v-if="authStore.isAuthenticated">
        <router-link to="/user/orders" class="nav-link">我的票券</router-link>
      </template>
    </div>

    <div class="auth-links">
      <template v-if="authStore.isAuthenticated">
        <span class="user-info">
          <span class="user-name">{{ authStore.user?.displayName || authStore.user?.username }}</span>
        <span class="user-role">{{ authStore.userRole === 'admin' ? '管理員' : '會員' }}</span>
        </span>
        <router-link 
          v-if="authStore.userRole === 'admin'" 
          to="/admin" 
          class="auth-button admin"
        >
          後台管理
        </router-link>
        <button @click="handleLogout" class="auth-button logout">登出</button>
      </template>
      <template v-else>
        <router-link to="/register" class="auth-button signup">註冊</router-link>
        <router-link to="/login" class="auth-button login">登入</router-link>
      </template>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'
import { ref, onMounted, onUnmounted } from 'vue'
import CircularLogo from './CircularLogo.vue'

const router = useRouter()
const authStore = useAuthStore()
const showDropdown = ref(false)
const dropdownRef = ref(null)

const handleLogout = () => {
  authStore.logout()
  router.push('/')
}

const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const closeDropdown = (event) => {
  if (dropdownRef.value && !dropdownRef.value.contains(event.target)) {
    showDropdown.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', closeDropdown)
})

onUnmounted(() => {
  document.removeEventListener('click', closeDropdown)
})
</script>

<style scoped>
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.navbar-brand {
  display: flex;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: #333;
  gap: 0.75rem;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  gap: 2rem;
}

.nav-link {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #6366f1;
}

.nav-dropdown {
  position: relative;
}

.dropdown-trigger {
  cursor: pointer;
  color: #333;
  font-weight: 500;
  transition: color 0.2s;
}

.dropdown-trigger:hover {
  color: #6366f1;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 150px;
  display: none; /* Hidden by default */
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0;
  margin-top: 0.5rem;
}

.dropdown-menu.show {
  display: flex;
}

.dropdown-item {
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: #333;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.dropdown-item:hover {
  background-color: #f3f4f6;
  color: #6366f1;
}

.auth-links {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f3f4f6;
  border-radius: 0.375rem;
}

.user-name {
  color: #374151;
  font-weight: 500;
}

.user-role {
  color: #6366f1;
  font-size: 0.875rem;
  font-weight: 500;
  padding: 0.25rem 0.5rem;
  background-color: #e0e7ff;
  border-radius: 0.25rem;
}

.auth-button {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  text-decoration: none;
  transition: all 0.2s;
}

.login {
  color: #6366f1;
  border: 1px solid #6366f1;
  background-color: transparent;
}

.login:hover {
  background-color: #6366f1;
  color: white;
}

.signup {
  background-color: #6366f1;
  color: white;
  border: 1px solid #6366f1;
}

.signup:hover {
  background-color: #4f46e5;
  border-color: #4f46e5;
}

.logout {
  color: #ef4444;
  border: 1px solid #ef4444;
  background-color: transparent;
  cursor: pointer;
}

.logout:hover {
  background-color: #ef4444;
  color: white;
}

.admin {
  color: #059669;
  border: 1px solid #059669;
  background-color: transparent;
}

.admin:hover {
  background-color: #059669;
  color: white;
}
</style> 
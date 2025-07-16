import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

// 定義角色和權限
const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  STAFF: 'staff',
  USER: 'user'
}

const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['manage_all', 'view_all', 'edit_all', 'delete_all'],
  [ROLES.MANAGER]: ['manage_events', 'view_all', 'edit_events', 'view_reports'],
  [ROLES.STAFF]: ['view_events', 'edit_events'],
  [ROLES.USER]: ['view_public', 'register_events']
}

export const useAuthStore = defineStore('auth', () => {
  // 將 router 移到內部，只在需要時初始化
  let router
  const isAuthenticated = ref(false)
  const userRole = ref('')
  const userPermissions = ref([])
  const userData = ref(null)
  
  // 計算屬性：檢查角色
  const isAdmin = computed(() => userRole.value === ROLES.ADMIN)
  const isManager = computed(() => userRole.value === ROLES.MANAGER)
  const isStaff = computed(() => userRole.value === ROLES.STAFF)
  const isUser = computed(() => userRole.value === ROLES.USER)
  
  // 檢查權限
  const hasPermission = (permission) => {
    return userPermissions.value.includes(permission)
  }
  
  // 登入
  function login(role = ROLES.USER, user = {}) {
    isAuthenticated.value = true
    userRole.value = role
    userPermissions.value = ROLE_PERMISSIONS[role] || []
    userData.value = {
      ...user,
      role,
      loginTime: new Date().toISOString()
    }
    
    // 儲存到 localStorage
    localStorage.setItem('isAuthenticated', 'true')
    localStorage.setItem('userRole', role)
    localStorage.setItem('userPermissions', JSON.stringify(userPermissions.value))
    
    // 為管理員生成特殊的 token
    if (role === ROLES.ADMIN) {
      const adminToken = btoa(`admin-${new Date().getTime()}`) // 簡單的 token 生成方式
      localStorage.setItem('adminToken', adminToken)
    }
  }
  
  // 登出
  function logout() {
    isAuthenticated.value = false
    userRole.value = ''
    userPermissions.value = []
    userData.value = null
    
    // 清除 localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userPermissions')
    localStorage.removeItem('adminToken')
    
    // 確保 router 已初始化
    if (!router) {
      router = useRouter()
    }
    
    // 檢查 router 是否可用
    if (router) {
      router.push('/login')
    } else {
      console.error('Router is not available')
      // 如果 router 不可用，可以使用 window.location
      window.location.href = '/login'
    }
  }
  
  // 初始化狀態
  function initializeAuth() {
    const storedIsAuthenticated = localStorage.getItem('isAuthenticated')
    const storedRole = localStorage.getItem('userRole')
    const storedPermissions = localStorage.getItem('userPermissions')
    const storedAdminToken = localStorage.getItem('adminToken')
    
    if (storedIsAuthenticated === 'true' && storedRole) {
      isAuthenticated.value = true
      userRole.value = storedRole
      userPermissions.value = JSON.parse(storedPermissions || '[]')
      
      // 如果是管理員，確保有 token
      if (storedRole === ROLES.ADMIN) {
        if (!storedAdminToken) {
          const adminToken = btoa(`admin-${new Date().getTime()}`)
          localStorage.setItem('adminToken', adminToken)
        }
      } else {
        // 如果不是管理員，確保清除 adminToken
        localStorage.removeItem('adminToken')
      }
    } else {
      // 如果沒有認證信息，清除所有相關數據
      isAuthenticated.value = false
      userRole.value = ''
      userPermissions.value = []
      localStorage.removeItem('adminToken')
    }
  }

  return {
    // 狀態
    isAuthenticated,
    userRole,
    userPermissions,
    userData,
    
    // 角色檢查
    isAdmin,
    isManager,
    isStaff,
    isUser,
    
    // 方法
    login,
    logout,
    initializeAuth,
    hasPermission,
    
    // 常量
    ROLES,
    ROLE_PERMISSIONS
  }
}) 
import { createRouter, createWebHistory } from 'vue-router'

// 一般用戶頁面
const Home = () => import('../views/Home.vue')
const EventList = () => import('../views/EventList.vue')
const EventRegistration = () => import('../views/EventRegistration.vue')
const EventDetail = () => import('../views/EventDetail.vue')
const QueryResult = () => import('../views/QueryResult.vue')
const Login = () => import('../views/Login.vue')
const Purchase = () => import('../views/Purchase.vue')
const UserLayout = () => import('../views/user/UserLayout.vue')
const UserProfile = () => import('../views/user/UserProfile.vue')
const UserOrders = () => import('../views/user/UserOrders.vue')

// 管理者頁面
const AdminLogin = () => import('../views/admin/auth/AdminLogin.vue')
const AdminLayout = () => import('../views/admin/layout/AdminLayout.vue')
const AdminDashboard = () => import('../views/admin/AdminDashboard.vue')
const EventManagementList = () => import('../views/admin/events/EventManagementList.vue')
const EventManagementDetail = () => import('../views/admin/events/EventManagementDetail.vue')
const DataVerification = () => import('../views/admin/DataVerification.vue')
const TicketManagement = () => import('../views/admin/tickets/TicketManagement.vue')
const AdminUserManagement = () => import('../views/admin/AdminUserManagement.vue')
const ReportDashboard = () => import('../views/admin/reports/ReportDashboard.vue')
const SystemSettings = () => import('../views/admin/settings/SystemSettings.vue')

const CheckboxDemo = () => import('../views/CheckboxDemo.vue')
const RegistrationSuccess = () => import('../views/RegistrationSuccess.vue')

const routes = [
  // 一般用戶路由
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: {
      title: '首頁',
      group: 'user'
    }
  },
  {
    path: '/checkbox-demo',
    name: 'CheckboxDemo',
    component: CheckboxDemo,
    meta: {
      title: 'Checkbox 組件示例',
      group: 'demo'
    }
  },
  {
    path: '/events',
    name: 'EventList',
    component: EventList,
    meta: {
      title: '活動列表',
      group: 'user'
    }
  },
  {
    path: '/event/:eventId',
    name: 'EventDetail',
    component: EventDetail,
    meta: {
      title: '活動詳情',
      group: 'user'
    }
  },
  {
    path: '/register/:eventId',
    name: 'EventRegistration',
    component: EventRegistration,
    meta: {
      title: '活動登記',
      group: 'user'
    }
  },
  {
    path: '/registration-success/:registrationId',
    name: 'RegistrationSuccess',
    component: RegistrationSuccess,
    meta: {
      title: '登記成功',
      group: 'user'
    }
  },
  // 搶購頁面 - 獨立路由
  {
    path: '/purchase/:eventId',
    name: 'Purchase',
    component: Purchase,
    meta: {
      title: '活動搶購',
      group: 'user',
      requiresRegistration: true // 標記需要先完成登記
    }
  },
  {
    path: '/query',
    name: 'QueryResult',
    component: QueryResult,
    meta: {
      title: '查詢結果',
      group: 'user'
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: {
      title: '會員登入',
      group: 'user'
    }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: {
      title: '會員註冊',
      group: 'user'
    }
  },
  {
    path: '/user',
    component: UserLayout,
    meta: { 
      requiresAuth: true,
      title: '會員中心',
      group: 'user'
    },
    children: [
      {
        path: 'profile',
        name: 'UserProfile',
        component: UserProfile,
        meta: {
          title: '會員資料',
          group: 'user'
        }
      },
      {
        path: 'orders',
        name: 'UserTickets',
        component: UserOrders,
        meta: {
          title: '我的票券',
          group: 'user'
        }
      }
    ]
  },

  // 管理者路由
  {
    path: '/admin/login',
    name: 'AdminLogin',
    component: AdminLogin,
    meta: {
      title: '管理員登入',
      group: 'admin'
    }
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { 
      requiresAdmin: true,
      group: 'admin'
    },
    children: [
      {
        path: '',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { 
          title: '儀表板',
          group: 'admin'
        }
      },
      {
        path: 'events',
        name: 'EventManagementList',
        component: EventManagementList,
        meta: { 
          title: '活動管理',
          group: 'admin'
        }
      },
      {
        path: 'events/:id',
        name: 'EventManagementDetail',
        component: EventManagementDetail,
        meta: { 
          title: '管理活動',
          group: 'admin'
        }
      },
      {
        path: 'data-verification',
        name: 'DataVerification',
        component: DataVerification,
        meta: { 
          title: '資料查核',
          group: 'admin'
        }
      },
      {
        path: 'tickets',
        name: 'TicketManagement',
        component: TicketManagement,
        meta: { 
          title: '票券管理',
          group: 'admin'
        }
      },
      {
        path: 'users',
        name: 'AdminUserManagement',
        component: AdminUserManagement,
        meta: { 
          title: '用戶管理',
          group: 'admin'
        }
      },
      {
        path: 'reports',
        name: 'ReportDashboard',
        component: ReportDashboard,
        meta: { 
          title: '活動報表',
          group: 'admin'
        }
      },
      {
        path: 'settings',
        name: 'SystemSettings',
        component: SystemSettings,
        meta: { 
          title: '系統設定',
          group: 'admin'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

// 路由守衛
router.beforeEach((to, from, next) => {
  // 更新頁面標題
  document.title = `${to.meta.title} - 桃園機場捷運票券系統`

  // 檢查是否需要管理員權限
  if (to.matched.some(record => record.meta.requiresAdmin)) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    const userRole = localStorage.getItem('userRole')
    const adminToken = localStorage.getItem('adminToken')
    
    if (!isAuthenticated || userRole !== 'admin' || !adminToken) {
      next({
        path: '/admin/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  // 檢查是否需要一般用戶登入權限
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true'
    
    if (!isAuthenticated) {
      next({
        path: '/login',
        query: { redirect: to.fullPath }
      })
      return
    }
  }
  
  next()
})

export default router

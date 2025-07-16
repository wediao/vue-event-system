import { render } from '@testing-library/vue'
import { createRouter, createWebHistory } from 'vue-router'
import { routes } from '../router'

// 創建測試用路由
export function createTestRouter() {
  return createRouter({
    history: createWebHistory(),
    routes
  })
}

// 模擬 Firebase 資料
export const mockFirebase = {
  events: [
    {
      id: 'test-event-1',
      name: '測試活動 1',
      description: '這是一個測試活動',
      image: 'test-image.jpg',
      price: 1000,
      status: 'registration',
      registrationStartDate: '2024-03-01T00:00:00Z',
      registrationEndDate: '2024-03-31T23:59:59Z',
      saleStartDate: '2024-04-01T10:00:00Z',
      eventDate: '2024-04-15T00:00:00Z'
    }
  ],
  registrations: [
    {
      id: 'test-registration-1',
      eventId: 'test-event-1',
      serial: 'TEST123',
      name: '測試用戶',
      email: 'test@example.com',
      phone: '0912345678',
      status: 'registered',
      registrationDate: '2024-03-15T08:30:00Z'
    }
  ]
}

// 模擬 Firestore 方法
export const mockFirestore = {
  collection: () => ({
    doc: (id) => ({
      get: async () => ({
        exists: true,
        data: () => mockFirebase.events.find(e => e.id === id) || mockFirebase.registrations.find(r => r.id === id)
      }),
      set: async (data) => {},
      update: async (data) => {}
    }),
    where: () => ({
      get: async () => ({
        empty: false,
        docs: mockFirebase.registrations.map(r => ({
          id: r.id,
          data: () => r
        }))
      })
    }),
    add: async (data) => ({ id: 'new-id' })
  })
}

// 渲染組件的輔助函數
export function renderWithRouter(component, options = {}) {
  const router = createTestRouter()
  return {
    ...render(component, {
      global: {
        plugins: [router],
        ...options.global
      },
      ...options
    }),
    router
  }
} 
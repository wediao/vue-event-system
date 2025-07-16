import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useTicketStore = defineStore('tickets', () => {
  const tickets = ref([
    {
      id: 1,
      eventName: '中信兄弟主場日',
      eventDate: '2024/07/16',
      eventTime: '18:30',
      eventLocation: '台中洲際棒球場',
      ticketType: 'VIP區',
      seat: 'A區 123號',
      ticketNumber: 'BB2024071600123',
      status: 'upcoming',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    },
    {
      id: 2,
      eventName: '五月天演唱會',
      eventDate: '2024/08/22',
      eventTime: '19:00',
      eventLocation: '台北小巨蛋',
      ticketType: '搖滾區',
      seat: '站席',
      ticketNumber: 'MT2024082200456',
      status: 'upcoming',
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='
    },
    {
      id: 3,
      eventName: '台北藝術節',
      eventDate: '2024/06/15',
      eventTime: '14:00',
      eventLocation: '國家戲劇院',
      ticketType: '普通票',
      seat: 'B區 45號',
      ticketNumber: 'TF2024061500789',
      status: 'completed'
    }
  ])

  // 根據狀態篩選票券
  const getTicketsByStatus = (status) => {
    return tickets.value.filter(ticket => ticket.status === status)
  }

  // 根據關鍵字搜尋票券
  const searchTickets = (keyword) => {
    const searchTerm = keyword.toLowerCase()
    return tickets.value.filter(ticket => 
      ticket.eventName.toLowerCase().includes(searchTerm) ||
      ticket.ticketNumber.toLowerCase().includes(searchTerm)
    )
  }

  // 下載票券
  const downloadTicket = (ticketId) => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (ticket) {
      // TODO: 實作票券下載邏輯
      console.log('下載票券:', ticket)
    }
  }

  // 轉讓票券
  const transferTicket = (ticketId, newOwner) => {
    const ticket = tickets.value.find(t => t.id === ticketId)
    if (ticket) {
      // TODO: 實作票券轉讓邏輯
      console.log('轉讓票券:', ticket, '新擁有者:', newOwner)
    }
  }

  return {
    tickets,
    getTicketsByStatus,
    searchTickets,
    downloadTicket,
    transferTicket
  }
}) 
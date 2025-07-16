import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, mockFirestore } from '../../utils/test-utils'
import QueryResult from '../QueryResult.vue'
import { fireEvent, waitFor } from '@testing-library/vue'

vi.mock('../../firebase', () => ({
  db: mockFirestore
}))

describe('QueryResult.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('顯示查詢表單', () => {
    const { getByLabelText, getByRole } = renderWithRouter(QueryResult)
    
    expect(getByLabelText(/序號/i)).toBeTruthy()
    expect(getByRole('button', { name: /查詢/i })).toBeTruthy()
  })

  it('驗證序號格式', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithRouter(QueryResult)
    
    const serialInput = getByLabelText(/序號/i)
    await fireEvent.update(serialInput, 'invalid')
    
    const submitButton = getByRole('button', { name: /查詢/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getByText(/請輸入有效的序號/i)).toBeTruthy()
    })
  })

  it('成功查詢報名資訊', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithRouter(QueryResult)
    
    const serialInput = getByLabelText(/序號/i)
    await fireEvent.update(serialInput, 'TEST123')
    
    const submitButton = getByRole('button', { name: /查詢/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getByText('測試用戶')).toBeTruthy()
      expect(getByText('test@example.com')).toBeTruthy()
      expect(getByText('已報名')).toBeTruthy()
    })
  })

  it('顯示未找到結果訊息', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithRouter(QueryResult)
    
    vi.spyOn(mockFirestore.collection(), 'where').mockImplementationOnce(() => ({
      get: async () => ({
        empty: true,
        docs: []
      })
    }))

    const serialInput = getByLabelText(/序號/i)
    await fireEvent.update(serialInput, 'NOTFOUND123')
    
    const submitButton = getByRole('button', { name: /查詢/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getByText(/找不到相關報名資訊/i)).toBeTruthy()
    })
  })
}) 
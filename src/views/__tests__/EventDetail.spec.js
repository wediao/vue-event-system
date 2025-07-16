import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, mockFirestore } from '../../utils/test-utils'
import EventDetail from '../EventDetail.vue'
import { fireEvent, waitFor } from '@testing-library/vue'

vi.mock('../../firebase', () => ({
  db: mockFirestore
}))

describe('EventDetail.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('正確顯示活動詳細資訊', async () => {
    const { getByText, getByRole } = renderWithRouter(EventDetail)
    
    await waitFor(() => {
      expect(getByText('測試活動 1')).toBeTruthy()
      expect(getByText('這是一個測試活動')).toBeTruthy()
      expect(getByText('NT$ 1,000')).toBeTruthy()
    })
  })

  it('在報名期間顯示報名按鈕', async () => {
    const { getByRole } = renderWithRouter(EventDetail)
    
    await waitFor(() => {
      const button = getByRole('button', { name: /立即報名/i })
      expect(button).toBeTruthy()
      expect(button).not.toBeDisabled()
    })
  })

  it('顯示倒數計時器', async () => {
    const { getByTestId } = renderWithRouter(EventDetail)
    
    await waitFor(() => {
      const timer = getByTestId('countdown-timer')
      expect(timer).toBeTruthy()
    })
  })
}) 
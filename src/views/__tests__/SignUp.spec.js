import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderWithRouter, mockFirestore } from '../../utils/test-utils'
import SignUp from '../SignUp.vue'
import { fireEvent, waitFor } from '@testing-library/vue'

vi.mock('../../firebase', () => ({
  db: mockFirestore
}))

describe('SignUp.vue', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('顯示報名表單', () => {
    const { getByLabelText, getByRole } = renderWithRouter(SignUp)
    
    expect(getByLabelText(/姓名/i)).toBeTruthy()
    expect(getByLabelText(/電子郵件/i)).toBeTruthy()
    expect(getByLabelText(/電話/i)).toBeTruthy()
    expect(getByRole('button', { name: /確認報名/i })).toBeTruthy()
  })

  it('驗證必填欄位', async () => {
    const { getByRole, getByText } = renderWithRouter(SignUp)
    
    const submitButton = getByRole('button', { name: /確認報名/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getByText(/請輸入姓名/i)).toBeTruthy()
      expect(getByText(/請輸入電子郵件/i)).toBeTruthy()
      expect(getByText(/請輸入電話/i)).toBeTruthy()
    })
  })

  it('驗證電子郵件格式', async () => {
    const { getByLabelText, getByRole, getByText } = renderWithRouter(SignUp)
    
    const emailInput = getByLabelText(/電子郵件/i)
    await fireEvent.update(emailInput, 'invalid-email')
    
    const submitButton = getByRole('button', { name: /確認報名/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(getByText(/請輸入有效的電子郵件地址/i)).toBeTruthy()
    })
  })

  it('成功提交表單', async () => {
    const { getByLabelText, getByRole } = renderWithRouter(SignUp)
    
    await fireEvent.update(getByLabelText(/姓名/i), '測試用戶')
    await fireEvent.update(getByLabelText(/電子郵件/i), 'test@example.com')
    await fireEvent.update(getByLabelText(/電話/i), '0912345678')
    
    const submitButton = getByRole('button', { name: /確認報名/i })
    await fireEvent.click(submitButton)

    await waitFor(() => {
      expect(mockFirestore.collection().add).toHaveBeenCalled()
    })
  })
}) 
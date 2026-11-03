import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import LoginPage from '../page'

const login = vi.fn()
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({ login, logout: vi.fn() }),
}))
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

describe('LoginPage', () => {
  it('starts Google login', async () => {
    render(<LoginPage />)
    await userEvent.click(screen.getByRole('button', { name: /Continue with Google/ }))
    expect(login).toHaveBeenCalledWith('/courses')
  })

  it('shows Facebook as disabled with "Coming soon" (BR-22)', () => {
    render(<LoginPage />)
    const fb = screen.getByRole('button', { name: /Continue with Facebook/ })
    expect(fb).toBeDisabled()
    expect(screen.getByText('Coming soon')).toBeInTheDocument()
  })
})

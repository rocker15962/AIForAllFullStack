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
    await userEvent.click(screen.getByRole('button', { name: /使用 Google 繼續/ }))
    expect(login).toHaveBeenCalledWith('/courses')
  })

  it('shows Facebook as a disabled outline button marked "coming soon" (BR-22)', () => {
    render(<LoginPage />)
    const fb = screen.getByRole('button', { name: '使用 Facebook 繼續 · 即將推出' })
    expect(fb).toBeDisabled()
    // No Facebook blue: same neutral outline look as the Google button
    expect(fb.className).not.toMatch(/1877F2/i)
    expect(fb.querySelector('svg')).not.toHaveAttribute('fill', 'white')
  })

  it('gives the Facebook button the same size as the Google button', () => {
    render(<LoginPage />)
    const google = screen.getByRole('button', { name: '使用 Google 繼續' })
    const fb = screen.getByRole('button', { name: '使用 Facebook 繼續 · 即將推出' })
    expect(fb.className).toBe(google.className)
  })
})

import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TopNav } from '../top-nav'
import type { NavigationItem } from '@/types'

vi.mock('next/navigation', () => ({
  usePathname: () => '/courses',
}))

const mockLogin = vi.fn()
const mockLogout = vi.fn()

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'Demo User',
      email: 'demo@test.com',
      avatarUrl: '',
      provider: 'google',
      isAdmin: false,
      createdAt: '',
      lastActiveAt: '',
    },
    accessToken: 'test-token',
    isLoading: false,
    login: mockLogin,
    logout: mockLogout,
    setAuth: vi.fn(),
  }),
}))

const navLinks: NavigationItem[] = [
  { label: '探索課程', href: '/courses' },
  { label: '我的學習', href: '/my-learning' },
]

describe('TopNav', () => {
  it('renders logo', () => {
    render(<TopNav navLinks={navLinks} />)
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('for All')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(<TopNav navLinks={navLinks} />)
    expect(screen.getByText('探索課程')).toBeInTheDocument()
    expect(screen.getByText('我的學習')).toBeInTheDocument()
  })

  it('renders user menu when authenticated', () => {
    render(<TopNav navLinks={navLinks} />)
    expect(screen.getByText('Demo User')).toBeInTheDocument()
  })

  it('highlights active link based on pathname', () => {
    render(<TopNav navLinks={navLinks} />)
    const activeLink = screen.getAllByText('探索課程')[0]
    expect(activeLink.closest('a')).toHaveClass('text-cyan-500')
  })

  it('renders hamburger button for mobile', () => {
    render(<TopNav navLinks={navLinks} />)
    const hamburger = screen.getByRole('button', { name: '開啟選單' })
    expect(hamburger).toBeInTheDocument()
  })

  it('opens mobile menu when hamburger is clicked', async () => {
    const user = userEvent.setup()
    render(<TopNav navLinks={navLinks} />)

    await user.click(screen.getByRole('button', { name: '開啟選單' }))

    const allExplorLinks = screen.getAllByText('探索課程')
    expect(allExplorLinks.length).toBeGreaterThanOrEqual(2)
  })
})

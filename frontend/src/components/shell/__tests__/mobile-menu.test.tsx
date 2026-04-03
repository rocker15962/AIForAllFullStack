import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileMenu } from '../mobile-menu'
import type { NavigationItem } from '@/types'

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
    login: vi.fn(),
    logout: vi.fn(),
    setAuth: vi.fn(),
  }),
}))

const navLinks: NavigationItem[] = [
  { label: 'Explore', href: '/courses' },
  { label: 'My Learning', href: '/my-learning' },
]

describe('MobileMenu', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <MobileMenu navLinks={navLinks} isOpen={false} onClose={vi.fn()} />,
    )
    expect(container.querySelector('nav')).not.toBeInTheDocument()
  })

  it('renders navigation links when open', () => {
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Explore')).toBeInTheDocument()
    expect(screen.getByText('My Learning')).toBeInTheDocument()
  })

  it('renders user info when authenticated', () => {
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Demo User')).toBeInTheDocument()
    expect(screen.getByText('demo@test.com')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={onClose} />)

    await user.click(screen.getByRole('button', { name: /close/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('calls onClose when a nav link is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={onClose} />)

    await user.click(screen.getByText('Explore'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has correct link hrefs', () => {
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('link', { name: 'Explore' })).toHaveAttribute('href', '/courses')
    expect(screen.getByRole('link', { name: 'My Learning' })).toHaveAttribute(
      'href',
      '/my-learning',
    )
  })

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={onClose} />)

    const backdrop = screen.getByTestId('mobile-menu-backdrop')
    await user.click(backdrop)
    expect(onClose).toHaveBeenCalledOnce()
  })
})

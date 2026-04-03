import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MobileMenu } from '../mobile-menu'
import type { NavigationItem } from '@/types'

const navLinks: NavigationItem[] = [
  { label: '探索課程', href: '/courses' },
  { label: '我的學習', href: '/my-learning' },
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

    expect(screen.getByText('探索課程')).toBeInTheDocument()
    expect(screen.getByText('我的學習')).toBeInTheDocument()
  })

  it('renders user info when open', () => {
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByText('Demo User')).toBeInTheDocument()
    expect(screen.getByText('demo@aiforall.org')).toBeInTheDocument()
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

    await user.click(screen.getByText('探索課程'))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('has correct link hrefs', () => {
    render(<MobileMenu navLinks={navLinks} isOpen={true} onClose={vi.fn()} />)

    expect(screen.getByRole('link', { name: '探索課程' })).toHaveAttribute('href', '/courses')
    expect(screen.getByRole('link', { name: '我的學習' })).toHaveAttribute('href', '/my-learning')
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

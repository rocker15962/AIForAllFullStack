import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import UserManagementPage from '../page'

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'admin', name: 'Admin', isAdmin: true },
    accessToken: 'token',
    isLoading: false,
  }),
}))

const now = new Date().toISOString()
const users = [
  {
    id: 'u1',
    name: '陳怡君',
    email: 'alice@example.com',
    avatarUrl: '',
    provider: 'google',
    createdAt: '2026-09-17T00:00:00Z',
    lastActiveAt: now,
    completedCount: 5,
  },
  {
    id: 'u2',
    name: '王柏翰',
    email: 'bob@example.com',
    avatarUrl: '',
    provider: 'facebook',
    createdAt: '2026-10-12T00:00:00Z',
    lastActiveAt: '2026-10-30T00:00:00Z',
    completedCount: 1,
  },
]

beforeEach(() => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => new Response(JSON.stringify({ users }), { status: 200 })),
  )
})

afterEach(() => {
  vi.unstubAllGlobals()
})

function statValue(label: string): string | null {
  return screen.getByText(label).nextElementSibling?.textContent ?? null
}

describe('UserManagementPage (BR-38)', () => {
  it('shows three stat cards: total, Google sign-ins and active today', async () => {
    render(<UserManagementPage />)
    await screen.findByText('陳怡君')

    expect(statValue('總用戶數')).toBe('2')
    expect(statValue('Google 登入')).toBe('1')
    expect(statValue('今日活躍')).toBe('1')
    expect(screen.queryByText('Facebook 登入')).not.toBeInTheDocument()
  })

  it('has no sign-in provider filter and lists every user', async () => {
    render(<UserManagementPage />)
    await screen.findByText('陳怡君')

    expect(screen.queryByRole('button', { name: '全部' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Google' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Facebook' })).not.toBeInTheDocument()
    expect(screen.getByText('王柏翰')).toBeInTheDocument()
  })
})

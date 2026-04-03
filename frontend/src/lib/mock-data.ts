import type { User, NavigationItem } from '@/types'

export const mockUser: User = {
  id: 'mock-user-1',
  name: 'Demo User',
  email: 'demo@aiforall.org',
  avatarUrl: '',
  provider: 'google',
  isAdmin: true,
  createdAt: '2025-01-01T00:00:00Z',
  lastActiveAt: '2026-04-02T00:00:00Z',
}

export const mainNavLinks: NavigationItem[] = [
  { label: 'Explore', href: '/courses' },
  { label: 'My Learning', href: '/my-learning' },
]

export const adminNavLinks: NavigationItem[] = [
  { label: 'Explore', href: '/courses' },
  { label: 'My Learning', href: '/my-learning' },
  { label: 'Users', href: '/admin/users' },
  { label: 'Admin', href: '/admin' },
]

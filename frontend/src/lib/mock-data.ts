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
  { label: '探索課程', href: '/courses' },
  { label: '我的學習', href: '/my-learning' },
]

export const adminNavLinks: NavigationItem[] = [
  { label: '探索課程', href: '/courses' },
  { label: '我的學習', href: '/my-learning' },
  { label: '用戶管理', href: '/admin/users' },
  { label: '後台管理', href: '/admin' },
]

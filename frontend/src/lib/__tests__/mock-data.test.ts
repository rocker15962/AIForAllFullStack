import { describe, it, expect } from 'vitest'
import { mockUser, mainNavLinks, adminNavLinks } from '../mock-data'

describe('mock-data', () => {
  describe('mockUser', () => {
    it('has required User fields', () => {
      expect(mockUser.id).toBe('mock-user-1')
      expect(mockUser.name).toBe('Demo User')
      expect(mockUser.email).toBe('demo@aiforall.org')
      expect(mockUser.provider).toBe('google')
      expect(mockUser.isAdmin).toBe(true)
      expect(mockUser.createdAt).toBeDefined()
      expect(mockUser.lastActiveAt).toBeDefined()
    })
  })

  describe('mainNavLinks', () => {
    it('contains general navigation items', () => {
      expect(mainNavLinks).toHaveLength(2)
      expect(mainNavLinks[0]).toEqual({ label: '探索課程', href: '/courses' })
      expect(mainNavLinks[1]).toEqual({ label: '我的學習', href: '/my-learning' })
    })
  })

  describe('adminNavLinks', () => {
    it('contains admin navigation items', () => {
      expect(adminNavLinks).toHaveLength(4)
      expect(adminNavLinks.map((link) => link.href)).toEqual([
        '/admin',
        '/admin/courses',
        '/admin/users',
        '/admin/categories',
      ])
      expect(adminNavLinks.map((link) => link.label)).toEqual(['儀表板', '課程', '用戶', '分類'])
    })
  })
})

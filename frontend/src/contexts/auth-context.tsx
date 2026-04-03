'use client'

import { createContext, useContext, useEffect, useCallback } from 'react'
import type { ReactNode } from 'react'
import type { User } from '@/types'
import { useAuthStore } from '@/stores/auth-store'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface AuthContextValue {
  user: User | null
  accessToken: string | null
  isLoading: boolean
  login: (redirect?: string) => void
  logout: () => Promise<void>
  setAuth: (token: string, user: User) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const {
    user,
    accessToken,
    isLoading,
    setAuth: storeSetAuth,
    clearAuth,
    setLoading,
  } = useAuthStore()

  const fetchUser = useCallback(async (token: string): Promise<User | null> => {
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) return null
      return (await res.json()) as User
    } catch {
      return null
    }
  }, [])

  // Restore session on mount
  useEffect(() => {
    async function restoreSession() {
      try {
        const res = await fetch(`${API_URL}/api/v1/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        })
        if (!res.ok) return

        const data = (await res.json()) as { accessToken: string }
        const fetchedUser = await fetchUser(data.accessToken)
        if (fetchedUser) {
          storeSetAuth(data.accessToken, fetchedUser)
        }
      } catch {
        // No valid session — stay as guest
      } finally {
        setLoading(false)
      }
    }

    restoreSession()
  }, [fetchUser, storeSetAuth, setLoading])

  const login = useCallback((redirect?: string) => {
    const redirectPath = redirect || window.location.pathname
    window.location.href = `${API_URL}/api/v1/auth/google/login?redirect=${encodeURIComponent(redirectPath)}`
  }, [])

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_URL}/api/v1/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch {
      // Clear state even if request fails
    }
    clearAuth()
  }, [clearAuth])

  const setAuth = useCallback(
    (token: string, fetchedUser: User) => {
      storeSetAuth(token, fetchedUser)
    },
    [storeSetAuth],
  )

  return (
    <AuthContext.Provider value={{ user, accessToken, isLoading, login, logout, setAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

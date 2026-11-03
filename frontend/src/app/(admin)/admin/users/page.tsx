'use client'

import { useState, useEffect, useCallback } from 'react'
import { Users, Search, X, Loader2, ShieldAlert, Activity } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { UserTable, UserProgressPanel } from '@/components/admin'
import type { UserRow, UserProgressRow } from '@/components/admin'
import type { AuthProvider } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface ApiUser {
  id: string
  name: string
  email: string
  avatarUrl: string
  provider: AuthProvider
  createdAt: string
  lastActiveAt: string
  completedCount: number
}

interface UserStats {
  totalUsers: number
  googleUsers: number
  facebookUsers: number
  activeToday: number
}

type ProviderFilter = 'all' | 'google' | 'facebook'

const statCards = [
  {
    key: 'totalUsers' as const,
    label: 'Total Users',
    icon: Users,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'googleUsers' as const,
    label: 'Google Login',
    icon: Users,
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'facebookUsers' as const,
    label: 'Facebook Login',
    icon: Users,
    iconBg: 'bg-indigo-100 dark:bg-indigo-900/40',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    key: 'activeToday' as const,
    label: 'Active Today',
    icon: Activity,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
] as const

const filterChips: { value: ProviderFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'google', label: 'Google' },
  { value: 'facebook', label: 'Facebook' },
]

export default function UserManagementPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth()

  const [users, setUsers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all')

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  // Fetch users
  const fetchUsers = useCallback(async () => {
    if (!accessToken) return
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)

      const res = await fetch(`${API_URL}/api/v1/admin/users?${params.toString()}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      })
      if (!res.ok) {
        throw new Error(`Failed to fetch users (${res.status})`)
      }
      const data = (await res.json()) as { users: ApiUser[] }
      setUsers(data.users || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }, [accessToken, search])

  useEffect(() => {
    if (authLoading) return
    if (!accessToken || !user?.isAdmin) {
      setIsLoading(false)
      return
    }
    fetchUsers()
  }, [fetchUsers, authLoading, accessToken, user?.isAdmin])

  // Learning progress panel (BR-34) — one user expanded at a time
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null)
  const [progressRows, setProgressRows] = useState<UserProgressRow[]>([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [progressError, setProgressError] = useState<string | null>(null)

  useEffect(() => {
    if (!expandedUserId || !accessToken) return
    let cancelled = false
    async function loadProgress(userId: string, token: string) {
      setProgressLoading(true)
      setProgressError(null)
      setProgressRows([])
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/users/${userId}/progress`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error(`Failed to load progress (${res.status})`)
        const data = (await res.json()) as { progress: UserProgressRow[] }
        if (!cancelled) setProgressRows(data.progress || [])
      } catch (err) {
        if (!cancelled) {
          setProgressError(err instanceof Error ? err.message : 'Failed to load progress')
        }
      } finally {
        if (!cancelled) setProgressLoading(false)
      }
    }
    loadProgress(expandedUserId, accessToken)
    return () => {
      cancelled = true
    }
  }, [expandedUserId, accessToken])

  function toggleProgress(userId: string) {
    setExpandedUserId((current) => (current === userId ? null : userId))
  }

  // Apply client-side provider filter
  const filteredUsers =
    providerFilter === 'all' ? users : users.filter((u) => u.provider === providerFilter)

  // Compute stats from unfiltered user list
  const stats: UserStats = {
    totalUsers: users.length,
    googleUsers: users.filter((u) => u.provider === 'google').length,
    facebookUsers: users.filter((u) => u.provider === 'facebook').length,
    activeToday: users.filter((u) => {
      const lastActive = new Date(u.lastActiveAt)
      const today = new Date()
      return lastActive.toDateString() === today.toDateString()
    }).length,
  }

  // Map to table rows
  const tableRows: UserRow[] = filteredUsers.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    avatarUrl: u.avatarUrl,
    provider: u.provider,
    createdAt: u.createdAt,
    lastActiveAt: u.lastActiveAt,
    completedCount: u.completedCount,
  }))

  // Auth loading
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Not admin
  if (!user || !user.isAdmin) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <ShieldAlert className="mx-auto h-12 w-12 text-zinc-400" />
          <h1 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Admin access required
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            You must be an administrator to view this page.
          </p>
        </div>
      </div>
    )
  }

  // Error state
  if (error && users.length === 0) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Failed to load users
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">User Management</h1>
        <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
          View user profiles and learning progress
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon
          const value = stats[card.key]
          return (
            <div
              key={card.key}
              className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-white px-4 py-4 dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
              >
                <Icon className={`h-4.5 w-4.5 ${card.iconColor}`} />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{card.label}</p>
                <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Search + Filter Row */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full rounded-lg border border-zinc-200 bg-zinc-50 py-2.5 pr-10 pl-10 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-400 focus:bg-white dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-cyan-500"
          />
          {searchInput && (
            <button
              onClick={() => {
                setSearchInput('')
                setSearch('')
              }}
              className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Provider filter chips */}
        <div className="flex gap-2">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setProviderFilter(chip.value)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                providerFilter === chip.value
                  ? 'bg-cyan-500 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* User Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
        </div>
      ) : (
        <UserTable
          users={tableRows}
          expandedUserId={expandedUserId}
          onToggleProgress={toggleProgress}
          progressPanel={
            <UserProgressPanel
              userName={users.find((u) => u.id === expandedUserId)?.name ?? ''}
              rows={progressRows}
              isLoading={progressLoading}
              error={progressError}
            />
          }
        />
      )}
    </div>
  )
}

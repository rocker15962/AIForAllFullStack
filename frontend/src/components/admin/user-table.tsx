'use client'

import type { AuthProvider } from '@/types'

export interface UserRow {
  id: string
  name: string
  email: string
  avatarUrl: string
  provider: AuthProvider
  createdAt: string
  lastActiveAt: string
  completedCount: number
}

export interface UserProgressRow {
  courseId: string
  courseTitle: string
  status: 'in-progress' | 'completed'
  score?: number
  completedAt?: string
  lastAccessedAt?: string
}

interface UserTableProps {
  users: UserRow[]
}

const providerBadge: Record<AuthProvider, { label: string; classes: string }> = {
  google: {
    label: 'Google',
    classes: 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  },
  facebook: {
    label: 'Facebook',
    classes: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatRelativeDate(dateStr: string): string {
  const diffMs = new Date().getTime() - new Date(dateStr).getTime()
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return `${diffDays} days ago`
  return formatDate(dateStr)
}

export function UserTable({ users }: UserTableProps) {
  if (users.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">No users found</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          Try adjusting your search or filters
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Table header */}
      <div className="hidden grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr] gap-4 border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase md:grid dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400">
        <span>User</span>
        <span>Email</span>
        <span>Login Method</span>
        <span>Completed</span>
        <span>Last Active</span>
      </div>

      {/* Table rows */}
      {users.map((user) => {
        const badge = providerBadge[user.provider]
        return (
          <div
            key={user.id}
            className="grid grid-cols-1 items-center gap-2 border-b border-zinc-100 px-5 py-4 md:grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr] md:gap-4 dark:border-zinc-700/50"
          >
            {/* User column */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-600">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-300">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{user.name}</p>
                <p className="text-xs text-zinc-400 dark:text-zinc-500">
                  Joined {formatDate(user.createdAt)}
                </p>
              </div>
            </div>

            {/* Email */}
            <p className="truncate text-sm text-zinc-600 max-md:pl-12 dark:text-zinc-400">
              {user.email}
            </p>

            {/* Login Method */}
            <div className="max-md:pl-12">
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.classes}`}
              >
                {badge.label}
              </span>
            </div>

            {/* Completed */}
            <p className="text-sm font-medium text-zinc-900 max-md:pl-12 dark:text-zinc-100">
              {user.completedCount}
            </p>

            {/* Last Active */}
            <p className="text-sm text-zinc-500 max-md:pl-12 dark:text-zinc-400">
              {formatRelativeDate(user.lastActiveAt)}
            </p>
          </div>
        )
      })}
    </div>
  )
}

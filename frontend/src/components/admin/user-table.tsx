'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import type { AuthProvider, CourseStatus } from '@/types'

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

/** One row of GET /admin/users/:id/progress */
export interface UserProgressRow {
  courseId: string
  courseTitle: string
  courseStatus: CourseStatus
  status: 'in_progress' | 'completed'
  /** Latest finished round; null while a round is in progress. */
  score: number | null
  answeredCount: number
  totalQuestions: number
  completedAt?: string
  lastAccessedAt?: string
}

interface UserTableProps {
  users: UserRow[]
  /** The user whose progress panel is open (only one at a time). */
  expandedUserId?: string | null
  onToggleProgress?: (userId: string) => void
  /** Rendered directly under the expanded user's row. */
  progressPanel?: ReactNode
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

const gridCols = 'md:grid-cols-[2fr_1.5fr_1fr_0.8fr_1fr_110px]'

export function UserTable({
  users,
  expandedUserId = null,
  onToggleProgress,
  progressPanel,
}: UserTableProps) {
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
      <div
        className={`hidden gap-4 ${gridCols} border-b border-zinc-200 bg-zinc-50 px-5 py-3 text-xs font-semibold tracking-wide text-zinc-500 uppercase md:grid dark:border-zinc-700 dark:bg-zinc-800/80 dark:text-zinc-400`}
      >
        <span>User</span>
        <span>Email</span>
        <span>Login Method</span>
        <span>Completed</span>
        <span>Last Active</span>
        <span className="sr-only">Progress</span>
      </div>

      {/* Table rows */}
      {users.map((user) => {
        const badge = providerBadge[user.provider]
        const isExpanded = expandedUserId === user.id
        return (
          <Fragment key={user.id}>
            <div
              className={`grid grid-cols-1 items-center gap-2 border-b border-zinc-100 px-5 py-4 md:gap-4 ${gridCols} dark:border-zinc-700/50`}
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
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                    {user.name}
                  </p>
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

              {/* Progress toggle */}
              <div className="max-md:pl-12">
                {onToggleProgress && (
                  <button
                    type="button"
                    aria-expanded={isExpanded}
                    onClick={() => onToggleProgress(user.id)}
                    className={
                      isExpanded
                        ? 'h-7 rounded-lg bg-cyan-500 px-2.5 text-xs font-medium text-white hover:bg-cyan-600'
                        : 'h-7 rounded-lg border border-zinc-200 bg-white px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'
                    }
                  >
                    {isExpanded ? 'Collapse' : 'Progress'}
                  </button>
                )}
              </div>
            </div>
            {isExpanded && progressPanel}
          </Fragment>
        )
      })}
    </div>
  )
}

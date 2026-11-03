'use client'

import { useState, useEffect, useCallback } from 'react'
import { BookOpen } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { StatCards, TabBar, ProgressCard, CompletedCard, BadgeCard } from '@/components/my-learning'
import type { InProgressCourse, CompletedCourse, Badge } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface MyStats {
  inProgress: number
  completed: number
  badges: number
}

export default function MyLearningPage() {
  const { user, accessToken, isLoading: authLoading, login } = useAuth()
  const [activeTab, setActiveTab] = useState('in-progress')
  const [stats, setStats] = useState<MyStats>({ inProgress: 0, completed: 0, badges: 0 })
  const [inProgressCourses, setInProgressCourses] = useState<InProgressCourse[]>([])
  const [completedCourses, setCompletedCourses] = useState<CompletedCourse[]>([])
  const [badges, setBadges] = useState<Badge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [tabLoading, setTabLoading] = useState(false)

  const authHeaders = useCallback((): HeadersInit => {
    if (!accessToken) return {}
    return { Authorization: `Bearer ${accessToken}` }
  }, [accessToken])

  // Fetch stats on mount
  useEffect(() => {
    if (!accessToken) return

    async function fetchStats() {
      try {
        const res = await fetch(`${API_URL}/api/v1/my/stats`, {
          headers: authHeaders(),
        })
        if (res.ok) {
          const data = (await res.json()) as MyStats
          setStats(data)
        }
      } catch {
        // Silently handle
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [accessToken, authHeaders])

  // Fetch tab data when tab changes
  useEffect(() => {
    if (!accessToken) return

    async function fetchTabData() {
      setTabLoading(true)
      try {
        if (activeTab === 'in-progress') {
          const res = await fetch(`${API_URL}/api/v1/my/progress`, {
            headers: authHeaders(),
          })
          if (res.ok) {
            const data = await res.json()
            setInProgressCourses(data.courses || [])
          }
        } else if (activeTab === 'completed') {
          const res = await fetch(`${API_URL}/api/v1/my/completed`, {
            headers: authHeaders(),
          })
          if (res.ok) {
            const data = await res.json()
            setCompletedCourses(data.courses || [])
          }
        } else if (activeTab === 'badges') {
          const res = await fetch(`${API_URL}/api/v1/my/badges`, {
            headers: authHeaders(),
          })
          if (res.ok) {
            const data = await res.json()
            setBadges(data.badges || [])
          }
        }
      } catch {
        // Silently handle
      } finally {
        setTabLoading(false)
      }
    }

    fetchTabData()
  }, [activeTab, accessToken, authHeaders])

  // Auth loading state
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    )
  }

  // Not logged in
  if (!user) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
            <BookOpen className="h-8 w-8 text-zinc-400" />
          </div>
          <h2 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
            登入以追蹤學習進度
          </h2>
          <p className="mt-2 text-sm text-zinc-500">登入後即可查看學習進度、已完成課程與徽章。</p>
          <button
            onClick={() => login('/my-learning')}
            className="mt-6 rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
          >
            登入
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="px-6 py-8 sm:px-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">我的學習</h1>
        <p className="mt-2 text-[15px] text-zinc-500">追蹤學習進度，收集完課徽章</p>
      </div>

      {/* Stat cards */}
      {isLoading ? (
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-[90px] animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800"
            />
          ))}
        </div>
      ) : (
        <div className="mb-8">
          <StatCards
            inProgress={stats.inProgress}
            completed={stats.completed}
            badges={stats.badges}
          />
        </div>
      )}

      {/* Tab bar */}
      <div className="mb-6">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} counts={stats} />
      </div>

      {/* Tab content */}
      {tabLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
        </div>
      ) : (
        <>
          {/* In Progress tab */}
          {activeTab === 'in-progress' && (
            <>
              {inProgressCourses.length === 0 ? (
                <EmptyState
                  title="還沒有進行中的課程"
                  description="探索課程，開始你的學習旅程。"
                  actionHref="/courses"
                  actionLabel="探索課程"
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inProgressCourses.map((course) => (
                    <ProgressCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Completed tab */}
          {activeTab === 'completed' && (
            <>
              {completedCourses.length === 0 ? (
                <EmptyState
                  title="還沒有已完成的課程"
                  description="完成課後測驗後，成績會顯示在這裡。"
                  actionHref="/courses"
                  actionLabel="探索課程"
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {completedCourses.map((course) => (
                    <CompletedCard key={course.id} course={course} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Badges tab */}
          {activeTab === 'badges' && (
            <>
              {badges.length === 0 ? (
                <EmptyState
                  title="還沒有獲得徽章"
                  description="完成課程即可獲得徽章，記錄你的學習成果。"
                  actionHref="/courses"
                  actionLabel="探索課程"
                />
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {badges.map((badge) => (
                    <BadgeCard key={badge.id} badge={badge} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}

function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string
  description: string
  actionHref: string
  actionLabel: string
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <BookOpen className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">{title}</h3>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      <a
        href={actionHref}
        className="mt-4 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
      >
        {actionLabel}
      </a>
    </div>
  )
}

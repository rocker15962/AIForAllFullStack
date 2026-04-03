'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BookOpen, Users as UsersIcon, FolderOpen, Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/contexts/auth-context'
import { DashboardStatsCards, TrendChart, PopularCourses } from '@/components/admin'
import type { DashboardStats } from '@/types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

interface TrendDataPoint {
  date: string
  totalUsers: number
  newUsers: number
}

interface PopularCourse {
  id: string
  title: string
  completions: number
}

interface DashboardData {
  stats: DashboardStats
  userTrend: TrendDataPoint[]
  popularCourses: PopularCourse[]
}

const adminLinks = [
  {
    href: '/admin/courses',
    label: 'Manage Courses',
    description: 'Add, edit, or remove courses',
    icon: BookOpen,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    href: '/admin/users',
    label: 'Manage Users',
    description: 'View and manage user accounts',
    icon: UsersIcon,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    href: '/admin/categories',
    label: 'Manage Categories',
    description: 'Organize tools and skills',
    icon: FolderOpen,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
]

export default function AdminDashboardPage() {
  const { user, accessToken, isLoading: authLoading } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading) return
    if (!accessToken || !user?.isAdmin) {
      setIsLoading(false)
      return
    }

    async function fetchDashboard() {
      try {
        const res = await fetch(`${API_URL}/api/v1/admin/dashboard`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        })
        if (!res.ok) {
          throw new Error(`Failed to fetch dashboard data (${res.status})`)
        }
        const json = (await res.json()) as DashboardData
        setData(json)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [accessToken, user?.isAdmin, authLoading])

  // Auth still loading
  if (authLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Not logged in or not admin
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

  // Dashboard data loading
  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-56px)] items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Failed to load dashboard
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{error}</p>
        </div>
      </div>
    )
  }

  // No data (shouldn't happen if fetch succeeded, but handle gracefully)
  if (!data) {
    return null
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-zinc-900 dark:text-zinc-100">Dashboard</h1>
        <p className="mt-1 text-[15px] text-zinc-500 dark:text-zinc-400">
          Platform analytics overview
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8">
        <DashboardStatsCards stats={data.stats} />
      </div>

      {/* Trend Chart + Popular Courses */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-10">
        <div className="lg:col-span-7">
          <TrendChart data={data.userTrend || []} />
        </div>
        <div className="lg:col-span-3">
          <PopularCourses courses={data.popularCourses || []} />
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {adminLinks.map((link) => {
          const Icon = link.icon
          return (
            <Link
              key={link.href}
              href={link.href}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${link.iconBg}`}
                >
                  <Icon className={`h-5 w-5 ${link.iconColor}`} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {link.label}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{link.description}</p>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

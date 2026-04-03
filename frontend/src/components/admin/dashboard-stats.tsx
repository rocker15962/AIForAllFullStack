'use client'

import { Users, BookOpen, CheckCircle, Activity } from 'lucide-react'
import type { DashboardStats } from '@/types'

interface DashboardStatsProps {
  stats: DashboardStats
}

const statCards = [
  {
    key: 'totalUsers' as const,
    label: 'Total Users',
    icon: Users,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'totalCourses' as const,
    label: 'Courses',
    icon: BookOpen,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'totalCompletions' as const,
    label: 'Completions',
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'activeUsers' as const,
    label: 'Active Users',
    icon: Activity,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
] as const

export function DashboardStatsCards({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]

        return (
          <div
            key={card.key}
            className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-5 dark:border-zinc-700 dark:bg-zinc-800"
          >
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${card.iconBg}`}
            >
              <Icon className={`h-5 w-5 ${card.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">{card.label}</p>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

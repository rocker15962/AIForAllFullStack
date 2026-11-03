'use client'

import {
  Users,
  BookOpen,
  CheckCircle,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
} from 'lucide-react'
import type { DashboardStats } from '@/types'
import { cn } from '@/lib/utils'

interface DashboardStatsProps {
  stats: DashboardStats
  /** The same stats a week ago; cards without a baseline show no trend. */
  lastWeek?: Partial<DashboardStats>
}

const statCards = [
  {
    key: 'totalUsers' as const,
    label: '總用戶數',
    icon: Users,
    iconBg: 'bg-cyan-100 dark:bg-cyan-900/40',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    key: 'totalCourses' as const,
    label: '課程數',
    icon: BookOpen,
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'totalCompletions' as const,
    label: '完課次數',
    icon: CheckCircle,
    iconBg: 'bg-green-100 dark:bg-green-900/40',
    iconColor: 'text-green-600 dark:text-green-400',
  },
  {
    key: 'activeUsers' as const,
    label: '活躍用戶',
    icon: Activity,
    iconBg: 'bg-violet-100 dark:bg-violet-900/40',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
] as const

/** Week-over-week change in whole percent; null when last week is missing or zero. */
export function weekOverWeek(current: number, lastWeek: number | undefined): number | null {
  if (!lastWeek) return null
  return Math.round(((current - lastWeek) / lastWeek) * 100)
}

const trendStyles = {
  up: { icon: TrendingUp, sign: '+', className: 'text-green-600 dark:text-green-400' },
  down: { icon: TrendingDown, sign: '−', className: 'text-red-500 dark:text-red-400' },
  flat: { icon: Minus, sign: '', className: 'text-zinc-500 dark:text-zinc-400' },
}

function Trend({ percent }: { percent: number }) {
  const style = trendStyles[percent > 0 ? 'up' : percent < 0 ? 'down' : 'flat']
  const Icon = style.icon
  return (
    <p className={cn('mt-0.5 flex items-center gap-1 text-xs', style.className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="font-medium">
        {style.sign}
        {Math.abs(percent)}%
      </span>
      <span className="text-zinc-500 dark:text-zinc-400">比上週</span>
    </p>
  )
}

export function DashboardStatsCards({ stats, lastWeek }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => {
        const Icon = card.icon
        const value = stats[card.key]
        const percent = weekOverWeek(value, lastWeek?.[card.key])

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
              {percent !== null && <Trend percent={percent} />}
            </div>
          </div>
        )
      })}
    </div>
  )
}

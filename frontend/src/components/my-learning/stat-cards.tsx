'use client'

import { BookOpen, CheckCircle, Award } from 'lucide-react'

interface StatCardsProps {
  inProgress: number
  completed: number
  badges: number
}

const stats = [
  {
    key: 'inProgress',
    label: '進行中',
    icon: BookOpen,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50 dark:bg-cyan-900/30',
  },
  {
    key: 'completed',
    label: '已完成',
    icon: CheckCircle,
    color: 'text-green-500',
    bg: 'bg-green-50 dark:bg-green-900/30',
  },
  {
    key: 'badges',
    label: '徽章',
    icon: Award,
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-900/30',
  },
] as const

export function StatCards({ inProgress, completed, badges }: StatCardsProps) {
  const values: Record<string, number> = { inProgress, completed, badges }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.key}
          className="flex h-[90px] items-center gap-4 rounded-xl border border-zinc-200 bg-white px-5 py-5 dark:border-zinc-700 dark:bg-zinc-800"
        >
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
            <stat.icon className={`h-5 w-5 ${stat.color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
              {values[stat.key]}
            </p>
            <p className="text-sm text-zinc-500">{stat.label}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

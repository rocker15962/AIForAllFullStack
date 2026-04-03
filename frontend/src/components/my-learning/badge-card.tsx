'use client'

import { Award } from 'lucide-react'
import type { Badge } from '@/types'

interface BadgeCardProps {
  badge: Badge
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Thumbnail */}
      <div className="relative h-[190px] bg-zinc-200 dark:bg-zinc-700">
        {badge.thumbnailUrl ? (
          <img
            src={badge.thumbnailUrl}
            alt={badge.courseTitle}
            className="h-full w-full object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-zinc-400">▶</div>
        )}
        <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-white">
          <Award className="h-5 w-5" />
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
          {badge.courseTitle}
        </h3>
        <p className="text-xs text-zinc-400">Earned {formatDate(badge.earnedAt)}</p>
      </div>
    </div>
  )
}

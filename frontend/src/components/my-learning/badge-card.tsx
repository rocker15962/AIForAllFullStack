'use client'

import type { Badge } from '@/types'

interface BadgeCardProps {
  badge: Badge
}

function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
}

export function BadgeCard({ badge }: BadgeCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Thumbnail — 200px */}
      <div className="h-[200px] bg-zinc-200 dark:bg-zinc-700">
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
      </div>

      {/* Amber bar */}
      <div className="h-1 bg-amber-400" />

      {/* Body */}
      <div className="flex flex-col gap-2.5 p-4">
        <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
          {badge.courseTitle}
        </h3>
        <span className="text-xs text-zinc-400">{formatShortDate(badge.earnedAt)} 獲得</span>
      </div>
    </div>
  )
}

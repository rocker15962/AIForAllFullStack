'use client'

import { unavailableCourseLabel } from '@/lib/learning-rules'
import type { Badge } from '@/types'
import { CardMeta, CardThumbnail, CourseTitle, cardClasses, formatShortDate } from './card-parts'

interface BadgeCardProps {
  badge: Badge
}

export function BadgeCard({ badge }: BadgeCardProps) {
  // A badge is never taken back, even when its course is archived or unpublished (BR-31, BR-37).
  const unavailable = unavailableCourseLabel(badge.courseStatus)

  return (
    <div className={cardClasses}>
      <CardThumbnail src={badge.thumbnailUrl} alt={badge.courseTitle} />

      {/* Amber bar */}
      <div className="h-1 bg-amber-400" />

      <div className="flex flex-col gap-2.5 p-4">
        <CourseTitle>{badge.courseTitle}</CourseTitle>
        <CardMeta
          left={
            <span className="text-zinc-400 dark:text-zinc-500">
              {formatShortDate(badge.earnedAt)} 獲得
            </span>
          }
          right={unavailable}
        />
      </div>
    </div>
  )
}

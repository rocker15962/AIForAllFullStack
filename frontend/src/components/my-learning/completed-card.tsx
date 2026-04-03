'use client'

import Link from 'next/link'
import { CheckCircle } from 'lucide-react'
import type { CompletedCourse } from '@/types'

interface CompletedCardProps {
  course: CompletedCourse
}

const difficultyStyles: Record<string, { classes: string; label: string }> = {
  beginner: { classes: 'bg-green-100 text-green-700', label: 'Beginner' },
  intermediate: { classes: 'bg-amber-100 text-amber-700', label: 'Intermediate' },
  advanced: { classes: 'bg-rose-100 text-rose-700', label: 'Advanced' },
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function CompletedCard({ course }: CompletedCardProps) {
  const difficulty = difficultyStyles[course.difficulty] || difficultyStyles.beginner

  return (
    <Link href={`/courses/${course.courseId}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
        {/* Thumbnail with check overlay */}
        <div className="relative h-[190px] bg-zinc-200 dark:bg-zinc-700">
          {course.courseThumbnail ? (
            <img
              src={course.courseThumbnail}
              alt={course.courseTitle}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-zinc-400">▶</div>
          )}
          <div className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-full bg-green-500 text-white">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-3 p-4">
          {/* Tags row */}
          <div className="flex flex-wrap gap-1.5">
            {course.toolName && (
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                {course.toolName}
              </span>
            )}
            {course.skillName && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {course.skillName}
              </span>
            )}
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${difficulty.classes}`}
            >
              {difficulty.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
            {course.courseTitle}
          </h3>

          {/* Score + completion date */}
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium text-green-600 dark:text-green-400">
              Score: {course.score}/{course.totalQuestions}
            </span>
            <span className="text-xs text-zinc-400">{formatDate(course.completedAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

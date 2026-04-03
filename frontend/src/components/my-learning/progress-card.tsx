'use client'

import Link from 'next/link'
import type { InProgressCourse } from '@/types'

interface ProgressCardProps {
  course: InProgressCourse
}

const difficultyStyles: Record<string, { classes: string; label: string }> = {
  beginner: { classes: 'bg-green-100 text-green-700', label: 'Beginner' },
  intermediate: { classes: 'bg-amber-100 text-amber-700', label: 'Intermediate' },
  advanced: { classes: 'bg-rose-100 text-rose-700', label: 'Advanced' },
}

export function ProgressCard({ course }: ProgressCardProps) {
  const difficulty = difficultyStyles[course.difficulty] || difficultyStyles.beginner

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800">
      {/* Thumbnail */}
      <div className="h-[190px] bg-zinc-200 dark:bg-zinc-700">
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

        {/* Progress bar */}
        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-zinc-500">
            <span>
              {course.currentQuestion} / {course.totalQuestions} questions
            </span>
            <span>{course.progress}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all"
              style={{ width: `${course.progress}%` }}
            />
          </div>
        </div>

        {/* Continue button */}
        <Link
          href={`/courses/${course.courseId}`}
          className="mt-1 block rounded-lg bg-cyan-500 py-2 text-center text-sm font-medium text-white transition-colors hover:bg-cyan-600"
        >
          Continue Learning
        </Link>
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    thumbnailUrl: string
    difficulty: string
    duration: number
    toolId: string
    skillId: string
    creatorId: string
    questionCount: number
  }
  toolName?: string
  skillName?: string
  creatorName?: string
}

const difficultyStyles: Record<string, { bg: string; label: string }> = {
  beginner: { bg: 'bg-amber-400 text-amber-900', label: '初級' },
  intermediate: { bg: 'bg-cyan-400 text-cyan-900', label: '中級' },
  advanced: { bg: 'bg-zinc-400 text-zinc-900', label: '進階' },
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function CourseCard({ course, toolName, skillName, creatorName }: CourseCardProps) {
  const difficulty = difficultyStyles[course.difficulty] || difficultyStyles.beginner

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
        {/* Thumbnail */}
        <div className="relative aspect-video bg-zinc-200 dark:bg-zinc-700">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-4xl text-zinc-400">▶</div>
          )}
          <span
            className={`absolute top-2 left-2 rounded px-2 py-0.5 text-xs font-semibold ${difficulty.bg}`}
          >
            {difficulty.label}
          </span>
          <span className="absolute right-2 bottom-2 rounded bg-black/70 px-1.5 py-0.5 text-xs text-white">
            {formatDuration(course.duration)}
          </span>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-zinc-900 sm:text-base dark:text-zinc-100">
            {course.title}
          </h3>
          <p className="mb-3 line-clamp-2 text-xs text-zinc-500 sm:text-sm">{course.description}</p>

          {/* Tags */}
          <div className="mb-3 flex flex-wrap gap-1.5">
            {toolName && (
              <span className="rounded bg-cyan-50 px-2 py-0.5 text-xs text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                {toolName}
              </span>
            )}
            {skillName && (
              <span className="rounded bg-amber-50 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
                {skillName}
              </span>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between text-xs text-zinc-500">
            <div className="flex items-center gap-1.5">
              <div className="h-5 w-5 rounded-full bg-cyan-200" />
              <span>{creatorName || '未知創作者'}</span>
            </div>
            <span>{course.questionCount} 題</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

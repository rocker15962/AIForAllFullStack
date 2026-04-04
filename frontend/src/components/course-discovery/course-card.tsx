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
  creatorAvatarUrl?: string
}

const difficultyStyles: Record<string, { classes: string; label: string }> = {
  beginner: { classes: 'bg-green-100 text-green-700', label: 'Beginner' },
  intermediate: { classes: 'bg-amber-100 text-amber-700', label: 'Intermediate' },
  advanced: { classes: 'bg-rose-100 text-rose-700', label: 'Advanced' },
}

export function CourseCard({
  course,
  toolName,
  skillName,
  creatorName,
  creatorAvatarUrl,
}: CourseCardProps) {
  const difficulty = difficultyStyles[course.difficulty] || difficultyStyles.beginner

  return (
    <Link href={`/courses/${course.id}`} className="group block">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow group-hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800">
        {/* Thumbnail — 190px, no overlays */}
        <div className="h-[190px] bg-zinc-200 dark:bg-zinc-700">
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
        </div>

        {/* Body */}
        <div className="flex flex-col gap-2.5 p-4">
          {/* Tags row — tool + skill + difficulty all together */}
          <div className="flex flex-wrap gap-1.5">
            {toolName && (
              <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                {toolName}
              </span>
            )}
            {skillName && (
              <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                {skillName}
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
            {course.title}
          </h3>

          {/* Description */}
          <p className="line-clamp-2 text-[13px] text-zinc-500">{course.description}</p>

          {/* Footer — avatar + creator name only */}
          <div className="flex items-center gap-1.5">
            {creatorAvatarUrl ? (
              <img src={creatorAvatarUrl} alt="" className="h-5 w-5 rounded-full" />
            ) : (
              <div className="h-5 w-5 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            )}
            <span className="text-xs text-zinc-500">{creatorName || 'Unknown creator'}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}

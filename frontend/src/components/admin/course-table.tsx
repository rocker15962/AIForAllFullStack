'use client'

import { Archive, Eye, EyeOff, Link2, Pencil, RotateCcw } from 'lucide-react'
import type { CourseStatus } from '@/types'

interface CourseCardItem {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  difficulty: string
  duration: number
  toolId: string
  skillId: string
  status: CourseStatus
  questionCount: number
}

interface NameMap {
  [id: string]: string
}

interface CourseTableProps {
  courses: CourseCardItem[]
  toolNames: NameMap
  skillNames: NameMap
  onEdit: (course: CourseCardItem) => void
  /** Archives the course (BR-31). Learners keep their progress and badges. */
  onDelete: (course: CourseCardItem) => void
  onTogglePublish: (course: CourseCardItem) => void
  /** Moves an archived course back to draft. */
  onRestore?: (course: CourseCardItem) => void
  /** Copies a shareable preview link for a draft course (BR-05). */
  onCopyPreviewLink?: (course: CourseCardItem) => void
}

const statusStyles: Record<CourseStatus, { dot: string; label: string }> = {
  published: { dot: 'bg-green-500', label: '已發布' },
  draft: { dot: 'bg-amber-400', label: '草稿' },
  archived: { dot: 'bg-zinc-400', label: '已封存' },
}

const actionButtonClasses =
  'rounded-lg bg-white/90 p-1.5 text-zinc-600 shadow-sm hover:bg-white dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-800'

const difficultyStyles: Record<string, { classes: string; label: string }> = {
  beginner: { classes: 'bg-green-100 text-green-700', label: '入門' },
  intermediate: { classes: 'bg-amber-100 text-amber-700', label: '中級' },
  advanced: { classes: 'bg-rose-100 text-rose-700', label: '進階' },
}

export type { CourseCardItem }

export function CourseTable({
  courses,
  toolNames,
  skillNames,
  onEdit,
  onDelete,
  onTogglePublish,
  onRestore,
  onCopyPreviewLink,
}: CourseTableProps) {
  if (courses.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <p className="text-lg font-medium text-zinc-500 dark:text-zinc-400">找不到課程</p>
        <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500">
          試著調整篩選條件或搜尋關鍵字
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => {
        const difficulty = difficultyStyles[course.difficulty] || difficultyStyles.beginner
        const isPublished = course.status === 'published'
        const isArchived = course.status === 'archived'
        const status = statusStyles[course.status] ?? statusStyles.draft

        return (
          <div
            key={course.id}
            className="group overflow-hidden rounded-xl border border-zinc-200 bg-white transition-shadow hover:shadow-md dark:border-zinc-700 dark:bg-zinc-800"
          >
            {/* Thumbnail */}
            <div className="relative h-[190px] bg-zinc-200 dark:bg-zinc-700">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt={course.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-zinc-400">
                  ▶
                </div>
              )}

              {/* Action buttons overlay on hover */}
              <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                {isArchived ? (
                  onRestore && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRestore(course)
                      }}
                      title="還原"
                      aria-label={`還原「${course.title}」`}
                      className={actionButtonClasses}
                    >
                      <RotateCcw className="h-4 w-4" />
                    </button>
                  )
                ) : (
                  <>
                    {course.status === 'draft' && onCopyPreviewLink && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onCopyPreviewLink(course)
                        }}
                        title="複製預覽連結"
                        aria-label={`複製「${course.title}」的預覽連結`}
                        className={actionButtonClasses}
                      >
                        <Link2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onTogglePublish(course)
                      }}
                      title={isPublished ? '取消發布' : '發布'}
                      className={actionButtonClasses}
                    >
                      {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(course)
                      }}
                      title="編輯"
                      className={actionButtonClasses}
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(course)
                      }}
                      title="封存"
                      aria-label={`封存「${course.title}」`}
                      className="rounded-lg bg-white/90 p-1.5 text-rose-500 shadow-sm hover:bg-white dark:bg-zinc-800/90 dark:text-rose-400 dark:hover:bg-zinc-800"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <button
              type="button"
              onClick={() => onEdit(course)}
              className="flex w-full cursor-pointer flex-col gap-2.5 p-4 text-left"
            >
              {/* Tags row */}
              <div className="flex flex-wrap gap-1.5">
                {toolNames[course.toolId] && (
                  <span className="rounded-full bg-cyan-50 px-2 py-0.5 text-[11px] font-medium text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300">
                    {toolNames[course.toolId]}
                  </span>
                )}
                {skillNames[course.skillId] && (
                  <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[11px] font-medium text-violet-700 dark:bg-violet-900/30 dark:text-violet-300">
                    {skillNames[course.skillId]}
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
              <p className="line-clamp-1 text-[13px] text-zinc-500">{course.description}</p>

              {/* Footer — status dot + question count */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                  <span className="text-xs text-zinc-500">{status.label}</span>
                </div>
                <span className="text-xs text-zinc-400">{course.questionCount} 題</span>
              </div>
            </button>
          </div>
        )
      })}
    </div>
  )
}

'use client'

import type { ReactNode } from 'react'
import { Archive, Eye, EyeOff, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
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
  /** Asks to archive the course (BR-31). Learners keep their progress and badges. */
  onArchive: (course: CourseCardItem) => void
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
  'rounded-lg bg-white/90 p-1.5 text-zinc-600 shadow-sm hover:bg-white focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none dark:bg-zinc-800/90 dark:text-zinc-300 dark:hover:bg-zinc-800'

const footerButtonClasses =
  'w-full border-zinc-200 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300'

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
  onArchive,
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
        const titleId = `admin-course-${course.id}-title`

        // Draft cards share a preview link (BR-05); archived cards can only be restored (BR-31).
        let footer: ReactNode = null
        if (isArchived && onRestore) {
          footer = (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-describedby={titleId}
              onClick={() => onRestore(course)}
              className={footerButtonClasses}
            >
              還原成草稿
            </Button>
          )
        } else if (course.status === 'draft' && onCopyPreviewLink) {
          footer = (
            <Button
              type="button"
              variant="outline"
              size="sm"
              aria-describedby={titleId}
              onClick={() => onCopyPreviewLink(course)}
              className={footerButtonClasses}
            >
              複製預覽連結
            </Button>
          )
        }

        const body = (
          <>
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
            <h3
              id={titleId}
              className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 dark:text-zinc-100"
            >
              {course.title}
            </h3>

            {/* Description */}
            <p className="line-clamp-1 text-[13px] text-zinc-500 dark:text-zinc-400">
              {course.description}
            </p>

            {/* Meta — status dot + question count */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${status.dot}`} />
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{status.label}</span>
              </div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {course.questionCount} 題
              </span>
            </div>
          </>
        )

        // 10px between the meta row and the footer, matching the card's inner gap
        const bodyClasses = cn('flex w-full flex-col gap-2.5 p-4 text-left', footer && 'pb-2.5')

        return (
          <article
            key={course.id}
            aria-labelledby={titleId}
            className={cn(
              'group overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800',
              isArchived ? 'opacity-70' : 'transition-shadow hover:shadow-md',
            )}
          >
            {/* Thumbnail */}
            <div className="relative h-[190px] bg-zinc-200 dark:bg-zinc-700">
              {course.thumbnailUrl ? (
                <img
                  src={course.thumbnailUrl}
                  alt=""
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-4xl text-zinc-400">
                  ▶
                </div>
              )}

              {/* Hover actions — none on archived cards */}
              {!isArchived && (
                <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => onTogglePublish(course)}
                    title={isPublished ? '取消發布' : '發布'}
                    aria-label={`${isPublished ? '取消發布' : '發布'}「${course.title}」`}
                    className={actionButtonClasses}
                  >
                    {isPublished ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => onEdit(course)}
                    title="編輯"
                    aria-label={`編輯「${course.title}」`}
                    className={actionButtonClasses}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onArchive(course)}
                    title="封存"
                    aria-label={`封存「${course.title}」`}
                    className={actionButtonClasses}
                  >
                    <Archive className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Body — opens the editor, except on archived cards */}
            {isArchived ? (
              <div className={bodyClasses}>{body}</div>
            ) : (
              <button
                type="button"
                onClick={() => onEdit(course)}
                className={cn(
                  bodyClasses,
                  'cursor-pointer focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:outline-none focus-visible:ring-inset',
                )}
              >
                {body}
              </button>
            )}

            {footer && <div className="px-4 pb-4">{footer}</div>}
          </article>
        )
      })}
    </div>
  )
}

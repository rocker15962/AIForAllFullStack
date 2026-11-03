import type { ReactNode } from 'react'
import { EyeOff } from 'lucide-react'

/** Building blocks shared by the My Learning course cards. */

const difficultyTags: Record<string, { classes: string; label: string }> = {
  beginner: {
    classes: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    label: '入門',
  },
  intermediate: {
    classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    label: '中級',
  },
  advanced: {
    classes: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
    label: '進階',
  },
}

/** "11月1日" */
export function formatShortDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
}

export function CardThumbnail({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="h-[200px] bg-zinc-200 dark:bg-zinc-700">
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          className="flex h-full items-center justify-center text-4xl text-zinc-400"
          aria-hidden="true"
        >
          ▶
        </div>
      )}
    </div>
  )
}

const barTones = {
  accent: 'bg-cyan-500',
  success: 'bg-green-500',
  highlight: 'bg-amber-500',
} as const

/** 4px bar directly below the thumbnail. */
export function CardProgressBar({
  value,
  tone,
  label,
}: {
  value: number
  tone: keyof typeof barTones
  label: string
}) {
  const v = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuenow={v}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-1 bg-zinc-200 dark:bg-zinc-700"
    >
      <div
        className={`h-full ${barTones[tone]} ${v < 100 ? 'rounded-r-sm' : ''}`}
        style={{ width: `${v}%` }}
      />
    </div>
  )
}

export function CourseTitle({ children }: { children: ReactNode }) {
  return (
    <h3 className="line-clamp-2 text-[15px] leading-snug font-semibold text-zinc-900 dark:text-zinc-100">
      {children}
    </h3>
  )
}

export function CourseTags({
  toolName,
  skillName,
  difficulty,
}: {
  toolName: string
  skillName: string
  difficulty: string
}) {
  const level = difficultyTags[difficulty] ?? difficultyTags.beginner
  return (
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
      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${level.classes}`}>
        {level.label}
      </span>
    </div>
  )
}

/** Bottom row: status on the left, a quieter note (date, badge kept…) on the right. */
export function CardMeta({ left, right }: { left: ReactNode; right?: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-2 text-xs leading-4">
      <span>{left}</span>
      {right && <span className="text-zinc-400 dark:text-zinc-500">{right}</span>}
    </div>
  )
}

/** BR-36: the latest round scored below 60%. */
export function LatestRoundFailed({ score }: { score: number }) {
  return (
    <span className="font-semibold text-amber-700 dark:text-amber-300">
      最新一輪未通過 · {Math.round(score)}%
    </span>
  )
}

export const cardClasses =
  'overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'

export const outlineFooterButton =
  'block w-full rounded-lg border border-zinc-200 bg-white py-2.5 text-center text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

interface UnavailableCourseCardProps {
  title: string
  thumbnail: string
  toolName: string
  skillName: string
  difficulty: string
  /** 「課程已封存」 or 「課程暫停開放」 */
  reason: string
}

/**
 * BR-31 / BR-37: an archived or unpublished course stays in My Learning, dimmed and without a
 * link or actions.
 */
export function UnavailableCourseCard({
  title,
  thumbnail,
  toolName,
  skillName,
  difficulty,
  reason,
}: UnavailableCourseCardProps) {
  return (
    <div className={`${cardClasses} opacity-60`}>
      <CardThumbnail src={thumbnail} alt={title} />
      <div className="flex flex-col gap-2.5 p-4">
        <CourseTitle>{title}</CourseTitle>
        <CourseTags toolName={toolName} skillName={skillName} difficulty={difficulty} />
        <CardMeta
          left={
            <span className="inline-flex items-center gap-1.5 font-medium text-zinc-500 dark:text-zinc-400">
              <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
              已無法觀看
            </span>
          }
          right={reason}
        />
      </div>
    </div>
  )
}

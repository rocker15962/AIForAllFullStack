import type { UserProgressRow } from './user-table'

interface UserProgressPanelProps {
  userName: string
  rows: UserProgressRow[]
  isLoading: boolean
  error: string | null
}

/**
 * Latest scored round was below the pass line (BR-36). A passed course stays completed
 * (badge kept); a never-passed course stays in progress. Both show the latest score.
 */
function latestRoundFailed(row: UserProgressRow): boolean {
  return row.latestRoundPassed === false
}

function roundedScore(row: UserProgressRow): number {
  return Math.min(100, Math.max(0, Math.round(row.score ?? 0)))
}

function progressPercent(row: UserProgressRow): number {
  if (latestRoundFailed(row)) return roundedScore(row)
  if (row.status === 'completed') return 100
  if (row.totalQuestions <= 0) return 0
  return Math.min(100, Math.round((row.answeredCount / row.totalQuestions) * 100))
}

function statusLabel(row: UserProgressRow): string {
  if (latestRoundFailed(row)) return `最新一輪未通過 · ${roundedScore(row)}%`
  if (row.status === 'completed') return `已完成 · ${roundedScore(row)}%`
  return `進行中 · ${progressPercent(row)}%`
}

function barColor(row: UserProgressRow): string {
  if (latestRoundFailed(row)) return 'bg-amber-500'
  if (row.status === 'completed') return 'bg-green-500'
  return 'bg-cyan-500'
}

/** Expanded "learning progress" panel shown under a row in the admin user table (BR-34). */
export function UserProgressPanel({ userName, rows, isLoading, error }: UserProgressPanelProps) {
  const completed = rows.filter((r) => r.status === 'completed').length
  const inProgress = rows.length - completed

  return (
    <section
      aria-label={`${userName} 的學習進度`}
      className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-5 dark:border-zinc-700/50 dark:bg-zinc-900/30"
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {userName} 的學習進度
      </h3>
      {!isLoading && !error && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          已完成 {completed} 堂 · 進行中 {inProgress} 堂
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">還沒有學習紀錄</p>
      ) : (
        <ul className="mt-3 flex flex-col">
          {rows.map((row) => {
            const pct = progressPercent(row)
            return (
              <li
                key={row.courseId}
                className="grid grid-cols-1 items-center gap-2 border-b border-zinc-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_180px_160px] sm:gap-4 dark:border-zinc-700/50"
              >
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {row.courseTitle}
                  {row.courseStatus === 'archived' && (
                    <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      已封存
                    </span>
                  )}
                </span>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`「${row.courseTitle}」的學習進度`}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                >
                  <div
                    className={`h-full rounded-full ${barColor(row)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[13px] whitespace-nowrap text-zinc-500 sm:text-right dark:text-zinc-400">
                  {statusLabel(row)}
                </span>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

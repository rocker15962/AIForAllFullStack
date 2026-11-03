import type { UserProgressRow } from './user-table'

interface UserProgressPanelProps {
  userName: string
  rows: UserProgressRow[]
  isLoading: boolean
  error: string | null
}

function progressPercent(row: UserProgressRow): number {
  if (row.status === 'completed') return 100
  if (row.totalQuestions <= 0) return 0
  return Math.min(100, Math.round((row.answeredCount / row.totalQuestions) * 100))
}

/** Latest round finished below the pass line (BR-12): not completed, but scored. */
function isNotPassed(row: UserProgressRow): boolean {
  return row.status === 'in_progress' && row.score !== null
}

function statusLabel(row: UserProgressRow): string {
  if (row.status === 'completed') return `Completed · ${Math.round(row.score ?? 0)}%`
  if (isNotPassed(row)) return `Not passed · ${Math.round(row.score ?? 0)}%`
  return `In progress · ${progressPercent(row)}%`
}

function barColor(row: UserProgressRow): string {
  if (row.status === 'completed') return 'bg-green-500'
  if (isNotPassed(row)) return 'bg-zinc-400'
  return 'bg-cyan-500'
}

/** Expanded "learning progress" panel shown under a row in the admin user table (BR-34). */
export function UserProgressPanel({ userName, rows, isLoading, error }: UserProgressPanelProps) {
  const completed = rows.filter((r) => r.status === 'completed').length
  const inProgress = rows.length - completed

  return (
    <section
      aria-label={`${userName}'s learning progress`}
      className="border-b border-zinc-100 bg-zinc-50/60 px-5 py-5 dark:border-zinc-700/50 dark:bg-zinc-900/30"
    >
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
        {userName}&rsquo;s learning progress
      </h3>
      {!isLoading && !error && (
        <p className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">
          {completed} completed · {inProgress} in progress
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
        </div>
      ) : error ? (
        <p className="py-6 text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-sm text-zinc-500 dark:text-zinc-400">
          No learning activity yet
        </p>
      ) : (
        <ul className="mt-3 flex flex-col">
          {rows.map((row) => {
            const pct = progressPercent(row)
            return (
              <li
                key={row.courseId}
                className="grid grid-cols-1 items-center gap-2 border-b border-zinc-100 py-3 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_180px_110px] sm:gap-4 dark:border-zinc-700/50"
              >
                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                  {row.courseTitle}
                  {row.courseStatus === 'archived' && (
                    <span className="ml-2 rounded bg-zinc-200 px-1.5 py-0.5 text-[11px] text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300">
                      Archived
                    </span>
                  )}
                </span>
                <div
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={pct}
                  aria-label={`${row.courseTitle} progress`}
                  className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
                >
                  <div
                    className={`h-full rounded-full ${barColor(row)}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="text-[13px] text-zinc-500 sm:text-right dark:text-zinc-400">
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

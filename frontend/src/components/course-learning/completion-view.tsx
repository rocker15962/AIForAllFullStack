import Link from 'next/link'
import type { ReactNode } from 'react'
import { Award, BookCheck, Trophy } from 'lucide-react'
import { PASSING_SCORE } from '@/lib/learning-rules'

const primaryButton =
  'inline-flex items-center justify-center rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-60'
const outlineButton =
  'inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700'

interface CompletionViewProps {
  score: number
  totalQuestions: number
  correctAnswers: number
  /** Whether this round completes the course (score >= 60%, BR-12). Defaults from the score. */
  passed?: boolean
  /** The learner holds this course's badge, from this or an earlier round (BR-16). */
  badgeEarned?: boolean
  /** When the badge was first earned (RFC3339), shown after a failed retake (BR-36). */
  badgeEarnedAt?: string | null
  /** Starts a new round (BR-16). Hidden when not provided. */
  onRetake?: () => void
  isRetaking?: boolean
  /** Extra content below the actions, such as an error message. */
  children?: ReactNode
}

/** "9月23日" */
function formatMonthDay(iso: string): string | null {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return null
  return date.toLocaleDateString('zh-TW', { month: 'long', day: 'numeric' })
}

function scoreColor(score: number, passed: boolean): string {
  if (!passed) return 'text-zinc-400 dark:text-zinc-500'
  if (score >= 100) return 'text-amber-500'
  return 'text-cyan-500'
}

/** Result of a scored round for a signed-in learner or a preview (BR-12, BR-14, BR-36). */
export function CompletionView({
  score,
  totalQuestions,
  correctAnswers,
  passed = score >= PASSING_SCORE,
  badgeEarned = false,
  badgeEarnedAt = null,
  onRetake,
  isRetaking = false,
  children,
}: CompletionViewProps) {
  const earnedOn = badgeEarnedAt ? formatMonthDay(badgeEarnedAt) : null
  let message = `答對 ${PASSING_SCORE}% 以上才算完課、拿到徽章。`
  if (passed) message = score >= 100 ? '滿分！' : '做得好！'

  return (
    <div className="py-8 text-center">
      {passed && (
        <div className="mb-2 flex justify-center" data-testid="result-trophy">
          <Trophy className="h-14 w-14 text-amber-500" strokeWidth={1.75} aria-hidden="true" />
        </div>
      )}
      <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {passed ? '恭喜完成！' : '繼續加油！'}
      </h2>
      <p className="mb-5 text-sm text-zinc-500 dark:text-zinc-400">{message}</p>

      <div className={`mb-2 text-5xl leading-none font-extrabold ${scoreColor(score, passed)}`}>
        {Math.round(score)}%
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        答對 {correctAnswers} / {totalQuestions} 題
      </p>
      {passed && badgeEarned && (
        <p className="mt-2 text-sm font-medium text-amber-600 dark:text-amber-400">
          你獲得了這堂課的徽章。
        </p>
      )}

      <div className="mt-8 flex flex-col items-center gap-4">
        <div className="flex flex-wrap justify-center gap-3">
          {passed ? (
            <Link href="/courses" className={primaryButton}>
              探索更多課程
            </Link>
          ) : (
            onRetake && (
              <button
                type="button"
                onClick={onRetake}
                disabled={isRetaking}
                className={primaryButton}
              >
                重做測驗
              </button>
            )
          )}
          <Link href="/courses" className={outlineButton}>
            返回課程列表
          </Link>
        </div>

        {!passed && badgeEarned && (
          <p className="flex items-center gap-1.5 text-[13px] leading-5 text-zinc-500 dark:text-zinc-400">
            <Award className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
            {earnedOn ? `你仍保留之前拿到的徽章（${earnedOn}取得）` : '你仍保留之前拿到的徽章'}
          </p>
        )}

        {/* A passed course can still be retaken (BR-16); kept low-key so it doesn't compete. */}
        {passed && onRetake && (
          <button
            type="button"
            onClick={onRetake}
            disabled={isRetaking}
            className="text-sm font-medium text-cyan-600 hover:underline disabled:opacity-60 dark:text-cyan-400"
          >
            重做測驗
          </button>
        )}
      </div>

      {children}
    </div>
  )
}

interface GuestResultViewProps {
  totalQuestions: number
  onLogin: () => void
}

/** A guest answered every question: no score until they sign in (BR-11). */
export function GuestResultView({ totalQuestions, onLogin }: GuestResultViewProps) {
  return (
    <div className="py-8 text-center">
      <div className="mb-2 flex justify-center">
        <BookCheck className="h-14 w-14 text-cyan-500" strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
        {totalQuestions} 題都做完了
      </h2>
      <p className="mb-8 text-sm text-zinc-500 dark:text-zinc-400">
        登入後就能看到分數、每題的對錯和解說，也能拿到這堂課的徽章。
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <button type="button" onClick={onLogin} className={primaryButton}>
          登入查看結果
        </button>
        <Link href="/courses" className={outlineButton}>
          返回課程列表
        </Link>
      </div>
    </div>
  )
}

import Link from 'next/link'
import type { ReactNode } from 'react'
import { PASSING_SCORE } from '@/lib/learning-rules'

interface CompletionViewProps {
  score: number
  totalQuestions: number
  correctAnswers: number
  /** Whether this round completes the course (score >= 60%, BR-12). Defaults from the score. */
  passed?: boolean
  /** The learner holds this course's badge, from this or an earlier round (BR-16). */
  badgeEarned?: boolean
  /** Starts a new round (BR-16). Hidden when not provided. */
  onRetake?: () => void
  isRetaking?: boolean
  /** Recommended courses (BR-15). */
  children?: ReactNode
}

function getScoreStyle(score: number, passed: boolean): { color: string; message: string } {
  if (!passed) return { color: 'text-zinc-400', message: '繼續加油！' }
  if (score >= 100) return { color: 'text-amber-500', message: '滿分！' }
  return { color: 'text-cyan-500', message: '做得好！' }
}

export function CompletionView({
  score,
  totalQuestions,
  correctAnswers,
  passed = score >= PASSING_SCORE,
  badgeEarned = false,
  onRetake,
  isRetaking = false,
  children,
}: CompletionViewProps) {
  const { color, message } = getScoreStyle(score, passed)

  return (
    <div className="py-8 text-center">
      {passed ? (
        <>
          <div className="mb-2 text-6xl" aria-hidden="true">
            🏆
          </div>
          <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">恭喜完成！</h2>
          <p className="mb-5 text-sm text-zinc-500">{message}</p>
        </>
      ) : (
        <>
          <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{message}</h2>
          <p className="mb-5 text-sm text-zinc-500">
            答對 {PASSING_SCORE}% 以上才算完課，隨時都可以重做。
          </p>
        </>
      )}

      <div className={`mb-2 text-5xl font-extrabold ${color}`}>{Math.round(score)}%</div>
      <p className="mb-2 text-sm text-zinc-500">
        答對 {correctAnswers} / {totalQuestions} 題
      </p>
      {badgeEarned && (
        <p className="mb-6 text-sm font-medium text-amber-600 dark:text-amber-400">
          {passed ? '你獲得了這堂課的徽章。' : '之前獲得的徽章會保留。'}
        </p>
      )}
      {!badgeEarned && <div className="mb-6" />}

      <div className="flex flex-wrap justify-center gap-3">
        {!passed && onRetake && (
          <button
            type="button"
            onClick={onRetake}
            disabled={isRetaking}
            className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:opacity-60"
          >
            重做測驗
          </button>
        )}
        <Link
          href="/courses"
          className={
            passed
              ? 'rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600'
              : 'rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
          }
        >
          探索更多課程
        </Link>
        <Link
          href="/courses"
          className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          返回課程列表
        </Link>
      </div>
      {passed && onRetake && (
        <button
          type="button"
          onClick={onRetake}
          disabled={isRetaking}
          className="mt-4 text-sm font-medium text-cyan-600 hover:underline disabled:opacity-60 dark:text-cyan-400"
        >
          重做測驗
        </button>
      )}

      {children}
    </div>
  )
}

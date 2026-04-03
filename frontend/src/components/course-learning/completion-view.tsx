import Link from 'next/link'

interface CompletionViewProps {
  score: number
  totalQuestions: number
  correctAnswers: number
}

function getScoreStyle(score: number): { color: string; message: string } {
  if (score >= 100) return { color: 'text-amber-500', message: '完美！' }
  if (score >= 60) return { color: 'text-cyan-500', message: '做得好！' }
  return { color: 'text-zinc-400', message: '繼續加油！' }
}

export function CompletionView({ score, totalQuestions, correctAnswers }: CompletionViewProps) {
  const { color, message } = getScoreStyle(score)

  return (
    <div className="py-8 text-center">
      <div className="mb-2 text-6xl">🏆</div>
      <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">恭喜完成！</h2>
      <p className="mb-5 text-sm text-zinc-500">{message}</p>

      <div className={`mb-2 text-5xl font-extrabold ${color}`}>{Math.round(score)}%</div>
      <p className="mb-8 text-sm text-zinc-500">
        答對 {correctAnswers} / {totalQuestions} 題
      </p>

      <div className="flex justify-center gap-3">
        <Link
          href="/courses"
          className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
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
    </div>
  )
}

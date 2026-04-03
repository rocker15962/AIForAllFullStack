import Link from 'next/link'

interface CompletionViewProps {
  score: number
  totalQuestions: number
  correctAnswers: number
}

function getScoreStyle(score: number): { color: string; message: string } {
  if (score >= 100) return { color: 'text-amber-500', message: 'Perfect!' }
  if (score >= 60) return { color: 'text-cyan-500', message: 'Well done!' }
  return { color: 'text-zinc-400', message: 'Keep going!' }
}

export function CompletionView({ score, totalQuestions, correctAnswers }: CompletionViewProps) {
  const { color, message } = getScoreStyle(score)

  return (
    <div className="py-8 text-center">
      <div className="mb-2 text-6xl">🏆</div>
      <h2 className="mb-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">Congratulations!</h2>
      <p className="mb-5 text-sm text-zinc-500">{message}</p>

      <div className={`mb-2 text-5xl font-extrabold ${color}`}>{Math.round(score)}%</div>
      <p className="mb-8 text-sm text-zinc-500">
        {correctAnswers} / {totalQuestions} correct
      </p>

      <div className="flex justify-center gap-3">
        <Link
          href="/courses"
          className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
        >
          Explore More Courses
        </Link>
        <Link
          href="/courses"
          className="rounded-lg border border-zinc-200 bg-white px-6 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
        >
          Back to Courses
        </Link>
      </div>
    </div>
  )
}

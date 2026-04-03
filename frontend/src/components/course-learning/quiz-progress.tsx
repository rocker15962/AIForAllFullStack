interface QuizProgressProps {
  current: number
  total: number
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  const percent = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="mb-6">
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">課後測驗</span>
        <span className="text-sm text-zinc-500">
          第 {current} 題 / 共 {total} 題
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-700">
        <div
          className="h-full rounded-full bg-cyan-500 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

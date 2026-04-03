interface QuizProgressProps {
  current: number
  total: number
}

export function QuizProgress({ current, total }: QuizProgressProps) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-sm ${
            i < current ? 'bg-cyan-500' : 'bg-zinc-200 dark:bg-zinc-700'
          }`}
        />
      ))}
    </div>
  )
}

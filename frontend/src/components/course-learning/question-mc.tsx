'use client'

interface Option {
  id: string
  text: string
}

interface QuestionMCProps {
  question: string
  options: Option[]
  selectedAnswer: string | null
  onSelect: (optionId: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function QuestionMC({
  question,
  options,
  selectedAnswer,
  onSelect,
  onSubmit,
  disabled,
}: QuestionMCProps) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
        {question}
      </h3>

      <div className="mb-5 flex flex-col gap-2">
        {options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => !disabled && onSelect(opt.id)}
            disabled={disabled}
            className={`rounded-lg border-2 px-4 py-3 text-left text-sm transition-colors ${
              selectedAnswer === opt.id
                ? 'border-cyan-500 bg-cyan-50 text-cyan-900 dark:bg-cyan-900/20 dark:text-cyan-100'
                : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            {opt.text}
          </button>
        ))}
      </div>

      <button
        onClick={onSubmit}
        disabled={!selectedAnswer || disabled}
        className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        提交答案
      </button>
    </div>
  )
}

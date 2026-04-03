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
    <div className="flex flex-col gap-6">
      <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">{question}</h3>

      <div className="flex flex-col gap-3">
        {options.map((opt) => {
          const isSelected = selectedAnswer === opt.id
          return (
            <button
              key={opt.id}
              onClick={() => !disabled && onSelect(opt.id)}
              disabled={disabled}
              className={`flex h-12 items-center gap-3 rounded-lg border-2 px-4 text-left text-sm transition-colors ${
                isSelected
                  ? 'border-cyan-400 bg-cyan-50 text-cyan-700 dark:border-cyan-500 dark:bg-cyan-900/20 dark:text-cyan-300'
                  : 'border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300'
              } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
            >
              {/* Radio circle */}
              <div
                className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-500'
                    : 'border-zinc-300 dark:border-zinc-600'
                }`}
              >
                {isSelected && <div className="h-2 w-2 rounded-full bg-white" />}
              </div>
              <span className={isSelected ? 'font-medium' : 'font-normal'}>{opt.text}</span>
            </button>
          )
        })}
      </div>

      {/* Submit button — right aligned */}
      <div className="flex justify-end">
        <button
          onClick={onSubmit}
          disabled={!selectedAnswer || disabled}
          className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Submit Answer
        </button>
      </div>
    </div>
  )
}

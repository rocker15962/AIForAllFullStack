'use client'

interface QuestionSAProps {
  question: string
  answer: string
  onChange: (value: string) => void
  onSubmit: () => void
  disabled: boolean
}

export function QuestionSA({ question, answer, onChange, onSubmit, disabled }: QuestionSAProps) {
  return (
    <div>
      <h3 className="mb-4 text-base font-semibold text-zinc-900 sm:text-lg dark:text-zinc-100">
        {question}
      </h3>

      <textarea
        value={answer}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder="輸入你的答案…"
        rows={3}
        className="mb-5 w-full resize-none rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 transition-colors outline-none focus:border-cyan-400 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
      />

      <button
        onClick={onSubmit}
        disabled={!answer.trim() || disabled}
        className="rounded-lg bg-cyan-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        送出答案
      </button>
    </div>
  )
}

interface AnswerFeedbackProps {
  correct: boolean
  correctAnswer: string
  explanation: string
  onNext: () => void
  isLast: boolean
}

export function AnswerFeedback({
  correct,
  correctAnswer,
  explanation,
  onNext,
  isLast,
}: AnswerFeedbackProps) {
  return (
    <div>
      <div
        className={`rounded-lg border p-4 ${
          correct
            ? 'border-green-300 bg-green-50 dark:border-green-700 dark:bg-green-900/20'
            : 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
        }`}
      >
        <p
          className={`mb-1 text-sm font-semibold ${correct ? 'text-green-800 dark:text-green-300' : 'text-red-800 dark:text-red-300'}`}
        >
          {correct ? '✓ 答對了！' : '✗ 答錯了'}
        </p>

        {!correct && correctAnswer && (
          <p
            className={`mb-2 text-xs ${correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
          >
            正確答案：{correctAnswer}
          </p>
        )}

        {explanation && (
          <p
            className={`text-sm ${correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}
          >
            {explanation}
          </p>
        )}
      </div>

      <button
        onClick={onNext}
        className="mt-4 rounded-lg bg-cyan-500 px-5 py-2 text-sm font-semibold text-white transition-colors hover:bg-cyan-600"
      >
        {isLast ? '查看結果' : '下一題 →'}
      </button>
    </div>
  )
}

interface ResultsBarProps {
  count: number
  hasActiveFilters: boolean
  onClearAll: () => void
}

export function ResultsBar({ count, hasActiveFilters, onClearAll }: ResultsBarProps) {
  return (
    <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {count} {count === 1 ? 'course' : 'courses'}
      </span>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          Clear all filters
        </button>
      )}
    </div>
  )
}

interface ResultsBarProps {
  /** Filtered course count across all pages */
  count: number
  /** Courses shown on this page; pass it only when the results span several pages (BR-40) */
  range?: { from: number; to: number }
  hasActiveFilters: boolean
  onClearAll: () => void
}

export function ResultsBar({ count, range, hasActiveFilters, onClearAll }: ResultsBarProps) {
  const rangeText = range ? ` · 第 ${range.from}–${range.to} 堂` : ''

  return (
    <div className="mb-3 flex min-h-8 items-center justify-between gap-3">
      <span className="text-sm text-zinc-500 dark:text-zinc-400" aria-live="polite">
        {`共 ${count} 堂課${rangeText}`}
      </span>
      {hasActiveFilters && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm font-medium text-cyan-600 hover:text-cyan-700 hover:underline dark:text-cyan-400 dark:hover:text-cyan-300"
        >
          清除全部篩選
        </button>
      )}
    </div>
  )
}

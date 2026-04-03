import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
        <Icon className="h-7 w-7 text-zinc-400" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-zinc-500">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-300"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

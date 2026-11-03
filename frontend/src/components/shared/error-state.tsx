import { WifiOff } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  description?: string
  onRetry: () => void
}

export function ErrorState({
  title = '發生錯誤',
  description = '無法載入資料，請檢查網路後再試一次。',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center py-10 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-50 dark:bg-red-900/20">
        <WifiOff className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mb-2 text-lg font-semibold text-zinc-800 dark:text-zinc-200">{title}</h3>
      <p className="mb-6 max-w-xs text-sm leading-relaxed text-zinc-500">{description}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600"
      >
        再試一次
      </button>
    </div>
  )
}

'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getPageItems } from './page-range'

interface PaginationProps {
  /** Current page, 1-based */
  page: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
}

/** The app's primary (cyan) look; the shadcn `default` variant is neutral in this theme. */
const currentPageClasses = 'bg-cyan-500 text-white hover:bg-cyan-600'

/**
 * Page-number pagination (BR-40): 上一頁, page numbers, 下一頁. Hidden when everything fits on
 * one page.
 */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null

  const items = getPageItems(page, totalPages)

  return (
    <nav
      aria-label="分頁"
      className={cn('flex flex-wrap items-center justify-center gap-1.5', className)}
    >
      <Button
        variant="outline"
        size="sm"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        上一頁
      </Button>

      {items.map((item) => {
        if (typeof item !== 'number') {
          return (
            <span
              key={item}
              aria-hidden="true"
              className="flex h-7 min-w-5 items-center justify-center text-sm text-zinc-400 dark:text-zinc-500"
            >
              …
            </span>
          )
        }

        const isCurrent = item === page
        return (
          <Button
            key={item}
            variant={isCurrent ? 'default' : 'outline'}
            size="sm"
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => {
              if (!isCurrent) onPageChange(item)
            }}
            className={cn('min-w-7 tabular-nums', isCurrent && currentPageClasses)}
          >
            {item}
          </Button>
        )
      })}

      <Button
        variant="outline"
        size="sm"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        下一頁
      </Button>
    </nav>
  )
}

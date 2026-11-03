'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { parsePageParam } from './page-range'

/** `push` adds a history entry (page clicks); `replace` doesn't (resets and corrections). */
export type PageHistoryMode = 'push' | 'replace'

interface PageTarget {
  page: number
  history: PageHistoryMode
}

/**
 * The current list page, kept in sync with `?page=` (BR-40).
 *
 * Local state drives rendering, so a page reset can land in the same render as the filter
 * change that caused it (one request, not two). The URL follows in an effect without
 * scrolling, and URL changes made elsewhere (back/forward, a nav link) flow back into the
 * state. Page 1 is written as no `page` param.
 *
 * Uses `useSearchParams`, so the caller must sit under a Suspense boundary.
 */
export function usePageParam(): [
  page: number,
  setPage: (page: number, history?: PageHistoryMode) => void,
] {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const urlPage = parsePageParam(searchParams.get('page'))

  const [target, setTarget] = useState<PageTarget>({ page: urlPage, history: 'replace' })

  // Follow URL changes we didn't make ourselves (adjusting state while rendering).
  const [seenUrlPage, setSeenUrlPage] = useState(urlPage)
  if (urlPage !== seenUrlPage) {
    setSeenUrlPage(urlPage)
    if (target.page !== urlPage) setTarget({ page: urlPage, history: 'replace' })
  }

  useEffect(() => {
    if (target.page === urlPage) return
    const params = new URLSearchParams(searchParams.toString())
    if (target.page > 1) params.set('page', String(target.page))
    else params.delete('page')
    const query = params.toString()
    const href = query ? `${pathname}?${query}` : pathname
    if (target.history === 'push') router.push(href, { scroll: false })
    else router.replace(href, { scroll: false })
  }, [target, urlPage, searchParams, pathname, router])

  const setPage = useCallback((page: number, history: PageHistoryMode = 'push') => {
    setTarget((prev) => (prev.page === page ? prev : { page, history }))
  }, [])

  return [target.page, setPage]
}

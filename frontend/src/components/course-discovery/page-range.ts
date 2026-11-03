/** Courses per page on Explore (BR-40). Matches the API's default `limit`. */
export const PAGE_SIZE = 20

/** A page number, or a gap standing in for the pages hidden between two numbers. */
export type PageItem = number | 'start-ellipsis' | 'end-ellipsis'

/** Reads `?page=`; anything that is not a whole number of at least 1 means page 1. */
export function parsePageParam(value: string | null | undefined): number {
  if (!value || !/^\d+$/.test(value)) return 1
  const page = Number(value)
  return Number.isSafeInteger(page) && page >= 1 ? page : 1
}

/** Number of pages for `total` results; never less than 1 so "page 1" always exists. */
export function getTotalPages(total: number, pageSize: number): number {
  return Math.max(1, Math.ceil(total / pageSize))
}

/** Keeps `page` within 1…`totalPages`. */
export function clampPage(page: number, totalPages: number): number {
  return Math.min(Math.max(1, page), Math.max(1, totalPages))
}

/** 1-based numbers of the first and last result shown on `page`. */
export function getItemRange(
  page: number,
  pageSize: number,
  total: number,
): { from: number; to: number } {
  if (total <= 0) return { from: 0, to: 0 }
  const current = clampPage(page, getTotalPages(total, pageSize))
  return {
    from: (current - 1) * pageSize + 1,
    to: Math.min(current * pageSize, total),
  }
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

/**
 * Page numbers to show in the pagination bar. Up to 7 pages are listed in full; beyond that
 * the first and last page, the current page and its neighbours stay visible and the rest
 * collapse into an ellipsis. An ellipsis never hides just one page.
 */
export function getPageItems(page: number, totalPages: number, siblingCount = 1): PageItem[] {
  const last = Math.max(1, totalPages)
  const current = clampPage(page, last)
  // first + last + current + siblings on both sides + two ellipses
  const maxItems = siblingCount * 2 + 5

  if (last <= maxItems) return range(1, last)

  const leftSibling = Math.max(current - siblingCount, 1)
  const rightSibling = Math.min(current + siblingCount, last)
  const showStartEllipsis = leftSibling > 3
  const showEndEllipsis = rightSibling < last - 2
  const edgeCount = siblingCount * 2 + 3

  if (!showStartEllipsis) return [...range(1, edgeCount), 'end-ellipsis', last]
  if (!showEndEllipsis) return [1, 'start-ellipsis', ...range(last - edgeCount + 1, last)]
  return [1, 'start-ellipsis', ...range(leftSibling, rightSibling), 'end-ellipsis', last]
}

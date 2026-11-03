import { describe, it, expect } from 'vitest'
import {
  PAGE_SIZE,
  clampPage,
  getItemRange,
  getPageItems,
  getTotalPages,
  parsePageParam,
} from '../page-range'

describe('PAGE_SIZE', () => {
  it('shows 20 courses per page (BR-40)', () => {
    expect(PAGE_SIZE).toBe(20)
  })
})

describe('parsePageParam', () => {
  it('reads a positive whole number', () => {
    expect(parsePageParam('3')).toBe(3)
  })

  it('falls back to page 1 when the param is missing', () => {
    expect(parsePageParam(null)).toBe(1)
    expect(parsePageParam(undefined)).toBe(1)
    expect(parsePageParam('')).toBe(1)
  })

  it('falls back to page 1 for zero, negative, fractional or non-numeric values', () => {
    expect(parsePageParam('0')).toBe(1)
    expect(parsePageParam('-2')).toBe(1)
    expect(parsePageParam('2.5')).toBe(1)
    expect(parsePageParam('abc')).toBe(1)
    expect(parsePageParam('2abc')).toBe(1)
  })
})

describe('getTotalPages', () => {
  it('rounds up partial pages', () => {
    expect(getTotalPages(41, 20)).toBe(3)
  })

  it('counts an exact multiple without an extra page', () => {
    expect(getTotalPages(40, 20)).toBe(2)
  })

  it('always has at least one page, even with no results', () => {
    expect(getTotalPages(0, 20)).toBe(1)
    expect(getTotalPages(5, 20)).toBe(1)
  })
})

describe('clampPage', () => {
  it('keeps a page that is in range', () => {
    expect(clampPage(2, 3)).toBe(2)
  })

  it('moves a page past the end back to the last page', () => {
    expect(clampPage(9, 3)).toBe(3)
  })

  it('never goes below page 1', () => {
    expect(clampPage(0, 3)).toBe(1)
    expect(clampPage(-4, 3)).toBe(1)
  })
})

describe('getItemRange', () => {
  it('returns the first and last course number on the first page', () => {
    expect(getItemRange(1, 20, 45)).toEqual({ from: 1, to: 20 })
  })

  it('returns the range of a middle page', () => {
    expect(getItemRange(2, 20, 45)).toEqual({ from: 21, to: 40 })
  })

  it('stops at the total on the last page', () => {
    expect(getItemRange(3, 20, 45)).toEqual({ from: 41, to: 45 })
  })

  it('returns an empty range when there are no results', () => {
    expect(getItemRange(1, 20, 0)).toEqual({ from: 0, to: 0 })
  })
})

describe('getPageItems', () => {
  it('lists every page when there are 7 or fewer', () => {
    expect(getPageItems(1, 1)).toEqual([1])
    expect(getPageItems(2, 3)).toEqual([1, 2, 3])
    expect(getPageItems(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7])
  })

  it('collapses the end when the current page is near the start', () => {
    expect(getPageItems(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
    expect(getPageItems(4, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10])
  })

  it('collapses both sides when the current page is in the middle', () => {
    expect(getPageItems(5, 10)).toEqual([1, 'start-ellipsis', 4, 5, 6, 'end-ellipsis', 10])
  })

  it('collapses the start when the current page is near the end', () => {
    expect(getPageItems(7, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
    expect(getPageItems(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10])
  })

  it('never hides a single page behind an ellipsis', () => {
    // Page 2 would be the only hidden page on the left, so it is shown instead.
    expect(getPageItems(4, 9)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 9])
  })

  it('treats an out-of-range current page as the nearest valid page', () => {
    expect(getPageItems(99, 10)).toEqual(getPageItems(10, 10))
  })
})

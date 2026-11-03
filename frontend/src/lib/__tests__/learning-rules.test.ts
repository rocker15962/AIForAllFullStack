import { describe, it, expect } from 'vitest'
import { firstUnansweredIndex, hasReachedStartThreshold, isPassing } from '../learning-rules'

describe('isPassing (BR-12)', () => {
  it('passes at exactly 60%', () => {
    expect(isPassing(3, 5)).toBe(true)
    expect(isPassing(6, 10)).toBe(true)
  })
  it('fails below 60% and with no questions', () => {
    expect(isPassing(2, 5)).toBe(false)
    expect(isPassing(0, 0)).toBe(false)
  })
})

describe('hasReachedStartThreshold (BR-17)', () => {
  it('needs 10% of the video length', () => {
    expect(hasReachedStartThreshold(59, 600)).toBe(false)
    expect(hasReachedStartThreshold(60, 600)).toBe(true)
  })
  it('never fires without a known length', () => {
    expect(hasReachedStartThreshold(100, 0)).toBe(false)
  })
})

describe('firstUnansweredIndex (BR-19)', () => {
  const ids = ['q1', 'q2', 'q3', 'q4']
  it('finds the first gap', () => {
    expect(firstUnansweredIndex(ids, new Set(['q1', 'q2']))).toBe(2)
    expect(firstUnansweredIndex(ids, new Set(['q2']))).toBe(0)
  })
  it('searches forward from a position and wraps around', () => {
    expect(firstUnansweredIndex(ids, new Set(['q2', 'q3', 'q4']), 2)).toBe(0)
  })
  it('returns -1 when everything is answered', () => {
    expect(firstUnansweredIndex(ids, new Set(ids))).toBe(-1)
  })
})

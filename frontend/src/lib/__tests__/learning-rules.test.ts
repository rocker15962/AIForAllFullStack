import { describe, it, expect } from 'vitest'
import {
  firstUnansweredIndex,
  hasReachedStartThreshold,
  isPassing,
  RETAKE_PARAM,
  retakeHref,
  savedRoundState,
  unavailableCourseLabel,
} from '../learning-rules'

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

describe('savedRoundState (BR-19, BR-36)', () => {
  const ids = ['q1', 'q2', 'q3']
  it('keeps answering while questions are left', () => {
    expect(savedRoundState(ids, new Set(['q1']), null)).toBe('answering')
    expect(savedRoundState(ids, new Set(), null)).toBe('answering')
  })
  it('answers a retake even when an older round left a score (status stays completed)', () => {
    // A retake of a passed course keeps status 'completed' with partial answers.
    expect(savedRoundState(ids, new Set(['q1', 'q2']), 40)).toBe('answering')
  })
  it('scores a fully answered round that has no score yet', () => {
    expect(savedRoundState(ids, new Set(ids), null)).toBe('needs-scoring')
  })
  it('shows the result of a fully answered, scored round', () => {
    expect(savedRoundState(ids, new Set(ids), 66.67)).toBe('scored')
    expect(savedRoundState(ids, new Set(ids), 0)).toBe('scored')
  })
  it('has nothing to resume without questions', () => {
    expect(savedRoundState([], new Set(), 100)).toBe('answering')
  })
})

describe('unavailableCourseLabel (BR-31, BR-37)', () => {
  it('names archived and unpublished courses', () => {
    expect(unavailableCourseLabel('archived')).toBe('課程已封存')
    expect(unavailableCourseLabel('draft')).toBe('課程暫停開放')
  })
  it('is null while the course can be opened', () => {
    expect(unavailableCourseLabel('published')).toBeNull()
    expect(unavailableCourseLabel(undefined)).toBeNull()
  })
})

describe('retakeHref (BR-36)', () => {
  it('opens the course page and asks it to start a new round', () => {
    expect(retakeHref('c1')).toBe(`/courses/c1?${RETAKE_PARAM}=1`)
  })
})

import { describe, it, expect } from 'vitest'
import { parseDuration, formatDuration } from '../duration'

describe('parseDuration', () => {
  it('converts mm:ss to seconds', () => {
    expect(parseDuration('12:30')).toBe(750)
    expect(parseDuration('0:45')).toBe(45)
    expect(parseDuration('120:00')).toBe(7200)
    expect(parseDuration(' 3:05 ')).toBe(185)
  })

  it('rejects other formats', () => {
    expect(parseDuration('')).toBeNull()
    expect(parseDuration('12')).toBeNull()
    expect(parseDuration('12:60')).toBeNull()
    expect(parseDuration('1:2')).toBeNull()
    expect(parseDuration('1000:00')).toBeNull()
    expect(parseDuration('1:02:03')).toBeNull()
  })
})

describe('formatDuration', () => {
  it('formats seconds as mm:ss', () => {
    expect(formatDuration(750)).toBe('12:30')
    expect(formatDuration(65)).toBe('1:05')
  })

  it('returns empty text for unset lengths', () => {
    expect(formatDuration(0)).toBe('')
  })
})

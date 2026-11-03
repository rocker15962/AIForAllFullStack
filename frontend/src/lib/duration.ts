/** Video length helpers for the course editor (BR-28). Lengths are stored in seconds. */

export const DURATION_PATTERN = /^\d{1,3}:[0-5]\d$/

/** "12:30" → 750. Returns null when the text is not mm:ss. */
export function parseDuration(text: string): number | null {
  const value = text.trim()
  if (!DURATION_PATTERN.test(value)) return null
  const [minutes, seconds] = value.split(':').map(Number)
  return minutes * 60 + seconds
}

/** 750 → "12:30". Zero or negative lengths (not set) give an empty string. */
export function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return ''
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = Math.floor(totalSeconds % 60)
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

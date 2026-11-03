import { describe, it, expect } from 'vitest'
import { courseFormSchema } from '../schemas'

const valid = {
  title: 'ChatGPT Basics',
  description: 'Learn the basics',
  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  toolId: 't1',
  skillId: 's1',
  difficulty: 'beginner' as const,
  creatorId: 'c1',
  durationText: '12:30',
}

function firstError(input: Record<string, unknown>) {
  const result = courseFormSchema.safeParse(input)
  return result.success ? null : result.error.issues[0]?.message
}

describe('courseFormSchema (BR-28)', () => {
  it('accepts a complete course', () => {
    expect(courseFormSchema.safeParse(valid).success).toBe(true)
  })

  it('requires a creator', () => {
    expect(firstError({ ...valid, creatorId: '' })).toBe('Creator is required')
  })

  it('requires a video length in mm:ss', () => {
    expect(firstError({ ...valid, durationText: '' })).toBe('Video length is required')
    expect(firstError({ ...valid, durationText: '750' })).toBe('Use the format mm:ss, e.g. 12:30')
    expect(firstError({ ...valid, durationText: '0:00' })).toBe(
      'Video length must be longer than 0:00',
    )
  })
})

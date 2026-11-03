import { describe, it, expect } from 'vitest'
import { centerSquare, MAX_AVATAR_BYTES, validateAvatarFile } from '../avatar'

describe('validateAvatarFile (BR-25)', () => {
  it('accepts images up to 5MB', () => {
    expect(validateAvatarFile({ type: 'image/png', size: MAX_AVATAR_BYTES })).toBeNull()
  })
  it('rejects larger files', () => {
    expect(validateAvatarFile({ type: 'image/jpeg', size: MAX_AVATAR_BYTES + 1 })).toBe(
      'Image must be 5MB or smaller',
    )
  })
  it('rejects non-images', () => {
    expect(validateAvatarFile({ type: 'application/pdf', size: 10 })).toBe(
      'Please choose an image file',
    )
  })
})

describe('centerSquare', () => {
  it('crops landscape images from the middle', () => {
    expect(centerSquare(1600, 900)).toEqual({ x: 350, y: 0, size: 900 })
  })
  it('crops portrait images from the middle', () => {
    expect(centerSquare(600, 1000)).toEqual({ x: 0, y: 200, size: 600 })
  })
})

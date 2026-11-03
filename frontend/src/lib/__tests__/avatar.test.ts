import { describe, it, expect } from 'vitest'
import {
  clampCropOffset,
  clampZoom,
  coverScale,
  CROP_CIRCLE,
  CROP_FRAME,
  CROP_INSET,
  cropSourceRect,
  cropDisplaySize,
  MAX_AVATAR_BYTES,
  validateAvatarFile,
} from '../avatar'

describe('validateAvatarFile (BR-25)', () => {
  it('accepts images up to 5MB', () => {
    expect(validateAvatarFile({ type: 'image/png', size: MAX_AVATAR_BYTES })).toBeNull()
  })
  it('rejects larger files', () => {
    expect(validateAvatarFile({ type: 'image/jpeg', size: MAX_AVATAR_BYTES + 1 })).toBe(
      '檔案超過 5MB，請換一張圖片',
    )
  })
  it('rejects non-images', () => {
    expect(validateAvatarFile({ type: 'application/pdf', size: 10 })).toBe('請選擇圖片檔')
  })
})

describe('crop geometry', () => {
  it('uses a 320px frame with a circle inset 16px', () => {
    expect(CROP_FRAME).toBe(320)
    expect(CROP_INSET).toBe(16)
    expect(CROP_CIRCLE).toBe(288)
  })
})

describe('coverScale', () => {
  it('scales the short side to the frame', () => {
    expect(coverScale(800, 800, 320)).toBeCloseTo(0.4)
    expect(coverScale(1600, 900, 320)).toBeCloseTo(320 / 900)
    expect(coverScale(600, 1000, 320)).toBeCloseTo(320 / 600)
  })
  it('scales small images up', () => {
    expect(coverScale(160, 100, 320)).toBeCloseTo(3.2)
  })
})

describe('clampZoom', () => {
  it('keeps the zoom between 1× and 3×', () => {
    expect(clampZoom(0.5)).toBe(1)
    expect(clampZoom(2)).toBe(2)
    expect(clampZoom(4)).toBe(3)
    expect(clampZoom(Number.NaN)).toBe(1)
  })
})

describe('cropDisplaySize', () => {
  it('is the cover size times the zoom', () => {
    expect(cropDisplaySize(1600, 900, 1).width).toBeCloseTo(1600 * (320 / 900))
    expect(cropDisplaySize(1600, 900, 1).height).toBeCloseTo(320)
    expect(cropDisplaySize(800, 800, 2)).toEqual({ width: 640, height: 640 })
  })
})

describe('clampCropOffset', () => {
  it('lets a square image move 16px each way at 1×', () => {
    const size = { width: 320, height: 320 }
    expect(clampCropOffset({ x: 100, y: -100 }, size)).toEqual({ x: 16, y: -16 })
    expect(clampCropOffset({ x: 5, y: -5 }, size)).toEqual({ x: 5, y: -5 })
  })
  it('allows more room along the long side and when zoomed in', () => {
    expect(clampCropOffset({ x: 1000, y: 1000 }, { width: 600, height: 320 })).toEqual({
      x: 156,
      y: 16,
    })
    expect(clampCropOffset({ x: -1000, y: 0 }, { width: 960, height: 960 })).toEqual({
      x: -336,
      y: 0,
    })
  })
  it('centers an image that is smaller than the circle', () => {
    expect(clampCropOffset({ x: 30, y: -30 }, { width: 200, height: 200 })).toEqual({
      x: 0,
      y: 0,
    })
  })
})

describe('cropSourceRect', () => {
  it('takes the circle area from the middle of a centered square image', () => {
    const r = cropSourceRect({ naturalWidth: 800, naturalHeight: 800, zoom: 1, x: 0, y: 0 })
    expect(r.sx).toBeCloseTo(40)
    expect(r.sy).toBeCloseTo(40)
    expect(r.size).toBeCloseTo(720)
  })

  it('follows the image when it is dragged to the edge', () => {
    // Dragged fully right and down: the circle sits on the image's top-left corner.
    const r = cropSourceRect({ naturalWidth: 800, naturalHeight: 800, zoom: 1, x: 16, y: 16 })
    expect(r.sx).toBeCloseTo(0)
    expect(r.sy).toBeCloseTo(0)
    expect(r.size).toBeCloseTo(720)
  })

  it('crops a smaller area when zoomed in', () => {
    const r = cropSourceRect({ naturalWidth: 800, naturalHeight: 800, zoom: 2, x: 0, y: 0 })
    expect(r.size).toBeCloseTo(360)
    expect(r.sx).toBeCloseTo(220)
    expect(r.sy).toBeCloseTo(220)
  })

  it('stays centered on a landscape image', () => {
    const r = cropSourceRect({ naturalWidth: 1600, naturalHeight: 900, zoom: 1, x: 0, y: 0 })
    expect(r.size).toBeCloseTo(810)
    expect(r.sx + r.size / 2).toBeCloseTo(800)
    expect(r.sy + r.size / 2).toBeCloseTo(450)
  })

  it('never leaves the image after clamping', () => {
    const size = cropDisplaySize(600, 1000, 1.5)
    const offset = clampCropOffset({ x: -9999, y: 9999 }, size)
    const r = cropSourceRect({ naturalWidth: 600, naturalHeight: 1000, zoom: 1.5, ...offset })
    expect(r.sx).toBeGreaterThanOrEqual(-1e-9)
    expect(r.sy).toBeGreaterThanOrEqual(-1e-9)
    expect(r.sx + r.size).toBeLessThanOrEqual(600 + 1e-9)
    expect(r.sy + r.size).toBeLessThanOrEqual(1000 + 1e-9)
  })
})

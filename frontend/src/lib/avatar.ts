/**
 * Avatar upload rules (BR-25): images up to 5MB. The learner positions and zooms the image in a
 * crop dialog; the area inside the circle is uploaded as a square JPEG.
 */

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
/** Largest side of the uploaded square avatar, in pixels. */
export const AVATAR_SIZE = 512

/** Side of the square crop preview, in CSS pixels. */
export const CROP_FRAME = 320
/** Gap between the preview edge and the circle. */
export const CROP_INSET = 16
/** Diameter of the circle; its bounding square is what gets uploaded. */
export const CROP_CIRCLE = CROP_FRAME - 2 * CROP_INSET
export const MIN_ZOOM = 1
export const MAX_ZOOM = 3

/** Returns an error message, or null when the file can be used. */
export function validateAvatarFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/')) return '請選擇圖片檔'
  if (file.size > MAX_AVATAR_BYTES) return '檔案超過 5MB，請換一張圖片'
  return null
}

export interface Point {
  x: number
  y: number
}

export interface Size {
  width: number
  height: number
}

/** Scale at which a width × height image just covers a square of `side` (zoom 1×). */
export function coverScale(width: number, height: number, side = CROP_FRAME): number {
  return Math.max(side / width, side / height)
}

export function clampZoom(zoom: number): number {
  if (!Number.isFinite(zoom)) return MIN_ZOOM
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, zoom))
}

/** Size of the image in the preview at a zoom level. */
export function cropDisplaySize(naturalWidth: number, naturalHeight: number, zoom: number): Size {
  const scale = coverScale(naturalWidth, naturalHeight) * clampZoom(zoom)
  return { width: naturalWidth * scale, height: naturalHeight * scale }
}

/**
 * Keeps the image covering the circle: the offset (from the centered position) may move the image
 * at most until one of its edges reaches the circle's bounding square.
 */
export function clampCropOffset(offset: Point, displayed: Size, circle = CROP_CIRCLE): Point {
  const clamp = (value: number, extent: number) => {
    const max = Math.max(0, (extent - circle) / 2)
    return Math.min(max, Math.max(-max, value)) || 0 // normalize -0
  }
  return { x: clamp(offset.x, displayed.width), y: clamp(offset.y, displayed.height) }
}

export interface CropView {
  naturalWidth: number
  naturalHeight: number
  zoom: number
  /** Offset of the image from the centered position, in preview pixels. */
  x: number
  y: number
}

/** The square of the original image (natural pixels) that lies under the circle. */
export function cropSourceRect(view: CropView): { sx: number; sy: number; size: number } {
  const scale = coverScale(view.naturalWidth, view.naturalHeight) * clampZoom(view.zoom)
  const left = (CROP_FRAME - view.naturalWidth * scale) / 2 + view.x
  const top = (CROP_FRAME - view.naturalHeight * scale) / 2 + view.y
  return {
    sx: (CROP_INSET - left) / scale,
    sy: (CROP_INSET - top) / scale,
    size: CROP_CIRCLE / scale,
  }
}

/** Draws the cropped square onto a canvas and encodes it as a JPEG of up to AVATAR_SIZE px. */
export async function cropImageToBlob(image: HTMLImageElement, view: CropView): Promise<Blob> {
  const { sx, sy, size } = cropSourceRect(view)
  const out = Math.max(1, Math.round(Math.min(AVATAR_SIZE, size)))
  const canvas = document.createElement('canvas')
  canvas.width = out
  canvas.height = out
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Could not process the image')
  // JPEG has no transparency: paint a white background first.
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, out, out)
  ctx.drawImage(image, sx, sy, size, size, 0, 0, out, out)
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the image'))),
      'image/jpeg',
      0.9,
    ),
  )
}

/** Avatar upload rules (BR-25): images up to 5MB, cropped to a centered square. */

export const MAX_AVATAR_BYTES = 5 * 1024 * 1024
/** Side of the uploaded square avatar, in pixels. */
export const AVATAR_SIZE = 512

/** Returns an error message, or null when the file can be used. */
export function validateAvatarFile(file: Pick<File, 'type' | 'size'>): string | null {
  if (!file.type.startsWith('image/')) return 'Please choose an image file'
  if (file.size > MAX_AVATAR_BYTES) return 'Image must be 5MB or smaller'
  return null
}

/** The largest centered square inside a width × height image. */
export function centerSquare(
  width: number,
  height: number,
): { x: number; y: number; size: number } {
  const size = Math.min(width, height)
  return { x: Math.floor((width - size) / 2), y: Math.floor((height - size) / 2), size }
}

/** Crops an image file to a centered square JPEG of AVATAR_SIZE × AVATAR_SIZE. */
export async function cropToSquare(file: File): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image()
      el.onload = () => resolve(el)
      el.onerror = () => reject(new Error('Could not read the image'))
      el.src = url
    })
    const { x, y, size } = centerSquare(img.naturalWidth, img.naturalHeight)
    const out = Math.min(AVATAR_SIZE, size)
    const canvas = document.createElement('canvas')
    canvas.width = out
    canvas.height = out
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Could not process the image')
    // JPEG has no transparency: paint a white background first.
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, out, out)
    ctx.drawImage(img, x, y, size, size, 0, 0, out, out)
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Could not process the image'))),
        'image/jpeg',
        0.9,
      ),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

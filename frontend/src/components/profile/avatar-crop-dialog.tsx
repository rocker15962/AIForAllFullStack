'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'
import { ImageIcon, XIcon } from 'lucide-react'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CROP_FRAME,
  MAX_ZOOM,
  MIN_ZOOM,
  clampCropOffset,
  clampZoom,
  cropDisplaySize,
  cropImageToBlob,
} from '@/lib/avatar'
import type { Point } from '@/lib/avatar'

/** Arrow-key nudge, in preview pixels. */
const KEY_STEP = 8
const ARROW_KEYS: Readonly<Record<string, Point>> = {
  ArrowLeft: { x: -KEY_STEP, y: 0 },
  ArrowRight: { x: KEY_STEP, y: 0 },
  ArrowUp: { x: 0, y: -KEY_STEP },
  ArrowDown: { x: 0, y: KEY_STEP },
}

interface AvatarCropDialogProps {
  /** Object URL of the picked image; the dialog is open while it is set. */
  src: string | null
  onCancel: () => void
  /** Called with the cropped square JPEG when the learner presses 「套用」. */
  onApply: (avatar: Blob) => void
  /** The image could not be read or cropped. */
  onError: () => void
}

/**
 * BR-25: position (drag) and zoom (1–3×) the picked image; the circle shows what becomes the
 * avatar. Only 「套用」 crops and hands the result back for upload.
 */
export function AvatarCropDialog({ src, onCancel, onApply, onError }: AvatarCropDialogProps) {
  return (
    <Dialog
      open={src !== null}
      onOpenChange={(open) => {
        if (!open) onCancel()
      }}
    >
      <DialogContent
        showCloseButton={false}
        className="max-w-[calc(100%-1rem)] gap-0 rounded-2xl bg-white p-3 shadow-xl ring-0 sm:max-w-[520px] sm:p-7 dark:bg-zinc-800"
      >
        <div className="mb-6 flex items-center justify-between">
          <DialogTitle className="text-xl leading-7 font-bold text-zinc-900 dark:text-zinc-100">
            調整大頭貼
          </DialogTitle>
          <DialogClose
            aria-label="關閉"
            className="flex text-zinc-400 transition-colors hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300"
          >
            <XIcon className="h-5 w-5" aria-hidden="true" />
          </DialogClose>
        </div>
        {/* Remount per image so position and zoom start fresh */}
        {src && (
          <CropEditor key={src} src={src} onCancel={onCancel} onApply={onApply} onError={onError} />
        )}
      </DialogContent>
    </Dialog>
  )
}

interface NaturalSize {
  width: number
  height: number
}

function CropEditor({
  src,
  onCancel,
  onApply,
  onError,
}: Required<Omit<AvatarCropDialogProps, 'src'>> & { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null)
  const drag = useRef<{ pointerId: number; start: Point; from: Point } | null>(null)
  const [natural, setNatural] = useState<NaturalSize | null>(null)
  const [zoom, setZoom] = useState(MIN_ZOOM)
  const [offset, setOffset] = useState<Point>({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

  const display = natural ? cropDisplaySize(natural.width, natural.height, zoom) : null

  function moveTo(next: Point) {
    if (!display) return
    setOffset(clampCropOffset(next, display))
  }

  function handlePointerDown(e: PointerEvent<HTMLDivElement>) {
    if (!display) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    drag.current = { pointerId: e.pointerId, start: { x: e.clientX, y: e.clientY }, from: offset }
    setIsDragging(true)
  }

  function handlePointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current
    if (!d || d.pointerId !== e.pointerId) return
    moveTo({ x: d.from.x + e.clientX - d.start.x, y: d.from.y + e.clientY - d.start.y })
  }

  function handlePointerEnd() {
    drag.current = null
    setIsDragging(false)
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const step = Object.hasOwn(ARROW_KEYS, e.key) ? ARROW_KEYS[e.key] : undefined
    if (!step) return
    e.preventDefault()
    moveTo({ x: offset.x + step.x, y: offset.y + step.y })
  }

  function handleZoom(value: string) {
    if (!natural) return
    const z = clampZoom(Number(value))
    setZoom(z)
    // Zooming out can leave the image short of the circle: pull it back in.
    setOffset((o) => clampCropOffset(o, cropDisplaySize(natural.width, natural.height, z)))
  }

  async function handleApply() {
    const image = imageRef.current
    if (!image || !natural) return
    setIsApplying(true)
    try {
      const blob = await cropImageToBlob(image, {
        naturalWidth: natural.width,
        naturalHeight: natural.height,
        zoom,
        x: offset.x,
        y: offset.y,
      })
      onApply(blob)
    } catch {
      onError()
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <>
      <div className="flex flex-col items-center gap-5">
        <div
          data-testid="crop-frame"
          tabIndex={0}
          aria-label="大頭貼預覽"
          aria-describedby="avatar-crop-help"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerEnd}
          onPointerCancel={handlePointerEnd}
          onKeyDown={handleKeyDown}
          className={`relative shrink-0 touch-none overflow-hidden rounded-lg bg-zinc-900 outline-none select-none focus-visible:ring-3 focus-visible:ring-cyan-500/50 ${
            isDragging ? 'cursor-grabbing' : 'cursor-grab'
          }`}
          style={{ width: CROP_FRAME, height: CROP_FRAME }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imageRef}
            data-testid="crop-image"
            src={src}
            alt=""
            draggable={false}
            onLoad={(e) =>
              setNatural({
                width: e.currentTarget.naturalWidth,
                height: e.currentTarget.naturalHeight,
              })
            }
            onError={onError}
            className="pointer-events-none absolute max-w-none"
            style={
              display
                ? {
                    width: display.width,
                    height: display.height,
                    left: (CROP_FRAME - display.width) / 2 + offset.x,
                    top: (CROP_FRAME - display.height) / 2 + offset.y,
                  }
                : { opacity: 0 }
            }
          />
          {/* Circle mask: 16px inset, 55% black outside, 2px white ring */}
          <div className="pointer-events-none absolute inset-4 rounded-full border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
        </div>

        <div
          className="flex items-center gap-3 text-zinc-500 dark:text-zinc-400"
          style={{ width: CROP_FRAME }}
        >
          <ImageIcon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.01}
            value={zoom}
            disabled={!natural}
            onChange={(e) => handleZoom(e.target.value)}
            aria-label="縮放"
            className="flex-1 accent-cyan-500"
          />
          <ImageIcon className="h-5 w-5 shrink-0" aria-hidden="true" />
        </div>

        <DialogDescription
          id="avatar-crop-help"
          className="text-center text-[13px] leading-5 text-zinc-500 dark:text-zinc-400"
        >
          拖曳圖片調整位置，用滑桿縮放；圓圈裡的範圍就是大頭貼。
        </DialogDescription>
      </div>

      <div className="mt-6 flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={isApplying}
          className="rounded-lg border border-zinc-200 bg-white px-5 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          取消
        </button>
        <button
          type="button"
          onClick={() => void handleApply()}
          disabled={!natural || isApplying}
          className="rounded-lg bg-cyan-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          套用
        </button>
      </div>
    </>
  )
}

import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AvatarCropDialog } from '../avatar-crop-dialog'
import { cropImageToBlob } from '@/lib/avatar'

vi.mock('@/lib/avatar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/avatar')>()
  return { ...actual, cropImageToBlob: vi.fn() }
})
const cropMock = vi.mocked(cropImageToBlob)

beforeAll(() => {
  // jsdom has no PointerEvent; a MouseEvent with a pointerId is enough for these handlers.
  if (!('PointerEvent' in window)) {
    class PointerEventPolyfill extends MouseEvent {
      pointerId: number
      constructor(type: string, init: PointerEventInit = {}) {
        super(type, init)
        this.pointerId = init.pointerId ?? 1
      }
    }
    Object.defineProperty(window, 'PointerEvent', { value: PointerEventPolyfill })
  }
})

beforeEach(() => {
  cropMock.mockReset()
  cropMock.mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }))
})

/** jsdom never loads images: give the preview a natural size and fire its load event. */
function loadImage(width = 800, height = 600) {
  const img = screen.getByTestId('crop-image') as HTMLImageElement
  Object.defineProperty(img, 'naturalWidth', { value: width, configurable: true })
  Object.defineProperty(img, 'naturalHeight', { value: height, configurable: true })
  fireEvent.load(img)
  return img
}

function renderDialog(overrides: Partial<Parameters<typeof AvatarCropDialog>[0]> = {}) {
  const props = {
    src: 'blob:photo',
    onCancel: vi.fn(),
    onApply: vi.fn(),
    onError: vi.fn(),
    ...overrides,
  }
  render(<AvatarCropDialog {...props} />)
  return props
}

describe('AvatarCropDialog (BR-25)', () => {
  it('shows the title, helper text, zoom slider and actions', () => {
    renderDialog()
    expect(screen.getByRole('dialog', { name: '調整大頭貼' })).toBeInTheDocument()
    expect(
      screen.getByText('拖曳圖片調整位置，用滑桿縮放；圓圈裡的範圍就是大頭貼。'),
    ).toBeInTheDocument()
    const slider = screen.getByRole('slider', { name: '縮放' })
    expect(slider).toHaveAttribute('min', '1')
    expect(slider).toHaveAttribute('max', '3')
    expect(screen.getByRole('button', { name: '取消' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '套用' })).toBeInTheDocument()
  })

  it('is closed without an image', () => {
    renderDialog({ src: null })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('waits for the image before it can apply', () => {
    renderDialog()
    expect(screen.getByRole('button', { name: '套用' })).toBeDisabled()
    loadImage()
    expect(screen.getByRole('button', { name: '套用' })).toBeEnabled()
  })

  it('cancels without cropping', async () => {
    const props = renderDialog()
    loadImage()
    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    expect(props.onCancel).toHaveBeenCalled()
    expect(cropMock).not.toHaveBeenCalled()
    expect(props.onApply).not.toHaveBeenCalled()
  })

  it('crops the centered image at 1× by default', async () => {
    const props = renderDialog()
    const img = loadImage(800, 600)
    await userEvent.click(screen.getByRole('button', { name: '套用' }))

    await waitFor(() => expect(props.onApply).toHaveBeenCalledWith(expect.any(Blob)))
    expect(cropMock).toHaveBeenCalledWith(img, {
      naturalWidth: 800,
      naturalHeight: 600,
      zoom: 1,
      x: 0,
      y: 0,
    })
  })

  it('uses the zoom from the slider', async () => {
    renderDialog()
    loadImage(800, 600)
    fireEvent.change(screen.getByRole('slider', { name: '縮放' }), { target: { value: '2.5' } })
    await userEvent.click(screen.getByRole('button', { name: '套用' }))
    await waitFor(() => expect(cropMock).toHaveBeenCalled())
    expect(cropMock.mock.calls[0][1]).toMatchObject({ zoom: 2.5 })
  })

  it('moves the image by dragging, but never past the circle', async () => {
    renderDialog()
    loadImage(600, 600) // 320px at 1×: 16px of room each way
    const frame = screen.getByTestId('crop-frame')
    fireEvent.pointerDown(frame, { clientX: 100, clientY: 100, pointerId: 1 })
    fireEvent.pointerMove(frame, { clientX: 110, clientY: 300, pointerId: 1 })
    fireEvent.pointerUp(frame, { clientX: 110, clientY: 300, pointerId: 1 })
    // Moves after the pointer is released are ignored
    fireEvent.pointerMove(frame, { clientX: 0, clientY: 0, pointerId: 1 })

    await userEvent.click(screen.getByRole('button', { name: '套用' }))
    await waitFor(() => expect(cropMock).toHaveBeenCalled())
    expect(cropMock.mock.calls[0][1]).toMatchObject({ x: 10, y: 16 })
  })

  it('can also be moved with the arrow keys', async () => {
    renderDialog()
    loadImage(800, 600)
    const frame = screen.getByTestId('crop-frame')
    fireEvent.keyDown(frame, { key: 'ArrowLeft' })
    fireEvent.keyDown(frame, { key: 'ArrowDown' })
    await userEvent.click(screen.getByRole('button', { name: '套用' }))
    await waitFor(() => expect(cropMock).toHaveBeenCalled())
    expect(cropMock.mock.calls[0][1]).toMatchObject({ x: -8, y: 8 })
  })

  it('reports an image that cannot be read', () => {
    const props = renderDialog()
    fireEvent.error(screen.getByTestId('crop-image'))
    expect(props.onError).toHaveBeenCalled()
  })

  it('reports a failed crop', async () => {
    cropMock.mockRejectedValueOnce(new Error('no canvas'))
    const props = renderDialog()
    loadImage()
    await userEvent.click(screen.getByRole('button', { name: '套用' }))
    await waitFor(() => expect(props.onError).toHaveBeenCalled())
    expect(props.onApply).not.toHaveBeenCalled()
  })
})

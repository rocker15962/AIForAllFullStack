import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ProfilePage from '../page'
import { cropImageToBlob, MAX_AVATAR_BYTES } from '@/lib/avatar'

const setAuth = vi.fn()
vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'u1', name: '陳怡君', email: 'alice@example.com', avatarUrl: '' },
    accessToken: 'token',
    isLoading: false,
    login: vi.fn(),
    setAuth,
  }),
}))

vi.mock('@/lib/avatar', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/lib/avatar')>()
  return { ...actual, cropImageToBlob: vi.fn() }
})
const cropMock = vi.mocked(cropImageToBlob)

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  setAuth.mockReset()
  cropMock.mockReset()
  cropMock.mockResolvedValue(new Blob(['jpeg'], { type: 'image/jpeg' }))
  fetchMock.mockImplementation(async (url: string) => {
    if (url.endsWith('/my/avatar')) {
      return new Response(JSON.stringify({ avatarUrl: '/uploads/avatars/u1.jpg' }), {
        status: 200,
      })
    }
    return new Response(
      JSON.stringify({
        name: '陳怡君',
        email: 'alice@example.com',
        avatarUrl: '',
        provider: 'google',
        createdAt: '2026-09-17T00:00:00Z',
      }),
      { status: 200 },
    )
  })
  vi.stubGlobal('fetch', fetchMock)
  // jsdom has no object URLs
  URL.createObjectURL = vi.fn(() => 'blob:photo')
  URL.revokeObjectURL = vi.fn()
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function pickFile(file: File) {
  const input = document.querySelector('input[type="file"]') as HTMLInputElement
  fireEvent.change(input, { target: { files: [file] } })
}

function imageFile(size: number, type = 'image/png') {
  const file = new File(['x'], 'photo.png', { type })
  Object.defineProperty(file, 'size', { value: size })
  return file
}

function avatarUploads() {
  return fetchMock.mock.calls.filter(([url]) => String(url).endsWith('/my/avatar'))
}

describe('Profile avatar (BR-25)', () => {
  it('rejects files over 5MB without opening the crop dialog', () => {
    render(<ProfilePage />)
    pickFile(imageFile(MAX_AVATAR_BYTES + 1))
    expect(screen.getByText('檔案超過 5MB，請換一張圖片')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('rejects files that are not images', () => {
    render(<ProfilePage />)
    pickFile(imageFile(100, 'application/pdf'))
    expect(screen.getByText('請選擇圖片檔')).toBeInTheDocument()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('uploads nothing when the crop is cancelled', async () => {
    render(<ProfilePage />)
    pickFile(imageFile(1000))
    expect(await screen.findByRole('dialog', { name: '調整大頭貼' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: '取消' }))
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
    expect(avatarUploads()).toHaveLength(0)
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:photo')
  })

  it('uploads the cropped square after 套用', async () => {
    render(<ProfilePage />)
    pickFile(imageFile(1000))
    await screen.findByRole('dialog', { name: '調整大頭貼' })

    const img = screen.getByTestId('crop-image')
    Object.defineProperty(img, 'naturalWidth', { value: 800 })
    Object.defineProperty(img, 'naturalHeight', { value: 800 })
    fireEvent.load(img)
    await userEvent.click(screen.getByRole('button', { name: '套用' }))

    expect(await screen.findByText('已更新大頭貼')).toBeInTheDocument()
    const uploads = avatarUploads()
    expect(uploads).toHaveLength(1)
    const body = uploads[0][1].body as FormData
    expect(body.get('avatar')).toBeInstanceOf(Blob)
    expect(setAuth).toHaveBeenCalledWith(
      'token',
      expect.objectContaining({ avatarUrl: expect.stringContaining('/uploads/avatars/u1.jpg') }),
    )
  })
})

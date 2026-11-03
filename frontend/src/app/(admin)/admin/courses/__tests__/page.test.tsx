import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ToastProvider } from '@/components/shared'
import CourseManagementPage from '../page'

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'admin', name: 'Admin', isAdmin: true },
    accessToken: 'token',
    isLoading: false,
  }),
}))
const push = vi.fn()
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push }),
}))

const baseCourse = {
  description: 'desc',
  youtubeUrl: '',
  thumbnailUrl: '',
  toolId: 't1',
  skillId: 's1',
  difficulty: 'beginner',
  duration: 600,
  questionCount: 3,
  createdAt: '2026-10-01T00:00:00Z',
  updatedAt: '2026-10-01T00:00:00Z',
}
const published = { ...baseCourse, id: 'c1', title: 'ChatGPT 入門', status: 'published' }
const draft = { ...baseCourse, id: 'c2', title: 'Cursor 進階', status: 'draft' }
const archived = { ...baseCourse, id: 'c3', title: 'Stable Diffusion 安裝', status: 'archived' }

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200 })
}

const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = new URL(String(input))
  const method = init?.method ?? 'GET'
  if (url.pathname === '/api/v1/tools') return json({ tools: [] })
  if (url.pathname === '/api/v1/skills') return json({ skills: [] })
  if (method === 'POST' && url.pathname.endsWith('/preview-link')) {
    return json({ path: '/courses/c2?preview=abc123' })
  }
  if (method !== 'GET') return json({})
  if (url.pathname === '/api/v1/admin/courses') {
    const status = url.searchParams.get('status')
    if (status === 'archived') return json({ courses: [archived] })
    return json({ courses: [published, draft] })
  }
  return new Response('not found', { status: 404 })
})

function calls(method: string, pathEnd: string) {
  return fetchMock.mock.calls.filter(
    ([input, init]) =>
      (init?.method ?? 'GET') === method && new URL(String(input)).pathname.endsWith(pathEnd),
  )
}

function renderPage() {
  return render(
    <ToastProvider>
      <CourseManagementPage />
    </ToastProvider>,
  )
}

beforeEach(() => {
  fetchMock.mockClear()
  push.mockClear()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CourseManagementPage', () => {
  it('leaves archived courses out of 全部狀態 (BR-31)', async () => {
    renderPage()
    await screen.findByText('ChatGPT 入門')

    const [list] = calls('GET', '/api/v1/admin/courses')
    expect(new URL(String(list[0])).searchParams.has('status')).toBe(false)
    expect(screen.queryByText('Stable Diffusion 安裝')).not.toBeInTheDocument()
  })

  it('confirms before archiving a course (BR-31)', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('ChatGPT 入門')

    await user.click(screen.getByRole('button', { name: '封存「ChatGPT 入門」' }))
    expect(screen.getByText('封存課程')).toBeInTheDocument()
    expect(
      screen.getByText(
        '封存「ChatGPT 入門」後，前台看不到這堂課；上過的學員仍保留紀錄，「我的學習」會顯示「已無法觀看」。之後可以在「已封存」篩選裡還原。',
      ),
    ).toBeInTheDocument()
    expect(calls('DELETE', '/admin/courses/c1')).toHaveLength(0)

    await user.click(screen.getByRole('button', { name: '封存' }))
    await waitFor(() => expect(calls('DELETE', '/admin/courses/c1')).toHaveLength(1))
  })

  it('copies a preview link from a draft card (BR-05)', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('Cursor 進階')

    await user.click(screen.getByRole('button', { name: '複製預覽連結' }))

    expect(await screen.findByText('已複製預覽連結，課程發布前都有效')).toBeInTheDocument()
    expect(calls('POST', '/admin/courses/c2/preview-link')).toHaveLength(1)
    await expect(navigator.clipboard.readText()).resolves.toBe(
      `${window.location.origin}/courses/c2?preview=abc123`,
    )
  })

  it('restores an archived course to draft from the 已封存 filter (BR-31)', async () => {
    const user = userEvent.setup()
    renderPage()
    await screen.findByText('ChatGPT 入門')

    await user.selectOptions(screen.getByRole('combobox', { name: '狀態' }), 'archived')
    await screen.findByText('Stable Diffusion 安裝')

    await user.click(screen.getByRole('button', { name: '還原成草稿' }))

    expect(await screen.findByText('已還原成草稿')).toBeInTheDocument()
    expect(calls('PUT', '/admin/courses/c3/restore')).toHaveLength(1)
  })
})

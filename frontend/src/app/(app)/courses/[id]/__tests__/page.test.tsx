import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import CourseLearningPage from '../page'

let searchParams = new URLSearchParams()
vi.mock('next/navigation', () => ({
  useParams: () => ({ id: 'c1' }),
  useSearchParams: () => searchParams,
}))

vi.mock('@/contexts/auth-context', () => ({
  useAuth: () => ({
    user: { id: 'u1' },
    accessToken: 'token',
    isLoading: false,
    login: vi.fn(),
  }),
}))

// The player loads the YouTube API; not needed here.
vi.mock('@/components/course-learning/youtube-embed', () => ({
  YouTubeEmbed: () => <div data-testid="video" />,
}))

const options = [
  { id: 'a', text: 'Alpha' },
  { id: 'b', text: 'Bravo' },
]
const detail = {
  id: 'c1',
  title: 'ChatGPT 文案寫作入門',
  description: '',
  youtubeId: 'yt',
  thumbnailUrl: '',
  difficulty: 'beginner',
  duration: 600,
  tool: { id: 't1', name: 'ChatGPT', icon: '' },
  skill: { id: 's1', name: '文案寫作', icon: '' },
  creator: { id: 'cr1', name: 'Creator', avatarUrl: '', channelUrl: '' },
  questions: [
    { id: 'q1', type: 'multiple_choice', question: 'First?', options, order: 1 },
    { id: 'q2', type: 'multiple_choice', question: 'Second?', options, order: 2 },
  ],
  status: 'published',
  isPreview: false,
}
const scoredFailedRetake = {
  status: 'completed',
  answers: [
    { questionId: 'q1', correct: false },
    { questionId: 'q2', correct: false },
  ],
  score: 0,
  badgeEarned: true,
  badgeEarnedAt: '2026-09-23T10:00:00Z',
  latestRoundPassed: false,
}

const fetchMock = vi.fn()
function json(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), { status: 200 }))
}

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
  window.history.replaceState(null, '', '/')
})

function calls(suffix: string) {
  return fetchMock.mock.calls.filter(([url]) => String(url).split('?')[0].endsWith(suffix))
}

describe('Course page', () => {
  it('starts a new round when opened with ?retake=1 and drops the flag (BR-36)', async () => {
    searchParams = new URLSearchParams('retake=1')
    window.history.replaceState(null, '', '/courses/c1?retake=1')
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/courses/c1')) return json(detail)
      if (url.endsWith('/progress')) return json(scoredFailedRetake)
      if (url.endsWith('/retake')) return json({ retake: true })
      return json({ courses: [] })
    })
    render(<CourseLearningPage />)

    expect(await screen.findByText('第 1 題 / 共 2 題')).toBeInTheDocument()
    expect(screen.getByText('First?')).toBeInTheDocument()
    expect(calls('/retake')).toHaveLength(1)
    expect(window.location.search).toBe('')
  })

  it('shows the saved result without ?retake', async () => {
    searchParams = new URLSearchParams()
    fetchMock.mockImplementation((url: string) => {
      if (url.endsWith('/courses/c1')) return json(detail)
      if (url.endsWith('/progress')) return json(scoredFailedRetake)
      return json({ courses: [] })
    })
    render(<CourseLearningPage />)

    expect(await screen.findByRole('heading', { name: '繼續加油！' })).toBeInTheDocument()
    expect(calls('/retake')).toHaveLength(0)
  })

  it('marks a draft preview with the cyan banner and does not load progress (BR-05)', async () => {
    searchParams = new URLSearchParams('preview=tok')
    fetchMock.mockImplementation(() => json({ ...detail, status: 'draft', isPreview: true }))
    render(<CourseLearningPage />)

    const banner = await screen.findByText(
      '草稿預覽：這堂課還沒發布，只有拿到預覽連結的人看得到。課程發布前，連結都有效。',
    )
    expect(banner.parentElement).toHaveClass('bg-cyan-50')
    await waitFor(() => expect(calls('/courses/c1')).toHaveLength(1))
    expect(calls('/progress')).toHaveLength(0)
  })
})

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import CoursesPage from '../page'

const push = vi.fn()
const replace = vi.fn()
let searchParams = new URLSearchParams()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push, replace }),
  usePathname: () => '/courses',
  useSearchParams: () => searchParams,
}))

/** Total courses the fake API reports for the current filters. */
let courseTotal = 45

function makeCourses(page: number, limit: number) {
  const from = (page - 1) * limit
  const count = Math.max(0, Math.min(limit, courseTotal - from))
  return Array.from({ length: count }, (_, i) => ({
    id: `c${from + i + 1}`,
    title: `課程 ${from + i + 1}`,
    description: '',
    thumbnailUrl: '',
    difficulty: 'beginner',
    duration: 600,
    toolId: 't1',
    skillId: 's1',
    creatorId: 'cr1',
    questionCount: 3,
  }))
}

function jsonResponse(body: unknown) {
  return { ok: true, json: async () => body } as unknown as Response
}

const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
  const url = new URL(String(input))
  if (url.pathname.endsWith('/tools')) {
    return jsonResponse({ tools: [{ id: 't1', name: 'ChatGPT', icon: '', order: 1 }] })
  }
  if (url.pathname.endsWith('/skills')) {
    return jsonResponse({ skills: [{ id: 's1', name: '文案寫作', icon: '', order: 1 }] })
  }
  if (url.pathname.endsWith('/creators')) {
    return jsonResponse({ creators: [] })
  }
  const page = Number(url.searchParams.get('page') ?? '1')
  const limit = Number(url.searchParams.get('limit') ?? '20')
  return jsonResponse({ courses: makeCourses(page, limit), total: courseTotal, page, limit })
})

/** Query strings of every course-list request, in order. */
function courseRequests(): URLSearchParams[] {
  return fetchMock.mock.calls
    .map(([input]) => new URL(String(input)))
    .filter((url) => url.pathname.endsWith('/courses'))
    .map((url) => url.searchParams)
}

function lastCourseRequest(): URLSearchParams {
  const requests = courseRequests()
  return requests[requests.length - 1]
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <CoursesPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  searchParams = new URLSearchParams()
  courseTotal = 45
  fetchMock.mockClear()
  push.mockClear()
  replace.mockClear()
  vi.stubGlobal('fetch', fetchMock)
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Explore pagination (BR-40)', () => {
  it('requests 20 courses for page 1 and shows the range on screen', async () => {
    renderPage()
    expect(await screen.findByText('共 45 堂課 · 第 1–20 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('page')).toBe('1')
    expect(lastCourseRequest().get('limit')).toBe('20')
    expect(screen.getAllByRole('link')).toHaveLength(20)

    const nav = screen.getByRole('navigation', { name: '分頁' })
    expect(within(nav).getByRole('button', { name: '1' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('button', { name: '上一頁' })).toBeDisabled()
  })

  it('reads the page from ?page=', async () => {
    searchParams = new URLSearchParams('page=2')
    renderPage()
    expect(await screen.findByText('共 45 堂課 · 第 21–40 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('page')).toBe('2')
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
  })

  it('moves to the next page, writes ?page= to the URL and scrolls back up', async () => {
    renderPage()
    await screen.findByText('共 45 堂課 · 第 1–20 堂')

    await userEvent.click(screen.getByRole('button', { name: '下一頁' }))

    expect(await screen.findByText('共 45 堂課 · 第 21–40 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('page')).toBe('2')
    expect(push).toHaveBeenCalledWith('/courses?page=2', { scroll: false })
    expect(window.scrollTo).toHaveBeenCalled()
  })

  it('shows the last, partial page', async () => {
    searchParams = new URLSearchParams('page=3')
    renderPage()
    expect(await screen.findByText('共 45 堂課 · 第 41–45 堂')).toBeInTheDocument()
    expect(screen.getAllByRole('link')).toHaveLength(5)
    expect(screen.getByRole('button', { name: '下一頁' })).toBeDisabled()
  })

  it('hides the pagination bar and the range when everything fits on one page', async () => {
    courseTotal = 5
    renderPage()
    expect(await screen.findByText('共 5 堂課')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '分頁' })).not.toBeInTheDocument()
  })

  it('keeps the empty state when nothing matches', async () => {
    courseTotal = 0
    renderPage()
    expect(await screen.findByText('找不到課程')).toBeInTheDocument()
    expect(screen.getByText('共 0 堂課')).toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: '分頁' })).not.toBeInTheDocument()
  })

  it('goes back to page 1 when a filter changes', async () => {
    searchParams = new URLSearchParams('page=2')
    renderPage()
    await screen.findByText('共 45 堂課 · 第 21–40 堂')

    await userEvent.click(await screen.findByRole('checkbox', { name: 'ChatGPT' }))

    expect(await screen.findByText('共 45 堂課 · 第 1–20 堂')).toBeInTheDocument()
    const request = lastCourseRequest()
    expect(request.get('tool_id')).toBe('t1')
    expect(request.get('page')).toBe('1')
    // No request for page 2 of the new filter
    expect(courseRequests().some((r) => r.get('tool_id') === 't1' && r.get('page') === '2')).toBe(
      false,
    )
    expect(replace).toHaveBeenCalledWith('/courses', { scroll: false })
  })

  it('goes back to page 1 when the search changes', async () => {
    searchParams = new URLSearchParams('page=2')
    renderPage()
    await screen.findByText('共 45 堂課 · 第 21–40 堂')

    await userEvent.type(screen.getAllByRole('textbox', { name: '搜尋課程' })[0], 'gpt')

    expect(await screen.findByText('共 45 堂課 · 第 1–20 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('search')).toBe('gpt')
    expect(lastCourseRequest().get('page')).toBe('1')
    expect(courseRequests().some((r) => r.get('search') && r.get('page') === '2')).toBe(false)
    expect(replace).toHaveBeenCalledWith('/courses', { scroll: false })
  })

  it('moves a page past the end to the last page', async () => {
    searchParams = new URLSearchParams('page=9')
    renderPage()
    expect(await screen.findByText('共 45 堂課 · 第 41–45 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('page')).toBe('3')
    expect(replace).toHaveBeenCalledWith('/courses?page=3', { scroll: false })
    expect(screen.queryByText('找不到課程')).not.toBeInTheDocument()
  })

  it('treats an invalid ?page= as page 1', async () => {
    searchParams = new URLSearchParams('page=abc')
    renderPage()
    expect(await screen.findByText('共 45 堂課 · 第 1–20 堂')).toBeInTheDocument()
    expect(lastCourseRequest().get('page')).toBe('1')
  })
})

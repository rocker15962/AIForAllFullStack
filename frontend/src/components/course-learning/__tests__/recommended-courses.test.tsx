import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { RecommendedCourses } from '../recommended-courses'
import type { RecommendedCourse } from '@/types'

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})
afterEach(() => {
  vi.unstubAllGlobals()
})

function respond(courses: RecommendedCourse[]) {
  fetchMock.mockResolvedValue(new Response(JSON.stringify({ courses }), { status: 200 }))
}

const course = (id: string, overrides: Partial<RecommendedCourse> = {}): RecommendedCourse => ({
  id,
  title: `Course ${id}`,
  thumbnailUrl: '',
  difficulty: 'beginner',
  toolName: 'ChatGPT',
  skillName: 'Writing',
  ...overrides,
})

describe('RecommendedCourses (BR-15)', () => {
  it('shows only the courses it gets, with tool and difficulty tags', async () => {
    respond([course('r1'), course('r2', { difficulty: 'advanced', toolName: 'Claude' })])
    render(<RecommendedCourses courseId="c1" accessToken="token" />)

    expect(await screen.findByRole('heading', { name: '接下來可以學' })).toBeInTheDocument()
    expect(screen.getByText('同工具或同技能，不含你已完成的課')).toBeInTheDocument()
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByRole('link', { name: /Course r1/ })).toHaveAttribute('href', '/courses/r1')
    expect(screen.getByText('入門')).toBeInTheDocument()
    expect(screen.getByText('進階')).toBeInTheDocument()
    expect(screen.getByText('Claude')).toBeInTheDocument()
    // No description and no skill tag on these small cards
    expect(screen.queryByText('Writing')).not.toBeInTheDocument()
  })

  it('sends the sign-in token so completed courses are left out', async () => {
    respond([])
    render(<RecommendedCourses courseId="c1" accessToken="token" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/api/v1/courses/c1/recommended',
      expect.objectContaining({ headers: { Authorization: 'Bearer token' } }),
    )
  })

  it('renders nothing when there are no recommendations', async () => {
    respond([])
    const { container } = render(<RecommendedCourses courseId="c1" accessToken="token" />)
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(container).toBeEmptyDOMElement()
  })

  it('is not shown to guests', () => {
    respond([course('r1')])
    const { container } = render(<RecommendedCourses courseId="c1" accessToken={null} />)
    expect(fetchMock).not.toHaveBeenCalled()
    expect(container).toBeEmptyDOMElement()
  })
})

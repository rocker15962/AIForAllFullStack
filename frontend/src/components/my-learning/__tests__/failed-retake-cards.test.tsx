import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletedCard } from '../completed-card'
import { ProgressCard } from '../progress-card'
import type { CompletedCourse, InProgressCourse } from '@/types'

const completed: CompletedCourse = {
  id: 'p2',
  courseId: 'c2',
  courseTitle: 'ChatGPT Automation',
  courseThumbnail: '',
  toolName: 'ChatGPT',
  skillName: 'Writing',
  difficulty: 'advanced',
  score: 40,
  totalQuestions: 5,
  completedAt: '2026-10-14T00:00:00Z',
  latestRoundPassed: false,
  badgeEarnedAt: '2026-10-14T00:00:00Z',
  courseStatus: 'published',
}

describe('CompletedCard — latest round not passed (BR-36)', () => {
  it('stays in 已完成 with the latest score, the kept badge and a retake', () => {
    render(<CompletedCard course={completed} />)

    expect(screen.getByText('最新一輪未通過 · 40%')).toBeInTheDocument()
    expect(screen.getByText('徽章保留')).toBeInTheDocument()
    expect(screen.queryByText(/分數：/)).not.toBeInTheDocument()

    // Only the retake button is a link; it starts a new round on the course page.
    const links = screen.getAllByRole('link')
    expect(links).toHaveLength(1)
    expect(links[0]).toHaveTextContent('重做測驗')
    expect(links[0]).toHaveAttribute('href', '/courses/c2?retake=1')
  })

  it('draws the amber bar at the latest score', () => {
    render(<CompletedCard course={completed} />)
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(bar.firstElementChild).toHaveClass('bg-amber-500')
    expect(bar.firstElementChild).toHaveStyle({ width: '40%' })
  })

  it('keeps passed cards as they are', () => {
    render(<CompletedCard course={{ ...completed, score: 100, latestRoundPassed: true }} />)
    expect(screen.getByText('分數：100%')).toBeInTheDocument()
    expect(screen.queryByText(/最新一輪未通過/)).not.toBeInTheDocument()
    expect(screen.queryByText('重做測驗')).not.toBeInTheDocument()
    expect(screen.getByRole('progressbar').firstElementChild).toHaveClass('bg-green-500')
  })

  it('treats a missing flag as passed', () => {
    render(<CompletedCard course={{ ...completed, score: 80, latestRoundPassed: undefined }} />)
    expect(screen.getByText('分數：80%')).toBeInTheDocument()
  })
})

describe('ProgressCard — failed first round (BR-36)', () => {
  const inProgress: InProgressCourse = {
    id: 'p1',
    courseId: 'c1',
    courseTitle: 'Prompting 101',
    courseThumbnail: '',
    toolName: 'ChatGPT',
    skillName: 'Prompting',
    difficulty: 'beginner',
    progress: 100,
    currentQuestion: 5,
    totalQuestions: 5,
    lastAccessedAt: '2026-11-01T00:00:00Z',
    score: 40,
    latestRoundPassed: false,
    courseStatus: 'published',
  }

  it('shows the failed score and offers a retake once every question is answered', () => {
    render(<ProgressCard course={inProgress} />)
    expect(screen.getByText('最新一輪未通過 · 40%')).toBeInTheDocument()
    expect(screen.queryByText('徽章保留')).not.toBeInTheDocument()
    expect(screen.getByRole('link', { name: '重做測驗' })).toHaveAttribute(
      'href',
      '/courses/c1?retake=1',
    )
  })

  it('shows normal progress while a new round is being answered', () => {
    render(<ProgressCard course={{ ...inProgress, progress: 40, currentQuestion: 2 }} />)
    expect(screen.getByText('進度 40% · 已答 2/5 題')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: '繼續學習' })).toHaveAttribute('href', '/courses/c1')
  })
})

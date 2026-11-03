import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressCard } from '../progress-card'
import { CompletedCard } from '../completed-card'
import { BadgeCard } from '../badge-card'
import type { Badge, CompletedCourse, InProgressCourse } from '@/types'

const inProgress: InProgressCourse = {
  id: 'p1',
  courseId: 'c1',
  courseTitle: 'Prompting 101',
  courseThumbnail: '',
  toolName: 'ChatGPT',
  skillName: 'Prompting',
  difficulty: 'beginner',
  progress: 50,
  currentQuestion: 2,
  totalQuestions: 4,
  lastAccessedAt: '2026-11-01T00:00:00Z',
  score: null,
  latestRoundPassed: null,
  courseStatus: 'published',
}

const completed: CompletedCourse = {
  id: 'p2',
  courseId: 'c2',
  courseTitle: 'Claude Basics',
  courseThumbnail: '',
  toolName: 'Claude',
  skillName: 'Writing',
  difficulty: 'beginner',
  score: 80,
  totalQuestions: 5,
  completedAt: '2026-11-01T00:00:00Z',
  latestRoundPassed: true,
  badgeEarnedAt: '2026-11-01T00:00:00Z',
  courseStatus: 'published',
}

const badge: Badge = {
  id: 'b1',
  courseId: 'c3',
  courseTitle: 'Midjourney Art',
  thumbnailUrl: '',
  earnedAt: '2026-09-28T00:00:00Z',
  courseStatus: 'published',
}

describe('My Learning cards for published courses', () => {
  it('in-progress card links to the course', () => {
    render(<ProgressCard course={inProgress} />)
    expect(screen.getByRole('link', { name: '繼續學習' })).toHaveAttribute('href', '/courses/c1')
    expect(screen.getByText('進度 50% · 已答 2/4 題')).toBeInTheDocument()
  })

  it('completed card opens the course and shows the score', () => {
    render(<CompletedCard course={completed} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/courses/c2')
    expect(screen.getByText('分數：80%')).toBeInTheDocument()
  })
})

describe.each([
  ['archived', '課程已封存'],
  ['draft', '課程暫停開放'],
] as const)('My Learning cards for %s courses (BR-31, BR-37)', (status, label) => {
  it('in-progress card is dimmed, not clickable and says why', () => {
    const { container } = render(<ProgressCard course={{ ...inProgress, courseStatus: status }} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Prompting 101')).toBeInTheDocument()
    expect(screen.getByText('已無法觀看')).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('opacity-60')
  })

  it('completed card is dimmed, not clickable and says why', () => {
    const { container } = render(<CompletedCard course={{ ...completed, courseStatus: status }} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('已無法觀看')).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('opacity-60')
  })

  it('a failed retake of an unavailable course offers no retake', () => {
    render(
      <CompletedCard
        course={{ ...completed, score: 40, latestRoundPassed: false, courseStatus: status }}
      />,
    )
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.queryByText('重做測驗')).not.toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('badge card keeps the badge and says why the course is gone', () => {
    render(<BadgeCard badge={{ ...badge, courseStatus: status }} />)
    expect(screen.getByText('Midjourney Art')).toBeInTheDocument()
    expect(screen.getByText('9月28日 獲得')).toBeInTheDocument()
    expect(screen.getByText(label)).toBeInTheDocument()
  })
})

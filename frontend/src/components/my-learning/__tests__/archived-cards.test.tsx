import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProgressCard } from '../progress-card'
import { CompletedCard } from '../completed-card'
import type { CompletedCourse, InProgressCourse } from '@/types'

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
  courseStatus: 'published',
}

describe('My Learning cards for archived courses (BR-31)', () => {
  it('in-progress card links to the course while it is published', () => {
    render(<ProgressCard course={inProgress} />)
    expect(screen.getByRole('link', { name: 'Continue Learning' })).toHaveAttribute(
      'href',
      '/courses/c1',
    )
  })

  it('in-progress card can no longer be opened once archived', () => {
    render(<ProgressCard course={{ ...inProgress, courseStatus: 'archived' }} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('No longer available')).toBeInTheDocument()
    expect(screen.getByText('Prompting 101')).toBeInTheDocument()
  })

  it('completed card keeps the score but is not a link once archived', () => {
    render(<CompletedCard course={{ ...completed, courseStatus: 'archived' }} />)
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    expect(screen.getByText('Score: 80%')).toBeInTheDocument()
    expect(screen.getByText('No longer available')).toBeInTheDocument()
  })
})

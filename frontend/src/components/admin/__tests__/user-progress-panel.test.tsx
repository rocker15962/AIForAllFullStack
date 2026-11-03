import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { UserProgressPanel } from '../user-progress-panel'
import type { UserProgressRow } from '../user-table'

const rows: UserProgressRow[] = [
  {
    courseId: 'c1',
    courseTitle: 'ChatGPT Basics',
    courseStatus: 'published',
    status: 'in_progress',
    score: null,
    answeredCount: 2,
    totalQuestions: 4,
  },
  {
    courseId: 'c2',
    courseTitle: 'Claude Intro',
    courseStatus: 'published',
    status: 'completed',
    score: 80,
    answeredCount: 5,
    totalQuestions: 5,
  },
]

describe('UserProgressPanel', () => {
  it('shows title and completed / in-progress counts', () => {
    render(<UserProgressPanel userName="Amy" rows={rows} isLoading={false} error={null} />)
    expect(screen.getByText('Amy 的學習進度')).toBeInTheDocument()
    expect(screen.getByText('已完成 1 堂 · 進行中 1 堂')).toBeInTheDocument()
  })

  it('labels in-progress rows by answered percentage and completed rows by score', () => {
    render(<UserProgressPanel userName="Amy" rows={rows} isLoading={false} error={null} />)
    expect(screen.getByText('進行中 · 50%')).toBeInTheDocument()
    expect(screen.getByText('已完成 · 80%')).toBeInTheDocument()
    const bars = screen.getAllByRole('progressbar')
    expect(bars[0]).toHaveAttribute('aria-valuenow', '50')
    expect(bars[1]).toHaveAttribute('aria-valuenow', '100')
  })

  it('shows empty state when there is no activity', () => {
    render(<UserProgressPanel userName="Amy" rows={[]} isLoading={false} error={null} />)
    expect(screen.getByText('還沒有學習紀錄')).toBeInTheDocument()
  })

  it('marks a finished round below 60% as not passed (BR-12)', () => {
    render(
      <UserProgressPanel
        userName="Amy"
        rows={[{ ...rows[0], answeredCount: 4, score: 25 }]}
        isLoading={false}
        error={null}
      />,
    )
    expect(screen.getByText('未及格 · 25%')).toBeInTheDocument()
  })
})

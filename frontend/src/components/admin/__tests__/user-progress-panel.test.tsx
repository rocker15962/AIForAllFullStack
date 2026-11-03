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
    latestRoundPassed: null,
    answeredCount: 2,
    totalQuestions: 4,
  },
  {
    courseId: 'c2',
    courseTitle: 'Claude Intro',
    courseStatus: 'published',
    status: 'completed',
    score: 80,
    latestRoundPassed: true,
    answeredCount: 5,
    totalQuestions: 5,
  },
]

function barFill(bar: HTMLElement): HTMLElement {
  return bar.firstElementChild as HTMLElement
}

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
    expect(barFill(bars[0])).toHaveClass('bg-cyan-500')
    expect(bars[1]).toHaveAttribute('aria-valuenow', '100')
    expect(barFill(bars[1])).toHaveClass('bg-green-500')
  })

  it('shows empty state when there is no activity', () => {
    render(<UserProgressPanel userName="Amy" rows={[]} isLoading={false} error={null} />)
    expect(screen.getByText('還沒有學習紀錄')).toBeInTheDocument()
  })

  it('marks a failed retake of a completed course as latest round not passed (BR-36)', () => {
    render(
      <UserProgressPanel
        userName="Amy"
        rows={[{ ...rows[1], score: 40, latestRoundPassed: false }]}
        isLoading={false}
        error={null}
      />,
    )
    expect(screen.getByText('最新一輪未通過 · 40%')).toBeInTheDocument()
    expect(screen.queryByText(/已完成 ·/)).not.toBeInTheDocument()
    // Still counted as completed: the course stays in 已完成
    expect(screen.getByText('已完成 1 堂 · 進行中 0 堂')).toBeInTheDocument()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '40')
    expect(barFill(bar)).toHaveClass('bg-amber-500')
    expect(barFill(bar)).toHaveStyle({ width: '40%' })
  })

  it('marks a failed first round of an in-progress course the same way (BR-36)', () => {
    render(
      <UserProgressPanel
        userName="Amy"
        rows={[{ ...rows[0], answeredCount: 4, score: 25, latestRoundPassed: false }]}
        isLoading={false}
        error={null}
      />,
    )
    expect(screen.getByText('最新一輪未通過 · 25%')).toBeInTheDocument()
    expect(screen.queryByText(/未及格/)).not.toBeInTheDocument()
    const bar = screen.getByRole('progressbar')
    expect(bar).toHaveAttribute('aria-valuenow', '25')
    expect(barFill(bar)).toHaveClass('bg-amber-500')
  })

  it('marks archived courses', () => {
    render(
      <UserProgressPanel
        userName="Amy"
        rows={[{ ...rows[1], courseStatus: 'archived' }]}
        isLoading={false}
        error={null}
      />,
    )
    expect(screen.getByText('已封存')).toBeInTheDocument()
    expect(screen.getByText('已完成 · 80%')).toBeInTheDocument()
  })
})

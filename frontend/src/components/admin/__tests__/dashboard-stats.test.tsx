import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardStatsCards, weekOverWeek } from '../dashboard-stats'

const mockStats = {
  totalUsers: 1250,
  totalCourses: 48,
  totalCompletions: 892,
  activeUsers: 347,
}

describe('DashboardStatsCards', () => {
  it('renders all four stat cards with correct values', () => {
    render(<DashboardStatsCards stats={mockStats} />)

    expect(screen.getByText('總用戶數')).toBeInTheDocument()
    expect(screen.getByText('1250')).toBeInTheDocument()

    expect(screen.getByText('課程數')).toBeInTheDocument()
    expect(screen.getByText('48')).toBeInTheDocument()

    expect(screen.getByText('完課次數')).toBeInTheDocument()
    expect(screen.getByText('892')).toBeInTheDocument()

    expect(screen.getByText('活躍用戶')).toBeInTheDocument()
    expect(screen.getByText('347')).toBeInTheDocument()
  })

  it('renders zero values correctly', () => {
    const zeroStats = {
      totalUsers: 0,
      totalCourses: 0,
      totalCompletions: 0,
      activeUsers: 0,
    }
    render(<DashboardStatsCards stats={zeroStats} />)

    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(4)
  })
})

describe('week-over-week trend', () => {
  it('computes whole-percent change and skips a missing or zero baseline', () => {
    expect(weekOverWeek(1250, 1000)).toBe(25)
    expect(weekOverWeek(347, 400)).toBe(-13)
    expect(weekOverWeek(5, 5)).toBe(0)
    expect(weekOverWeek(5, 0)).toBeNull()
    expect(weekOverWeek(5, undefined)).toBeNull()
  })

  it('shows up, down and flat trends only on cards with last week numbers', () => {
    render(
      <DashboardStatsCards
        stats={mockStats}
        lastWeek={{ totalUsers: 1000, totalCompletions: 892, activeUsers: 400 }}
      />,
    )

    expect(screen.getByText('+25%')).toBeInTheDocument()
    expect(screen.getByText('0%')).toBeInTheDocument()
    expect(screen.getByText('−13%')).toBeInTheDocument()
    // No baseline for the course count
    expect(screen.getAllByText('比上週')).toHaveLength(3)
  })

  it('shows no trend without last week numbers', () => {
    render(<DashboardStatsCards stats={mockStats} />)
    expect(screen.queryByText('比上週')).not.toBeInTheDocument()
  })
})

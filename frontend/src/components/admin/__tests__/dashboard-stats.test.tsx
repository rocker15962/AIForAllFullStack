import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { DashboardStatsCards } from '../dashboard-stats'

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

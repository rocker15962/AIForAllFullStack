import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'
import { TrendChart } from '../trend-chart'

const mockTrendData = [
  { date: '2026-03-26', totalUsers: 280, newUsers: 15 },
  { date: '2026-03-27', totalUsers: 290, newUsers: 20 },
  { date: '2026-03-28', totalUsers: 300, newUsers: 25 },
]

// Recharts requires ResizeObserver
beforeAll(() => {
  if (typeof window.ResizeObserver === 'undefined') {
    window.ResizeObserver = class ResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  }
})

describe('TrendChart', () => {
  it('renders the heading', () => {
    render(<TrendChart data={mockTrendData} />)
    expect(screen.getByText('User Trends')).toBeInTheDocument()
  })

  it('renders summary stats', () => {
    render(<TrendChart data={mockTrendData} />)
    expect(screen.getByText('New Users This Week')).toBeInTheDocument()
    // total newUsers = 15 + 20 + 25 = 60
    expect(screen.getByText('60')).toBeInTheDocument()

    expect(screen.getByText('Avg Active Users')).toBeInTheDocument()
    // avg totalUsers = (280 + 290 + 300) / 3 = 290
    expect(screen.getByText('290')).toBeInTheDocument()
  })

  it('counts new users from the last 7 days only (BR-35)', () => {
    const tenDays = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
      totalUsers: 100 + i,
      // first 3 days: 100 each (must be ignored); last 7 days: 1 each
      newUsers: i < 3 ? 100 : 1,
    }))
    render(<TrendChart data={tenDays} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<TrendChart data={[]} />)
    expect(screen.getByText('User Trends')).toBeInTheDocument()
    // Both "New Users This Week" and "Avg Active Users" show 0
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(2)
  })
})

import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeAll } from 'vitest'
import { TrendChart } from '../trend-chart'

const mockTrendData = [
  { date: '2026-03-26', newUsers: 15, activeUsers: 40 },
  { date: '2026-03-27', newUsers: 20, activeUsers: 51 },
  { date: '2026-03-28', newUsers: 25, activeUsers: 33 },
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
    expect(screen.getByText('用戶趨勢')).toBeInTheDocument()
  })

  it('renders summary stats', () => {
    render(<TrendChart data={mockTrendData} />)
    expect(screen.getByText('本週新用戶')).toBeInTheDocument()
    // total newUsers = 15 + 20 + 25 = 60
    expect(screen.getByText('60')).toBeInTheDocument()

    expect(screen.getByText('平均活躍用戶')).toBeInTheDocument()
    // avg activeUsers = (40 + 51 + 33) / 3 = 41.33 → 41
    expect(screen.getByText('41')).toBeInTheDocument()
  })

  it('averages daily active users across every day in the range (BR-39)', () => {
    const thirtyDays = Array.from({ length: 30 }, (_, i) => ({
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
      newUsers: 0,
      // 15 days with 10 active users, 15 days with 21 → average 15.5 → rounds to 16
      activeUsers: i < 15 ? 10 : 21,
    }))
    render(<TrendChart data={thirtyDays} />)
    expect(screen.getByText('16')).toBeInTheDocument()
  })

  it('counts new users from the last 7 days only (BR-35)', () => {
    const tenDays = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-03-${String(i + 1).padStart(2, '0')}`,
      activeUsers: 100 + i,
      // first 3 days: 100 each (must be ignored); last 7 days: 1 each
      newUsers: i < 3 ? 100 : 1,
    }))
    render(<TrendChart data={tenDays} />)
    expect(screen.getByText('7')).toBeInTheDocument()
  })

  it('handles empty data', () => {
    render(<TrendChart data={[]} />)
    expect(screen.getByText('用戶趨勢')).toBeInTheDocument()
    // Both "New Users This Week" and "Avg Active Users" show 0
    const zeros = screen.getAllByText('0')
    expect(zeros).toHaveLength(2)
  })
})

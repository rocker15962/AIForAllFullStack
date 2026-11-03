import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsBar } from '../results-bar'

describe('ResultsBar', () => {
  it('shows the number of courses', () => {
    render(<ResultsBar count={12} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.getByText('共 12 堂課')).toBeInTheDocument()
  })

  it('uses the same counter wording for one course', () => {
    render(<ResultsBar count={1} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.getByText('共 1 堂課')).toBeInTheDocument()
  })

  it('adds the range shown on this page when results span several pages (BR-40)', () => {
    render(
      <ResultsBar
        count={45}
        range={{ from: 21, to: 40 }}
        hasActiveFilters={false}
        onClearAll={() => {}}
      />,
    )
    expect(screen.getByText('共 45 堂課 · 第 21–40 堂')).toBeInTheDocument()
  })

  it('hides "Clear all filters" when nothing is filtered', () => {
    render(<ResultsBar count={8} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.queryByRole('button', { name: '清除全部篩選' })).not.toBeInTheDocument()
  })

  it('shows "Clear all filters" when any filter is active and calls onClearAll', async () => {
    const onClearAll = vi.fn()
    render(<ResultsBar count={3} hasActiveFilters onClearAll={onClearAll} />)
    await userEvent.click(screen.getByRole('button', { name: '清除全部篩選' }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })
})

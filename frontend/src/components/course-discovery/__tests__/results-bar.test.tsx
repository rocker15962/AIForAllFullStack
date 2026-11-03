import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ResultsBar } from '../results-bar'

describe('ResultsBar', () => {
  it('shows the number of courses', () => {
    render(<ResultsBar count={12} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.getByText('12 courses')).toBeInTheDocument()
  })

  it('uses singular for one course', () => {
    render(<ResultsBar count={1} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.getByText('1 course')).toBeInTheDocument()
  })

  it('hides "Clear all filters" when nothing is filtered', () => {
    render(<ResultsBar count={8} hasActiveFilters={false} onClearAll={() => {}} />)
    expect(screen.queryByRole('button', { name: 'Clear all filters' })).not.toBeInTheDocument()
  })

  it('shows "Clear all filters" when any filter is active and calls onClearAll', async () => {
    const onClearAll = vi.fn()
    render(<ResultsBar count={3} hasActiveFilters onClearAll={onClearAll} />)
    await userEvent.click(screen.getByRole('button', { name: 'Clear all filters' }))
    expect(onClearAll).toHaveBeenCalledOnce()
  })
})

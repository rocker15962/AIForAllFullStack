import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Pagination } from '../pagination'

describe('Pagination', () => {
  it('renders nothing when there is only one page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />)
    expect(container).toBeEmptyDOMElement()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('renders a labelled nav with previous, page numbers and next', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />)
    const nav = screen.getByRole('navigation', { name: '分頁' })
    const labels = within(nav)
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(labels).toEqual(['上一頁', '1', '2', '3', '下一頁'])
  })

  it('marks the current page', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '2' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('button', { name: '1' })).not.toHaveAttribute('aria-current')
  })

  it('disables 上一頁 on the first page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '上一頁' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '下一頁' })).toBeEnabled()
  })

  it('disables 下一頁 on the last page', () => {
    render(<Pagination page={3} totalPages={3} onPageChange={() => {}} />)
    expect(screen.getByRole('button', { name: '下一頁' })).toBeDisabled()
    expect(screen.getByRole('button', { name: '上一頁' })).toBeEnabled()
  })

  it('goes to the previous and next page', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '上一頁' }))
    expect(onPageChange).toHaveBeenLastCalledWith(1)
    await userEvent.click(screen.getByRole('button', { name: '下一頁' }))
    expect(onPageChange).toHaveBeenLastCalledWith(3)
  })

  it('goes to a page number', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '3' }))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('does nothing when the current page is clicked', async () => {
    const onPageChange = vi.fn()
    render(<Pagination page={2} totalPages={3} onPageChange={onPageChange} />)
    await userEvent.click(screen.getByRole('button', { name: '2' }))
    expect(onPageChange).not.toHaveBeenCalled()
  })

  it('collapses long page lists with a hidden-from-screen-readers ellipsis', () => {
    render(<Pagination page={5} totalPages={10} onPageChange={() => {}} />)
    const nav = screen.getByRole('navigation', { name: '分頁' })
    const labels = within(nav)
      .getAllByRole('button')
      .map((b) => b.textContent)
    expect(labels).toEqual(['上一頁', '1', '4', '5', '6', '10', '下一頁'])
    expect(within(nav).getAllByText('…')).toHaveLength(2)
  })
})

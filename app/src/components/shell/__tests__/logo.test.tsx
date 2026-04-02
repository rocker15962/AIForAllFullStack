import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Logo } from '../logo'

describe('Logo', () => {
  it('renders AI and for All text', () => {
    render(<Logo />)
    expect(screen.getByText('AI')).toBeInTheDocument()
    expect(screen.getByText('for All')).toBeInTheDocument()
  })

  it('links to homepage', () => {
    render(<Logo />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/')
  })
})

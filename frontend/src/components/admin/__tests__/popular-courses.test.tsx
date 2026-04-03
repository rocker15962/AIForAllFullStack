import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PopularCourses } from '../popular-courses'

const mockCourses = [
  { id: '1', title: 'Intro to ChatGPT', completions: 120 },
  { id: '2', title: 'Midjourney Basics', completions: 95 },
  { id: '3', title: 'Prompt Engineering 101', completions: 78 },
]

describe('PopularCourses', () => {
  it('renders heading', () => {
    render(<PopularCourses courses={mockCourses} />)
    expect(screen.getByText('Popular Courses')).toBeInTheDocument()
  })

  it('renders each course with rank, title, and completions', () => {
    render(<PopularCourses courses={mockCourses} />)

    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Intro to ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('120')).toBeInTheDocument()

    expect(screen.getByText('2')).toBeInTheDocument()
    expect(screen.getByText('Midjourney Basics')).toBeInTheDocument()
    expect(screen.getByText('95')).toBeInTheDocument()

    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('Prompt Engineering 101')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
  })

  it('renders empty state when no courses', () => {
    render(<PopularCourses courses={[]} />)
    expect(screen.getByText('No course data available yet.')).toBeInTheDocument()
  })
})

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CourseCard } from '../course-card'

const mockCourse = {
  id: 'course-1',
  title: 'ChatGPT 入門：從零開始學 AI 對話',
  description: '學習如何有效使用 ChatGPT',
  thumbnailUrl: '',
  difficulty: 'beginner',
  duration: 630,
  toolId: 'tool-1',
  skillId: 'skill-1',
  creatorId: 'creator-1',
  questionCount: 5,
}

describe('CourseCard', () => {
  it('renders course title', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('ChatGPT 入門：從零開始學 AI 對話')).toBeInTheDocument()
  })

  it('renders difficulty badge', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('初級')).toBeInTheDocument()
  })

  it('renders formatted duration', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('10:30')).toBeInTheDocument()
  })

  it('renders question count', () => {
    render(<CourseCard course={mockCourse} />)
    expect(screen.getByText('5 題')).toBeInTheDocument()
  })

  it('renders tool and skill names when provided', () => {
    render(<CourseCard course={mockCourse} toolName="ChatGPT" skillName="Copywriting" />)
    expect(screen.getByText('ChatGPT')).toBeInTheDocument()
    expect(screen.getByText('Copywriting')).toBeInTheDocument()
  })

  it('links to course detail page', () => {
    render(<CourseCard course={mockCourse} />)
    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/courses/course-1')
  })
})

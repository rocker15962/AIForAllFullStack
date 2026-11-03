import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletionView } from '../completion-view'

describe('CompletionView', () => {
  it('renders trophy and congratulations', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('Congratulations!')).toBeInTheDocument()
  })

  it('shows score percentage', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('shows correct count', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('4 / 5 correct')).toBeInTheDocument()
  })

  it('shows perfect message for 100%', () => {
    render(<CompletionView score={100} totalQuestions={5} correctAnswers={5} />)
    expect(screen.getByText('Perfect!')).toBeInTheDocument()
  })

  it('shows good message for 60%+', () => {
    render(<CompletionView score={60} totalQuestions={5} correctAnswers={3} />)
    expect(screen.getByText('Well done!')).toBeInTheDocument()
  })

  it('shows encouragement for <60%', () => {
    render(<CompletionView score={40} totalQuestions={5} correctAnswers={2} />)
    expect(screen.getByText('Keep going!')).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('Explore More Courses')).toHaveAttribute('href', '/courses')
    expect(screen.getByText('Back to Courses')).toHaveAttribute('href', '/courses')
  })

  it('below 60% shows no trophy and offers a retake (BR-12)', async () => {
    const onRetake = vi.fn()
    render(<CompletionView score={40} totalQuestions={5} correctAnswers={2} onRetake={onRetake} />)
    expect(screen.queryByText('🏆')).not.toBeInTheDocument()
    expect(screen.queryByText('Congratulations!')).not.toBeInTheDocument()
    screen.getByRole('button', { name: 'Retake Quiz' }).click()
    expect(onRetake).toHaveBeenCalled()
  })

  it('tells a failing learner they keep an earlier badge (BR-16)', () => {
    render(<CompletionView score={20} totalQuestions={5} correctAnswers={1} badgeEarned />)
    expect(screen.getByText('You keep the badge you earned earlier.')).toBeInTheDocument()
  })
})

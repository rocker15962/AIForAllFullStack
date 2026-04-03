import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { CompletionView } from '../completion-view'

describe('CompletionView', () => {
  it('renders trophy and congratulations', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('🏆')).toBeInTheDocument()
    expect(screen.getByText('恭喜完成！')).toBeInTheDocument()
  })

  it('shows score percentage', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('shows correct count', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('答對 4 / 5 題')).toBeInTheDocument()
  })

  it('shows perfect message for 100%', () => {
    render(<CompletionView score={100} totalQuestions={5} correctAnswers={5} />)
    expect(screen.getByText('完美！')).toBeInTheDocument()
  })

  it('shows good message for 60%+', () => {
    render(<CompletionView score={60} totalQuestions={5} correctAnswers={3} />)
    expect(screen.getByText('做得好！')).toBeInTheDocument()
  })

  it('shows encouragement for <60%', () => {
    render(<CompletionView score={40} totalQuestions={5} correctAnswers={2} />)
    expect(screen.getByText('繼續加油！')).toBeInTheDocument()
  })

  it('has navigation links', () => {
    render(<CompletionView score={80} totalQuestions={5} correctAnswers={4} />)
    expect(screen.getByText('探索更多課程')).toHaveAttribute('href', '/courses')
    expect(screen.getByText('返回課程列表')).toHaveAttribute('href', '/courses')
  })
})

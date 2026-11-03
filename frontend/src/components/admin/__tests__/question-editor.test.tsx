import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionEditor } from '../question-editor'
import type { Question } from '@/types'

describe('QuestionEditor — short answer (BR-29)', () => {
  it('requires a sample answer for short-answer questions', async () => {
    const user = userEvent.setup()
    const onQuestionsChange = vi.fn()
    render(<QuestionEditor courseId="" questions={[]} onQuestionsChange={onQuestionsChange} />)

    await user.click(screen.getByRole('button', { name: /Add Question/ }))
    await user.click(screen.getByRole('button', { name: 'Short Answer' }))
    await user.type(screen.getByPlaceholderText('Enter your question...'), 'What is RAG?')
    await user.click(screen.getByRole('button', { name: 'Save Question' }))

    expect(screen.getByText('Sample answer is required')).toBeInTheDocument()
    expect(onQuestionsChange).not.toHaveBeenCalled()
  })

  it('saves the sample answer with the question', async () => {
    const user = userEvent.setup()
    const onQuestionsChange = vi.fn()
    render(<QuestionEditor courseId="" questions={[]} onQuestionsChange={onQuestionsChange} />)

    await user.click(screen.getByRole('button', { name: /Add Question/ }))
    await user.click(screen.getByRole('button', { name: 'Short Answer' }))
    await user.type(screen.getByPlaceholderText('Enter your question...'), 'What is RAG?')
    await user.type(screen.getByLabelText('Sample answer'), 'Retrieval-augmented generation')
    await user.click(screen.getByRole('button', { name: 'Save Question' }))

    const saved = onQuestionsChange.mock.calls[0][0] as Question[]
    expect(saved).toHaveLength(1)
    expect(saved[0]).toMatchObject({
      type: 'short_answer',
      sampleAnswer: 'Retrieval-augmented generation',
    })
  })

  it('does not show the sample answer field for multiple choice', async () => {
    const user = userEvent.setup()
    render(<QuestionEditor courseId="" questions={[]} onQuestionsChange={vi.fn()} />)
    await user.click(screen.getByRole('button', { name: /Add Question/ }))
    expect(screen.queryByLabelText('Sample answer')).not.toBeInTheDocument()
  })
})

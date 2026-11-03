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

    await user.click(screen.getByRole('button', { name: /新增題目/ }))
    await user.click(screen.getByRole('button', { name: '簡答題' }))
    await user.type(screen.getByPlaceholderText('輸入題目…'), 'What is RAG?')
    await user.click(screen.getByRole('button', { name: '儲存題目' }))

    expect(screen.getByText('請輸入範例答案')).toBeInTheDocument()
    expect(onQuestionsChange).not.toHaveBeenCalled()
  })

  it('saves the sample answer with the question', async () => {
    const user = userEvent.setup()
    const onQuestionsChange = vi.fn()
    render(<QuestionEditor courseId="" questions={[]} onQuestionsChange={onQuestionsChange} />)

    await user.click(screen.getByRole('button', { name: /新增題目/ }))
    await user.click(screen.getByRole('button', { name: '簡答題' }))
    await user.type(screen.getByPlaceholderText('輸入題目…'), 'What is RAG?')
    await user.type(screen.getByLabelText('範例答案'), 'Retrieval-augmented generation')
    await user.click(screen.getByRole('button', { name: '儲存題目' }))

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
    await user.click(screen.getByRole('button', { name: /新增題目/ }))
    expect(screen.queryByLabelText('範例答案')).not.toBeInTheDocument()
  })
})
